"use client";

import * as React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authApi } from "@/lib/axios";
import { toast } from "react-toastify";
import { LoaderSmall } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showTopToast } from "@/components/toast/toast-util";

interface NewTicketCardProps {
    addTicket: (updated: { [key: string]: any }) => void;
    eventId: string;
}

export const NewTicketCard = ({ addTicket, eventId }: NewTicketCardProps) => {
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [ticketName, setTicketName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [price, setPrice] = useState<string>(""); // keep as string in the input
    const [isSelectedPaid, setIsSelectedPaid] = useState<boolean>(true); // tabs control
    const [priceError, setPriceError] = useState<boolean>(false);

    const [quantity, setQuantity] = useState<string>("");

    const handlePriceChange = (raw: string) => {
        // Allow only digits and a single decimal point
        let cleaned = raw.replace(/[^0-9.]/g, "");

        // Prevent more than one decimal point
        const parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts[0] + "." + parts.slice(1).join("");
        }

        // Limit to 2 decimal places if decimal exists
        if (parts.length === 2) {
            cleaned = parts[0] + "." + parts[1].slice(0, 2);
        }

        setPrice(cleaned);
        setPriceError(false); // Clear error when price changes
    };

    // Handle tab selection
    const handleTabChange = (paid: boolean) => {
        setIsSelectedPaid(paid);
        if (!paid) {
            // If switching to Free, clear price
            setPrice("");
            setPriceError(false);
        }
    };

    const handleQuantityChange = (raw: string) => {
        // integers only
        const numericStr = raw.replace(/\D/g, "");
        // normalize leading zeros (optional)
        const normalized = numericStr.replace(/^0+(?=\d)/, "");
        const value = normalized === "" ? 0 : parseInt(normalized, 10);

        setQuantity(normalized);
    };

    const handleUpdateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const priceNumber = price === "" ? 0 : parseFloat(price);
        const quantityNumber = quantity === "" ? 0 : parseInt(quantity, 10);

        // Validate price for paid tickets
        if (isSelectedPaid) {
            if (priceNumber <= 0) {
                setPriceError(true);
                showTopToast("error", "Paid tickets must have a price greater than 0");
                setIsLoading(false);
                return;
            }
        }

        const param = {
            title: ticketName.trim(),
            description: description.trim(),
            paid: isSelectedPaid && priceNumber > 0,
            price: isSelectedPaid ? priceNumber : 0,
            totalQuantity: quantityNumber,
        };

        try {
            const response = await authApi.post(`/ticket/event/${eventId}`, param)
            setIsEditOpen(false);

            // const newTicket = {
            //     id: response.data.data.id,
            //     title: ticketName.trim(),
            //     description: description.trim(),
            //     isPaid,
            //     price,
            //     totalQuantity: quantity,
            //     purchasedQuantity: 0
            // };
            addTicket(response.data.data);


            showTopToast("success", "Ticket created successfully");
        } catch (error: any) {
            showTopToast("error", "Error updating ticket");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center mt-4 gap-3">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full py-7 text-lg text-blue-600 border-blue-600 bg-card text-foreground shadow-sm hover:border-blue-600 hover:text-blue-600 dark:bg-card dark:text-blue-400 dark:border-blue-500"
                        type="button"
                    >
                        + Add Ticket
                    </Button>
                </DialogTrigger>
                <div className="flex flex-col gap-4">
                    <DialogContent className="w-full flex flex-col gap-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Add New Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3">
                            <Label htmlFor="title" className="text-muted-foreground">Ticket Title</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Ticket Title"
                                value={ticketName}
                                onChange={(e) => setTicketName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                            <textarea
                                id="description"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="border border-border bg-background text-foreground focus:border-blue-600 focus:outline-hidden rounded-md py-2 px-3"
                            />
                        </div>
                        {/* Paid/Free Tabs */}
                        <div className="flex justify-between w-full items-center rounded-md border border-border">
                            <span
                                className={`w-[50%] text-center font-semibold cursor-pointer py-3 border-b-2 ${isSelectedPaid
                                    ? "text-foreground border-foreground"
                                    : "text-muted-foreground border-transparent"
                                    }`}
                                onClick={() => handleTabChange(true)}
                            >
                                Paid
                            </span>
                            <span
                                className={`w-[50%] text-center font-semibold cursor-pointer py-3 border-b-2 ${!isSelectedPaid
                                    ? "text-foreground border-foreground"
                                    : "text-muted-foreground border-transparent"
                                    }`}
                                onClick={() => handleTabChange(false)}
                            >
                                Free
                            </span>
                        </div>
                        {isSelectedPaid && (
                            <div className="grid gap-3">
                                <Label htmlFor="price" className="text-muted-foreground">Price</Label>
                                <Input
                                    id="price"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    placeholder="Enter ticket price"
                                    value={price}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                />
                                {priceError && (
                                    <span className="text-xs text-red-600">
                                        Paid tickets must have a price greater than 0
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="grid gap-3">
                            <Label htmlFor="price" className="text-muted-foreground">Quantity</Label>
                            <Input
                                id="quantity"
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                placeholder="Quantity"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="w-full flex flex-row sm:justify-between justify-between px-4 sm:px-20">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-md border-neutral-400 text-neutral-500 hover:bg-muted py-6 px-8 font-semibold"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="text-md py-6 px-8 bg-neutral-950 hover:bg-neutral-950 text-white font-semibold"
                                onClick={handleUpdateTicket}
                            >
                                {isLoading ? <LoaderSmall /> : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
};
