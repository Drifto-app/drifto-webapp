"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { FiPlus, FiSettings } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { Loader } from "@/components/ui/loader";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { PostFeedSkeleton } from "@/components/ui/page-skeletons";
import { DESKTOP_ROUTES } from "@/lib/routes";
import { MessageSquareText, Plus, Sparkles } from "lucide-react";

interface PostDisplayProps extends ComponentProps<"div"> {
    variant?: "mobile" | "desktop";
}

export const PostDisplay = ({ variant = "mobile", className, ...props }: PostDisplayProps) => {

    const router = useRouter();
    const isDesktop = variant === "desktop";

    const [posts, setPosts] = useState<Array<{ [key: string]: any }>>([]);
    const [, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const queuedRef = useRef(false);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

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

                const response = await authApi.get(`/feed/post`, { params });

                const newPosts = response.data.data.data as Array<{ [key: string]: any }>;

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
                showTopToast("error", err.message || "Error loading posts");
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        []
    );

    // Initial load
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
                if (!entry.isIntersecting) return;

                if (loadingRef.current) {
                    queuedRef.current = true;
                    return;
                }

                if (hasMoreRef.current && !error) loadPosts();
            },
            {
                root: null,
                rootMargin: "100px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadPosts, error]);

    useEffect(() => {
        if (!loading && queuedRef.current && hasMoreRef.current && !error) {
            queuedRef.current = false;
            loadPosts();
        }
    }, [loading, error, loadPosts]);


    if (isDesktop) {
        return (
            <div
                className={cn("min-h-full bg-background text-foreground", className)}
                {...props}
            >
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_clamp(20rem,22vw,24rem)]">
                    <section className="min-w-0">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                                    Social
                                </p>
                                <h1 className="mt-1 text-4xl font-black tracking-tight">Posts</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Follow event updates, creator notes, and tagged conversations from the Drifto community.
                                </p>
                            </div>
                            <Button
                                className="h-11 rounded-full"
                                onClick={() => router.push(`${DESKTOP_ROUTES.createPost}?prev=${encodeURIComponent("/?screen=posts")}`)}
                            >
                                <Plus size={17} />
                                Create post
                            </Button>
                        </div>

                        {loading && posts.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <PostFeedSkeleton />
                            </div>
                        ) : error && posts.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card p-10 text-center">
                                <p className="font-black">Unable to load posts</p>
                                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                                <Button className="mt-5 rounded-full" onClick={() => loadPosts(true)}>
                                    Try again
                                </Button>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                                <MessageSquareText className="mx-auto text-muted-foreground" size={36} />
                                <p className="mt-4 font-black">No posts yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">Create the first post for your community feed.</p>
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {posts.map((post) => (
                                    <PostCard key={post.id} postContent={post} variant="desktop" />
                                ))}
                            </div>
                        )}

                        {loading && posts.length > 0 && (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="h-8 w-8" />
                            </div>
                        )}

                        <div ref={sentinelRef} aria-hidden className="h-8" />
                    </section>

                    <aside className="hidden xl:block">
                        <div className="sticky top-8 space-y-4">
                            <div className="rounded-2xl border border-border bg-card p-5">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                    <Sparkles size={21} />
                                </span>
                                <h2 className="mt-4 text-xl font-black">Share what is happening.</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Tag users with @ and events with # to connect posts to the right people and experiences.
                                </p>
                                <Button
                                    className="mt-5 h-11 w-full rounded-full"
                                    onClick={() => router.push(`${DESKTOP_ROUTES.createPost}?prev=${encodeURIComponent("/?screen=posts")}`)}
                                >
                                    <Plus size={17} />
                                    New post
                                </Button>
                            </div>
                           
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col min-h-[100dvh] bg-accent/40",
                className,
            )}
            style={{ maxHeight: "calc(100dvh - 80px)" }}
        >
            <div className={cn(
                "w-full border-b-1 border-border flex flex-col gap-3 py-4 justify-center",
                className
            )} {...props}>
                <div className="flex flex-row items-center justify-between px-4">
                    <span className="text-xl font-bold">Posts</span>
                    <button
                        className="bg-transparent rounded-none p-0 shadow-none"
                        onClick={() => router.push(`/m/settings?prev=${encodeURIComponent("/?screen=posts")}`)}
                    >
                        <FiSettings size={20} className="text-foreground" />
                    </button>
                </div>
            </div>

            <div
                className="w-full flex flex-col"
                {...props}
            >
                {loading && posts.length === 0 ? (
                    <PostFeedSkeleton />
                ) : (
                    <div className="w-full flex flex-col gap-2 pt-4 pb-20">
                        {posts.map((post) => (
                            <PostCard key={post.id} postContent={post} />
                        ))}
                    </div>
                )}

                {loading && posts.length > 0 && (
                    <div className="w-full flex items-center justify-center pt-5 pb-10">
                        <Loader className="h-8 w-8" />
                    </div>
                )}
            </div>

            <div ref={sentinelRef} aria-hidden className="h-1" />

            <div className="fixed bottom-20 right-4" onClick={() => router.push(`/m/post/create?prev=${encodeURIComponent("/?screen=posts")}`)}>
                <span className="flex items-center justify-center rounded-full w-14 h-14 bg-blue-800 text-white shadow-xl">
                    <FiPlus size={22} />
                </span>
            </div>
        </div>
    )
}
