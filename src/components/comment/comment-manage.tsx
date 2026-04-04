"use client"

import * as React from "react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {FaArrowLeft} from "react-icons/fa";
import {CommentCard} from "@/components/comment/comment-card";
import {authApi} from "@/lib/axios";
import {toast} from "react-toastify";
import {Loader, LoaderSmall} from "@/components/ui/loader";
import {useEffect, useRef, useCallback, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { IoChatbubbleEllipsesOutline, IoSend } from 'react-icons/io5';
import {showTopToast} from "@/components/toast/toast-util";
import {PostCard} from "@/components/post/post-card";
import { BiSolidError } from 'react-icons/bi';
import { CommentThreadSkeleton } from "@/components/ui/page-skeletons";

interface CommentManageProps extends React.ComponentProps<"div">{
    entityId: string;
    type: string;
    onBackClick?: () => void;
    prev: string | null;
    currentPathUrl: string
}

export default function CommentManagePage(
    {entityId, currentPathUrl, onBackClick, prev, type, className, ...props}: CommentManageProps
) {
    const router = useRouter();

    // State for infinite scroll
    const [mainEntity, setMainEntity] = useState<{[key: string]: any}>({});
    const [comments, setComments] = useState<any[]>([]);
    const [numOfComments, setNumOfComments] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [comment, setComment] = useState<string>("");
    const [submitCommentLoading, setSubmitCommentLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const [keyboardOffset, setKeyboardOffset] = useState(0);

    // Refs for infinite scroll logic
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);

    const handleCommentSubmit =   async (e: React.FormEvent) => {
        e.preventDefault()

        setSubmitCommentLoading(true);

        if(comment == null || comment == ""){
           showTopToast("error", "Comment must specify a comment");
           return;
        }

        const params: {[key: string]: string} = {
            comment,
            commentType: type,
        }

        if(type === "EVENT") {
            params.eventId = entityId
        } else if(type === "POST") {
            params.postId = entityId
        } else if(type === "COMMENT_REPLY") {
            params.commentId = entityId
        }

        try {
            const response = await authApi.post("/comment", params)

            setComments([response.data.data, ...comments])
            setNumOfComments(comments.length + 1)
            setComment("")
        } catch (err: any) {
            setError(err.response?.data?.description || 'Commenting failed');
            showTopToast("error", err.response?.data?.description || 'Commenting failed');
        } finally {
            setSubmitCommentLoading(false);
        }
    }

    const loadComments = useCallback(async (resetData = false) => {
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        if (resetData) {
            setInitialLoading(true);
        }
        setError(null);

        try {
            if(resetData) {
                let response
                if (type === "COMMENT_REPLY") {
                    response = await authApi.get(`/comment/${entityId}`);
                } else if(type === "POST") {
                    response = await authApi.get(`/post/${entityId}`);
                }
                setMainEntity(response?.data.data);
            }

            const currentPage = resetData ? 1 : pageRef.current;

            const params: {[key: string]: string | number} = {
                pageSize: 10,
                pageNumber: currentPage,
                commentType: type
            };

            const response = await authApi.get(`/comment/entity/${entityId}`, {
                params
            });

            const newComments = response.data.data.data;
            setNumOfComments(response.data.data.totalElements)

            if (resetData) {
                setComments(newComments);
                pageRef.current = 2;
            } else {
                setComments((prev) => [...prev, ...newComments]);
                pageRef.current = currentPage + 1;
            }

            if(type === "COMMENT_REPLY") {
                setTitle("Comment Replies");
            } else if(type === "POST") {
                setTitle("Post Comments")
            }else if(type === "EVENT") {
                setTitle("Event Comments")
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
    }, [entityId, type]);

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
        loadComments(true);
    }, [loadComments]);

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
                loadComments(false);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [loadComments, error]);

    const handleBackClick = () => {
        if (onBackClick) {
            // Use custom back navigation if provided
            onBackClick();
        } else {
            // Default router navigation
            router.push(prev != null ? prev : "/");
        }
    }


    const renderMainEntity = () => {
        switch (type) {
            case "COMMENT_REPLY":
                return(
                    <div className="w-full pt-2">
                        <CommentCard comment={mainEntity} currentPathUrl={currentPathUrl} disabled={true} className="rounded-none" />
                    </div>
                )
            case "POST":
                return (
                    <div className="w-full pt-2 px-4">
                        <PostCard postContent={mainEntity} disabled={true} />
                    </div>
                )
        }
    }

    return (
        <div className={cn(
            "w-full flex flex-col pb-20",
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
                        {title}
                    </p>
                </div>
            </div>
            {initialLoading
              ? <CommentThreadSkeleton withHero={type === "POST"} />
              : error && comments.length === 0
                ? ( <div className="w-full h-screen flex flex-col gap-3 items-center justify-center">
                    <BiSolidError size={40} className="text-red-600"/>
                    <h2>Unable to load comments</h2>
                </div>)
                : (
                  <div>
                      <div className="w-full flex flex-col gap-4 px-4">
                          <h1 className="text-md font-semibold text-foreground pt-4">
                              {title} ({numOfComments})
                          </h1>
                      </div>
                      {
                          renderMainEntity()
                      }
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

                      {/* Loading indicator for pagination */}
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
                              onClick={() => loadComments(false)}
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
