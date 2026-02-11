"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { MdDeleteOutline, MdVerified } from "react-icons/md";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useRouter } from "next/navigation";
import { GoDash } from "react-icons/go";
import { useState } from "react";
import { LoaderSmall } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { SlOptionsVertical } from "react-icons/sl";
import { FaFlag } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import defaultImage from "@/assests/default.jpeg";

interface UserPlaceholderProps extends React.ComponentProps<"div"> {
    user: { [key: string]: any };
    prev?: string;
}

interface UserEventSinglePlaceholderProps extends UserPlaceholderProps {
    isHost: boolean;
    removeClick?: (username: string) => void;
}

function UserVerificationBadge({ user, isClickable = false }: { user: { [key: string]: any }, isClickable?: boolean }) {
    let verificationStyle = "";
    let description = ""

    if (user.userVerificationType === "ORGANIZATION_VERIFICATION") {
        verificationStyle = "text-black";
        description = "The account is verified as an affiliated account to Drifto";
    } else if (user.userVerificationType === "USER_VERIFICATION") {
        verificationStyle = "text-blue-600"
        description = "The account is a verified user on Drifto";
    } else if (user.userVerificationType === "HOST_VERIFICATION") {
        verificationStyle = "text-yellow-500"
        description = "The account is a verified host account on Drifto";

    }


    if (user.verified) {
        if (isClickable) {
            return (
                <Drawer>
                    <DrawerTrigger asChild>
                        <MdVerified size={15} className={cn(
                            verificationStyle
                        )} />
                    </DrawerTrigger>

                    <DrawerContent className="z-99999">
                        <div className="w-full px-4 pb-4">
                            <DrawerHeader>
                                <DrawerTitle>Verification Info</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex items-center gap-4">
                                <MdVerified size={25} className={cn(
                                    verificationStyle
                                )} />
                                <span className="font-bold leading-tight">
                                    {description}
                                </span>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
            )
        }

        return (
            <MdVerified size={15} className={cn(
                verificationStyle
            )} />
        )
    }

    return null;
}

function UserEventSinglePlaceholder({ user, isHost, removeClick, prev, className, ...props }: UserEventSinglePlaceholderProps) {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const handleRemoveClick = async (e: React.MouseEvent, username: string) => {
        // Prevent events bubbling to parent div
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);

        try {
            await removeClick!(username);
        } catch (error: any) {

        } finally {
            setLoading(false);
        }
    }

    const handleUserClick = () => {
        router.push(`/m/user/${user.id}?prev=${encodeURIComponent(prev || "/")}`);
    }

    if (removeClick) {
        return (
            <div key={user.id} className={cn(
                "flex justify-between items-center",
                className
            )} {...props}>
                <div className="flex flex-row gap-4 cursor-pointer" onClick={handleUserClick}>
                    <div className="w-10 h-10 flex flex-row items-center">
                        <AspectRatio ratio={1}>
                            <Image
                                src={user.profileImageUrl || defaultImage}
                                alt={user.username}
                                fill
                                className="object-cover rounded-full" />
                        </AspectRatio>
                    </div>
                    <div>
                        <div className="flex flex-row gap-1 items-center">
                            <p className="font-semibold text-sm">{user.username}</p>
                            <UserVerificationBadge user={user} />
                        </div>
                        <p className="text-sm font-semibold text-neutral-400">{isHost ? "Main Host" : "Co-Host"}</p>
                    </div>
                </div>
                {
                    isHost || <button
                        className="flex justify-center items-center px-4 cursor-pointer text-transparent border-none"
                        onClick={(e) => handleRemoveClick(e, user.username)}
                        disabled={loading}
                    >
                        {
                            loading ? <LoaderSmall /> : <GoDash size={20} className="text-red-600" />
                        }
                    </button>
                }
            </div>
        )
    }

    return (
        <div key={user.id} className={cn(
            "flex flex-row gap-4 cursor-pointer",
            className
        )} {...props} onClick={handleUserClick}>
            <div className="w-10 h-10 flex flex-row items-center">
                <AspectRatio ratio={1}>
                    <Image
                        src={user.profileImageUrl || defaultImage}
                        alt={user.username}
                        fill
                        className="object-cover rounded-full" />
                </AspectRatio>
            </div>
            <div>
                <div className="flex flex-row gap-1 items-center">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <UserVerificationBadge user={user} />
                </div>
                <p className="text-sm font-semibold text-neutral-400">{isHost ? "Main Host" : "Co-Host"}</p>
            </div>
        </div>
    )
}

function UserSinglePlaceholder({ user, prev, className, ...props }: UserPlaceholderProps) {
    const router = useRouter();

    return (
        <div
            className={cn(
                "flex flex-row gap-4 cursor-pointer",
                className
            )}
            {...props}
            onClick={() => router.push(`/m/user/${user.id}?prev=${encodeURIComponent(prev || "/")}`)}
        >
            <div className="w-7 h-7 flex flex-row items-center">
                <AspectRatio ratio={1}>
                    <Image
                        src={user.profileImageUrl || defaultImage}
                        alt={user.username}
                        fill
                        className="object-cover rounded-full" />
                </AspectRatio>
            </div>
            <div className="flex flex-row gap-1 items-center">
                <p className="font-semibold text-sm">{user.username}</p>
                <UserVerificationBadge user={user} />
            </div>
        </div>
    )
}

export { UserEventSinglePlaceholder, UserSinglePlaceholder, UserVerificationBadge };