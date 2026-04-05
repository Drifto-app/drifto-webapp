import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
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
}

export const UserEvents = ({
    user, isForUser = false, className, ...props
}: UserEventsProps) => {
    const [searchText, setSearchText] = useState<string>("");
    const [events, setEvents] = useState<Array<{[key: string]: any}>>([]);
    const [hasMore, setHasMore] = useState(true);
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
        [user]
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
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadEvents, error, searchText]);

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
