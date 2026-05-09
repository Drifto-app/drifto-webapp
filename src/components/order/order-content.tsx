"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { ArrowLeft, ShieldCheck, Ticket } from "lucide-react";
import { OrderItem } from "@/components/order/order-item";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderSmall } from "@/components/ui/loader";
import { authApi } from "@/lib/axios";
import { OrderSuccessDetails } from "@/components/order/order-sucess";
import { showTopToast } from "@/components/toast/toast-util";
import { useAuthStore } from '@/store/auth-store';
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from "@/lib/routes";

interface OrderContentProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    prev: string | null;
    variant?: "mobile" | "desktop";
}

type OrderLine = {
    ticket: { [key: string]: any };
    quantity: number;
};

export const OrderContent = ({
    prev, event, variant = "mobile", className, ...props
}: OrderContentProps) => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isDesktop = variant === "desktop";

    const { isAuthenticated } = useAuthStore();

    const [isOrderSuccessful, setIsOrderSuccessful] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [orderItems, setOrderItems] = useState<OrderLine[]>([]);

    const handleBackClick = () => {
        router.push(prev != null ? prev : "/");
    }

    const handleOrderItemChange = (ticketId: string, quantity: number) => {
        const eventTicket = event.tickets.find((ticket: { [key: string]: any }) => ticket.id === ticketId);
        if (!eventTicket) return

        setOrderItems((prev) => {
            const itemIndex = prev.findIndex((line) => line.ticket.id === ticketId)
            let newItems: OrderLine[]

            if (quantity <= 0) {
                newItems = itemIndex === -1 ? prev : [...prev.slice(0, itemIndex), ...prev.slice(itemIndex + 1)]
            } else if (itemIndex === -1) {
                newItems = [...prev, { ticket: eventTicket, quantity }]
            } else {
                newItems = [...prev]
                newItems[itemIndex] = { ...newItems[itemIndex], ticket: eventTicket, quantity }
            }

            const newTotal = newItems.reduce((sum, item) => sum + item.quantity, 0)
            setTotal(newTotal)

            const newTotalAmount = newItems.reduce((sum, item) => sum + item.quantity * item.ticket.price, 0)
            setTotalAmount(newTotalAmount)

            return newItems
        })
    }

    const handleOrderSubmit = async () => {
        if (total <= 0) return

        setLoading(true);

        if (!isAuthenticated) {
            const queryString = searchParams?.toString();
            const currentPath = `${pathname ?? (isDesktop ? DESKTOP_ROUTES.order(event.id) : MOBILE_ROUTES.order(event.id))}${queryString ? `?${queryString}` : ""}`;
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
            setLoading(false);
            return;
        }

        const param: { [key: string]: any } = {
            receiveUpdateOnEvent: true,
            eventId: event.id,
            ticketRequests: []
        }
        for (const item of orderItems) {
            param.ticketRequests = [...param.ticketRequests, {
                ticketId: item.ticket.id,
                quantity: item.quantity,
            }];

        }

        try {
            const response = await authApi.post("/order", param);
            setLoading(false);

            if (!response.data.data.completed) {
                const paymentBase = isDesktop
                    ? DESKTOP_ROUTES.payment(response.data.data.orderId)
                    : MOBILE_ROUTES.payment(response.data.data.orderId);
                const queryString = searchParams?.toString();
                const currentPath = `${pathname ?? ""}${queryString ? `?${queryString}` : ""}`;
                router.push(withPrev(paymentBase, currentPath));
            } else {
                setIsOrderSuccessful(true);
            }
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setLoading(false);
        }
    }

    if (isOrderSuccessful) {
        return (
            <OrderSuccessDetails variant={variant} />
        )
    }

    if (isDesktop) {
        const titleImage = event?.titleImage || event?.titleFileUrl || "/createeventpic.jpg";

        return (
            <div className={cn("w-full min-h-screen bg-background", className)} {...props}>
                <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                    <div className="desktop-page-header-inner flex h-20 items-center gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={handleBackClick}
                            aria-label="Back"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <p className="truncate text-base font-semibold capitalize">
                            {event.title}
                        </p>
                    </div>
                </header>

                <div className="desktop-page-container desktop-two-column-page grid gap-10 py-10">
                    <section className="min-w-0">
                        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                            <MdOutlineDateRange size={28} className="text-green-500" />
                            <p className="text-sm text-muted-foreground">
                                Need to cancel? Do so before the event starts for a refund (10% fee applies).
                            </p>
                        </div>

                        <h1 className="mt-8 text-2xl font-black tracking-tight">Select tickets</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose how many of each ticket type you&apos;d like to purchase.
                        </p>

                        <div className="mt-5 flex flex-col gap-4">
                            {event.tickets.map((item: { [key: string]: any }) => (
                                <OrderItem key={item.id} ticket={item} onChangeChange={handleOrderItemChange} />
                            ))}
                        </div>
                    </section>

                    <aside className="min-w-0">
                        <div className="sticky top-28 flex flex-col gap-4">
                            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                                <div className="relative aspect-[16/10] w-full bg-muted">
                                    <Image
                                        src={titleImage}
                                        alt={event.title}
                                        fill
                                        sizes="380px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-4 p-5">
                                    <p className="text-sm font-semibold capitalize text-muted-foreground">
                                        Order summary
                                    </p>
                                    {orderItems.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No tickets selected yet.
                                        </p>
                                    ) : (
                                        <ul className="flex flex-col gap-2 text-sm">
                                            {orderItems.map((line) => (
                                                <li key={line.ticket.id} className="flex items-start justify-between gap-3">
                                                    <span className="capitalize">
                                                        {line.ticket.title}
                                                        <span className="ml-2 text-muted-foreground">x{line.quantity}</span>
                                                    </span>
                                                    <span className="font-semibold">
                                                        {line.ticket.price ? `₦ ${(line.quantity * line.ticket.price).toFixed(2)}` : "Free"}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="border-t border-border pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Tickets</span>
                                            <span className="text-sm font-semibold">{total}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Total</span>
                                            <span className="text-xl font-black">
                                                {totalAmount ? `₦ ${totalAmount.toFixed(2)}` : total > 0 ? "Free" : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        className="h-12 w-full rounded-full"
                                        onClick={handleOrderSubmit}
                                        disabled={total <= 0 || loading}
                                    >
                                        {!loading ? (
                                            <>
                                                <Ticket size={17} />
                                                {totalAmount ? `Continue – ₦ ${totalAmount.toFixed(2)}` : total > 0 ? "Get free tickets" : "Select tickets"}
                                            </>
                                        ) : (
                                            <LoaderSmall />
                                        )}
                                    </Button>

                                    {!isAuthenticated && (
                                        <p className="text-center text-xs font-semibold text-muted-foreground">
                                            Sign in is required before checkout.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                                <ShieldCheck size={20} className="mt-0.5 text-blue-700" />
                                <div className="text-sm text-muted-foreground">
                                    Drifto secures your payment with end-to-end encryption.
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full min-h-[100dvh]",
            className
        )} {...props}>
            <div className={cn(
                "w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center",
                className
            )} {...props}>
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                    />
                    <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
                        {event.title}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-center px-4">
                <div className="flex flex-row items-center px-4 py-4 w-full gap-4 rounded-md border-border border-1 mt-4">
                    <MdOutlineDateRange size={36} className="text-green-500" />
                    <p className="text-neutral-500 text-sm font-medium">Need to cancel? Do so before the event starts for a refund (10% fee applies).</p>
                </div>
                <div className="flex flex-col items-center gap-4 w-full pt-4 mb-25">
                    {event.tickets.map((item: { [key: string]: any }) => (
                        <OrderItem key={item.id} ticket={item} onChangeChange={handleOrderItemChange} />
                    ))}
                </div>
            </div>
            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border w-full bg-background">
                <div className="w-full flex flex-row justify-between items-center px-6 py-3">
                    <div>
                        <p className="text-neutral-500 text-base">Total</p>
                        <p className="font-bold text-lg">{total}</p>
                    </div>
                    <Button
                        className="text-sm px-6 py-7 rounded-lg"
                        onClick={handleOrderSubmit}
                        disabled={total <= 0 || loading}
                    >
                        {!loading ? (
                            totalAmount ? "Get ₦ " + totalAmount : "Get Free"
                        ) : <LoaderSmall />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
