"use client";

import * as React from "react";
import {
    FaRegHeart,
    FaRegComment,
    FaFlag,
} from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { AiOutlineSend } from "react-icons/ai";
import { authApi } from "@/lib/axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserSinglePlaceholder } from "@/components/ui/user-placeholder";
import { showTopToast } from "@/components/toast/toast-util";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { SlOptionsVertical } from "react-icons/sl";
import { MdDeleteOutline } from "react-icons/md";
import { ComponentProps, FC, memo, useCallback, useMemo, useState } from "react";
import { useAuthStore } from '@/store/auth-store';
import { ReportDrawer } from "@/components/report/report-drawer";
import { Linkify } from "@/lib/linkify";

type AnyRecord = Record<string, any>;


interface CommentCardProps extends ComponentProps<"div"> {
    comment: { [key: string]: any };
    currentPathUrl: string;
    disabled?: boolean;
    onDelete?: (commentId: string) => void;
    isForUser?: boolean;
}

export const CommentCard = ({
    comment, currentPathUrl, onDelete, disabled = false, isForUser, className, ...props
}: CommentCardProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isDisabled = Boolean(disabled);

    const { isAuthenticated } = useAuthStore();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean>(comment.isLikedByUser);
    const [isLikedLoading, setIsLikedLoading] = useState(false);
    const [totalReactions, setTotalReactions] = useState<number>(comment.totalLikes);
    const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);


    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    const handleDelete = useCallback(async () => {
        if (isDisabled || isDeleteLoading) return;
        setIsDeleteLoading(true);
        try {
            await authApi.delete(`/comment/${comment.id}`);
            closeDrawer();
            onDelete?.(comment.id);
            showTopToast("success", "Comment deleted successfully.");
        } catch (error: any) {
            showTopToast("error", error?.message || "Error deleting comment");
        } finally {
            setIsDeleteLoading(false);
        }
    }, [isDisabled, isDeleteLoading, comment.id, onDelete, closeDrawer]);

    const handleReaction = useCallback(async () => {
        if (isLikedLoading) return;

        setIsLikedLoading(true);

        // Optimistic update
        const nextLiked = !isLiked;
        setTotalReactions((prev) => prev + (nextLiked ? 1 : -1));

        try {
            setIsLiked(nextLiked);
            await authApi.post(`/reaction/react`, {
                reactionType: "COMMENT",
                commentId: comment.id,
            });
        } catch (err: any) {
            // rollback
            setIsLiked(!nextLiked);
            setTotalReactions((prev) => prev + (nextLiked ? -1 : 1));
            showTopToast("error", err?.message || "Something went wrong");
        } finally {
            setIsLikedLoading(false);
        }
    }, [isDisabled, isLikedLoading, isLiked, comment.id]);

    const goToReplies = useCallback(() => {
        if (isDisabled) return;
        router.push(
            `/m/comment/${comment.id}` +
            `?prev=${encodeURIComponent(currentPathUrl)}` +
            `&type=COMMENT_REPLY`
        );
    }, [isDisabled, router, comment.id, currentPathUrl]);

    return (
        <>
            <div
                className={cn(
                    "flex flex-col gap-2 py-5 px-6 border border-border rounded-lg bg-background",
                    className
                )}
                {...props}
            >
                {/* author + date + menu */}
                <div className="flex items-center justify-between">
                    <UserSinglePlaceholder
                        user={comment.userPlaceHolder}
                        prev={`${pathname}?${searchParams}`}
                    />

                    <span className="inline-flex items-center justify-center">
                        <p className="text-sm text-neutral-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        <button
                            type="button"
                            aria-label="More options"
                            className={cn("bg-none pl-5 transition-opacity", isDisabled && "pointer-events-none opacity-50")}
                            disabled={disabled}
                            onClick={() => setDrawerOpen(true)}
                        >
                            <SlOptionsVertical className="text-neutral-500" />
                        </button>

                    </span>
                </div>

                {/* comment text */}
                <Linkify text={comment.comment} className="text-foreground text-sm mt-3 mb-5" />

                {/* actions */}
                <div className="flex items-center justify-between gap-6 text-neutral-400 font-bold">
                    {/* Likes */}
                    {isAuthenticated &&
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{totalReactions}</span>
                            <button
                                type="button"
                                onClick={handleReaction}
                                disabled={isLikedLoading}
                                aria-pressed={isLiked}
                                aria-busy={isLikedLoading}
                                className={cn("font-inherit transition-opacity", (isLikedLoading || isDisabled) && "opacity-50")}
                            >
                                {isLiked ? (
                                    <FaHeart
                                        className="w-5 h-5 text-red-500 animate-[heartBeat_0.3s_ease-in-out]"
                                        style={{
                                            animation: 'heartBeat 0.2s ease-in-out'
                                        }}
                                    />
                                ) : (
                                    <FaRegHeart className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    }

                    {/* Replies */}
                    <button
                        type="button"
                        onClick={goToReplies}
                        className={cn("flex items-center gap-2", isDisabled && "opacity-50 cursor-not-allowed")}
                        aria-disabled={isDisabled || undefined}
                    >
                        <span className="text-sm">{comment.totalComments}</span>
                        <FaRegComment className="w-5 h-5" />
                    </button>

                    {/* Share / send (wire up later) */}
                    <button
                        type="button"
                        className={cn("cursor-pointer", isDisabled && "opacity-50 cursor-not-allowed")}
                        aria-label="Share"
                        aria-disabled={isDisabled || undefined}
                        onClick={() => {
                            if (isDisabled) return;
                            showTopToast("info", "Share coming soon.");
                        }}
                    >
                        <AiOutlineSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <Drawer
                open={!isDisabled && drawerOpen}
                onOpenChange={(open) => {
                    if (!isDisabled) setDrawerOpen(open);
                }}
            >
                <DrawerContent className="z-9999">
                    <div className="w-full px-4 pb-4">
                        <DrawerHeader>
                            <DrawerTitle>Action</DrawerTitle>
                        </DrawerHeader>

                        {isForUser ? (
                            <button
                                type="button"
                                className="flex gap-2 items-center py-4 text-red-600"
                                onClick={handleDelete}
                                disabled={isDeleteLoading}
                                aria-busy={isDeleteLoading}
                            >
                                <MdDeleteOutline size={16} />
                                <span className="font-semibold">
                                    {isDeleteLoading ? "Deleting..." : "Delete"}
                                </span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="flex gap-2 items-center py-4"
                                onClick={() => {
                                    closeDrawer();
                                    setIsReportDrawerOpen(true);
                                }}
                            >
                                <FaFlag />
                                <span className="font-semibold">Report</span>
                            </button>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

            <ReportDrawer
                isOpen={isReportDrawerOpen}
                onClose={() => setIsReportDrawerOpen(false)}
                entityType="COMMENT"
                commentId={comment.id}
            />
        </>
    )
};
