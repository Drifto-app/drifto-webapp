import { ComponentProps, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FaArrowLeft } from 'react-icons/fa';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/post/post-card';
import { authApi } from '@/lib/axios';
import { showTopToast } from '@/components/toast/toast-util';
import { CommentCard } from '@/components/comment/comment-card';
import { Input } from '@/components/ui/input';
import { IoChatbubbleEllipsesOutline, IoSend } from 'react-icons/io5';
import { Loader, LoaderSmall } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { BiSolidError } from 'react-icons/bi';
import { PostDetailPageSkeleton } from '@/components/ui/page-skeletons';


interface SinglePostContentProps extends ComponentProps<"div"> {
  prev: string | null;
  currentPathUrl: string;
  postId: string;
}

export const SinglePostContent = ({
  prev, currentPathUrl, postId, className, ...props
}: SinglePostContentProps) => {
  const router = useRouter();

  const [post, setPost] = useState<{[key: string]: any}>({});
  const [comments, setComments] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comment, setComment] = useState<string>("");
  const [submitCommentLoading, setSubmitCommentLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const handleBackClick = () => {
    router.push(prev != null ? prev : `/?screen=${encodeURIComponent("posts")}`);
  }

  const loadCommentsAndPost = useCallback(async (resetData = false) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    if (resetData) {
      setInitialLoading(true);
    }
    setError(null);

    try {
      if(resetData) {
        const response = await authApi.get(`/post/${postId}`);
        setPost(response?.data.data);
      }

      const currentPage = resetData ? 1 : pageRef.current;

      const params: {[key: string]: string | number} = {
        pageSize: 10,
        pageNumber: currentPage,
        commentType: "POST"
      };

      const response = await authApi.get(`/comment/entity/${postId}`, {
        params
      });

      const newComments = response.data.data.data;

      if (resetData) {
        setComments(newComments);
        pageRef.current = 2;
      } else {
        setComments((prev) => [...prev, ...newComments]);
        pageRef.current = currentPage + 1;
      }

      const isLast = response.data.data.isLast;
      setHasMore(!isLast);
      hasMoreRef.current = !isLast;

    } catch (err: any) {
      showTopToast("error", err.message || "Error loading comments");
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [postId]);

  const handleCommentSubmit =   async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitCommentLoading(true);

    if(comment == null || comment == ""){
      showTopToast("error", "Comment must specify a comment");
      return;
    }

    const params: {[key: string]: string} = {
      comment,
      commentType: "POST",
      postId
    }

    try {
      const response = await authApi.post("/comment", params)

      setComments([response.data.data, ...comments])
      setComment("")
    } catch (err: any) {
      setError(err.response?.data?.description || 'Commenting failed');
      showTopToast("error", err.response?.data?.description || 'Commenting failed');
    } finally {
      setSubmitCommentLoading(false);
    }
  }

  useEffect(() => {
    if (!window.visualViewport || !inputRef.current) return;

    const onResize = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const offset = window.innerHeight - viewportHeight;
      setKeyboardOffset(offset > 100 ? offset : 0);
    };

    const onFocus = () => {
      window.visualViewport?.addEventListener("resize", onResize);
    };
    const onBlur = () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      setKeyboardOffset(0);
    };

    const inp = inputRef.current;
    inp.addEventListener("focus", onFocus);
    inp.addEventListener("blur", onBlur);

    return () => {
      inp.removeEventListener("focus", onFocus);
      inp.removeEventListener("blur", onBlur);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  // Initial load
  useEffect(() => {
    setComments([]);
    setHasMore(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setError(null);
    loadCommentsAndPost(true);
  }, [loadCommentsAndPost]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200 &&
        !loadingRef.current &&
        hasMoreRef.current &&
        !error
      ) {
        loadCommentsAndPost(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadCommentsAndPost, error]);



  return (
    <div className={cn(
      "w-full min-h-[100dvh] flex flex-col pb-20",
      className
    )} {...props}>
      <div className={cn(
      "w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center",
      className
      )} {...props}>
        <div className="flex flex-row items-center px-8">
          <FaArrowLeft
            size={20}
            onClick={handleBackClick}
            className="cursor-pointer hover:text-muted-foreground transition-colors"
          />
          <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
            Post
          </p>
        </div>
      </div>
      {initialLoading
        ? <PostDetailPageSkeleton />
        : error && comments.length === 0
          ? ( <div className="w-full h-screen flex flex-col gap-3 items-center justify-center">
            <BiSolidError size={40} className="text-red-600"/>
            <h2>Unable to load comments</h2>
          </div>)
          : (
            <div>
              <div className="w-full pt-2">
                <PostCard postContent={post} disabled={true} />
               </div>
              <div className="w-full flex flex-col gap-6 px-4 py-4">
                {comments.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    currentPathUrl={currentPathUrl}
                    isForUser={c.isMine}
                    onDelete={(commentId: string) => setComments(comments => comments.filter((c) => c.id !== commentId))}
                  />
                ))}
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="fixed inset-x-0 z-60 border-t bg-background border-border safe-area-inset-bottom flex flex-row"
                style={{
                  bottom: keyboardOffset,
                  transition: "bottom 0.2s ease",
                }}
              >
                <Input
                  ref={inputRef}
                  type="text"
                  name="comments"
                  className="min-h-16 outline-none w-full px-6 border-none placeholder:text-sm"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex items-center py-0 px-3">
                  <button className={cn(
                    "p-3 rounded-full",
                    comment.length === 0 ? "bg-muted" : "bg-blue-700"
                  )} type="submit" disabled={comment.length === 0 || submitCommentLoading}>
                    {
                      !submitCommentLoading
                        ? <IoSend size={20} className="text-white" />
                        : <LoaderSmall />
                    }
                  </button>
                </div>
              </form>

              {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8"/>
                </div>
              )}

              {!loading && !initialLoading && comments.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-8">
                  <IoChatbubbleEllipsesOutline size={40} className="text-blue-800"/>
                  <p className="text-gray-500 font-semibold">No comments...yet</p>
                </div>
              )}

              {error && comments.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 pt-4 pb-15 w-full">
                  <p className="text-orange-700 text-sm mb-2">
                    Failed to load more comments
                  </p>
                  <Button
                    onClick={() => loadCommentsAndPost(false)}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
    </div>
  )
}
