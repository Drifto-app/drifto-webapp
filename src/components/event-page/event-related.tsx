"use client"

import * as React from "react";
import {cn} from "@/lib/utils";
import {authApi} from "@/lib/axios";
import {EventCard} from "@/components/event-display/event-card";
import {Loader} from "@/components/ui/loader";
import {Button} from "@/components/ui/button";
import {useCallback, useEffect, useRef, useState} from "react";
import { useAuthStore } from '@/store/auth-store';
import { EventCardSkeleton } from "@/components/ui/page-skeletons";

interface SingleEventRelatedProps extends React.ComponentProps<"div">{
    event: {[key: string]: any};
    currentPathUrl: string;
}

export const SingleEventRelated = ({
                                       event, currentPathUrl, className, ...props
                                   }: SingleEventRelatedProps) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);

    const loadRelatedEvents = useCallback(async (resetData = false) => {
        if (!event?.id || loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        if (resetData) {
            setInitialLoading(true);
        }
        setError(null);

        try {
            const currentPage = resetData ? 1 : pageRef.current;

            let response;
            if(isAuthenticated && !isLoading    ) {
                response = await authApi.get(`/event/${event.id}/related`, {
                    params: {
                        pageSize: 10,
                        pageNumber: currentPage,
                    }
                });
            } else {
                response = await authApi.get(`/event/public/${event.id}/related`, {
                    params: {
                        pageSize: 10,
                        pageNumber: currentPage,
                    }
                });
            }

            const newEvents = response.data.data.data || [];
            const isLast = response.data.data.isLast !== undefined
                ? response.data.data.isLast
                : newEvents.length < 10;

            if (resetData) {
                setRelatedEvents(newEvents);
                pageRef.current = 2;
            } else {
                setRelatedEvents((prev) => [...prev, ...newEvents]);
                pageRef.current = currentPage + 1;
            }

            setTotalCount(response.data.data.totalElements);
            setHasMore(!isLast);
            hasMoreRef.current = !isLast;

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Error loading related events";
            setError(errorMessage);
            console.error("Failed to load related events:", err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            loadingRef.current = false;
        }
    }, [event?.id]);

    useEffect(() => {
        setRelatedEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadRelatedEvents(true);
    }, [loadRelatedEvents]);

    // Infinite scroll
    useEffect(() => {
        const onScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 200 &&
                !loadingRef.current &&
                hasMoreRef.current &&
                !error
            ) {
                loadRelatedEvents(false);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [loadRelatedEvents, error]);

    const handleRetry = () => {
        setError(null);
        setRelatedEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        loadRelatedEvents(true);
    };

    // Initial loading state
    if (initialLoading) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex flex-col items-center justify-center",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                <div className="flex w-full flex-col gap-8 px-4 py-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <EventCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    // Error state when no events loaded
    if (error && relatedEvents.length === 0) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex flex-col items-center justify-center",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                <div className="flex flex-col items-center justify-center py-8 px-4">
                    <p className="text-red-700 text-sm mb-4 text-center max-w-md">
                        Failed to load related events
                    </p>
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

    // No related events
    if (!loading && !initialLoading && relatedEvents.length === 0 && !error) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex flex-col items-center justify-center",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                <div className="text-center max-w-md px-4">
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No Related Events
                    </h3>
                    <p className="text-neutral-500 mb-4">
                        No related events found for this event at the moment.
                    </p>
                    <Button
                        onClick={handleRetry}
                        variant="outline"
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
                "w-full min-h-[85vh]",
                className,
                event.eventTheme !== null ? "" : "bg-muted/40",
            )}
            {...props}
        >
            <div className="px-4 py-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                        Related Events ({totalCount})
                    </h2>
                </div>

                <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto">
                    {relatedEvents.map((evt) => (
                        <EventCard
                            key={evt.id}
                            event={evt}
                            currentPathUrl={currentPathUrl}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {/* Loading indicator for pagination */}
                {loading && !initialLoading && (
                    <div className="flex justify-center py-4 mt-4">
                        <Loader className="h-8 w-8"/>
                    </div>
                )}

                {/* Error indicator for pagination errors */}
                {error && relatedEvents.length > 0 && (
                    <div className="flex flex-col items-center justify-center py-4 mt-4">
                        <p className="text-orange-700 text-sm mb-2">
                            Failed to load more related events
                        </p>
                        <Button
                            onClick={() => loadRelatedEvents(false)}
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* End of content indicator */}
                {!hasMore && relatedEvents.length > 0 && (
                    <p className="pt-4 text-gray-500 text-center">
                        You have reached the end!
                    </p>
                )}
            </div>
        </div>
    );
}
