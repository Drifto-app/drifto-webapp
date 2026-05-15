"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { UserEventSinglePlaceholder, UserVerificationBadge } from "@/components/ui/user-placeholder";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { authApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserPlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader, LoaderSmall } from "@/components/ui/loader";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { showTopToast } from "@/components/toast/toast-util";
import defaultImage from "@/assests/default.jpeg";
import { DESKTOP_ROUTES } from "@/lib/routes";

interface CoHostManageProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    variant?: "mobile" | "desktop";
}

interface User {
    id: string;
    username: string;
    profileImage: string | null;
    userVerificationType: string | null;
    verified: boolean;
}

export const CoHostManage = ({
    event, variant = "mobile", className, ...props
}: CoHostManageProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [coHosts, setCoHosts] = useState<any[]>(event.coHosts)
    const [showModal, setShowModal] = useState(false);

    // User search states
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
    const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set());

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleCohostRemove = async (username: string) => {
        const params = {
            username,
        }

        try {
            await authApi.post(`/event/${event.id}/cohost/remove`, params)
            setCoHosts((coHosts) => coHosts.filter((c) => c.username !== username))
        } catch (e: any) {
            showTopToast("error", "Could not remove co-host");
        }
    }

    // API function to search users
    const searchUsers = async (pageNum: number, search: string = "") => {
        if (!search.trim()) return [];

        setSearchLoading(true);

        try {
            const params: { [key: string]: string | number } = {
                search: search.trim(),
                searchType: 'USER',
                pageSize: '20',
                pageNumber: pageNum.toString(),
            };

            const response = await authApi.get('/search', { params });
            const data = response.data.data.users.data;

            setSearchLoading(false);

            // Check if there are more pages
            setHasMore(!response.data.data.users.isLast);

            return data;
        } catch (error: any) {
            console.error('Error searching users:', error);
            setSearchLoading(false);
            return [];
        }
    };

    // Search effect with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim() !== "") {
                handleSearch();
            } else {
                setUsers([]);
                setPage(1);
                setHasMore(true);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = async () => {
        const searchResults = await searchUsers(1, searchQuery);
        setUsers(searchResults);
        setPage(2);
    };

    const loadMoreUsers = async () => {
        if (searchLoading || !hasMore || !searchQuery.trim()) return;

        const newUsers = await searchUsers(page, searchQuery);
        setUsers(prev => [...prev, ...newUsers]);
        setPage(prev => prev + 1);
    };

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMoreUsers();
        }
    }, [searchLoading, hasMore, page, searchQuery]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Invite user function
    const handleInviteUser = async (username: string, userId: string) => {
        setInvitingUsers(prev => new Set(prev).add(userId));

        try {
            const response = await authApi.post('/invite/send', {
                eventId: event.id,
                username: username
            });

            if (response.data.success) {
                setInvitedUsers(prev => new Set(prev).add(userId));
            } else {
                showTopToast("error", response.data.description || 'Failed to send invite');
            }
        } catch (error: any) {
            showTopToast("error", 'Failed to send invite. Please try again.');
        }

        setInvitingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    };

    // Reset states when modal closes
    const handleModalClose = (open: boolean) => {
        setShowModal(open);
        if (!open) {
            setUsers([]);
            setSearchQuery("");
            setPage(1);
            setHasMore(true);
            setInvitedUsers(new Set());
            setInvitingUsers(new Set());
        }
    };

    const filteredUsers = users.filter(user =>
        !coHosts.some(coHost => coHost.id === user.id)
    );

    const handleUserClick = (userId: string) => {
        router.push(variant === "desktop" ? DESKTOP_ROUTES.userDetail(userId) : `/m/user/${userId}`);
    }

    const inviteDialog = (
        <Dialog open={showModal} onOpenChange={handleModalClose}>
            <DialogContent
                className="flex h-[80vh] w-full flex-col sm:max-w-2xl sm:rounded-2xl"
            >
                <DialogHeader className="w-full">
                    <DialogTitle className="text-left text-xl font-black">
                        Invite co-host
                    </DialogTitle>
                    <DialogDescription>
                        Search Drifto users and send an invite to help manage this event.
                    </DialogDescription>
                </DialogHeader>

                <div className="w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search username"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 w-full rounded-full bg-background pl-12"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-border" ref={scrollRef}>
                    {searchQuery.trim() === "" ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Start typing to search
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div>
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between gap-3 border-b border-border p-4 last:border-b-0"
                                >
                                    <button
                                        type="button"
                                        className="flex min-w-0 items-center justify-center gap-4 text-left"
                                        onClick={() => { handleUserClick(user.id) }}
                                    >
                                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                                            <Image
                                                src={user.profileImage || defaultImage}
                                                alt={user.username}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                                <h3 className="truncate font-black text-foreground">{user.username}</h3>
                                                <UserVerificationBadge user={user} />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Drifto user</p>
                                        </div>
                                    </button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleInviteUser(user.username, user.id)}
                                        disabled={invitingUsers.has(user.id) || invitedUsers.has(user.id)}
                                        className={cn(
                                            "rounded-full px-4 font-bold",
                                            invitedUsers.has(user.id)
                                                ? "cursor-not-allowed bg-muted text-muted-foreground"
                                                : "bg-blue-800 text-white hover:bg-blue-900"
                                        )}
                                    >
                                        {invitingUsers.has(user.id) ? (
                                            <LoaderSmall />
                                        ) : invitedUsers.has(user.id) ? (
                                            "Invited"
                                        ) : (
                                            "Invite"
                                        )}
                                    </Button>
                                </div>
                            ))}

                            {searchLoading && (
                                <div className="flex justify-center py-4">
                                    <Loader className="h-8 w-8" />
                                </div>
                            )}

                            {!hasMore && filteredUsers.length > 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    No more users to load
                                </div>
                            )}
                        </div>
                    ) : searchLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="h-8 w-8" />
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No users found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );

    if (variant === "desktop") {
        const hostLimit = 5;
        const remainingSlots = Math.max(hostLimit - coHosts.length, 0);

        return (
            <div className={cn("w-full", className)} {...props}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                    Collaboration
                                </p>
                                <h2 className="mt-1 text-2xl font-black">Co-host management</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Add trusted collaborators, review current hosts, and remove access when plans change.
                                </p>
                            </div>
                            <Button className="h-11 rounded-full" onClick={() => setShowModal(true)}>
                                <UserPlus size={17} />
                                Add co-host
                            </Button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <Users className="text-blue-800 dark:text-blue-300" size={20} />
                                <p className="mt-3 text-3xl font-black">{coHosts.length}</p>
                                <p className="text-sm text-muted-foreground">Active hosts</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <UserPlus className="text-blue-800 dark:text-blue-300" size={20} />
                                <p className="mt-3 text-3xl font-black">{remainingSlots}</p>
                                <p className="text-sm text-muted-foreground">Open slots</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Limit</p>
                                <p className="mt-3 text-3xl font-black">{hostLimit}</p>
                                <p className="text-sm text-muted-foreground">Including you</p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            {coHosts.map((coHost: { [key: string]: any }, i: number) => {
                                const isHost = (i + 1) === coHosts.length;
                                const displayUser = isHost ? { ...coHost, username: "You" } : coHost;

                                return (
                                    <div key={coHost.id} className="rounded-2xl border border-border bg-background p-4">
                                        <UserEventSinglePlaceholder
                                            user={displayUser}
                                            isHost={isHost}
                                            removeClick={handleCohostRemove}
                                            prev={`${pathname}?${searchParams}`}
                                            variant={variant}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <aside className="h-fit rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Access note</p>
                        <h3 className="mt-2 text-xl font-black">Co-hosts can help operate the event.</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Keep primary-host actions limited to people who should manage guests, event edits, and check-in operations.
                        </p>
                    </aside>
                </div>
                {inviteDialog}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex-1 px-4",
                className
            )}
            {...props}
        >
            <div className="flex flex-col w-full gap-6">
                <div className="w-full flex flex-col gap-2 pt-2">
                    <h1 className="text-xl font-semibold text-foreground pt-4">
                        Add or Remove Co-Host
                    </h1>
                    <p className="text-neutral-400 font-semibold">
                        Add or remove co-host to collaborate on planning and hosting your event. You can add up to 5 hosts in total (including yourself)
                    </p>
                </div>
                <div className="w-full">
                    <h3 className="font-semibold text-lg">Hosts</h3>
                    <ul className="flex flex-col gap-3">
                        {coHosts.map((coHost: { [key: string]: any }, i: number) => {
                            if ((i + 1) === coHosts.length) {
                                coHost.username = "You"
                            }

                            return (
                                <li key={coHost.id} className="w-full py-4 px-4 rounded-xl outline-none border-border border-1 shadow-none">
                                    <UserEventSinglePlaceholder
                                        user={coHost}
                                        key={coHost.id}
                                        isHost={(i + 1) === coHosts.length}
                                        removeClick={handleCohostRemove}
                                        prev={`${pathname}?${searchParams}`}
                                        variant={variant}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <Button
                    className="py-6 text-md font-bold bg-blue-800 hover:bg-blue-800"
                    onClick={() => setShowModal(true)}
                >
                    Add Co-Host
                </Button>

                {/* Mobile invite dialog */}
                <Dialog open={showModal} onOpenChange={handleModalClose}>
                    <DialogContent
                        className="w-full sm:max-w-md sm:rounded-lg flex flex-col h-[80vh]"
                    >
                        <DialogHeader className="w-full">
                            <DialogTitle className="text-lg text-left">
                                Search User
                            </DialogTitle>
                        </DialogHeader>

                        <div className="w-full mb-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search username"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-6 rounded-xl bg-muted focus:bg-background"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                            {searchQuery.trim() === "" ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Start typing to search
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between gap-3 p-3 w-full border-border border-b-1"
                                        >
                                            <div className="flex items-center justify-center gap-4" onClick={() => { handleUserClick(user.id) }}>
                                                <div className="relative w-12 h-12 rounded-full flex items-center justify-center">
                                                    <AspectRatio ratio={1 / 1}>
                                                        <Image
                                                            src={user.profileImage || defaultImage}
                                                            alt={user.username}
                                                            fill
                                                            className="object-cover rounded-full"
                                                        />
                                                    </AspectRatio>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                                        <UserVerificationBadge user={user} />
                                                    </div>
                                                    <p className="text-sm text-gray-500">User</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleInviteUser(user.username, user.id)}
                                                disabled={invitingUsers.has(user.id) || invitedUsers.has(user.id)}
                                                className={cn(
                                                    "px-4 py-4 font-semibold rounded-md transition-colors",
                                                    invitedUsers.has(user.id)
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                )}
                                            >
                                                {invitingUsers.has(user.id) ? (
                                                    <LoaderSmall />
                                                ) : invitedUsers.has(user.id) ? (
                                                    "Invited"
                                                ) : (
                                                    "Invite"
                                                )}
                                            </Button>
                                        </div>
                                    ))}

                                    {searchLoading && (
                                        <div className="flex justify-center py-4">
                                            <Loader className="h-8 w-8" />
                                        </div>
                                    )}

                                    {!hasMore && filteredUsers.length > 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            No more users to load
                                        </div>
                                    )}
                                </div>
                            ) : searchLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader className="h-8 w-8" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No users found
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
