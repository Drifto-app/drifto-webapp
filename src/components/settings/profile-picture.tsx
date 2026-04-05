"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useState} from "react";
import {cn, MAX_IMAGE_SIZE, uploadMedia} from "@/lib/utils";
import {FaArrowLeft, FaCamera} from "react-icons/fa";
import * as React from "react";
import {useAuthStore} from "@/store/auth-store";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {IoCameraOutline} from "react-icons/io5";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";

export const ProfilePicturePageContent = () => {

    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <ProfilePictureContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface ProfilePictureContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const ProfilePictureContent = ({
    prev, currentPathUrl, className, ...props
}: ProfilePictureContentProps) => {
    const router = useRouter();
    const {user, setUser} = useAuthStore()

    const [profileImage, setProfileImage] = useState<string>(user?.profileImage || "");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModified, setIsModified] = useState<boolean>(false);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };


    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) return;

        setIsUploading(true);
        setIsModified(true);

        try {
            const response = await uploadMedia(file, "PROFILE_IMAGE")

            if (!response) {
                showTopToast("error", "Upload failed.");
                return
            }

            setProfileImage(response);
            // e.target.value = response;
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }

    const handleProfileImageUpdate = async () => {
        setIsLoading(true);

        const param = {
            profileImageUrl: profileImage,
        }

        try {
            await authApi.patch("/user/update", param);

            setUser({...user, profileImage: profileImage});

            showTopToast("success", "Profile picture updated successfully.");
        } catch (error: any) {
            showTopToast("error", "Profile image update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            className={cn(
                "w-full min-h-[100dvh] flex flex-col",
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
                        Profile Image
                    </p>
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col py-8 px-4 items-center justify-between">
                <label className="flex flex-col items-center px-8 gap-3">
                    <div className="rounded-full h-36 w-36 border-neutral-400 border-1 bg-neutral-200 flex items-center justify-center">
                        {isUploading ? <LoaderSmall /> : profileImage
                            ? <AspectRatio ratio={1}>
                                <Image
                                    src={profileImage}
                                    alt={user?.username}
                                    fill
                                    className="object-cover rounded-full" />
                            </AspectRatio>
                        : <IoCameraOutline size={25} /> }
                    </div>
                    <input
                        multiple={false}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />
                    <p className="font-semibold text-blue-800 text-md">
                        Change Image
                    </p>
                </label>
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg"
                    disabled={isUploading || isLoading || !isModified}
                    onClick={handleProfileImageUpdate}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}

