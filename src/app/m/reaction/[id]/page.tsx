"use client"

import {useParams, usePathname, useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import * as React from "react";
import ReactionManagePage from "@/components/reaction/reaction-manage";

export default function ReactionPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;

    const queryParams = useSearchParams();
    const prev = queryParams?.get("prev") ?? null;
    const type = queryParams?.get("type");

    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Type guard to ensure id is a string
    if (!id || Array.isArray(id)) {
        return (
            <ProtectedRoute>
                <ScreenProvider>
                    <div className="w-full h-screen flex flex-col items-center justify-center">
                        <div className="bg-red-500 text-white p-4 rounded">Invalid entity ID</div>
                    </div>
                </ScreenProvider>
            </ProtectedRoute>
        );
    }

    if(!type) {
        return (
            <ProtectedRoute>
                <ScreenProvider>
                    <div className="w-full h-screen flex flex-col items-center justify-center">
                        <div className="bg-red-500 text-white p-4 rounded">Reaction type is not present</div>
                    </div>
                </ScreenProvider>
            </ProtectedRoute>
        )
    }

    return(
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                   <ReactionManagePage entityId={id} prev={prev} type={type} currentPathUrl={pathname + "?" + searchParams} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}
