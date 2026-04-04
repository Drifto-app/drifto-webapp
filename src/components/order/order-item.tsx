"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { LuMinus } from "react-icons/lu";
import { Linkify } from "@/lib/linkify";

interface OrderItemProps extends React.ComponentProps<"div"> {
    ticket: { [key: string]: any };
    onChangeChange: (ticketId: string, quantity: number) => void;
}

export const OrderItem = ({
    ticket,
    onChangeChange,
    className,
    ...props
}: OrderItemProps) => {
    const [value, setValue] = useState(0);

    const max = Math.max(
        0,
        (ticket?.totalQuantity ?? 0) - (ticket?.purchasedQuantity ?? 0)
    );

    const onClick = (adjustment: number) => {
        const next = Math.max(0, Math.min(max, value + adjustment));
        setValue(next);
        onChangeChange(ticket.id, next);
    };

    useEffect(() => {
        setValue((v) => Math.max(0, Math.min(max, v)));
    }, [max]);

    return (
        <div className={cn("flex flex-col items-center gap-6 px-4 py-4 border-b-neutral-400 border-1 w-full rounded-md", className)} {...props}>
            <div className="w-full flex flex-col gap-2">
                <h1 className="w-full text-left text-md font-bold">
                    {ticket.title}
                </h1>
                <p className="w-full text-left text-gray-700 text-sm">
                    {ticket.price ? `₦ ${ticket.price}` : "Free"}
                </p>
                <Linkify text={ticket.description || "No description available"} className="w-full text-left text-gray-400 text-sm" />
            </div>
            <div className="flex items-center justify-center gap-6">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => onClick(-1)}
                    disabled={value <= 0}
                >
                    <LuMinus size={24} />
                    <span className="sr-only">Decrease</span>
                </Button>

                <div className="flex-1 text-center">
                    <div className="text-xl font-bold tracking-tighter">{value}</div>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => onClick(1)}
                    disabled={value >= max}
                >
                    <FaPlus size={24} />
                    <span className="sr-only">Increase</span>
                </Button>
            </div>
        </div>
    );
};
