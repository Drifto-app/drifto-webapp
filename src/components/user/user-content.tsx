"use client"

import { ComponentProps, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaArrowLeft, FaHashtag } from "react-icons/fa";
import * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import { X } from "lucide-react";
import { Dialog as HeadDialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { showTopToast } from "@/components/toast/toast-util";
import { authApi } from "@/lib/axios";
import { LoaderSmall } from "@/components/ui/loader";
import { IoIosArrowForward } from "react-icons/io";
import { PiFireSimpleBold } from "react-icons/pi";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { MdContentCopy } from "react-icons/md";
import { useAuthStore } from "@/store/auth-store";
import { UserEvents } from "@/components/user/user-events";
import { UserPosts } from "@/components/user/user-posts";
import defaultImage from "@/assests/default.jpeg";
import { Linkify } from "@/lib/linkify";

interface UserProps extends ComponentProps<"div"> {
    user: { [key: string]: any }
    setUser: (user: { [key: string]: boolean }) => void;
    prev: string | null;
}

type ActiveScreenType = "details" | "posts";

export const UserContent = ({
    user, setUser, prev, className, ...props
}: UserProps) => {
    const router = useRouter();
    const { user: currentUser } = useAuthStore()

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const userStats: { name: string, value: string | number }[] = [
        { name: "Ticket Sold", value: user.participantCount },
        { name: "Experience", value: user.eventCount },
        { name: "Subscribers", value: user.totalFollowers },
    ]

    const userAboutLinks: { name: string, value: string }[] = [
        { name: "Website", value: user.website },
        { name: "Instagram", value: user.instagramHandle },
        { name: "Twitter", value: user.twitterHandle },
        { name: "FaceBook", value: user.facebookHandle },
    ]

    const isUserProfile: boolean = (currentUser?.id === user.id);

    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("details");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [aboutOpen, setAboutOpen] = useState<boolean>(false);
    const [isSubscribeLoading, setIsSubscribeLoading] = useState<boolean>(false);


    const handleBackClick = () => {
        if (activeScreen === "details") {
            router.push(prev != null ? prev : "/");
        }
        setActiveScreen("details");
    }

    const handleSubscribeClick = async () => {
        setIsSubscribeLoading(true);

        try {
            await authApi.post(`/userFollow/follow/user/${user.id}`)
            setUser({ ...user, followed: true })
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setIsSubscribeLoading(false);
        }
    }

    const handleUnsubscribeClick = async () => {
        setIsSubscribeLoading(true);

        try {
            await authApi.post(`/userFollow/unfollow/user/${user.id}`)
            setUser({ ...user, followed: false })
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setIsSubscribeLoading(false);
        }
    }

    const handleLinkCopy = async (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showTopToast("success", "Link copied to clipboard");
        }
    }

    const render = () => {
        switch (activeScreen) {
            case "posts":
                return (
                    <UserPosts user={user} />
                )
            default:
                return (
                    <div className="w-full flex-1 flex flex-col px-4 pt-6 gap-8">
                        <div className="w-full flex gap-3 items-center">
                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center" onClick={() => setIsOpen(true)}>
                                <AspectRatio ratio={1}>
                                    <Image
                                        src={user.profileImage || defaultImage}
                                        alt={user.username}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                </AspectRatio>
                            </div>
                            <div className="w-full flex flex-col">
                                <div className="flex gap-2 items-center">
                                    <p className="text-foreground text-sm font-bold truncate">{user.username}</p>
                                    <UserVerificationBadge user={user} isClickable={true} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full flex justify-between items-center px-6">
                                {userStats.map((item, index) => (
                                    <span key={index} className="flex flex-col items-center justify-center gap-1">
                                        <p className="text-neutral-400 text-sm">{item.name}</p>
                                        <p className="font-bold text-lg">{item.value}</p>
                                    </span>
                                ))}
                            </div>
                            {isUserProfile
                                ? <div className="w-full flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                                        onClick={() => router.push(`/m/settings/edit-profile?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`)}
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                                        onClick={() => router.push(`/m/event-create?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`)}
                                    >
                                        Create Event
                                    </Button>
                                </div>
                                : <div className="w-full flex gap-3">
                                    {/*<Button*/}
                                    {/*    variant="outline"*/}
                                    {/*    className="flex-1 min-w-0 shadow-none font-semibold border-black py-6"*/}
                                    {/*>*/}
                                    {/*    Message*/}
                                    {/*</Button>*/}
                                    {user.followed
                                        ? <Button
                                            variant="outline"
                                            className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                                            onClick={handleUnsubscribeClick}
                                            disabled={isSubscribeLoading}
                                        >
                                            {isSubscribeLoading ? <LoaderSmall /> : "Subscribed"}
                                        </Button>
                                        : <Button
                                            variant="default"
                                            className="flex-1 min-w-0 shadow-none border-none py-6 bg-blue-800 hover:bg-blue-800"
                                            onClick={handleSubscribeClick}
                                            disabled={isSubscribeLoading}
                                        >
                                            {isSubscribeLoading ? <LoaderSmall /> : "Subscribe"}
                                        </Button>}
                                </div>}
                        </div>
                        <div className="w-full flex flex-col gap-4">
                            <Dialog
                                open={aboutOpen}
                                onOpenChange={setAboutOpen}
                            >
                                <DialogTrigger asChild>
                                    <div className="w-full flex justify-between items-center py-2">
                                        <span className="font-bold">About</span>
                                        <IoIosArrowForward size={16} />
                                    </div>
                                </DialogTrigger>

                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-left">About</DialogTitle>
                                    </DialogHeader>
                                    <div className="w-full flex flex-col gap-4 text-muted-foreground">
                                        <Linkify text={user.aboutText} className="font-medium text-sm" as="span" />
                                        <div className="w-full flex flex-col gap-3">
                                            {userAboutLinks.map((item, index) => {
                                                if (!item.value) return
                                                return (
                                                    <div key={index} className="flex flex-col">
                                                        <span className="font-bold text-muted-foreground">{item.name}</span>
                                                        <span className="w-full flex items-center justify-between">
                                                            <p>{item.value}</p>
                                                            <span
                                                                className="px-2"
                                                                onClick={() => handleLinkCopy(item.value)}
                                                            >
                                                                <MdContentCopy className="text-blue-700" />
                                                            </span>
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3 border border-border px-4 py-5 rounded-sm items-start" onClick={() => router.push(
                                    isUserProfile
                                        ? `/m/user-events?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`
                                        : `/m/user-events?id=${user?.id}&prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`
                                )}>
                                    <div className="h-10 flex items-center justify-center">
                                        <PiFireSimpleBold size={32} />
                                    </div>
                                    <span className="font-semibold">Experiences</span>
                                </div>

                                <div className="flex flex-col gap-3 border border-border px-4 py-5 rounded-sm items-start" onClick={() => setActiveScreen("posts")}>
                                    <div className="h-10 flex items-center justify-center">
                                        <FaHashtag size={24} />
                                    </div>
                                    <span className="font-semibold">Posts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <>
            <div
                className={cn(
                    "w-full h-[100dvh]",
                    className
                )}
                {...props}
            >
                <div className={"w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center"}>
                    <div className="flex flex-row items-center px-8">
                        <FaArrowLeft
                            size={16}
                            onClick={handleBackClick}
                            className="cursor-pointer hover:text-muted-foreground transition-colors"
                        />
                        <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
                            {user.username}
                        </p>
                    </div>
                </div>
                {render()}
            </div>

            <HeadDialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/70"
            >
                <div className="absolute top-4 right-4 text-white" onClick={() => setIsOpen(false)}>
                    <X size={30} />
                </div>
                <HeadDialog.Panel className="bg-background overflow-hidden w-full max-h-[95%] text-foreground">
                    <Image
                        src={user.profileImage || defaultImage}
                        alt="Snapshot"
                        width={800}
                        height={600}
                        className="object-contain w-full h-auto"
                    // style={{ maxHeight: "95vh" }}
                    />
                </HeadDialog.Panel>
            </HeadDialog>
        </>
    )
}
