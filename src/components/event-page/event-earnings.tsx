"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cn } from "@/lib/utils";
import { EventSingleContent, EventSingleContentText } from "@/components/ui/content";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/axios";
import { Loader } from "@/components/ui/loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BadgeDollarSign, CircleDollarSign, Eye, EyeOff, ReceiptText, Ticket } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "../ui/button";
import DoughnutChart from "@/components/ui/doughnut-chart";
import { StatCardSkeleton } from "@/components/ui/page-skeletons";

interface EventEarningsProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    variant?: "mobile" | "desktop";
}

export const EventEarnings = ({
    event, variant = "mobile", className, ...props
}: EventEarningsProps) => {
    const [eventEarnings, setEventEarnings] = useState<{ [key: string]: any }>({});
    const [isShow, setShow] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleLoadEventEarnings = async () => {
        setLoading(true);

        try {
            const response = await authApi.get(
                `/event/${event.id}/earnings`
            )

            setError(null);
            setEventEarnings(response.data.data);
        } catch (err: any) {
            setError(err.message || "Unable to load event earnings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    useEffect(() => {
        if (!event) return;

        handleLoadEventEarnings()
    }, [event])

    if (error) {
        return (
            <div className={cn(
                "w-full px-4 flex items-center justify-center",
                className
            )} {...props}>
                <p className="text-lg text-neutral-500">
                    Unable to load event earnings
                </p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={cn("w-full px-4 pt-5 pb-15", variant === "desktop" && "px-0 pt-0 pb-0")}>
                <StatCardSkeleton count={5} />
            </div>
        )
    }

    if (variant === "desktop") {
        const formatMoney = (value: unknown) => {
            const amount = Number(value ?? 0);
            return isShow ? `₦ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "****";
        };

        return (
            <div className={cn("w-full", className)} {...props}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="grid gap-6">
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                        Earnings
                                    </p>
                                    <h2 className="mt-1 text-3xl font-black tracking-tight">Revenue overview</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Track gross earnings, platform fees, ticket movement, and payout readiness for this event.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-11 rounded-full"
                                    onClick={() => setShow(!isShow)}
                                >
                                    {isShow ? <EyeOff size={17} /> : <Eye size={17} />}
                                    {isShow ? "Hide values" : "Show values"}
                                </Button>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {[
                                    {
                                        label: "Total earnings",
                                        value: formatMoney(eventEarnings.totalEarnings),
                                        icon: <CircleDollarSign size={20} />,
                                    },
                                    {
                                        label: "Net earnings",
                                        value: formatMoney(eventEarnings.netEarnings),
                                        icon: <BadgeDollarSign size={20} />,
                                    },
                                    {
                                        label: "Tickets sold",
                                        value: eventEarnings.totalTicketsSold ?? 0,
                                        icon: <Ticket size={20} />,
                                    },
                                    {
                                        label: "Ticket capacity",
                                        value: eventEarnings.totalTickets ?? 0,
                                        icon: <ReceiptText size={20} />,
                                    },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-border bg-background p-5">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                            {item.icon}
                                        </span>
                                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                                        <p className="mt-2 text-2xl font-black">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Ticket breakdown</p>
                                    <h3 className="mt-1 text-2xl font-black">Inventory performance</h3>
                                </div>
                                <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold capitalize text-muted-foreground">
                                    {eventEarnings.payoutStatus?.replace(/_/g, " ") ?? "Payout pending"}
                                </span>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
                                <div className="grid grid-cols-[minmax(220px,1fr)_120px_120px_120px] bg-muted/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                                    <span>Ticket</span>
                                    <span className="text-right">Sold</span>
                                    <span className="text-right">Left</span>
                                    <span className="text-right">Price</span>
                                </div>
                                {event.tickets?.length ? (
                                    event.tickets.map((ticket: { [key: string]: any }) => {
                                        const left = Number(ticket.totalQuantity ?? 0) - Number(ticket.purchasedQuantity ?? 0);
                                        const isLowStock = ticket.totalQuantity ? (left / ticket.totalQuantity) * 100 < 5 : false;

                                        return (
                                            <div
                                                key={ticket.id}
                                                className="grid grid-cols-[minmax(220px,1fr)_120px_120px_120px] items-center border-t border-border px-4 py-4 text-sm"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <DoughnutChart
                                                        total={ticket.totalQuantity}
                                                        used={ticket.purchasedQuantity}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-black">{ticket.title ?? ticket.name}</p>
                                                        <p className="text-xs text-muted-foreground">Capacity {ticket.totalQuantity ?? 0}</p>
                                                    </div>
                                                </div>
                                                <span className="text-right font-bold">{ticket.purchasedQuantity ?? 0}</span>
                                                <span className={cn("text-right font-bold", isLowStock && "text-red-600")}>{Math.max(left, 0)}</span>
                                                <span className="text-right font-bold">
                                                    {Number(ticket.price) === 0 ? "Free" : `₦ ${Number(ticket.price ?? 0).toLocaleString()}`}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No ticket inventory is available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="h-fit rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Payout summary</p>
                        <div className="mt-5 space-y-3">
                            {[
                                ["Status", eventEarnings.payoutStatus?.replace(/_/g, " ") ?? "Pending"],
                                ["Platform fee", `${eventEarnings.driftoPercentage ?? 0}% + ₦${eventEarnings.driftoServiceFee ?? 0}`],
                                ["Net after fees", formatMoney(eventEarnings.netEarnings)],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-border bg-background p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-sm font-black capitalize">{value}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full px-4 pt-5 pb-15",
            className
        )} {...props}>
            <div className="w-full flex flex-col items-center gap-6">
                <EventSingleContentText isLine={false} headText={"Total Earnings"} className="shadow-xl gap-6">
                    <div className="flex flex-row justify-between items-center w-full">
                        <p className="text-2xl font-semibold">
                            {
                                isShow
                                    ? eventEarnings.totalEarnings?.toFixed(2)
                                    : "****"
                            }
                        </p>
                        <div className="px-2 cursor-pointer text-neutral-500" onClick={() => setShow(!isShow)}>
                            {isShow
                                ? <FaEyeSlash size={20} />
                                : <FaEye size={20} />}
                        </div>
                    </div>
                </EventSingleContentText>
                <div className="w-full flex flex-row items-center justify-between px-6">
                    <p className="font-medium text-md">Payout Status:</p>
                    <p className="text-neutral-500 font-semibold">
                        {eventEarnings.payoutStatus?.replace(/_/g, ' ')}
                    </p>
                </div>
                <EventSingleContentText isLine={false} headText={"Net Earnings"} className="shadow-xl gap-6 items-start">
                    <p className="text-xl font-semibold">
                        {
                            isShow
                                ? eventEarnings.netEarnings?.toFixed(2)
                                : "****"
                        }
                    </p>
                </EventSingleContentText>
                <EventSingleContentText isLine={false} headText={"Platform Fee"} className="shadow-xl gap-6 items-start">
                    <p className="text-lg font-semibold">
                        {eventEarnings.driftoPercentage}% + ₦{eventEarnings.driftoServiceFee}
                    </p>
                </EventSingleContentText>
                <EventSingleContentText isLine={false} headText={"Total Tickets Sold"} className="shadow-xl gap-6 items-start">
                    <p className="text-lg font-semibold">
                        {eventEarnings.totalTicketsSold}
                    </p>
                </EventSingleContentText>
                <EventSingleContentText isLine={false} headText={"Total Tickets"} className="shadow-xl gap-6 items-start">
                    <p className="text-lg font-semibold">
                        {eventEarnings.totalTickets}
                    </p>
                </EventSingleContentText>


                <Drawer>
                    <DrawerTrigger asChild>
                        <p className="font-bold py-2 underline text-blue-800 cursor-pointer w-full text-center">
                            See more info on Tickets
                        </p>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                            <DrawerHeader className="border-b border-border">
                                <DrawerTitle className="text-center text-lg">Ticket Details</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col pb-8">
                                {event.tickets.map((ticket: { [key: string]: any }, index: number) => {
                                    const left = ticket.totalQuantity - ticket.purchasedQuantity;
                                    const leftPercentage = (left / ticket.totalQuantity) * 100;
                                    const isLowStock = leftPercentage < 5;
                                    const soldPercentage = Math.round((ticket.purchasedQuantity / ticket.totalQuantity) * 100);

                                    return (
                                        <div key={ticket.id}>
                                            <div className="flex items-center justify-between py-5">
                                                {/* Left side: Chart + Info */}
                                                <div className="flex items-center gap-4">
                                                    <DoughnutChart
                                                        total={ticket.totalQuantity}
                                                        used={ticket.purchasedQuantity}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">
                                                            {ticket.title}
                                                        </span>
                                                        <span className="text-gray-500 text-sm">
                                                            {ticket.price === 0 ? "Free" : `₦${ticket.price.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right side: SOLD / LEFT */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs text-gray-400 font-medium">SOLD</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {ticket.purchasedQuantity}
                                                        </span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs text-gray-400 font-medium">LEFT</span>
                                                        <span className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-gray-900'}`}>
                                                            {left}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Divider line between tickets */}
                                            {index < event.tickets.length - 1 && (
                                                <div className="border-b border-border" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <DrawerFooter>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>

                {/* <div className="text-red-600 font-semibold underline w-full text-center py-2 cursor-pointer">
                    Report Event
                </div> */}
            </div>
        </div>
    )
}
