"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import * as React from "react";
import { useAuthStore } from "@/store/auth-store";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import defaultImage from "@/assests/default.jpeg";

export const EditProfilePageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <EditProfileContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}


interface EditProfileContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

export const EditProfileContent = ({
    prev, currentPathUrl, className, ...props
}: EditProfileContentProps) => {
    const router = useRouter();
    const { user } = useAuthStore()

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const userInfo: {
        value: string,
        onClickAction: () => void,
    }[] = [
            {
                value: user?.username || "Username", onClickAction: () => { router.push(`/m/settings/username?prev=${encodeURIComponent(currentPathUrl)}`) },
            },
            {
                value: `${user?.firstName || "First Name"} ${user?.lastName || "Last Name"}`, onClickAction: () => { router.push(`/m/settings/name?prev=${encodeURIComponent(currentPathUrl)}`) }
            },
        ]

    const userProfileActions: {
        value: string,
        onClickAction: () => void,
    }[] = [
            {
                value: "Update Email", onClickAction: () => { router.push(`/m/settings/update-email?prev=${encodeURIComponent(currentPathUrl)}`) },
            },
            {
                value: "Change Password", onClickAction: () => { router.push(`/m/settings/change-password?prev=${encodeURIComponent(currentPathUrl)}`) },
            },
            {
                value: "Add Phone Number", onClickAction: () => { router.push(`/m/settings/change-phone?prev=${encodeURIComponent(currentPathUrl)}`) },
            },
        ]


    return (
        <div
            className={cn(
                "w-full min-h-[100dvh]",
                className,
            )}
            {...props}
        >
            <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
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
                        Edit Profile
                    </p>
                </div>
            </div>
            <div className="w-full flex flex-col gap-6 py-6">
                <div className="w-full flex flex-col items-center gap-2" onClick={() => router.push(`/m/settings/profile-picture?prev=${encodeURIComponent(currentPathUrl)}`)}>
                    <span className="relative w-18 h-18 rounded-full flex items-center justify-center">
                        <AspectRatio ratio={1}>
                            <Image
                                src={user?.profileImage || defaultImage}
                                alt={user?.username}
                                fill
                                className="object-cover rounded-full"
                            />
                        </AspectRatio>
                    </span>
                    <span className="text-blue-800 font-semibold">Update Photo</span>
                </div>
                <div className="w-full flex flex-col items-center gap-4 px-4">
                    <span className="w-full flex justify-between px-4 border-1 border-neutral-800 rounded-md py-4">
                        <p className="text-neutral-400 font-semibold text-lg">{user?.email}</p>
                    </span>
                    <span className="w-full flex justify-between px-4 border-1 border-neutral-800 rounded-md py-4">
                        <p className="text-neutral-400 font-semibold text-lg">{user?.phoneNumber || "No Phone Number"}</p>
                    </span>
                    {userInfo.map((item, index) => (
                        <span key={index} className="w-full flex justify-between px-4 border-1 border-neutral-800 rounded-md py-4" onClick={item.onClickAction}>
                            <p className="text-neutral-400 font-semibold text-lg">{item.value}</p>
                            <CiEdit size={22} />
                        </span>
                    ))}
                    <span className="w-full flex justify-between px-4 border-1 border-neutral-800 rounded-md py-4" onClick={() => router.push(`/m/settings/bio?prev=${encodeURIComponent(currentPathUrl)}`)}>
                        <p className="text-blue-800 font-semibold text-lg">Add bio</p>
                        <CiEdit size={22} />
                    </span>
                </div>
                <div className="w-full flex flex-col items-center gap-4 px-4">
                    {userProfileActions.map((item, index) => (
                        <Button
                            key={index}
                            className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg"
                            onClick={item.onClickAction}
                        >
                            {item.value}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}