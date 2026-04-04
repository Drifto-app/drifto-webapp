"use client"

import * as React from "react";
import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {Loader} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";
import {PaymentInfoCard} from "@/components/wallet/payment-info-card";
import { UserListSkeleton } from "@/components/ui/page-skeletons";

interface UserPaymentInfoProps extends ComponentProps<"div"> {
    onAccountsLoad?: (paymentInfos: Array<Record<string, any>>) => void;
    detailsType?: string;
    maxHeight?: string;
    paymentInfo?: Record<string, any> | null;
    setPaymentInfo?: (paymentInfo: Record<string, any> | null) => void;
    isManage?: boolean;
}

export const UserPaymentInfo = ({
                                    onAccountsLoad,
                                    detailsType = "BANK_ACCOUNT_DETAILS",
                                    maxHeight = "500px",
                                    paymentInfo,
                                    setPaymentInfo,
                                    isManage = false,
                                    className,
                                    ...props
                                }: UserPaymentInfoProps) => {
    const [paymentInfos, setPaymentInfos] = useState<Array<Record<string, any>>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isPaymentInfoLoading, setIsPaymentInfo] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);

    const handleDelete = async (info: Record<string, any>) => {
        await authApi.delete(`/paymentInfo/${info.id}`);
        setPaymentInfos((infos) => infos.filter((i) => i.id !== info.id));
        setPaymentInfos(prev => prev.filter(p => p.id !== info.id));
        showTopToast("success", "Successfully deleted payment method");
    };

    const handleSelect = (info: Record<string, any>) => {
        if (paymentInfo?.id === info.id) {
            if (setPaymentInfo) {
                setPaymentInfo(null);
            }
            return;
        }
        if (setPaymentInfo) {
            setPaymentInfo(info);
        }
    };

    const loadAccounts = useCallback(
        async (reset: boolean = false) => {
            if (loadingRef.current || (!reset && !hasMoreRef.current)) return;

            loadingRef.current = true;
            setIsPaymentInfo(true);
            setError(null);

            try {
                const currentPage = reset ? 1 : pageRef.current;

                const params: { [key: string]: string | number } = {
                    pageSize: 10,
                    pageNumber: currentPage,
                    detailsType,
                };

                const response = await authApi.get("/paymentInfo/user", {params})

                const newAccounts = response.data.data.data as Array<Record<string, any>>;

                if (reset) {
                    setPaymentInfos(newAccounts);
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setPaymentInfos((prev) => [...prev, ...newAccounts]);
                    pageRef.current = currentPage + 1;
                }

                const isLast = response.data.data.isLast;
                setHasMore(!isLast);
                hasMoreRef.current = !isLast;

                if (onAccountsLoad) {
                    onAccountsLoad(reset ? newAccounts : [...paymentInfos, ...newAccounts]);
                }
            } catch (err: any) {
                showTopToast("error", err.message || "Error loading paymentInfos");
                setError(err.message || "Unknown error");
            } finally {
                setIsPaymentInfo(false);
                loadingRef.current = false;
            }
        },
        [detailsType, onAccountsLoad]
    );

    useEffect(() => {
        setPaymentInfos([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadAccounts(true);
    }, [loadAccounts]);

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
                ) loadAccounts();
            },
            {
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadAccounts, error]);

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-2 overflow-y-auto no-scrollbar",
                className
            )}
            ref={scrollRootRef}
            style={{ maxHeight }}
            {...props}
        >
            {isPaymentInfoLoading && paymentInfos.length === 0 ? (
                <UserListSkeleton count={3} />
            ) : (
                paymentInfos.map((info) => (
                    <PaymentInfoCard
                        key={info.id}
                        info={info}
                        isSelected={paymentInfo?.id === info.id}
                        onSelect={() => handleSelect(info)}
                        onDelete={handleDelete}
                        showDelete={isManage}
                    />
                ))
            )}

            {!isPaymentInfoLoading && paymentInfos.length === 0 && (
                <div className="w-full flex items-center justify-between px-4 py-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <span className="text-foreground font-medium">No account added</span>
                    </div>
                </div>
            )}

            <span ref={sentinelRef} aria-hidden className="h-1" />

            {isPaymentInfoLoading && paymentInfos.length > 0 && (
                <span className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </span>
            )}

            {error && !isPaymentInfoLoading && (
                <p className="text-red-600 text-sm text-center py-4">{error}</p>
            )}
        </div>
    );
};
