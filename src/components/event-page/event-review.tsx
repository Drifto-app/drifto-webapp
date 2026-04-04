"use client"

import * as React from "react";
import {cn} from "@/lib/utils";
import {CommentCard} from "@/components/comment/comment-card";
import {authApi} from "@/lib/axios";
import {toast} from "react-toastify";
import {Loader, LoaderSmall} from "@/components/ui/loader";
import {useEffect, useRef, useCallback, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { IoChatbubbleEllipsesOutline, IoSend } from 'react-icons/io5';
import { showTopToast } from "../toast/toast-util";
import { useAuthStore } from '@/store/auth-store';
import { FaRegCommentDots } from 'react-icons/fa';
import { CommentThreadSkeleton } from "@/components/ui/page-skeletons";

interface SingleEventReviewsProps extends React.ComponentProps<"div">{
    event: {[key: string]: any};
    currentPathUrl: string;
}

export const SingleEventReviews = ({
  event, currentPathUrl, className, ...props}: SingleEventReviewsProps) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    // State for infinite scroll
    const [comments, setComments] = useState<any[]>([]);
    const [numOfComments, setNumOfComments] = useState<number>(0);
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

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setSubmitCommentLoading(true);

        if(comment == null || comment == ""){
            showTopToast("error", "Comment must specify a comment");
            setSubmitCommentLoading(false);
            return;
        }

        const params = {
            comment,
            commentType: "EVENT",
            eventId: event.id
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
            const currentPage = resetData ? 1 : pageRef.current;

            const params = {
                pageSize: 10,
                pageNumber: currentPage,
                commentType: "EVENT"
            };

            let response;
            if (!isLoading && isAuthenticated) {
                response = await authApi.get(`/comment/entity/${event.id}`, {
                    params
                });
            } else {
                response = await authApi.get(`/comment/public/entity/${event.id}`, {
                    params
                });

            }

            const newComments = response.data.data.data;
            setNumOfComments(response.data.data.totalElements)

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
    }, [event.id]);

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

    // Loading state for initial load
    if (initialLoading) {
        return (
            <div className={cn(
                "w-full flex flex-col items-center justify-center min-h-[85vh]",
                className,
                event.eventTheme !== null ? "" : "bg-muted/40",
            )} {...props}>
                <div className="w-full">
                    <CommentThreadSkeleton count={4} />
                </div>
            </div>
        );
    }

    // Error state
    if (error && comments.length === 0) {
        return (
            <div className={cn(
                "w-full flex flex-col items-center justify-center min-h-[85vh]",
                className,
                event.eventTheme !== null ? "" : "bg-muted/40",
            )} {...props}>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h2>Unable to load comments</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full min-h-[85vh] pb-20",
            className,
            event.eventTheme !== null ? "" : "bg-muted/40",
        )} {...props}>

            <div className="w-full flex flex-col gap-4 px-4">
                <h1 className="text-md font-semibold text-foreground pt-4">
                    Event Reviews ({numOfComments})
                </h1>
            </div>

            <div className="w-full flex flex-col gap-6 px-4 py-4">
                {comments.map((c) => (
                    <CommentCard
                        key={c.id}
                        comment={c}
                        currentPathUrl={currentPathUrl}
                        isForUser={c.mine}
                        onDelete={(commentId: string) => setComments(comments => comments.filter((c) => c.id !== commentId))}
                    />
                ))}
            </div>

            {isAuthenticated &&
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
                    className="min-h-16 outline-none w-full px-6 border-none"
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
            }

            {/* Loading indicator for pagination */}
            {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

            {/* No comments message */}
            {!loading && !initialLoading && comments.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-8">
                    <IoChatbubbleEllipsesOutline size={40} className="text-neutral-500"/>
                    <p className="text-gray-500 font-semibold">No reviews found</p>
                </div>
            )}

            {error && comments.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 pt-4 pb-15 w-full">
                    <p className="text-orange-700 text-sm mb-2">
                        Failed to load more reviews
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
    )
}
