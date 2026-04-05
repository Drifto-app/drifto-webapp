"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import {Share2} from "lucide-react";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {showTopToast} from "@/components/toast/toast-util";
import {useShare} from "@/hooks/share-option";
import {ShareDialog} from "@/components/share-button/share-option";
import Image from "next/image";


export const InviteFriendsPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <InviteFriendsContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface InviteFriendsContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const InviteFriendsContent = ({
    prev, currentPathUrl, className, ...props
}: InviteFriendsContentProps) => {
    const router = useRouter();

    const inviteUrl = process.env.NEXT_WEBSITE_BASE_URL!

    const {
        isShareDialogOpen,
        closeShareDialog,
        handleQuickShare,
        copyToClipboard
    } = useShare({
        title: "Join me on Drifto!",
        url: inviteUrl,
        description: "Discover real experiences with people you love. Live every moment."
    });

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleCopyInviteLink = async () => {
        try {
            await copyToClipboard();
            showTopToast("success", "Invite link copied to clipboard!");
        } catch (error) {
            showTopToast("error", "Failed to copy invite link");
        }
    };

    return (
        <>
            <div
                className={cn(
                    "w-full min-h-[100dvh] flex flex-col bg-background",
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
                            Invite Friends
                        </p>
                        <div className="w-5" /> {/* Spacer for centering */}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                    <div className="w-68 flex flex-row items-center pb-10">
                        <Image
                            src={"/logo-extend.png"}
                            alt="Drifto Logo"
                            width={800}
                            height={400}
                            className="object-contain rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col items-center text-center mb-12">
                        <h1 className="text-2xl font-bold text-foreground mb-4">
                            Share Drifto with your friends
                        </h1>
                        <p className="text-neutral-500 text-base leading-tight max-w-md">
                            Discover real experiences with people you love. Live every moment.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full max-w-md flex flex-col gap-4">
                        <Button
                            onClick={handleCopyInviteLink}
                            className="w-full bg-blue-800 hover:bg-blue-800 text-white py-7 font-semibold text-lg rounded-md"
                        >
                            Copy Invite Link
                        </Button>

                        <Button
                            onClick={handleQuickShare}
                            variant="outline"
                            className="w-full bg-background border-2 border-border hover:bg-background text-foreground py-7 font-semibold text-lg rounded-md flex items-center justify-center gap-3"
                        >
                            <Share2 className="w-5 h-5 text-blue-600" />
                            Share Invite
                        </Button>
                    </div>
                </div>
            </div>

            <ShareDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                title="Join me on Drifto!"
                url={inviteUrl}
                description="Discover real experiences with people you love. Live every moment."
            />
        </>
    )
}