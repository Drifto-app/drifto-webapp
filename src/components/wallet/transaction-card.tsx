"use client"

import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
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
import { Button } from "@/components/ui/button";

interface TransactionCardProps extends ComponentProps<"div"> {
    transactionContent: { [key: string]: any }
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

export const TransactionCard = ({
    transactionContent, className, ...props
}: TransactionCardProps) => {

    const amount = transactionContent.amount ?? 0;
    const isCredit = !!transactionContent.credit;
    const statusClass = getStatusColor(transactionContent.status);

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div
                    className={cn(
                        "w-full py-4 px-2 border-b border-border flex items-center justify-between",
                        className
                    )}
                    {...props}
                >
                    <div className="flex gap-4 w-[50%] items-center">
                        <span className={cn(
                            "h-12 w-12 rounded-full p-4 flex items-center justify-center text-white",
                            isCredit ? "bg-green-700" : "bg-red-700"
                        )}>
                            {
                                isCredit ? <FaArrowUp size={20} /> : <FaArrowDown size={20} />
                            }
                        </span>
                        <span className="w-full">
                            <p className="text-foreground truncate">{transactionContent.description}</p>
                            <p className="text-neutral-400">
                                {isCredit
                                    ? new Date(transactionContent.paidAt || transactionContent.createdAt).toLocaleString()
                                    : transactionContent.paidAt ? new Date(transactionContent.paidAt).toLocaleString() : null
                                }
                            </p>
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p
                            className={cn(
                                "font-semibold text-sm",
                                isCredit ? "text-green-700" : "text-red-700"
                            )}
                        >
                            {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }).format(amount)}
                        </p>

                        <p className={cn("font-semibold text-xs", statusClass)}>
                            {transactionContent.status}
                        </p>
                    </div>
                </div>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Transaction Details</DrawerTitle>
                </DrawerHeader>

                <div className="w-full flex flex-col gap-4 px-8 items-center pb-15">
                    <div className="text-foreground font-semibold leading-tight">
                        {transactionContent.description}
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <p
                            className={cn(
                                "font-semibold text-md",
                                isCredit ? "text-green-700" : "text-red-700"
                            )}
                        >
                            {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }).format(amount)}
                        </p>

                        <p className={cn("font-semibold text-xs", statusClass)}>
                            {transactionContent.status}
                        </p>
                    </div>
                    <div className="text-neutral-500 flex flex-col gap-6 w-full">
                        <span className="w-full flex justify-between">
                            <p className="w-[40%]">Transaction ID: </p>
                            <p className="text-right">{transactionContent.id}</p>
                        </span>
                        <span className="w-full flex justify-between">
                            <p className="w-[40%]">Fees: </p>
                            <p className="text-right">{new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }).format(transactionContent.fees || 0.00)}</p>
                        </span>
                        <span className="w-full flex justify-between">
                            <p className="w-[40%]">Created To: </p>
                            <p className="text-right">
                                {isCredit ? "Your wallet balance" : `${transactionContent.accountName}, ${transactionContent.accountName}, ${transactionContent.bankName}`}
                            </p>
                        </span>
                        <span className="w-full flex justify-between">
                            <p className="w-[40%]">Paid At: </p>
                            <p className="text-right">
                                {isCredit
                                    ? new Date(transactionContent.paidAt || transactionContent.createdAt).toLocaleString()
                                    : transactionContent.paidAt ? new Date(transactionContent.paidAt).toLocaleString() : null
                                }
                            </p>
                        </span>
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button className="bg-blue-800 font-semibold py-6 text-base">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};