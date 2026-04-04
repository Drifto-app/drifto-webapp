import {ComponentProps, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import {Loader} from "@/components/ui/loader";
import * as React from "react";
import {UserOrderCard} from "@/components/order/user-order-card";
import { OrderCardSkeleton } from "@/components/ui/page-skeletons";

interface UserOrdersProps extends ComponentProps<"div"> {
    user: {[key: string]: any};
}

export const UserOrders = ({
    user, className, ...props
}: UserOrdersProps) => {

    const [orders, setOrders] = useState<Array<{[key: string]: any}>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(1);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRootRef = useRef<HTMLDivElement | null>(null);

    const loadOrders = useCallback(
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

                const response  = await authApi.get(`/order/user`, { params });

                const newPosts = response.data.data.data as Array<Record<string, any>>;

                if (reset) {
                    setOrders(newPosts);
                    pageRef.current = 2;
                    setHasMore(true);
                    hasMoreRef.current = true;
                } else {
                    setOrders((prev) => [...prev, ...newPosts]);
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

    useEffect(() => {
        setOrders([]);
        setHasMore(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setError(null);
        loadOrders(true);
    }, [loadOrders]);

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
                )  loadOrders();
            },
            {
                root: scrollRootRef.current ?? null,
                rootMargin: "80px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadOrders, error]);

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4 flex-1 pt-4 overflow-y-auto no-scrollbar pb-10",
                className
            )}
            {...props}
            ref={scrollRootRef}
            style={{ maxHeight: "calc(100dvh - 80px)" }}
        >
            {loading && orders.length === 0 ? (
                <div className="flex flex-col gap-6 pb-15">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <OrderCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-20 pb-15">
                    {orders.map((order) => (
                        <UserOrderCard
                            key={order.orderId}
                            orderContent={order}
                            onCancel={
                                (orderId: string) => setOrders(
                                    (orders) => orders.map((order) => {
                                        if(order.orderId === orderId){
                                            const newOrder = {...order};
                                            newOrder.orderStatus = "CANCELLED"
                                            return newOrder;
                                        }

                                        return order;
                                    })
                                )
                            }
                        />
                    ))}
                </div>
            )}

            <div ref={sentinelRef} aria-hidden className="h-1" />

            {loading && orders.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8"/>
                </div>
            )}

        </div>
    )
}
