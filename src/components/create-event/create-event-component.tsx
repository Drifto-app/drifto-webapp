"use client"

import {useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {CreateEventContent} from "@/components/create-event/create-event-content";

export default function CreateEventComponent () {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                    <CreateEventContent prev={prev} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}