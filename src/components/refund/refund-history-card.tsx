"use client"

import {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {FaUndo} from "react-icons/fa";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import * as React from "react";
import {Button} from "@/components/ui/button";

interface RefundCardProps extends ComponentProps<"div"> {
    refundContent: {[key: string]: any}
}

type StatusType = "PENDING" | "SUCCESSFUL" | "FAILED"

const STATUS_COLOR: Record<StatusType, string> = {
    PENDING: "text-muted-foreground",
    SUCCESSFUL: "text-green-700",
    FAILED: "text-red-700",
};

function getStatusColor(status?: string) {
    const key = (status || "PENDING").toUpperCase() as StatusType;
    return STATUS_COLOR[key] ?? "text-muted-foreground";
}

export const RefundCard = ({
                               refundContent, className, ...props
                           }: RefundCardProps) => {

    const amount = refundContent.amount ?? 0;
    const statusClass = getStatusColor(refundContent.refundStatus);

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div
                    className={cn(
                        "w-full py-4 px-3 border border-border rounded-lg flex items-center gap-4 cursor-pointer hover:bg-background transition-colors",
                        className
                    )}
                    {...props}
                >
                    <span className="h-12 w-12 rounded-full p-3 flex items-center justify-center bg-blue-800 flex-shrink-0">
                        <FaUndo size={20} className="text-white" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate font-medium">
                            {refundContent.description || `Refund for ticket ${refundContent.ticketId || refundContent.id}`}
                        </p>
                        <p className={cn("text-sm font-semibold mt-1", statusClass)}>
                            {refundContent.refundStatus}
                        </p>
                    </div>
                </div>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Refund Details</DrawerTitle>
                </DrawerHeader>

                <div className="w-full flex flex-col gap-4 px-6 items-center pb-8">
                    <div className="text-foreground font-medium text-center leading-tight">
                        {refundContent.description || `Refund for ticket ${refundContent.ticketId || refundContent.id}`}
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <p className="font-bold text-2xl text-foreground">
                            {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }).format(amount)}
                        </p>

                        <p className={cn("font-semibold text-sm uppercase", statusClass)}>
                            {refundContent.refundStatus}
                        </p>
                    </div>
                    <div className="text-neutral-500 flex flex-col gap-4 w-full text-sm">
                        <span className="w-full flex justify-between gap-4">
                            <p className="text-muted-foreground font-medium">Refund ID:</p>
                            <p className="text-right break-all">{refundContent.id}</p>
                        </span>

                        <span className="w-full flex justify-between text-muted-foreground text-sm">
                            <p className="w-[40%]">Fees: </p>
                            <p className="text-right">{new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }).format(refundContent.fees || 0.00)}</p>
                        </span>

                        {refundContent.accountNumber && (
                            <span className="w-full flex justify-between gap-4">
                                <p className="text-muted-foreground font-medium">Account Number:</p>
                                <p className="text-right">{refundContent.accountNumber}</p>
                            </span>
                        )}

                        {refundContent.accountName && (
                            <span className="w-full flex justify-between gap-4">
                                <p className="text-muted-foreground font-medium">Account Name:</p>
                                <p className="text-right">{refundContent.accountName}</p>
                            </span>
                        )}

                        {refundContent.bankName && (
                            <span className="w-full flex justify-between gap-4">
                                <p className="text-muted-foreground font-medium">Bank Name:</p>
                                <p className="text-right">{refundContent.bankName}</p>
                            </span>
                        )}

                        {refundContent.createdAt && (
                            <span className="w-full flex justify-between gap-4">
                                <p className="text-muted-foreground font-medium">Created At:</p>
                                <p className="text-right">
                                    {new Date(refundContent.createdAt).toLocaleString("en-US", {
                                        month: "numeric",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true
                                    })}
                                </p>
                            </span>
                        )}

                        <span className="w-full flex justify-between gap-4">
                            <p className="text-muted-foreground font-medium">Order ID:</p>
                            <p className="text-right">{refundContent.orderId || "N/A"}</p>
                        </span>

                        {refundContent.ticketId && (
                            <span className="w-full flex justify-between gap-4">
                                <p className="text-muted-foreground font-medium">Ticket ID:</p>
                                <p className="text-right break-all">{refundContent.ticketId}</p>
                            </span>
                        )}
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button className="bg-blue-800 hover:bg-blue-800 font-semibold py-7 text-lg rounded-md">
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};