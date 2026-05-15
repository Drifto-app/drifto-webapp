"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, uploadMedia } from "@/lib/utils";
import { ChangeEvent, ComponentProps, useState, useRef, useEffect, useCallback } from "react";
import { FaArrowLeft, FaPlay } from "react-icons/fa";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Hash, ImagePlus, Send, X } from "lucide-react";
import { LoaderSmall } from "@/components/ui/loader";
import { showTopToast } from "@/components/toast/toast-util";
import { authApi } from "@/lib/axios";
import { Dialog } from "@headlessui/react";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import defaultImage from "@/assests/default.jpeg";

interface CreatePostContentProps extends ComponentProps<"div"> {
    prev: string | null,
    variant?: "mobile" | "desktop";
}

type MediaFileType = { url: string, type: "VIDEO" | "IMAGE" };

interface MentionState {
    isActive: boolean;
    searchTerm: string;
    type: 'user' | 'event' | null;
    position: number;
    results: { [key: string]: any }[];
    selectedIndex: number;
    loading: boolean;
    hasMore: boolean;
    pageNumber: number;
}

export const CreatePostContent = ({
    prev, variant = "mobile", className, ...props
}: CreatePostContentProps) => {
    const router = useRouter();
    const isDesktop = variant === "desktop";
    const { user } = useAuthStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mentionDropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>(null);

    const [postText, setPostText] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<MediaFileType[] | null>(null);
    const [tagEvents, setTagEvents] = useState<{ name: string, id: string }[]>([]);
    const [tagUsers, setTagUsers] = useState<{ name: string, id: string }[]>([]);

    const [isPostLoading, setIsPostLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeMediaFile, setActiveMediaFile] = useState<MediaFileType | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [mentionState, setMentionState] = useState<MentionState>({
        isActive: false,
        searchTerm: '',
        type: null,
        position: 0,
        results: [],
        selectedIndex: 0,
        loading: false,
        hasMore: true,
        pageNumber: 1,
    });

    const handleBackClick = () => {
        router.push(prev != null ? prev : "/");
    }

    const openModal = (file: MediaFileType) => {
        setActiveMediaFile(file);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveMediaFile(null);
    };

    const handleFileRemove = (url: string) => {
        const next = mediaFiles ? mediaFiles.filter((file) => file.url !== url) : null;
        setMediaFiles(next ?? null);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        handleImagesAddMany(files);
        e.target.value = "";
    };

    const handleImagesAddMany = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const all = Array.from(files);
        const newMediaFiles: { file: File, type: "VIDEO" | "IMAGE" }[] = all.filter(
            (file) =>
                (file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE) ||
                (file.type.startsWith("video/") && file.size <= MAX_VIDEO_SIZE)
        ).map((file) => ({
            file, type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        }));

        if (newMediaFiles.length === 0) {
            showTopToast("error", "Please select valid image files");
            return;
        }

        setIsUploading(true);

        const uploaded: MediaFileType[] = [];

        for (const file of newMediaFiles) {
            const url = await uploadSingle(file.file);
            if (url) uploaded.push({ url, type: file.type });
        }

        if (uploaded.length > 0) {
            const next = [...mediaFiles || [], ...uploaded];
            setMediaFiles(next);
        }

        setIsUploading(false);
    };

    const uploadSingle = async (file: File): Promise<string | null> => {
        try {
            const response = await uploadMedia(file, "POST_MEDIA")

            if (!response) {
                showTopToast("error", "Upload failed.");
                return null;
            }

            return response;
        } catch (error: any) {
            showTopToast(
                "error",
                error?.response?.data?.description || "Upload failed. Please try again."
            );
            return null;
        }
    };

    // Search API function
    const searchAPI = async (query: string, type: 'user' | 'event', pageNum: number = 1): Promise<{ results: { [key: string]: any }[], hasMore: boolean }> => {
        try {
            const searchType = type === 'user' ? 'USER' : 'EVENT';
            const res = await authApi.get("/search", {
                params: {
                    search: query,
                    searchType: searchType,
                    pageNumber: pageNum,
                    pageSize: 10
                },
            });

            if (res.data?.success) {
                const results = type === "user" ? res.data.data?.users.data : res.data.data?.events.data;
                const hasMore = type === "user" ? !res.data.data?.users.isLast : !res.data.data?.events.isLast;
                return { results, hasMore };
            }
            return { results: [], hasMore: false };
        } catch {
            showTopToast("error", `Load ${type} mention error`)
            return { results: [], hasMore: false };
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback((query: string, type: 'user' | 'event', pageNum: number = 1) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        setMentionState(prev => ({
            ...prev,
            loading: true
        }));

        debounceTimeoutRef.current = setTimeout(async () => {
            if (query.trim()) {
                const { results, hasMore } = await searchAPI(query, type, pageNum);
                setMentionState(prev => ({
                    ...prev,
                    results: pageNum === 1 ? results : [...prev.results, ...results],
                    loading: false,
                    hasMore,
                    pageNumber: pageNum
                }));
            } else {
                setMentionState(prev => ({
                    ...prev,
                    results: [],
                    loading: false,
                    hasMore: true,
                    pageNumber: 1
                }));
            }
        }, 350);
    }, []);

    // Load more results for infinite scroll
    const loadMoreResults = useCallback(() => {
        if (mentionState.loading || !mentionState.hasMore) return;

        const nextPage = mentionState.pageNumber + 1;
        debouncedSearch(mentionState.searchTerm, mentionState.type!, nextPage);
    }, [mentionState.loading, mentionState.hasMore, mentionState.pageNumber, mentionState.searchTerm, mentionState.type, debouncedSearch]);

    // Handle textarea changes and detect mentions/hashtags
    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart;

        setPostText(value);

        // Find mention/hashtag trigger
        const textBeforeCursor = value.slice(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');

        let triggerIndex = -1;
        let triggerType: 'user' | 'event' | null = null;

        if (lastAtIndex > lastHashIndex && lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                triggerIndex = lastAtIndex;
                triggerType = 'user';
            }
        } else if (lastHashIndex > lastAtIndex && lastHashIndex !== -1) {
            const textAfterHash = textBeforeCursor.slice(lastHashIndex + 1);
            if (!textAfterHash.includes(' ') && !textAfterHash.includes('\n')) {
                triggerIndex = lastHashIndex;
                triggerType = 'event';
            }
        }

        if (triggerIndex !== -1 && triggerType) {
            const searchTerm = textBeforeCursor.slice(triggerIndex + 1);

            setMentionState(prev => ({
                ...prev,
                isActive: true,
                searchTerm,
                type: triggerType,
                position: triggerIndex,
                selectedIndex: 0
            }));

            debouncedSearch(searchTerm, triggerType, 1);
        } else {
            setMentionState(prev => ({
                ...prev,
                isActive: false,
                results: [],
                selectedIndex: 0
            }));
        }
    };

    // Handle mention selection
    const selectMention = (result: { [key: string]: any }) => {
        if (!textareaRef.current || !mentionState.isActive) return;

        const { position, type } = mentionState;
        const beforeMention = postText.slice(0, position);
        const afterCursor = postText.slice(textareaRef.current.selectionStart);

        const mentionText = type === 'user' ? `@${result.username}` : `#${result.title}`;
        const newText = beforeMention + mentionText + ' ' + afterCursor;

        setPostText(newText);

        // Update tags
        if (type === 'user') {
            setTagUsers(prev => [...prev, { name: `@${result.username}`, id: result.id }]);
        } else {
            setTagEvents(prev => [...prev, { name: `#${result.title}`, id: result.id }]);
        }

        // Close mention dropdown
        setMentionState(prev => ({
            ...prev,
            isActive: false,
            results: [],
            selectedIndex: 0
        }));

        // Focus back on textarea
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPosition = beforeMention.length + mentionText.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);
    };

    // Handle removing a tagged user
    const handleRemoveTagUser = (tagToRemove: { name: string, id: string }) => {
        // Remove from tagUsers array
        setTagUsers(prev => prev.filter(tag => tag.id !== tagToRemove.id));

        // Remove the @mention from the post text
        // Match the @username with optional trailing space
        const mentionPattern = new RegExp(tagToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s?', 'g');
        setPostText(prev => prev.replace(mentionPattern, ''));
    };

    // Handle removing a tagged event
    const handleRemoveTagEvent = (tagToRemove: { name: string, id: string }) => {
        // Remove from tagEvents array
        setTagEvents(prev => prev.filter(tag => tag.id !== tagToRemove.id));

        // Remove the #eventname from the post text
        // Match the #eventname with optional trailing space
        const mentionPattern = new RegExp(tagToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s?', 'g');
        setPostText(prev => prev.replace(mentionPattern, ''));
    };

    // Handle keyboard navigation in dropdown
    // const handleKeyDown = (e: React.KeyboardEvent) => {
    //     if (!mentionState.isActive || mentionState.results.length === 0) return;
    //
    //     switch (e.key) {
    //         case 'ArrowDown':
    //             e.preventDefault();
    //             setMentionState(prev => ({
    //                 ...prev,
    //                 selectedIndex: Math.min(prev.selectedIndex + 1, prev.results.length - 1)
    //             }));
    //             break;
    //         case 'ArrowUp':
    //             e.preventDefault();
    //             setMentionState(prev => ({
    //                 ...prev,
    //                 selectedIndex: Math.max(prev.selectedIndex - 1, 0)
    //             }));
    //             break;
    //         case 'Enter':
    //         case 'Tab':
    //             e.preventDefault();
    //             selectMention(mentionState.results[mentionState.selectedIndex]);
    //             break;
    //         case 'Escape':
    //             setMentionState(prev => ({
    //                 ...prev,
    //                 isActive: false,
    //                 results: [],
    //                 selectedIndex: 0
    //             }));
    //             break;
    //     }
    // };

    // Handle scroll in dropdown for infinite scroll
    const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (!mentionState.hasMore) return;

        if (scrollHeight - scrollTop <= clientHeight + 10) {
            loadMoreResults();
        }
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handlePostSubmit = async () => {
        if (!postText && !mediaFiles) {
            showTopToast("error", "No content present")
            return;
        }

        setIsPostLoading(true);

        const param: { [key: string]: any } = {
            content: postText,
            mediaFiles: mediaFiles?.map((item) => item.url),
            tagEvents: tagEvents.map((item) => item.id),
            tagUsers: tagUsers.map((item) => item.id)
        }

        try {
            await authApi.post("/post", param)
            router.push("/?screen=posts")
        } catch {
            showTopToast("error", "Error creating post");
        } finally {
            setIsPostLoading(false);
        }
    }

    const mentionDropdown = mentionState.isActive && (
        <div
            ref={mentionDropdownRef}
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-background shadow-lg"
            onScroll={handleDropdownScroll}
        >
            {mentionState.loading && mentionState.results.length === 0 && (
                <div className="flex w-full items-center justify-center p-4">
                    <LoaderSmall />
                </div>
            )}

            {mentionState.results.length === 0 && !mentionState.loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    No {mentionState.type === 'user' ? 'users' : 'events'} found
                </div>
            )}

            {mentionState.results.map((result) => (
                <button
                    key={result.id}
                    type="button"
                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-accent"
                    onClick={() => selectMention(result)}
                >
                    {mentionState.type === 'user' ? (
                        <>
                            <span className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                                <Image
                                    src={result.profileImage || defaultImage}
                                    alt={result.username}
                                    fill
                                    className="object-cover"
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="flex items-center gap-1">
                                    <span className="truncate text-sm font-black">{result.username}</span>
                                    <UserVerificationBadge user={result} />
                                </span>
                                <span className="text-xs text-muted-foreground">Drifto user</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                <Hash size={17} />
                            </span>
                            <span className="min-w-0">
                                <span className="line-clamp-1 text-sm font-black">{result.title}</span>
                                <span className="text-xs text-muted-foreground">Event</span>
                            </span>
                        </>
                    )}
                </button>
            ))}

            {mentionState.loading && mentionState.results.length > 0 && (
                <div className="flex justify-center p-3">
                    <LoaderSmall />
                </div>
            )}
        </div>
    );

    if (isDesktop) {
        const canPost = Boolean(postText.trim() || mediaFiles?.length);

        return (
            <>
                <main className={cn("min-h-screen bg-background text-foreground", className)} {...props}>
                    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
                        <div className="desktop-page-header-inner flex h-20 items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-4">
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBackClick}>
                                    <ArrowLeft size={20} />
                                </Button>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                                        Social
                                    </p>
                                    <h1 className="truncate text-xl font-black">Create post</h1>
                                </div>
                            </div>
                            <Button
                                className="rounded-full"
                                disabled={!canPost || isUploading || isPostLoading}
                                onClick={handlePostSubmit}
                            >
                                {isPostLoading ? <LoaderSmall /> : <Send size={17} />}
                                Post
                            </Button>
                        </div>
                    </header>

                    <div className="desktop-page-container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_clamp(20rem,22vw,24rem)]">
                        <section className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex gap-4">
                                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                                    <Image
                                        src={user?.profileImage || defaultImage}
                                        alt={user?.username || "User"}
                                        fill
                                        className="object-cover"
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black">{user?.username ?? "You"}</p>
                                    <p className="text-sm text-muted-foreground">Use @ for users and # for events.</p>
                                </div>
                            </div>

                            <div className="relative mt-6">
                                <textarea
                                    ref={textareaRef}
                                    id="desktop-post-text"
                                    placeholder="Share an update, story, or event moment..."
                                    value={postText}
                                    onChange={handleTextareaChange}
                                    rows={10}
                                    className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-4 text-base leading-7 outline-none transition placeholder:text-muted-foreground focus:border-blue-700"
                                />
                                {mentionDropdown}
                            </div>

                            {(tagEvents.length > 0 || tagUsers.length > 0) && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {tagEvents.map((item, index) => (
                                        <span
                                            key={`event-${index}`}
                                            className="inline-flex items-center gap-1 rounded-full bg-blue-800/10 px-3 py-1 text-sm font-bold text-blue-800 dark:bg-blue-400/10 dark:text-blue-300"
                                        >
                                            {item.name}
                                            <button type="button" onClick={() => handleRemoveTagEvent(item)} className="rounded-full p-0.5 hover:bg-blue-800/10">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {tagUsers.map((item, index) => (
                                        <span
                                            key={`user-${index}`}
                                            className="inline-flex items-center gap-1 rounded-full bg-blue-800/10 px-3 py-1 text-sm font-bold text-blue-800 dark:bg-blue-400/10 dark:text-blue-300"
                                        >
                                            {item.name}
                                            <button type="button" onClick={() => handleRemoveTagUser(item)} className="rounded-full p-0.5 hover:bg-blue-800/10">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-black">Media</p>
                                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-bold transition hover:bg-accent">
                                        {isUploading ? <LoaderSmall /> : <ImagePlus size={17} />}
                                        Add media
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            disabled={isUploading}
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                </div>

                                {mediaFiles?.length ? (
                                    <div className="overflow-x-auto no-scrollbar">
                                        <div className="flex gap-3">
                                            {mediaFiles.map((file, idx) => (
                                                <div key={file.url} className="relative w-48 flex-none">
                                                    <Card
                                                        className="overflow-hidden p-0"
                                                        onClick={() => openModal(file)}
                                                    >
                                                        <CardContent className="p-0">
                                                            <AspectRatio ratio={4 / 3}>
                                                                {file.type === "IMAGE" ? (
                                                                    <Image
                                                                        src={file.url}
                                                                        alt={`Media ${idx + 1}`}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        className="h-full w-full object-cover"
                                                                        src={file.url}
                                                                        controls={false}
                                                                        muted
                                                                        playsInline
                                                                    />
                                                                )}
                                                                {file.type === "VIDEO" && (
                                                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                                        <div className="rounded-full bg-black/50 p-3">
                                                                            <FaPlay className="text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </AspectRatio>
                                                        </CardContent>
                                                    </Card>
                                                    <button
                                                        className="absolute right-2 top-2 rounded-full bg-neutral-950/70 p-1 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFileRemove(file.url);
                                                        }}
                                                        aria-label="Remove media"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background text-center transition hover:bg-accent">
                                        {isUploading ? <LoaderSmall /> : <ImagePlus className="text-muted-foreground" size={34} />}
                                        <span className="mt-3 font-black">Add images or videos</span>
                                        <span className="mt-1 text-sm text-muted-foreground">Media is optional, but it helps posts stand out.</span>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            disabled={isUploading}
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                )}
                            </div>
                        </section>

                        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                Composer guide
                            </p>
                            <h2 className="mt-2 text-xl font-black">Make the post easy to discover.</h2>
                            <div className="mt-5 grid gap-3 text-sm">
                                <div className="rounded-xl border border-border bg-background p-4">
                                    <p className="font-black">@ users</p>
                                    <p className="mt-1 text-muted-foreground">Mention people involved in the update.</p>
                                </div>
                                <div className="rounded-xl border border-border bg-background p-4">
                                    <p className="font-black"># events</p>
                                    <p className="mt-1 text-muted-foreground">Attach posts to events guests can inspect.</p>
                                </div>
                                <div className="rounded-xl border border-border bg-background p-4">
                                    <p className="font-black">Media</p>
                                    <p className="mt-1 text-muted-foreground">Use responsive images or short videos for context.</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <Dialog
                    open={modalOpen}
                    onClose={closeModal}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                >
                    <button className="absolute right-4 top-4 cursor-pointer text-white" onClick={closeModal}>
                        <X size={30} />
                    </button>

                    <Dialog.Panel className="max-h-[95vh] w-full max-w-5xl overflow-hidden text-foreground">
                        {!activeMediaFile ? null : activeMediaFile.type === "IMAGE" ? (
                            <Image
                                src={activeMediaFile.url}
                                alt="Post media"
                                width={1200}
                                height={800}
                                className="h-auto max-h-[92vh] w-full object-contain"
                            />
                        ) : (
                            <video
                                src={activeMediaFile.url}
                                className="max-h-[92vh] w-full object-contain"
                                controls
                                playsInline
                                autoPlay
                                preload="metadata"
                            />
                        )}
                    </Dialog.Panel>
                </Dialog>
            </>
        );
    }

    return (
        <>
            <div
                className={cn(
                    `w-full min-h-[100dvh] flex flex-col`,
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        "w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0"
                    )}
                >
                    <div className="flex flex-row items-center px-8">
                        <FaArrowLeft
                            size={20}
                            onClick={handleBackClick}
                            className="cursor-pointer hover:text-muted-foreground transition-colors"
                            aria-label="Go back"
                            role="button"
                            tabIndex={0}
                        />
                        <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
                            Create Post
                        </p>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <div className="w-full flex flex-col items-center px-4 pt-6 gap-6">
                        <div className="w-full flex gap-4 relative">
                            <span className="w-18 h-18">
                                <AspectRatio ratio={1}>
                                    <Image
                                        src={user?.profileImage || defaultImage}
                                        alt={user?.username}
                                        fill
                                        className="object-cover rounded-full" />
                                </AspectRatio>
                            </span>
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    id="post-text"
                                    placeholder="Share your thoughts (use @ to mention users, # for events)"
                                    value={postText}
                                    onChange={handleTextareaChange}
                                    rows={5}
                                    className="w-full py-2 px-3 bg-background rounded-md border-1 border-border focus:border-blue-600 focus:border-1 focus:outline-hidden placeholder:text-lg"
                                />

                                {/* Mention/Hashtag Dropdown */}
                                {mentionState.isActive && (
                                    <div
                                        ref={mentionDropdownRef}
                                        className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-10"
                                        onScroll={handleDropdownScroll}
                                    >
                                        {mentionState.loading && mentionState.results.length === 0 && (
                                            <div className="flex items-center justify-center w-full p-3">
                                                <LoaderSmall />
                                            </div>
                                        )}

                                        {mentionState.results.length === 0 && !mentionState.loading && (
                                            <div className="p-3 text-center text-neutral-500">
                                                No {mentionState.type === 'user' ? 'users' : 'events'} found
                                            </div>
                                        )}

                                        {mentionState.results.map((result) => (
                                            <div
                                                key={result.id}
                                                className={cn(
                                                    "p-3 flex items-center gap-3 cursor-pointer hover:bg-background"
                                                )}
                                                onClick={() => selectMention(result)}
                                            >
                                                {mentionState.type === 'user' ? (
                                                    <div
                                                        className="flex flex-row items-center px-2 justify-between cursor-pointer"
                                                    >
                                                        <div className="w-full flex gap-3 items-center">
                                                            <div className="relative w-8 h-8 rounded-full flex items-center justify-center" >
                                                                <AspectRatio ratio={1}>
                                                                    <Image
                                                                        src={result.profileImage || defaultImage}
                                                                        alt={result.username}
                                                                        fill
                                                                        className="object-cover rounded-full"
                                                                    />
                                                                </AspectRatio>
                                                            </div>
                                                            <div className="flex gap-2 items-center">
                                                                <p className="text-foreground text-sm font-bold truncate">{result.username}</p>
                                                                <UserVerificationBadge user={result} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center w-full gap-3">
                                                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Hash size={16} className="text-blue-600" />
                                                        </span>
                                                        <span className="flex-1">
                                                            <p className="font-medium text-foreground leading-tight line-clamp-2">{result.title}</p>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {mentionState.loading && mentionState.results.length > 0 && (
                                            <div className="p-3 text-center text-neutral-500">
                                                <LoaderSmall />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <span className="text-blue-600 flex flex-wrap gap-2">
                                {tagEvents.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full text-sm"
                                    >
                                        {item.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTagEvent(item)}
                                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </span>
                            <span className="text-blue-600 flex flex-wrap gap-2">
                                {tagUsers.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full text-sm"
                                    >
                                        {item.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTagUser(item)}
                                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </span>
                        </div>

                        <div className="w-full overflow-x-auto no-scrollbar">
                            <div className="flex gap-3">
                                {mediaFiles?.map((file, idx) => (
                                    <div key={idx} className="w-[60%] flex-none relative">
                                        <Card
                                            className="overflow-hidden cursor-pointer py-0"
                                            onClick={() => openModal(file)}
                                        >
                                            <CardContent className="p-0">
                                                {file.type === "IMAGE"
                                                    ? <AspectRatio ratio={4 / 3}>
                                                        <Image
                                                            src={file.url}
                                                            alt={`Media ${idx + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </AspectRatio>
                                                    : <AspectRatio ratio={4 / 3}>
                                                        <video
                                                            className="w-full h-full object-cover rounded-lg"
                                                            src={file.url}
                                                            controls={false}
                                                            muted
                                                            playsInline
                                                        >
                                                            <source src={file.url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </AspectRatio>}
                                                {file.type === "VIDEO" && (
                                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-black/50 rounded-full p-3">
                                                            <FaPlay className="text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <button
                                            className={cn(
                                                "absolute top-2 right-2 rounded-full bg-neutral-800 p-1 opacity-60 ",
                                                "text-white"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFileRemove(file.url);
                                            }}
                                            aria-label="Remove image"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full flex justify-between px-2">
                            <label className="border-1 border-border p-3 rounded-full bg-background">
                                {isUploading ? <LoaderSmall /> : <HiOutlineRectangleStack size={30} />}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    disabled={isUploading}
                                    onChange={handleFileSelect}
                                />
                            </label>
                            <Button
                                variant="link"
                                className="border-none bg-background font-semibold text-lg text-blue-800"
                                disabled={isUploading || isPostLoading}
                                onClick={() => handlePostSubmit()}
                            >
                                {isPostLoading ? <LoaderSmall /> : "Post"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={modalOpen}
                onClose={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50"
            >
                <div
                    className="absolute top-4 right-4 text-white cursor-pointer"
                    onClick={closeModal}
                >
                    <X size={30} />
                </div>

                <Dialog.Panel className="bg-background overflow-hidden w-full max-h-[95%] text-foreground">
                    {!activeMediaFile ? null : activeMediaFile.type === "IMAGE"
                        ? (
                            <Image
                                src={activeMediaFile.url}
                                alt="Snapshot"
                                width={800}
                                height={600}
                                className="object-contain w-full h-auto"
                            />
                        )
                        : (
                            <video
                                src={activeMediaFile.url}
                                className={cn(
                                    "w-full object-contain max-w-full max-h-[90vh]"
                                )}
                                controls
                                controlsList="nodownload noplaybackrate nofullscreen"
                                playsInline
                                autoPlay
                                preload={"metadata"}
                            >
                                <source src={activeMediaFile.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                </Dialog.Panel>
            </Dialog>
        </>
    )
}
