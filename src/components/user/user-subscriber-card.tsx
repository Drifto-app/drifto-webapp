/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import * as React from "react";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LoaderSmall } from "@/components/ui/loader";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import defaultImage from "@/assests/default.jpeg";
import { DESKTOP_ROUTES } from "@/lib/routes";

interface UserSubscriberCardProps extends ComponentProps<"div"> {
    user: { [key: string]: any };
    onUserChange: (user: { [key: string]: any }) => void;
    variant?: "mobile" | "desktop";
}

export const UserSubscriberCard = ({
    user, onUserChange, variant = "mobile", className, ...props
}: UserSubscriberCardProps) => {
    const router = useRouter();
    const isDesktop = variant === "desktop";

    const [isSubscribeLoading, setIsSubscribeLoading] = useState<boolean>(false);

    const handleSubscribeClick = async () => {
        setIsSubscribeLoading(true);

        try {
            await authApi.post(`/userFollow/follow/user/${user.userId}`)
            onUserChange({ ...user, followed: true })
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setIsSubscribeLoading(false);
        }
    }

    const handleUnsubscribeClick = async () => {
        setIsSubscribeLoading(true);

        try {
            await authApi.post(`/userFollow/unfollow/user/${user.userId}`)
            onUserChange({ ...user, followed: false })
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setIsSubscribeLoading(false);
        }
    }

    return (
        <div
            className={cn(
                "w-full flex justify-between",
                isDesktop
                    ? "items-center rounded-2xl border border-border bg-card px-4 py-4 shadow-sm transition hover:border-blue-800/30"
                    : "rounded-lg border-1 px-4 py-4 border-neutral-800",
                className
            )}
            {...props}
        >
            <div
                className="flex flex-row gap-4 cursor-pointer"
                onClick={() => {
                    const path = isDesktop ? DESKTOP_ROUTES.userDetail(user.userId) : `/m/user/${user.userId}`;
                    router.push(`${path}?prev=${encodeURIComponent("/?screen=profile")}`);
                }}
            >
                <div className={cn("flex flex-row items-center", isDesktop ? "h-11 w-11" : "w-8 h-8")}>
                    <AspectRatio ratio={1}>
                        <Image
                            src={user.profileImage || defaultImage}
                            alt={user.username}
                            fill
                            className="object-cover rounded-full" />
                    </AspectRatio>
                </div>
                <div className="flex flex-row gap-1 items-center">
                    <p className={cn("font-semibold", isDesktop ? "text-base" : "text-sm")}>{user.username}</p>
                    <UserVerificationBadge user={user} />
                </div>
            </div>
            {user.followed
                ? <Button
                    variant="outline"
                    className="shadow-none font-semibold border-foreground py-2"
                    onClick={handleUnsubscribeClick}
                    disabled={isSubscribeLoading}
                >
                    {isSubscribeLoading ? <LoaderSmall /> : "Subscribed"}
                </Button>
                : <Button
                    variant="default"
                    className=" shadow-none border-none py-2 bg-blue-800 hover:bg-blue-800"
                    onClick={handleSubscribeClick}
                    disabled={isSubscribeLoading}
                >
                    {isSubscribeLoading ? <LoaderSmall /> : "Subscribe"}
                </Button>}
        </div>
    )
}
