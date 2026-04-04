"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import * as React from "react";
import {useAuthStore} from "@/store/auth-store";
import {ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import {useEventTags} from "@/store/event-tag-store";
import {Button} from "@/components/ui/button";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";

export const UserPreferencesPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full" >
                    <UserPreferencesContent prev={prev} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}


interface UserPreferencesContentProps extends ComponentProps<"div"> {
    prev: string | null;
}

const colors: string[] = [
    "bg-rose-400",
    "bg-teal-400",
    "bg-sky-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-fuchsia-500"
]

export const UserPreferencesContent = ({
           prev, className, ...props
}: UserPreferencesContentProps) => {
    const router = useRouter();

   const {user, setUser} = useAuthStore();
   const eventTags= useEventTags()

    const [isEdited, setEdited] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<string[]>(user?.eventTags || []);

    const handleBackClick = () => {
        router.push(prev ?? "/");
    };

    const handleClick = async () => {
        setIsLoading(true);

        const param = {
            tags: categories
        }

        try {
            await authApi.patch("/user/update", param);
            setUser({...user, eventTags: categories});
            showTopToast("success", "User preferences updated successfully.");
        } catch (error: any) {
            showTopToast("error", "User preferences update error")
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("w-full", className)} {...props}>
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
                        Preferences
                    </p>
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col gap-2 px-4 pt-5">
                <h3 className="text-xl font-bold">What are you interested in?</h3>
                <p className="text-neutral-500 text-sm">Choose for 20+ categories that match your interest.</p>
                <div className="w-full grid grid-cols-2 gap-4">
                    {eventTags.map((tag, index) => (
                        <span
                            key={index}
                            className={`pt-2 pb-25 px-4 rounded-xl text-white font-bold border-3 ${colors[index % colors.length]} ${categories.includes(tag.name) ? "border-foreground" : "border-transparent"}`}
                            onClick={() => {
                                setEdited(true);
                                 if(categories.includes(tag.name)) {
                                     setCategories((categories) => categories.filter((item) => item !== tag.name))
                                 } else {
                                     setCategories([...categories, tag.name]);
                                 }
                            }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className='w-full px-4 fixed inset-x-0 bottom-2 z-99'>
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-6 font-semibold"
                    disabled={isLoading || !isEdited}
                    onClick={handleClick}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}