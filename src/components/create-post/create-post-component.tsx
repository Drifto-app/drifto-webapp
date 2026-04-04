"use client"

import {useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {CreatePostContent} from "@/components/create-post/create-post-content";

export const CreatePostComponent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                   <CreatePostContent prev={prev} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}