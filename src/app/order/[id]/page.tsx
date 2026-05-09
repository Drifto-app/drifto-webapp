"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { authApi } from "@/lib/axios";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { OrderContent } from "@/components/order/order-content";
import { OrderPageSkeleton } from "@/components/ui/page-skeletons";
import { useAuthStore } from "@/store/auth-store";

export default function OrderPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const searchParams = useSearchParams();

    const prev = searchParams?.get("prev") ?? null;

    const { isAuthenticated, isLoading, hasTriedRefresh } = useAuthStore();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (!id) return;
        if (isLoading || (!isAuthenticated && !hasTriedRefresh)) return;

        const fetchEvent = async () => {
            try {
                const response = isAuthenticated
                    ? await authApi.get(`/event/${id}`)
                    : await authApi.get(`/event/public/${id}`);
                setEvent(response.data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, isLoading, isAuthenticated, hasTriedRefresh]);

    if (error) {
        return (
            <ScreenProvider>
                <div className="w-full h-screen flex justify-center items-center">
                    <div className="flex justify-center items-center gap-2">
                        <MdErrorOutline size={30} className="text-red-500" />
                        <p className="font-semibold text-lg">No event found</p>
                    </div>
                </div>
            </ScreenProvider>
        );
    }

    if (loading) {
        return (
            <ScreenProvider>
                <OrderPageSkeleton />
            </ScreenProvider>
        );
    }

    if (!isAuthenticated) {
        return (
            <ScreenProvider>
                <OrderContent event={event} prev={prev} variant="desktop" />
            </ScreenProvider>
        );
    }

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <OrderContent event={event} prev={prev} variant="desktop" />
            </ScreenProvider>
        </ProtectedRoute>
    );
}
