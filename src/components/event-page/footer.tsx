"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo } from 'react';
import { useRouter } from "next/navigation";

interface SingleEventFooterProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    setActiveScreen?: (activeScreen: string) => void;
    isCoHost?: boolean;
    setLoading?: (state: boolean) => void;
    currentPathUrl?: string;
}

export const SingleEventFooter = ({
    currentPathUrl, event, isCoHost, setLoading, setActiveScreen, className, ...props
}: SingleEventFooterProps) => {
    const router = useRouter();

    const priceLabel = useMemo(() => {
        if (!event.tickets || event.tickets.length === 0) return "Unavailable";

        const minPrice = event.tickets.reduce((min: number, ticket: { price: any }) => {
            const currentPrice = parseFloat(ticket.price);

            if (isNaN(currentPrice)) return min;

            return currentPrice < min ? currentPrice : min;
        }, Infinity);

        if (minPrice === Infinity) return "Unavailable";
        if (minPrice === 0) return "Free";

        return "₦ " + minPrice.toFixed(2);
    }, [event.tickets]);



    if (isCoHost) {
        // Edit and Delete buttons are now in the details action bar
        // This footer section is kept minimal for bottom spacing
        return (
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-60 border-t border-neutral-200",
                "safe-area-inset-bottom flex justify-center",
                event.eventTheme !== null ? "bg-gradient-to-t" : "bg-neutral-100",
                className
            )}
                style={
                    event.eventTheme
                        ? {
                            backgroundImage: `linear-gradient(to top, ${event.eventTheme[0]}, ${event.eventTheme[1]})`
                        }
                        : undefined
                }
                {...props}>
                <div className="w-full py-3 px-6">
                    <p className="text-center text-xs text-neutral-500">
                        Swipe for more actions
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "fixed inset-x-0 bottom-0 z-60 border-t border-neutral-200",
            "safe-area-inset-bottom",
            event.eventTheme !== null ? "bg-gradient-to-t" : "bg-neutral-100",
            className
        )}
            style={
                event.eventTheme
                    ? {
                        backgroundImage: `linear-gradient(to top, ${event.eventTheme[0]}, ${event.eventTheme[1]})`
                    }
                    : undefined
            }
            {...props}>
            <div className="w-full flex flex-row items-center justify-between px-6 py-3">
                <div>
                    <p className="text-xs text-neutral-600">Starting:</p>
                    <h3 className="font-bold text-lg">{priceLabel}</h3>
                </div>
                <Button
                    className="rounded-full px-5 py-6"
                    onClick={() => { router.push(`/m/order/${event.id}?prev=${encodeURIComponent(currentPathUrl!)}`) }}
                    disabled={new Date(event.stopTime) < new Date(Date.now())}
                >
                    Get Tickets
                </Button>
            </div>
        </div>
    )
}