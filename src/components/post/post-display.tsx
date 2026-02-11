"use client"

import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { FiPlus, FiSettings } from 'react-icons/fi';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { Loader } from "@/components/ui/loader";
import { FaPlus } from "react-icons/fa";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";

interface PostDisplayProps extends ComponentProps<"div"> { }

export const PostDisplay = ({ className, ...props }: PostDisplayProps) => {

    const router = useRouter();

    const [posts, setPosts] = useState<Array<{ [key: string]: any }>>([]);
    const [hasMore, setHasMore] = useState(true);
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


    return (
        <div
            className={cn(
                "w-full flex flex-col min-h-[100dvh] bg-gray-50",
                className,
            )}
            style={{ maxHeight: "calc(100dvh - 80px)" }}
        >
            <div className={cn(
                "w-full border-b-1 border-b-neutral-300 flex flex-col gap-3 py-4 justify-center",
                className
            )} {...props}>
                <div className="flex flex-row items-center justify-between px-4">
                    <span className="text-xl font-bold">Posts</span>
                    <button
                        className="bg-transparent rounded-none p-0 shadow-none"
                        onClick={() => router.push(`/m/settings?prev=${encodeURIComponent("/?screen=posts")}`)}
                    >
                        <FiSettings size={20} className="text-black" />
                    </button>
                </div>
            </div>

            <div
                className="w-full flex flex-col"
                {...props}
            >
                <div className="w-full flex flex-col gap-2 pt-4 pb-20">
                    {posts.map((post) => (
                        <PostCard key={post.id} postContent={post} />
                    ))}
                </div>

                {loading && (
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