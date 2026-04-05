"use client"

import {useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {SearchDetails} from "@/components/search/search-details";

export default function SearchContent () {

    const searchParams = useSearchParams();

    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                    <SearchDetails prev={prev} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
};