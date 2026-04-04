import { cn } from "@/lib/utils";
import { ComponentProps, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import * as React from "react";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/share-button/share-option";
import { useShare } from "@/hooks/share-option";
import { PiFireSimpleBold } from "react-icons/pi";
import { FaHashtag, FaRegClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { BiCalendarAlt } from "react-icons/bi";
import { ActiveScreenType } from "@/components/profile-display/profile-display";
import { UserEvents } from "@/components/user/user-events";
import { UserPosts } from "@/components/user/user-posts";
import { UserOrders } from "@/components/order/user-orders";
import { UserSubscribers } from "@/components/user/user-subscribers";
import { router } from "next/client";
import defaultImage from "@/assests/default.jpeg";

interface UserProfileProps extends ComponentProps<"div"> {
    handleScreenChange: (value: string) => void;
    activeScreen: string;
    setActiveScreen: (value: ActiveScreenType) => void;
}

export const UserProfile = ({
    activeScreen, setActiveScreen, handleScreenChange, className, ...props
}: UserProfileProps) => {
    const { user } = useAuthStore();
    const router = useRouter();

    const userUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/user/${user?.id}`;
    const {
        isShareDialogOpen,
        closeShareDialog,
        handleQuickShare,
    } = useShare({
        title: user?.username,
        url: userUrl,
    });

    const userStats: { name: string, value: string | number }[] = [
        { name: "Ticket Sold", value: user?.participantCount || 0 },
        { name: "Experience", value: user?.eventCount || 0 },
        { name: "Subscribers", value: user?.totalFollowers || 0 },
    ]

    const render = () => {
        switch (activeScreen) {
            case "posts":
                return (
                    <UserPosts user={user!} isForUser={true} />
                )
            case "orders":
                return (
                    <UserOrders user={user!} />
                )
            case "subscribers":
                return (
                    <UserSubscribers />
                )
            default:
                return (
                    <>
                        <div className="w-full flex flex-col px-4 pt-6 pb-25 gap-8">
                            <div className="flex items-center gap-5 px-2">
                                <div className="w-24 h-24 flex flex-row items-center cursor-pointer" onClick={() => router.push(`/m/settings/profile-picture?prev=${encodeURIComponent(`/?screen=profile`)}`)}>
                                    <AspectRatio ratio={1}>
                                        <Image
                                            src={user?.profileImage || defaultImage}
                                            alt={user?.username}
                                            fill
                                            className="object-cover rounded-full" />
                                    </AspectRatio>
                                </div>
                                <div className="flex flex-row gap-1 items-center">
                                    <p className="font-medium text-xl cursor-pointer" onClick={() => router.push(`/m/settings/username?prev=${encodeURIComponent(`/?screen=profile`)}`)} >{user?.username}</p>
                                    <UserVerificationBadge user={user!} isClickable={true} />
                                </div>
                            </div>
                            <div className="w-full flex justify-between items-center px-4 mt-2">
                                {userStats.map((item, index) => (
                                    <span
                                        key={index}
                                        className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                                        onClick={() => {
                                            if (item.name === "Subscribers") {
                                                setActiveScreen("subscribers");
                                            } else if (item.name === "Experience") {
                                                router.push(
                                                    `/m/user-events?id=${user?.id}&prev=${encodeURIComponent("/?screen=profile")}`
                                                );

                                            }
                                        }}
                                    >
                                        <p className="text-neutral-500 text-sm font-medium">{item.name}</p>
                                        <p className="font-bold text-lg">{item.value}</p>
                                    </span>
                                ))}
                            </div>
                            <div className="w-full flex gap-3 px-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 min-w-0 shadow-none font-semibold border-neutral-300 rounded-2xl h-12"
                                    onClick={() => router.push(`/m/settings/edit-profile?prev=${encodeURIComponent(`/?screen=profile`)}`)}
                                >
                                    Edit profile
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 min-w-0 shadow-none font-semibold border-neutral-300 rounded-2xl h-12"
                                    onClick={handleQuickShare}
                                >
                                    Share Profile
                                </Button>
                            </div>
                            <div className="w-full flex flex-col px-2 mt-4">
                                <div className="flex flex-row gap-5 items-center justify-start border-b border-neutral-300 py-5 cursor-pointer" onClick={() => router.push(
                                    `/m/user-events?id=${user?.id}&prev=${encodeURIComponent("/?screen=profile")}`
                                )}>
                                    <PiFireSimpleBold size={24} className="text-neutral-800" />
                                    <span className="font-normal text-[17px]">Experiences</span>
                                </div>

                                <div className="flex flex-row gap-5 items-center justify-start border-b border-neutral-300 py-5 cursor-pointer" onClick={() => setActiveScreen("posts")}>
                                    <FaHashtag size={24} className="text-neutral-800" />
                                    <span className="font-normal text-[17px]">Posts</span>
                                </div>
                                <div className="flex flex-row gap-5 items-center justify-start border-b border-neutral-300 py-5 cursor-pointer" onClick={() => setActiveScreen("orders")}>
                                    <FaRegClock size={24} className="text-neutral-800" />
                                    <span className="font-normal text-[17px]">Orders</span>
                                </div>
                                <div
                                    className="flex flex-row gap-5 items-center justify-start border-b border-neutral-300 py-5 cursor-pointer"
                                    onClick={() => handleScreenChange("plans")}>
                                    <BiCalendarAlt size={24} className="text-neutral-800" />
                                    <span className="font-normal text-[17px]">Plans</span>
                                </div>
                            </div>
                        </div>

                        <ShareDialog
                            isOpen={isShareDialogOpen}
                            onClose={closeShareDialog}
                            title={user?.username}
                            url={userUrl}
                        />
                    </>
                )
        }
    }

    return (
        <div
            className={cn(
                className,
                "w-full"
            )}
            {...props}
        >
            {render()}
        </div>
    )
}