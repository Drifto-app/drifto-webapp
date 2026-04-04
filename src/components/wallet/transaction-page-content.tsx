"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import * as React from "react";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { Loader } from "@/components/ui/loader";
import { TransactionCard } from "./transaction-card";
import { TransactionListSkeleton } from "@/components/ui/page-skeletons";

export const WalletTransactionsPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <WalletTransactionsContent prev={prev} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface WalletTransactionsContentProps extends ComponentProps<"div"> {
    prev: string | null;
}

export const WalletTransactionsContent = ({
    prev, className, ...props
}: WalletTransactionsContentProps) => {
    const router = useRouter();

    const [totalTransactions, setTotalTransactions] = useState<number>(0);
    const [transactions, setTransactions] = useState<Array<{ [key: string]: any }>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);


    const loadTransactions = useCallback(
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
                };

                const response = await authApi.get('/wallet/transactions', params);

                const newTransactions = response.data.data.data as Array<Record<string, any>>;

                if (reset) {
                    setTransactions(newTransactions);
                    setTotalTransactions(response.data.data.totalElements)
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setTransactions((prev) => [...prev, ...newTransactions]);
                    pageRef.current = currentPage + 1;
                }

                const isLast = response.data.data.isLast;
                setHasMore(!isLast);
                hasMoreRef.current = !isLast;
            } catch (err: any) {
                showTopToast("error", err.message || "Error loading trnsactions");
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
                loadingRef.current = false;
            }
        },
        []
    );

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    useEffect(() => {
        setTransactions([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadTransactions(true);
    }, [loadTransactions]);

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
                ) loadTransactions();
            },
            {
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadTransactions, error]);

    return (
        <div
            className={cn(
                "w-full min-h-[100dvh]",
                className
            )}
            {...props}
        >
            <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
                        Wallet Transactions
                    </p>
                    <div className="w-5" /> {/* Spacer for centering */}
                </div>
            </div>
            <div
                className="w-full flex flex-col gap-4 flex-1 pt-6 overflow-y-auto no-scrollbar pb-10 px-4"
                ref={scrollRootRef}
                style={{ maxHeight: "calc(100dvh - 80px)" }}
            >

                <h3 className="font-bold">
                    Transaction History ({totalTransactions})
                </h3>

                {loading && transactions.length === 0 ? (
                    <TransactionListSkeleton />
                ) : (
                    <div className="flex flex-col gap-4">
                        {transactions.map((item) => (
                            <TransactionCard
                                key={item.id}
                                transactionContent={item}
                            />
                        ))}
                    </div>
                )}

                {transactions.length < 0 && !hasMore && <div className="w-full text-center text-neutral-500">No Transaction History Found</div>}

                <div ref={sentinelRef} aria-hidden className="h-1" />

                {loading && transactions.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader className="h-8 w-8" />
                    </div>
                )}

            </div>
        </div>
    )
}
