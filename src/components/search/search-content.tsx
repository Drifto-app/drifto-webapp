"use client"

import {useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {SearchDetails} from "@/components/search/search-details";

interface SearchContentProps {
    variant?: "mobile" | "desktop";
}

export default function SearchContent ({ variant = "mobile" }: SearchContentProps) {

    const searchParams = useSearchParams();

    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                    <SearchDetails prev={prev} variant={variant} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
};
