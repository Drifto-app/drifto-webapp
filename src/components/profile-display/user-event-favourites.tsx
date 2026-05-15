"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import {Loader} from "@/components/ui/loader";
import * as React from "react";
import {EventFavouriteCard} from "@/components/profile-display/event-favourite-card";
import { FaRegHeart } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { EventCardSkeleton } from "@/components/ui/page-skeletons";

interface UserEventFavouritesProps extends ComponentProps<"div"> {
    handleScreenChange: (value: string) => void;
    variant?: "mobile" | "desktop";
}

export const UserEventFavourites = ({
    handleScreenChange, variant = "mobile", className, ...props
}: UserEventFavouritesProps) => {
    const isDesktop = variant === "desktop";

    const [events, setEvents] = useState<Array<{[key: string]: any}>>([]);
    const [, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);

    const loadEvents = useCallback(
        async (reset: boolean = false) => {
            if (loadingRef.current || (!reset && !hasMoreRef.current)) return;

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentPage = reset ? 1 : pageRef.current;

                const params: { [key: string]: string | number } = {
                    pageSize: 10,
                    pageNumber: currentPage,
                    reactionType: "EVENT"
                };

                const response = await authApi.get(`/reaction/user`, { params });

                const data = response.data.data.data;
                const newEvents = data.map((event: {[key: string]: any}) => event.eventPlaceHolder)

                if (reset) {
                    setEvents(newEvents);
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setEvents((prev) => [...prev, ...newEvents]);
                    pageRef.current = currentPage + 1;
                }

                const isLast = response.data.data.isLast;
                setHasMore(!isLast);
                hasMoreRef.current = !isLast;
            } catch (err: any) {
                showTopToast("error", err.message || "Error loading comments");
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        []
    );

    useEffect(() => {
        setEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadEvents(true);
    }, [loadEvents]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    !loadingRef.current &&
                    hasMoreRef.current &&
                    !error
                )  loadEvents();
            },
            {
                root: isDesktop ? null : scrollRootRef.current ?? null,
                rootMargin: isDesktop ? "160px" : "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadEvents, error, isDesktop]);

    if (isDesktop) {
        return (
            <div
                className={cn("w-full space-y-5", className)}
                {...props}
            >
                {loading && events.length === 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <EventCardSkeleton key={index} />
                        ))}
                    </div>
                ) : error && events.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center">
                        <p className="font-black">Unable to load favourites</p>
                        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                        <FaRegHeart size={38} className="text-blue-800" />
                        <p className="mt-4 font-black">No liked events yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Explore Drifto for experiences worth saving.
                        </p>
                        <Button
                            onClick={() => handleScreenChange("events")}
                            className="mt-5 rounded-full"
                        >
                            Find events
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <EventFavouriteCard
                                eventContent={event}
                                key={event.eventId}
                                variant="desktop"
                                onUnReact={(eventId: string) => {
                                    setEvents((items) => items.filter(i => i.eventId !== eventId));
                                }}
                            />
                        ))}
                    </div>
                )}

                <div ref={sentinelRef} aria-hidden className="h-8" />

                {loading && events.length > 0 && (
                    <div className="flex justify-center py-6">
                        <Loader className="h-8 w-8"/>
                    </div>
                )}
            </div>
        )
    }


    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4 flex-1 pt-4 overflow-y-auto no-scrollbar pb-10",
                className,
            )}
            {...props}
            ref={scrollRootRef}
            style={{ maxHeight: "calc(100dvh - 120px)" }}
        >

            <div className="flex flex-col gap-8 px-4">
                {loading && events.length === 0
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <EventCardSkeleton key={index} />
                    ))
                    : events.map((event) => (
                        <EventFavouriteCard
                            eventContent={event}
                            key={event.eventId}
                            variant={variant}
                            onUnReact={(eventId: string) => {
                                setEvents((items) => items.filter(i => i.eventId !== eventId));
                            }}
                        />
                    ))}
            </div>

            <div ref={sentinelRef} aria-hidden className="h-1" />

            {loading && events.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

            {!loading && events.length === 0 && (
              <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
                  <FaRegHeart size={40} className="text-blue-800"/>
                 <span className="flex flex-col gap-2">
                      <p className="text-foreground text-sm font-semibold">
                        No liked event...yet!
                      </p>
                      <p className="text-neutral-500 text-xs">
                          Explore drifto for exciting events.
                      </p>
                 </span>
                  <Button
                    onClick={() => handleScreenChange("events")}
                    className="rounded-full py-5 px-5"
                  >
                      Find events
                  </Button>
              </div>
            )}

        </div>
    )
}
