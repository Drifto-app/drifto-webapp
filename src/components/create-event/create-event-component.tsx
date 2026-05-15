"use client"

import {useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {CreateEventContent} from "@/components/create-event/create-event-content";

interface CreateEventComponentProps {
    variant?: "mobile" | "desktop";
}

export default function CreateEventComponent ({ variant = "mobile" }: CreateEventComponentProps = {}) {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                    <CreateEventContent prev={prev} variant={variant} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}
