"use client"

import { cn } from "@/lib/utils";
import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import {PostCard} from "@/components/post/post-card";
import * as React from "react";
import {Loader} from "@/components/ui/loader";
import { PostFeedSkeleton } from "@/components/ui/page-skeletons";

interface UserPostsProps extends ComponentProps<"div">{
    user: {[key:string]: any};
    isForUser?: boolean;
}

export const UserPosts = ({
    user, isForUser = false, className, ...props
}: UserPostsProps) => {

    const [posts, setPosts] = useState<Array<{[key: string]: any}>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);

    const loadPosts = useCallback(
        async (reset: boolean = false) => {
            if (loadingRef.current || (!reset && !hasMoreRef.current)) return;

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentPage = reset ? 1 : pageRef.current;

                const params: { [key: string]: string | number } = {
                    pageSize: 10,
                    pageNumber: currentPage,
                };

                let response
                if(isForUser) {
                    response = await authApi.get(`/post/user`, { params });
                } else {
                    response = await authApi.get(`/post/user/${user.id}`, { params });
                }

                const newPosts = response.data.data.data as Array<Record<string, any>>;

                if (reset) {
                    setPosts(newPosts);
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setPosts((prev) => [...prev, ...newPosts]);
                    pageRef.current = currentPage + 1;
                }

                const isLast = response.data.data.isLast;
                setHasMore(!isLast);
                hasMoreRef.current = !isLast;
            } catch (err: any) {
                showTopToast("error", err.message || "Error loading comments");
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        [user]
    );

    useEffect(() => {
        setPosts([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadPosts(true);
    }, [loadPosts]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    !loadingRef.current &&
                    hasMoreRef.current &&
                    !error
                )  loadPosts();
            },
            {
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadPosts, error]);

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4 flex-1 pt-4 overflow-y-auto no-scrollbar pb-10",
                className
            )}
            {...props}
            ref={scrollRootRef}
            style={{ maxHeight: "calc(100dvh - 80px)" }}
        >
            {loading && posts.length === 0 ? (
                <PostFeedSkeleton />
            ) : (
                <div className="flex flex-col gap-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            postContent={post}
                            isForUser={isForUser}
                            onDelete={(postId) => {setPosts((post) => post.filter(p => p.id !== postId))}}
                        />
                    ))}
                </div>
            )}

            <div ref={sentinelRef} aria-hidden className="h-1" />

            {loading && posts.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

        </div>
    )
}
