"use client"

import * as React from "react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {FaArrowLeft} from "react-icons/fa";
import {CommentCard} from "@/components/comment/comment-card";
import {authApi} from "@/lib/axios";
import {toast} from "react-toastify";
import {Loader} from "@/components/ui/loader";
import {useEffect, useRef, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {UserSinglePlaceholder} from "@/components/ui/user-placeholder";
import {showTopToast} from "@/components/toast/toast-util";
import { UserListSkeleton } from "@/components/ui/page-skeletons";

interface ReactionManageProps extends React.ComponentProps<"div">{
    entityId: string;
    type: string;
    onBackClick?: () => void;
    prev: string | null;
    currentPathUrl: string
}

export default function ReactionManagePage(
    {entityId, currentPathUrl, onBackClick, prev, type, className, ...props}: ReactionManageProps
) {
    const router = useRouter();

    // State for infinite scroll
    const [users, setUsers] = React.useState<any[]>([]);
    const [title, setTitle] = React.useState<string>("");
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Refs for infinite scroll logic
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);

    const loadReactions = useCallback(async (resetData = false) => {
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        if (resetData) {
            setInitialLoading(true);
        }
        setError(null);

        try {
            const currentPage = resetData ? 1 : pageRef.current;

            const params: {[key: string]: string | number} = {
                pageSize: 10,
                pageNumber: currentPage,
                reactionType: type
            };

            const response = await authApi.get(`/reaction/entity/${entityId}`, {
                params
            });

            const newUsers = response.data.data.data;

            if (resetData) {
                setUsers(newUsers);
                pageRef.current = 2;
            } else {
                setUsers((prev) => [...prev, ...newUsers]);
                pageRef.current = currentPage + 1;
            }

            if(type === "COMMENT_REPLY") {
                setTitle("Comment Reactions");
            } else if(type === "POST") {
                setTitle("Post Reactions")
            }else if(type === "EVENT") {
                setTitle("Event Reactions")
            }

            const isLast = response.data.data.isLast;
            setHasMore(!isLast);
            hasMoreRef.current = !isLast;

        } catch (err: any) {
            showTopToast("error", err.message || "Error loading user reactions");
            setError(err.message);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            loadingRef.current = false;
        }
    }, [entityId, type]);

    // Initial load
    useEffect(() => {
        setUsers([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadReactions(true);
    }, [loadReactions]);

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
                loadReactions(false);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [loadReactions, error]);

    const handleBackClick = () => {
        if (onBackClick) {
            // Use custom back navigation if provided
            onBackClick();
        } else {
            // Default router navigation
            router.push(prev != null ? prev : "/");
        }
    }

    // Loading state for initial load
    if (initialLoading) {
        return (
            <div className={cn(
                "w-full flex flex-col items-center justify-center",
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
                        <p className="font-semibold text-foreground text-xl w-full text-center capitalize truncate ml-4">
                            {title}
                        </p>
                    </div>
                </div>
                <div className="w-full px-4 py-4">
                    <UserListSkeleton count={5} />
                </div>
            </div>
        );
    }

    // Error state
    if (error && users.length === 0) {
        return (
            <div className={cn(
                "w-full flex flex-col items-center justify-center",
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
                        <p className="font-semibold text-foreground text-xl w-full text-center capitalize truncate ml-4">
                            {<title></title>}
                        </p>
                    </div>
                </div>
                <div className="w-full h-screen flex flex-col items-center justify-center">
                    <h2>Unable to users reactions</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full flex flex-col items-center justify-center pb-20",
            className
        )} {...props}>
            <div className="w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center">
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
            <div className="w-full flex flex-col gap-4 px-4">
                <h1 className="text-md font-semibold text-foreground pt-4">
                    {title} ({users.length})
                </h1>
            </div>
            <div className="w-full flex flex-col gap-6 px-4 py-4">
                {users.map((user) => (
                    <div key={user.id} className="rounded-lg border-1 px-4 py-4 border-neutral-800">
                        <UserSinglePlaceholder user={user}  />
                    </div>
                ))}
            </div>

            {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

            {!hasMore && users.length > 0 && (
                <p className="py-4 text-gray-500">You have reached the end!</p>
            )}

            {!loading && !initialLoading && users.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500">No user reaction found</p>
                </div>
            )}

            {error && users.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 pt-4 pb-15 w-full">
                    <p className="text-orange-700 text-sm mb-2">
                        Failed to load more user reactions
                    </p>
                    <Button
                        onClick={() => loadReactions(false)}
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
