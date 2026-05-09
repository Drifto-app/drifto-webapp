/* eslint-disable @typescript-eslint/no-explicit-any */

import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {IoSearchSharp} from "react-icons/io5";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import {Loader} from "@/components/ui/loader";
import {UserEventCard} from "@/components/user/user-event-card";
import { EventCardSkeleton } from "@/components/ui/page-skeletons";

interface UserEventsProps extends ComponentProps<"div"> {
    user: {[key:string]: any};
    isForUser?: boolean;
    variant?: "mobile" | "desktop";
}

export const UserEvents = ({
    user, isForUser = false, variant = "mobile", className, ...props
}: UserEventsProps) => {
    const isDesktop = variant === "desktop";
    const [searchText, setSearchText] = useState<string>("");
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
        async (query: string, reset: boolean = false) => {
            if (loadingRef.current || (!reset && !hasMoreRef.current)) return;

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentPage = reset ? 1 : pageRef.current;

                const params: { [key: string]: string | number } = {
                    search: query.trim().toLowerCase(),
                    pageSize: 10,
                    pageNumber: currentPage,
                };

                let response
                if(isForUser) {
                    response = await authApi.get(`/event/user`, { params });
                } else {
                    response = await authApi.get(`/event/user/${user.id}`, { params });
                }

                const newEvents = response.data.data.data as Array<Record<string, any>>;

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
        [user, isForUser]
    );

    // Initial load
    useEffect(() => {
        setEvents([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadEvents("", true);
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
                ) loadEvents(searchText);
            },
            {
                root: isDesktop ? null : scrollRootRef.current ?? null,
                rootMargin: isDesktop ? "160px" : "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadEvents, error, searchText, isDesktop]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setEvents([]);
            setError(null);
            pageRef.current = 1;
            hasMoreRef.current = true;
            setHasMore(true);

            loadEvents(searchText, true);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchText, loadEvents]);

    if (isDesktop) {
        return (
            <div
                className={cn("w-full space-y-5", className)}
                {...props}
            >
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex h-12 items-center rounded-full border border-border bg-background px-4">
                        <IoSearchSharp size={22} className="text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            inputMode="search"
                            enterKeyHint="search"
                            className="h-full border-none bg-transparent shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                            placeholder={`Search ${user.username}'s experiences`}
                            aria-label="Search experiences"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                {loading && events.length === 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <EventCardSkeleton key={index} />
                        ))}
                    </div>
                ) : error && events.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center">
                        <p className="font-black">Unable to load experiences</p>
                        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                        <p className="font-black">No experiences yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Hosted events will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <UserEventCard event={event} key={event.id} variant="desktop" />
                        ))}
                    </div>
                )}

                <div ref={sentinelRef} aria-hidden className="h-8" />

                {loading && events.length > 0 && (
                    <div className="flex justify-center py-6">
                        <Loader className="h-8 w-8" />
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
            style={{ maxHeight: "calc(100dvh - 80px)" }}
        >
            <div className="w-full px-4">
                <div className="flex items-center w-full rounded-full bg-neutral-200 px-2">
                    <IoSearchSharp size={30} className="text-neutral-400" />
                    <Input
                        name="search"
                        type="search"
                        inputMode="search"
                        enterKeyHint="search"
                        className="w-full h-full outline-none border-none shadow-none placeholder:text-neutral-400 placeholder:font-medium text-lg py-4"
                        placeholder={`Search ${user.username}'s experiences`}
                        aria-label="Search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value) }
                    />
                </div>
            </div>
            <div className="w-full flex flex-col gap-10 px-4">
                {loading && events.length === 0
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <EventCardSkeleton key={index} />
                    ))
                    : events.map((event) => (
                        <UserEventCard event={event} key={event.id} />
                    ))}
            </div>

            <div ref={sentinelRef} aria-hidden className="h-1" />

            {loading && events.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

        </div>
    )
}
