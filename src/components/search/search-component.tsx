"use client";

import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/axios";
import { Loader } from "@/components/ui/loader";
import { showTopToast } from "@/components/toast/toast-util";
import { RecentSearchCard } from "@/components/search/search-card";
import { SearchResultsSkeleton, UserListSkeleton } from "@/components/ui/page-skeletons";

export type SearchType = "EVENT" | "USER";

interface SearchComponentProps extends ComponentProps<"div"> {
    searchText?: string;
    commitToken?: number;
    committed?: boolean;
}

export const SearchComponent = ({
                                    searchText = "",
                                    commitToken,
                                    committed = false,
                                    className,
                                    ...props
                                }: SearchComponentProps) => {
    const [searchType, setSearchType] = useState<SearchType>("EVENT");

    // suggestions
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [suggestionData, setSuggestionData] = useState<{ [key: string]: any } | null>(null);

    // results
    const [resultsLoading, setResultsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    // scrolling
    const scrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLLIElement | null>(null);
    const inFlightRef = useRef(false);

    // >>> RESET when parent uncommits (e.g., input cleared)
    useEffect(() => {
        if (!committed) {
            setSuggestionData(null);
            setUsers([]);
            setEvents([]);
            setPage(1);
            setHasMore(true);
        }
    }, [committed]);

    // suggestions while typing (only when NOT committed)
    useEffect(() => {
        if (!searchText.trim() || committed) {
            setSuggestionData(null);
            return;
        }
        const t = setTimeout(async () => {
            try {
                setSuggestionLoading(true);
                const response = await authApi.get("/search/suggestion", {
                    params: { search: searchText.trim() },
                });
                setSuggestionData(response.data.data);
            } catch {
                showTopToast("error", "Something went wrong");
            } finally {
                setSuggestionLoading(false);
            }
        }, 400);
        return () => clearTimeout(t);
    }, [searchText, committed]);

    // core loader with in-flight guard + functional page update
    const loadResults = useCallback(
        async (pageNum: number, q: string, type: SearchType) => {
            if (inFlightRef.current) return;
            inFlightRef.current = true;
            setResultsLoading(true);
            try {
                const response = await authApi.get("/search", {
                    params: { search: q, searchType: type, pageNumber: pageNum, pageSize: 20 },
                });
                const payload = response.data.data;

                if (type === "USER") {
                    const batch = payload?.users?.data ?? [];
                    setUsers(prev => (pageNum === 1 ? batch : [...prev, ...batch]));
                    setHasMore(!payload?.users?.isLast);
                } else {
                    const batch = payload?.events?.data ?? [];
                    setEvents(prev => (pageNum === 1 ? batch : [...prev, ...batch]));
                    setHasMore(!payload?.events?.isLast);
                }

                setPage(prev => prev + 1);
            } catch (error: any) {
                showTopToast("error", "Error");
            } finally {
                setResultsLoading(false);
                inFlightRef.current = false;
            }
        },
        []
    );

    // run committed search on every Enter (commitToken bump)
    useEffect(() => {
        if (!commitToken || !searchText.trim()) return;
        setUsers([]);
        setEvents([]);
        setPage(1);
        setHasMore(true);
        void loadResults(1, searchText.trim(), searchType);
    }, [commitToken]);

    // re-run first page when switching tabs in committed mode
    useEffect(() => {
        if (!committed || !searchText.trim()) return;
        setUsers([]);
        setEvents([]);
        setPage(1);
        setHasMore(true);
        void loadResults(1, searchText.trim(), searchType);
    }, [searchType]);

    // IntersectionObserver to trigger loading more when sentinel enters view
    useEffect(() => {
        const target = sentinelRef.current;
        if (!target) return;

        const rootEl = scrollRef.current ?? null;
        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    committed &&
                    hasMore &&
                    !resultsLoading &&
                    !inFlightRef.current &&
                    searchText.trim()
                ) {
                    void loadResults(page, searchText.trim(), searchType);
                }
            },
            {
                root: rootEl,
                rootMargin: "200px",
                threshold: 0,
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [committed, hasMore, resultsLoading, page, searchText, searchType, loadResults]);

    const Tab = ({ label, type }: { label: string; type: SearchType }) => (
        <button
            className={cn(
                "px-5 py-2 rounded-full border-1 font-semibold",
                searchType === type ? "bg-black text-white" : "bg-transparent text-foreground"
            )}
            onClick={() => setSearchType(type)}
        >
            {label}
        </button>
    );

    return (
        <div className={cn("w-full flex-1", className)} {...props}>
            {/* Tabs */}
            {searchText.trim() && committed && (
                <div className="w-full px-4 pt-3 pb-2 flex gap-3">
                    <Tab label="Events" type="EVENT" />
                    <Tab label="Users" type="USER" />
                </div>
            )}

            {/* SUGGESTIONS (typing) */}
            {!committed && (
                <div className="px-4 py-2">
                    {suggestionLoading ? (
                        <div className="py-4">
                            <UserListSkeleton count={4} />
                        </div>
                    ) : !suggestionData ? (
                        <div className="text-center text-neutral-500 py-10">Start typing to see suggestions</div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Events preview */}
                            <div>
                                <h3 className="font-semibold mb-2">Events</h3>
                                {suggestionData.events.data.length ? (
                                    <ul className="flex flex-col gap-3">
                                        {suggestionData.events.data.map((event: { [key: string]: any }) => (
                                            <RecentSearchCard item={event} type={"event"} key={event.id} />
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-neutral-400">No event suggestions</p>
                                )}
                            </div>

                            {/* Users preview */}
                            <div>
                                <h3 className="font-semibold mb-2">Users</h3>
                                {suggestionData.users.data.length ? (
                                    <ul className="flex flex-col gap-3">
                                        {suggestionData.users.data.map((user: { [key: string]: any }) => (
                                            <RecentSearchCard item={user} type={"user"} key={user.id} />
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-neutral-400">No user suggestions</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* RESULTS (after Enter) */}
            {committed && (
                <div
                    className="flex-1 overflow-y-auto px-4 no-scrollbar pb-15"
                    ref={scrollRef}
                    // Ensure the container can actually scroll (tweak as needed or replace with a Tailwind class)
                    style={{ maxHeight: "calc(100dvh - 200px)" }}
                >
                    {resultsLoading && users.length === 0 && events.length === 0 ? (
                        <SearchResultsSkeleton count={4} />
                    ) : searchType === "USER" ? (
                        users.length ? (
                            <ul className="flex flex-col gap-4">
                                {users.map(user => (
                                    <RecentSearchCard item={user} type={"user"} key={user.id} />
                                ))}
                                {resultsLoading && (
                                    <div className="flex justify-center py-4">
                                        <Loader className="h-8 w-8" />
                                    </div>
                                )}
                                {/* Sentinel to trigger next page */}
                                <li ref={sentinelRef} className="h-1" aria-hidden />
                                {!hasMore && <p className="text-center text-neutral-500 py-4">No more users</p>}
                            </ul>
                        ) : (
                            <p className="text-center text-neutral-500 py-10">No users found</p>
                        )
                    ) : events.length ? (
                        <ul className="flex flex-col gap-4">
                            {events.map(event => (
                                <RecentSearchCard item={event} type={"event"} key={event.id} />
                            ))}
                            {resultsLoading && (
                                <div className="flex justify-center py-4">
                                    <Loader className="h-8 w-8" />
                                </div>
                            )}
                            {/* Sentinel to trigger next page */}
                            <li ref={sentinelRef} className="h-1" aria-hidden />
                            {!hasMore && <p className="text-center text-neutral-500 py-4">No more events</p>}
                        </ul>
                    ) : (
                        <p className="text-center text-neutral-500 py-10">No events found</p>
                    )}
                </div>
            )}
        </div>
    );
};
