"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/axios";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Loader, LoaderSmall } from "@/components/ui/loader";
import { toast } from "react-toastify";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import { showTopToast } from "@/components/toast/toast-util";
import defaultImage from "@/assests/default.jpeg";
import { UserListSkeleton } from "@/components/ui/page-skeletons";
import { Button } from "@/components/ui/button";
import { Mail, UserRoundPlus } from "lucide-react";

interface HostInvitesProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    variant?: "mobile" | "desktop";
}

export const HostInvites = ({
    event, variant = "mobile", className, ...props
}: HostInvitesProps) => {
    const [invites, setInvites] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [cancellingInvites, setCancellingInvites] = useState<Set<string>>(new Set())

    const fetchInvites = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.get(`/invite/event/${event.id}`)
            setInvites(response.data.data)
        } catch (error: any) {
            setError(error.response?.data?.description || "Failed to fetch invites")
        } finally {
            setLoading(false)
        }
    }

    const revokeInvite = async (inviteId: string) => {
        setCancellingInvites(prev => new Set(prev).add(inviteId))

        try {
            await authApi.post(`/invite/${inviteId}/revoke`)
            // Remove the invite from the list after successful revocation
            setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId))
        } catch (error: any) {
            showTopToast("error", "Error revoking invite")
        } finally {
            setCancellingInvites(prev => {
                const newSet = new Set(prev)
                newSet.delete(inviteId)
                return newSet
            })
        }
    }

    useEffect(() => {
        if (event?.id) {
            fetchInvites()
        }
    }, [event?.id])

    if (loading && invites.length === 0) {
        return (
            <div
                className={cn(
                    "w-full flex-1 px-4",
                    variant === "desktop" && "px-0",
                    className
                )}
                {...props}
            >
                <div className="w-full flex flex-col gap-4">
                    <UserListSkeleton count={3} />
                </div>
            </div>
        )
    }

    if (error) {
        if (variant === "desktop") {
            return (
                <div className={cn("w-full rounded-2xl border border-border bg-card p-8 text-center", className)} {...props}>
                    <p className="font-black text-red-600">{error}</p>
                    <Button onClick={fetchInvites} className="mt-4 rounded-full">
                        Try again
                    </Button>
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
                <div className="w-full flex flex-col gap-4">
                    <div className="flex items-center justify-between pt-4 pb-2">
                        <h1 className="text-xl font-semibold text-foreground">
                            Co-Host Invites
                        </h1>
                    </div>
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <div className="text-red-500">{error}</div>
                        <button
                            onClick={fetchInvites}
                            className="text-blue-500 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (variant === "desktop") {
        return (
            <div className={cn("w-full", className)} {...props}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                    Pending access
                                </p>
                                <h2 className="mt-1 text-2xl font-black">Host invites</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Review co-host invitations that have not been accepted yet, and cancel stale requests.
                                </p>
                            </div>
                            <span className="rounded-full bg-blue-800/10 px-4 py-2 text-sm font-black text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                {invites.length} pending
                            </span>
                        </div>

                        {invites.length === 0 ? (
                            <div className="mt-6 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                                <div>
                                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                        <Mail size={24} />
                                    </span>
                                    <p className="mt-4 font-black">No pending invites</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        New co-host invitations will appear here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                                <div className="grid grid-cols-[minmax(260px,1fr)_160px_120px] bg-muted/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                                    <span>User</span>
                                    <span>Status</span>
                                    <span className="text-right">Action</span>
                                </div>
                                {invites.map((invite) => (
                                    <div
                                        key={invite.inviteId}
                                        className="grid grid-cols-[minmax(260px,1fr)_160px_120px] items-center gap-4 border-t border-border px-4 py-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                                <Image
                                                    src={invite.userPlaceHolder?.profileImageUrl || defaultImage}
                                                    alt={invite.userPlaceHolder?.username ?? "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="truncate font-black text-foreground">
                                                        {invite.userPlaceHolder?.username}
                                                    </span>
                                                    <UserVerificationBadge user={invite.userPlaceHolder} />
                                                </div>
                                                <p className="text-sm text-muted-foreground">Co-host invitation</p>
                                            </div>
                                        </div>
                                        <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-black uppercase text-muted-foreground">
                                            {invite.invitationStatus}
                                        </span>
                                        <div className="text-right">
                                            <Button
                                                variant="ghost"
                                                onClick={() => revokeInvite(invite.inviteId)}
                                                disabled={cancellingInvites.has(invite.inviteId)}
                                                className="rounded-full text-red-600 hover:text-red-700"
                                            >
                                                {cancellingInvites.has(invite.inviteId) ? <LoaderSmall /> : "Cancel"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="h-fit rounded-2xl border border-border bg-card p-5">
                        <UserRoundPlus className="text-blue-800 dark:text-blue-300" size={22} />
                        <h3 className="mt-4 text-xl font-black">Invite lifecycle</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Use Co-hosts to send new invites. This page is for tracking and revoking pending requests.
                        </p>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex-1 bg-accent/40 pt-2",
                className
            )}
            {...props}
        >
            <div className="w-full flex flex-col">
                {invites.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-neutral-500 text-center">
                            No pending invites
                        </div>
                    </div>
                ) : (
                    <div className="w-full px-4">
                        {invites.map((invite) => (
                            <div key={invite.inviteId} className="w-full flex items-center justify-between py-4 pb-4 border-border border-b-1">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                        {
                                            invite.userPlaceHolder?.profileImageUrl !== null ?
                                                <AspectRatio ratio={1 / 1}>
                                                    <Image
                                                        src={invite.userPlaceHolder?.profileImageUrl}
                                                        alt={invite.userPlaceHolder.username}
                                                        fill
                                                        className="object-cover rounded-full" />
                                                </AspectRatio> :
                                                <AspectRatio ratio={1 / 1}>
                                                    <Image
                                                        src={defaultImage}
                                                        alt={invite.userPlaceHolder.username}
                                                        fill
                                                        className="object-cover rounded-full" />
                                                </AspectRatio>
                                        }
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col">
                                        <div className="flex gap-1 items-center">
                                            <span className="font-bold text-foreground">
                                                {invite.userPlaceHolder.username}
                                            </span>
                                            <UserVerificationBadge user={invite.userPlaceHolder} />
                                        </div>
                                        <span className="text-xs text-neutral-500 uppercase font-medium">
                                            {invite.invitationStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Cancel Button */}
                                <button
                                    onClick={() => revokeInvite(invite.inviteId)}
                                    disabled={cancellingInvites.has(invite.inviteId)}
                                    className="text-red-500 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancellingInvites.has(invite.inviteId) ? <LoaderSmall /> : "Cancel"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
