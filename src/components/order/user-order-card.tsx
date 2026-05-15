"use client";

import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import * as React from "react";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { LoaderSmall } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from "@/lib/routes";

interface UserOrderCardProps extends ComponentProps<"div"> {
    orderContent: { [key: string]: any }
    onCancel?: (orderId: string) => void;
    variant?: "mobile" | "desktop";
}

export const UserOrderCard = ({
    orderContent, onCancel, variant = "mobile", className, ...props
}: UserOrderCardProps) => {
    const router = useRouter();
    const isDesktop = variant === "desktop";

    const eventDetails = orderContent.eventPlaceHolder

    const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false);

    const handleCancel = async () => {
        setIsCancelLoading(true)

        try {
            await authApi.post(`/order/cancel/${orderContent.orderId}`)
            onCancel?.(orderContent.orderId);
            showTopToast("success", "Order canceled successfully.");
        } catch {
            showTopToast("error", "Error cancelling order");
        } finally {
            setIsCancelLoading(false);
        }
    }

    return (
        <div
            className={cn(
                "w-full border-border border-b-1 pb-4 flex flex-col gap-4",
                orderContent.orderStatus !== "PENDING" && "opacity-70",
                className
            )}
            {...props}
        >
            <div
                className="relative w-full max-h-[30vh] overflow-hidden cursor-pointer"
                onClick={() => {
                    if (orderContent.orderStatus === "PENDING") {
                        const base = isDesktop
                            ? DESKTOP_ROUTES.payment(orderContent.orderId)
                            : MOBILE_ROUTES.payment(orderContent.orderId);
                        const prev = isDesktop ? DESKTOP_ROUTES.bookings : `/?screen=profile`;
                        router.push(withPrev(base, prev));
                    } else if (orderContent.orderStatus === "COMPLETED") {
                        const eventId = orderContent.eventPlaceHolder?.id;
                        if (!eventId) return;

                        router.push(
                            isDesktop
                                ? DESKTOP_ROUTES.bookingDetail(eventId)
                                : MOBILE_ROUTES.bookingDetail(eventId)
                        );
                    }
                }}
            >
                <Image
                    src={eventDetails.titleFileUrl}
                    alt={eventDetails.title}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: "30vh" }}
                />
                {<span className="absolute top-4 right-2 rounded-md py-2 px-2 text-xs shadow-md bg-neutral-950/80 text-white">
                    {orderContent.orderStatus}
                </span>}
            </div>
            <div className="w-full flex flex-col px-2 gap-2">
                <span className="font-black text-base capitalize leading-tight line-clamp-2">{eventDetails.title}</span>
                <span className="text-neutral-500 font-semibold">Order ID: {orderContent.orderId}</span>
                <span className="text-neutral-500 font-semibold">Number of tickets: {orderContent.totalAmountOfTickets}</span>
                <span className="text-neutral-500 font-semibold">Completed at: {orderContent.completedAt ? new Date(orderContent.completedAt).toLocaleDateString() : "N/A"}</span>
            </div>
            {orderContent.orderStatus === "PENDING" && (
                <button
                    className="w-full py-2 text-center font-bold text-red-600 text-base flex items-center justify-center"
                    disabled={isCancelLoading}
                    onClick={handleCancel}
                >
                    {isCancelLoading ? <LoaderSmall /> : "Cancel"}
                </button>
            )}
        </div>
    )
}
