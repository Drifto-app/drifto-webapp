"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { ComponentProps, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { authApi } from "@/lib/axios";
import { EventCard } from "@/components/event-display/event-card";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/event-display/tabs";
import { useAuthStore } from '@/store/auth-store';
import { BiCalendarAlt } from 'react-icons/bi';
import { PiFireSimpleBold } from 'react-icons/pi';

interface EventDisplayProps extends ComponentProps<"div"> {
    location: string | null;
}

interface EventDisplayRef {
    refresh: () => void;
}

export const EventDisplay = forwardRef<EventDisplayRef, EventDisplayProps>(({
    location, className, ...props
}, ref) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const { isAuthenticated } = useAuthStore();

    const [activeEventItem, setActiveEventItem] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);

    const loadEvents = useCallback(async (resetData = false) => {
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        if (resetData) {
            setInitialLoading(true);
        }
        setError(null); // Clear previous errors on refresh

        try {
            const currentPage = resetData ? 1 : pageRef.current;

            const params: { [key: string]: string | number } = {
                pageSize: 10,
                pageNumber: currentPage,
            }

            if (activeEventItem) {
                params.eventTag = activeEventItem;
            }

            if (location) {
                params.location = location;
            }

            let response;

            if (isAuthenticated) {
                response = await authApi.get("/feed/event", {
                    params
                });
            } else {
                response = await authApi.get("/feed/public/event", {
                    params
                });
            }

            const newEvents = response.data.data.data;

            if (resetData) {
                setEvents(newEvents);
                pageRef.current = 2;
            } else {
                setEvents((prev) => [...prev, ...newEvents]);
                pageRef.current = currentPage + 1;
            }

            const isLast = response.data.data.isLast;
            setHasMore(!isLast);
            hasMoreRef.current = !isLast;

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Error loading events";

            // Only show toast for pagination errors, not initial load errors
            // if (!resetData) {
            //     toast.error(errorMessage);
            // }

            setError(errorMessage);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            loadingRef.current = false;
        }
    }, [location, activeEventItem]);

    // Expose refresh method via ref
    useImperativeHandle(ref, () => ({
        refresh: () => {
            setEvents([]);
            setHasMore(true);
            pageRef.current = 1;
            hasMoreRef.current = true;
            setError(null);
            loadEvents(true);
        }
    }), [loadEvents]);

    // Reset when category changes
    useEffect(() => {
        setEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadEvents(true);
    }, [activeEventItem, loadEvents]);

    // Infinite scroll
    useEffect(() => {
        const onScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 200 &&
                !loadingRef.current &&
                hasMoreRef.current &&
                !error // Don't trigger scroll loading if there's an error
            ) {
                loadEvents(false);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [loadEvents, error]);

    // Retry function for error state
    const handleRetry = () => {
        setError(null);
        setEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        loadEvents(true);
    };


    // Initial loading state
    if (initialLoading) {
        return (
            <div
                className={cn(
                    "w-full flex flex-col items-center justify-center pb-20",
                    className
                )}
                {...props}
            >
                <Tabs active={activeEventItem} />

                <div className="flex justify-center py-8">
                    <Loader className="h-10 w-10" />
                </div>
            </div>
        );
    }

    // Error state when no events loaded
    if (error && events.length === 0) {
        return (
            <div
                className={cn(
                    "w-full flex flex-col items-center justify-center pb-20",
                    className
                )}
                {...props}
            >
                <Tabs active={activeEventItem} onClick={setActiveEventItem} />

                <div className="flex flex-col items-center justify-center py-8 px-4w-full">
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col items-center justify-center pb-20",
                className
            )}
            {...props}
        >
            <Tabs active={activeEventItem} onClick={setActiveEventItem} />

            <div className="flex flex-col gap-10 px-4 mt-4 w-full max-w-7xl ">
                {events.map((evt, index) => (
                    <EventCard key={evt.id} isAuthenticated={isAuthenticated} event={evt} currentPathUrl={pathname + "?" + searchParams} />
                ))}
            </div>

            <Button
                size="lg"
                className={cn(
                    'fixed rounded-full z-1000 bg-blue-800',
                    isAuthenticated ? "bottom-20" : "bottom-8"
                )}
                onClick={() => router.push(`/m/event-create?prev=${encodeURIComponent(pathname + "?" + searchParams)}`)}
            >
                Create Experience
            </Button>

            {/* Loading indicator for pagination */}
            {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8" />
                </div>
            )}

            {/* Error indicator for pagination errors */}
            {error && events.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 pt-4 pb-15 w-full">
                    <p className="text-orange-700 text-sm mb-2">
                        Failed to load more events
                    </p>
                    <Button
                        onClick={() => loadEvents(false)}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700 text-sm hover:bg-orange-50"
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {/* End of content indicator */}
            {!hasMore && events.length > 0 && (
                <p className="pt-4 pb-15 text-gray-500 text-sm">You have reached the end!</p>
            )}

            {/* No events message */}
            {!loading && !initialLoading && events.length === 0 && !error && (
                <div className="w-full flex flex-col items-center justify-center pt-15">
                    <div className="flex flex-col items-center gap-3 text-center max-w-md px-4">
                        <PiFireSimpleBold size={40} className="text-blue-800" />
                        <p className="text-neutral-500 mb-4 text-sm">
                            {activeEventItem
                                ? `No events found for ${activeEventItem.toUpperCase() || 'this category'}`
                                : location
                                    ? `No events found in ${location}`
                                    : "No events available at the moment"
                            }
                        </p>
                    </div>
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
});