/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/axios";
import { EventCard } from "@/components/event-display/event-card";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from '@/store/auth-store';
import { EventCardSkeleton } from "@/components/ui/page-skeletons";

interface SingleEventRelatedProps extends React.ComponentProps<"div">{
    event: {[key: string]: any};
    currentPathUrl: string;
    variant?: "mobile" | "desktop";
}

export const SingleEventRelated = ({
                                       event, currentPathUrl, variant = "mobile", className, ...props
                                   }: SingleEventRelatedProps) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const isDesktop = variant === "desktop";

    const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const desktopRailRef = useRef<HTMLDivElement | null>(null);
    const desktopLoadMoreRef = useRef<HTMLDivElement | null>(null);

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
    }, [event?.id, isAuthenticated, isLoading]);

    useEffect(() => {
        setRelatedEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadRelatedEvents(true);
    }, [loadRelatedEvents]);

    // Mobile infinite scroll uses the page viewport.
    useEffect(() => {
        if (isDesktop) return;

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
    }, [isDesktop, loadRelatedEvents, error]);

    // Desktop infinite scroll uses the horizontal rail as the observer root.
    useEffect(() => {
        if (!isDesktop) return;

        const rail = desktopRailRef.current;
        const trigger = desktopLoadMoreRef.current;

        if (!rail || !trigger || error || !hasMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (
                    entry?.isIntersecting &&
                    !loadingRef.current &&
                    hasMoreRef.current &&
                    !error
                ) {
                    loadRelatedEvents(false);
                }
            },
            {
                root: rail,
                rootMargin: "0px 280px 0px 0px",
                threshold: 0.15,
            }
        );

        observer.observe(trigger);
        return () => observer.disconnect();
    }, [isDesktop, loadRelatedEvents, error, relatedEvents.length, loading, initialLoading, hasMore]);

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
                    "w-full flex flex-col items-center justify-center",
                    isDesktop ? "min-h-64" : "min-h-[85vh]",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                {isDesktop ? (
                    <div className="w-full">
                        <div className="flex w-full gap-6 overflow-x-auto pb-6 pr-4 no-scrollbar snap-x snap-mandatory">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="w-[360px] shrink-0 xl:w-[400px]">
                                    <EventCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid w-full grid-cols-1 gap-6 px-4 py-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <EventCardSkeleton key={index} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Error state when no events loaded
    if (error && relatedEvents.length === 0) {
        return (
            <div
                className={cn(
                    "w-full flex flex-col items-center justify-center",
                    isDesktop ? "min-h-64" : "min-h-[85vh]",
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
                    "w-full flex flex-col items-center justify-center",
                    isDesktop ? "min-h-64" : "min-h-[85vh]",
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
                "w-full",
                isDesktop ? "min-h-0" : "min-h-[85vh]",
                className,
                event.eventTheme !== null ? "" : "bg-muted/40",
            )}
            {...props}
        >
            <div className={cn(isDesktop ? "px-0 py-0" : "px-4 py-6")}>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                        Related Events ({totalCount})
                    </h2>
                </div>

                {isDesktop ? (
                    <div className="w-full">
                        <div
                            ref={desktopRailRef}
                            className="flex w-full gap-6 overflow-x-auto pb-6 pr-4 no-scrollbar snap-x snap-mandatory"
                        >
                            {relatedEvents.map((evt) => (
                                <div
                                    key={evt.id}
                                    className="w-[360px] shrink-0 snap-start xl:w-[400px]"
                                >
                                    <EventCard
                                        event={evt}
                                        currentPathUrl={currentPathUrl}
                                        isAuthenticated={isAuthenticated}
                                        variant="desktop"
                                        className="h-full"
                                    />
                                </div>
                            ))}

                            {loading && !initialLoading && (
                                <div className="flex w-[220px] shrink-0 items-center justify-center">
                                    <Loader className="h-8 w-8" />
                                </div>
                            )}

                            {error && relatedEvents.length > 0 && (
                                <div className="flex w-[260px] shrink-0 flex-col items-center justify-center px-4">
                                    <p className="text-orange-700 text-sm mb-2 text-center">
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

                            {!hasMore && relatedEvents.length > 0 && (
                                <div className="flex w-[260px] shrink-0 items-center justify-center px-4">
                                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                                            <Flag size={18} />
                                        </span>
                                        <p className="text-sm font-semibold text-foreground">
                                            You&apos;re all caught up
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            That&apos;s every related event for now.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div ref={desktopLoadMoreRef} className="h-px w-px shrink-0" aria-hidden="true" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {relatedEvents.map((evt) => (
                            <EventCard
                                key={evt.id}
                                event={evt}
                                currentPathUrl={currentPathUrl}
                                isAuthenticated={isAuthenticated}
                                variant="mobile"
                            />
                        ))}
                    </div>
                )}

                {/* Loading indicator for pagination */}
                {loading && !initialLoading && !isDesktop && (
                    <div className="flex justify-center py-4 mt-4">
                        <Loader className="h-8 w-8"/>
                    </div>
                )}

                {/* Error indicator for pagination errors (mobile) */}
                {error && relatedEvents.length > 0 && !isDesktop && (
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

                {/* End of content indicator (mobile) */}
                {!hasMore && relatedEvents.length > 0 && !isDesktop && (
                    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-6 text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                            <Flag size={18} />
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                            You&apos;re all caught up
                        </p>
                        <p className="text-xs text-muted-foreground">
                            That&apos;s every related event for now.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
