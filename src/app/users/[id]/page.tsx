"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { UserContent } from "@/components/user/user-content";
import { UserProfilePageSkeleton } from "@/components/ui/page-skeletons";
import { authApi } from "@/lib/axios";

export default function DesktopUserPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await authApi.get(`/user/lookup/${id}`);
                setUser(response.data.data);
            } catch (err: any) {
                setError(err.message || "No User found");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <ScreenProvider>
                <UserProfilePageSkeleton />
            </ScreenProvider>
        )
    }

    if (error) {
        return (
            <ScreenProvider>
                <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
                        <MdErrorOutline size={30} className="text-red-500" />
                        <div>
                            <p className="font-black">No user found</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>
                </div>
            </ScreenProvider>
        )
    }

    return (
        <ScreenProvider>
            <UserContent prev={prev} user={user} setUser={setUser} variant="desktop" />
        </ScreenProvider>
    )
}
