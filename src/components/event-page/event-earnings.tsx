"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { EventSingleContent, EventSingleContentText } from "@/components/ui/content";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/axios";
import { Loader } from "@/components/ui/loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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

interface EventEarningsProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
}

export const EventEarnings = ({
    event, className, ...props
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
            <div className="w-full flex-1 flex flex-col items-center justify-center">
                <Loader className="h-10 w-10" />
            </div>
        )
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
                            <DrawerHeader className="border-b border-gray-200">
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
                                                <div className="border-b border-gray-200" />
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