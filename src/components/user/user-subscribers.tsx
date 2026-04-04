"use client"

import React, {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import {ChevronDown} from "lucide-react";
import {Loader} from "@/components/ui/loader";
import {EventFavouriteCard} from "@/components/profile-display/event-favourite-card";
import {UserSubscriberCard} from "@/components/user/user-subscriber-card";
import { UserListSkeleton } from "@/components/ui/page-skeletons";

interface UserSubscribersProps extends ComponentProps<"div"> {}


export const UserSubscribers = ({
    className, ...props
}: UserSubscribersProps) => {

    const [isSubscribers, setIsSubscribers] = useState<boolean>(true);
    const [totalUsers, setTotalUsers] = useState<number>(0)

    const [users, setUsers] = useState<Array<{[key: string]: any}>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);

    const loadUsers = useCallback(
        async (reset: boolean = false) => {
            if (loadingRef.current || (!reset && !hasMoreRef.current)) return;

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentPage = reset ? 1 : pageRef.current;

                const params: { [key: string]: string | number | boolean } = {
                    pageSize: 10,
                    pageNumber: currentPage,
                    isFollowers: isSubscribers
                };

                const response = await authApi.get(`/userFollow`, { params });

                const newUsers = response.data.data.data as Array<{[key: string]: any}>

                if (reset) {
                    setTotalUsers(response.data.data.totalElements)
                    setUsers(newUsers);
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setUsers((prev) => [...prev, ...newUsers]);
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
        [isSubscribers]
    );

    useEffect(() => {
        setUsers([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadUsers(true);
    }, [loadUsers, isSubscribers]);

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
                )  loadUsers();
            },
            {
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadUsers, error, isSubscribers]);


    return (
        <div
            className={cn(
                "w-full pt-4 flex-1 flex flex-col",
                className
            )}
            {...props}
        >
            <div className="w-full flex justify-between items-center px-4">
                <span className="font-semibold">
                    {isSubscribers ? `Subscribers (${totalUsers})` : `Subscribed (${totalUsers})`}
                </span>
                <FilterDropdown
                    selectedFilter={isSubscribers}
                    onFilterChange={setIsSubscribers}
                />
            </div>
            <div
                className="w-full flex flex-col gap-4 overflow-y-auto no-scrollbar"
                ref={scrollRootRef}
                style={{ maxHeight: "calc(100dvh - 180px)" }}
            >

                <div className="flex flex-col gap-6 px-4">
                    {loading && users.length === 0
                        ? <UserListSkeleton count={5} />
                        : users.map((user) => (
                            <UserSubscriberCard
                                key={user.userId}
                                user={user}
                                onUserChange={(user: {[key: string]: any}) => {
                                    setUsers(
                                        (items) => items.map((item) => {
                                            if(item.userId === user.userId) {
                                                return user
                                            }
                                            return item;
                                        })
                                    );
                                }}
                            />
                        ))}
                </div>

                <div ref={sentinelRef} aria-hidden className="h-1" />

                {loading && users.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader className="h-8 w-8"/>
                    </div>
                )}

            </div>
        </div>
    )
}

const FILTER_OPTIONS = [
    { value: false, label: "Subscribed" },
    { value: true, label: "Subscribers" },
]

interface FilterDropdownProps {
    selectedFilter: boolean;
    onFilterChange: (filter: boolean) => void;
}

const FilterDropdown = ({
                            selectedFilter,
                            onFilterChange,
                        }: FilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = FILTER_OPTIONS.find(
        (option) => option.value === selectedFilter
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex justify-between items-baseline">
            <div className="relative mb-4" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-36 py-2 text-left bg-background rounded-lg border-none outline-none"
                >
                    <span className="text-sm font-medium text-muted-foreground">
                        {selectedOption?.label || "Select filter"}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                        }`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-36 mt-1 bg-background border border-border rounded-sm shadow-lg">
                        <div className="">
                            {FILTER_OPTIONS.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onFilterChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm  border-b border-border hover:bg-accent/40 focus:outline-none focus:bg-accent/40 text-muted-foreground`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
