/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { UserSinglePlaceholder } from "@/components/ui/user-placeholder";
import * as React from "react";
import { FaFlag, FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineSend } from "react-icons/ai";
import { MediaCarousel, MediaDialog } from "@/components/post/post-media";
import { Linkify } from "@/lib/linkify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlOptionsVertical } from "react-icons/sl";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MdDeleteOutline } from "react-icons/md";
import { ReportDrawer } from "@/components/report/report-drawer";
import { DESKTOP_ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps extends ComponentProps<"div"> {
    postContent: { [key: string]: any };
    disabled?: boolean;
    isForUser?: boolean;
    onDelete?: (postId: string) => void;
    variant?: "mobile" | "desktop";
}

export const PostCard = ({
    postContent, disabled = false, isForUser = false, onDelete, variant = "mobile", className, ...props
}: PostCardProps) => {
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(postContent.isLikedByUser);
    const [isLikedLoading, setIsLikedLoading] = useState<boolean>(false);
    const [totalReactions, setTotalReactions] = useState<number>(
        postContent.totalLikes
    );
    const [showMediaDialog, setShowMediaDialog] = useState<boolean>(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
    const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(false);
    const prevUrl = pathname + "?" + searchParams;
    const isDesktop = variant === "desktop";
    const postDetailPath = isDesktop
        ? `${DESKTOP_ROUTES.postDetail(postContent.id)}?prev=${encodeURIComponent(prevUrl)}`
        : `/m/post/${postContent.id}?prev=${encodeURIComponent(prevUrl)}`;
    const userHref = (id: string) =>
        isDesktop
            ? `${DESKTOP_ROUTES.userDetail(id)}?prev=${encodeURIComponent(prevUrl)}`
            : `/m/user/${id}?prev=${encodeURIComponent(prevUrl)}`;
    const eventHref = (id: string) =>
        isDesktop
            ? `${DESKTOP_ROUTES.eventDetail(id)}?prev=${encodeURIComponent(prevUrl)}`
            : `/m/events/${id}?prev=${encodeURIComponent(prevUrl)}`;
    const reactionPath = isDesktop
        ? `${DESKTOP_ROUTES.reactionDetail(postContent.id)}?prev=${encodeURIComponent(prevUrl)}&type=POST`
        : `/m/reaction/${postContent.id}?prev=${encodeURIComponent(prevUrl)}&type=POST`;

    const handleReaction = async () => {
        if (isLikedLoading) return;

        setIsLikedLoading(true);

        const newLiked = !isLiked;
        setTotalReactions((prev) => prev + (newLiked ? 1 : -1));

        try {
            setIsLiked(newLiked);
            await authApi.post(`/reaction/react`, {
                reactionType: "POST",
                postId: postContent.id,
            })
        } catch (err: any) {
            setIsLiked(!newLiked);
            showTopToast("error", err.message);
            setTotalReactions((prev) => prev + (newLiked ? -1 : 1));
        } finally {
            setIsLikedLoading(false);
        }
    }

    const handleMediaClick = (index: number) => {
        setSelectedMediaIndex(index);
        setShowMediaDialog(true);
    };

    const handleCloseMediaDialog = () => {
        setShowMediaDialog(false);
    };

    const handleDelete = async () => {
        setIsDeleteLoading(true)

        try {
            await authApi.delete(`/post/${postContent.id}`)
            setDrawerOpen(false);
            onDelete?.(postContent.id);
            showTopToast("success", "Post deleted successfully.");
        } catch {
            showTopToast("error", "Error deleting post");
        } finally {
            setIsDeleteLoading(false);
        }
    }

    return (
        <>
            <div
                className={cn(
                    "w-full border-border",
                    isDesktop ? "rounded-2xl border bg-card p-5 shadow-sm" : "border-b-1 py-4",
                    className,
                )}
                {...props}
            >
                <div className={cn("w-full flex flex-col gap-6", isDesktop ? "px-0" : "px-4")}>
                    <div className="flex items-center justify-between">
                        <UserSinglePlaceholder user={postContent.userPlaceHolder} prev={prevUrl} variant={variant} />
                        <span className="inline-flex items-center justify-center">
                            <p
                                className="text-sm text-neutral-500 cursor-pointer"
                                onClick={() => {
                                    if (!disabled) {
                                        router.push(postDetailPath)
                                    }
                                }}
                            >
                                {new Date(postContent.createdAt).toLocaleDateString()}
                            </p>
                            {disabled || (isDesktop ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="bg-none pl-5"
                                            aria-label="Post actions"
                                        >
                                            <SlOptionsVertical className="text-neutral-500" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" sideOffset={10} className="w-48 rounded-xl p-2">
                                        <DropdownMenuLabel className="px-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                                            Action
                                        </DropdownMenuLabel>
                                        {isForUser ? (
                                            <DropdownMenuItem
                                                variant="destructive"
                                                className="rounded-lg px-3 py-2.5 font-semibold"
                                                disabled={isDeleteLoading}
                                                onSelect={(event) => {
                                                    event.preventDefault();
                                                    void handleDelete();
                                                }}
                                            >
                                                <MdDeleteOutline size={16} />
                                                {isDeleteLoading ? "Deleting..." : "Delete"}
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                className="rounded-lg px-3 py-2.5 font-semibold"
                                                onSelect={() => setIsReportDrawerOpen(true)}
                                            >
                                                <FaFlag />
                                                Report
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                                    <DrawerTrigger asChild>
                                        <button
                                            className="bg-none pl-5"
                                            onClick={() => setDrawerOpen(true)}
                                        >
                                            <SlOptionsVertical className="text-neutral-500" />
                                        </button>
                                    </DrawerTrigger>

                                    <DrawerContent className="z-99999">
                                        <div className="w-full px-4 pb-4">
                                            <DrawerHeader>
                                                <DrawerTitle>Action</DrawerTitle>
                                            </DrawerHeader>

                                            {isForUser ? (
                                                <button
                                                    className="flex gap-2 items-center py-4 text-red-600"
                                                    onClick={handleDelete}
                                                    disabled={isDeleteLoading}
                                                >
                                                    <MdDeleteOutline size={16} />
                                                    <span className="font-semibold">
                                                        {isDeleteLoading ? "Deleting..." : "Delete"}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className="flex gap-2 items-center py-4"
                                                    onClick={() => {
                                                        setDrawerOpen(false);
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
                            ))}
                        </span>
                    </div>
                    <div
                        className="w-full flex flex-col gap-2 cursor-pointer"
                        onClick={() => {
                            if (!disabled) {
                                router.push(postDetailPath)
                            }
                        }}
                    >
                        <span className="flex flex-col gap-2">
                            <Linkify text={postContent.content} className={cn("text-foreground", isDesktop ? "text-base leading-7" : "text-sm")} />
                            <span className="flex flex-wrap gap-1 text-blue-600" onClick={(e) => e.stopPropagation()}>
                                {postContent.taggedUsers.map((tagUser: { [key: string]: any }) => (
                                    <a
                                        key={tagUser.id}
                                        className="leading-tight"
                                        href={userHref(tagUser.id)}
                                    >
                                        @{tagUser.username}
                                    </a>
                                ))}
                            </span>
                            <span className="flex flex-wrap gap-1 text-blue-600" onClick={(e) => e.stopPropagation()}>
                                {postContent.taggedEvents.map((tagEvent: { [key: string]: any }) => (
                                    <a
                                        key={tagEvent.eventId}
                                        className="leading-tight"
                                        href={eventHref(tagEvent.eventId)}
                                    >
                                        #{tagEvent.title}
                                    </a>
                                ))}
                            </span>
                            <span className="w-full" onClick={(e) => e.stopPropagation()}>
                                {postContent.mediaFiles && postContent.mediaFiles.length > 0 && (
                                    <MediaCarousel
                                        mediaFiles={postContent.mediaFiles}
                                        itemClickAction={handleMediaClick}
                                    />
                                )}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400 font-bold">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="text-sm"
                                onClick={() => {
                                    if (!disabled) router.push(reactionPath);
                                }}
                            >
                                {totalReactions}
                            </button>
                            <button
                                onClick={handleReaction}
                                disabled={isLikedLoading}
                                className="font-inherit"
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

                        <div className="flex items-center gap-2" onClick={() => {
                            if (!disabled) {
                                router.push(postDetailPath)
                            }
                        }}>
                            <span className="text-sm">{postContent.totalComments}</span>
                            <FaRegComment className="w-5 h-5" />
                        </div>

                        {isDesktop ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 rounded-full px-3 text-muted-foreground"
                                onClick={() => {
                                    if (!disabled) router.push(postDetailPath)
                                }}
                            >
                                Open thread
                            </Button>
                        ) : (
                            <AiOutlineSend
                                className="w-5 h-5 cursor-pointer"
                                onClick={() => {
                                    if (!disabled) router.push(postDetailPath)
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <MediaDialog
                mediaFiles={postContent.mediaFiles || []}
                initialIndex={selectedMediaIndex}
                isOpen={showMediaDialog}
                onClose={handleCloseMediaDialog}
            />

            <ReportDrawer
                isOpen={isReportDrawerOpen}
                onClose={() => setIsReportDrawerOpen(false)}
                entityType="POST"
                postId={postContent.id}
            />
        </>
    )
}
