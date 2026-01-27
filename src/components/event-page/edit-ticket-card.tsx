"use client";

import * as React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
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
import { Switch } from "@/components/ui/switch";

interface TicketCardProps {
    ticket: { [key: string]: any };
    removeTicket: (ticketId: string) => void;
    onChange: (updated: { [key: string]: any }) => void;
}

export const TicketCard = ({ ticket, removeTicket, onChange }: TicketCardProps) => {
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [ticketName, setTicketName] = useState<string>(ticket.title);
    const [description, setDescription] = useState<string>(ticket.description);
    const [price, setPrice] = useState<string>(String(ticket.basePrice ?? "")); // keep as string in the input
    const [isPaid, setIsPaid] = useState<boolean>((ticket.basePrice ?? 0) > 0);

    const [quantity, setQuantity] = useState<string>(String(ticket.totalQuantity ?? ""));
    const [quantityError, setQuantityError] = useState<boolean>(false);
    const [priceError, setPriceError] = useState<boolean>(false);

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

    // Handle toggle change
    const handleToggleChange = (checked: boolean) => {
        setIsPaid(checked);
        if (!checked) {
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

        if (value < (ticket.purchasedQuantity ?? 0)) {
            setQuantity(normalized);
            setQuantityError(true);
            return;
        }

        setQuantity(normalized);
        setQuantityError(false);
    };

    const handleDelete = async () => {
        setIsDeleteLoading(true);

        try {
            const response = await authApi.delete(`/ticket/${ticket.id}`);
            showTopToast("success", "Ticket deleted successfully");
            removeTicket(ticket.id);
        } catch (err: any) {
            showTopToast("error", err.response?.data?.description || "Deletion failed");
        } finally {
            setIsDeleteLoading(false);
        }
    }

    const handleUpdateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const priceNumber = price === "" ? 0 : parseFloat(price);
        const quantityNumber = quantity === "" ? 0 : parseInt(quantity, 10);

        // Validate price for paid tickets
        if (isPaid) {
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
            isPaid: isPaid && priceNumber > 0,
            price: isPaid ? priceNumber : 0,
            totalQuantity: quantityNumber,
        };

        const updatedTicket = {
            ...ticket,
            title: ticketName.trim(),
            description: description.trim(),
            isPaid,
            price,
            totalQuantity: quantity,
        };

        try {
            await authApi.patch(`/ticket/${ticket.id}`, param)
            setIsEditOpen(false);
            onChange(updatedTicket);
            showTopToast("success", "Ticket updated");
        } catch (error: any) {
            showTopToast("error", "Error updating ticket");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="bg-neutral-200 rounded-md px-4 py-3 flex flex-col gap-2"
        >
            {/* Title & Price */}
            <div className="w-full flex items-center justify-between text-lg">
                <p className="font-semibold capitalize">{ticket.title}</p>
                <p>{!ticket.isPaid ? "Free" : "₦" + Number(ticket.basePrice).toFixed(2)}</p>
            </div>

            {/* Ticket Info */}
            <p className="w-full text-sm text-neutral-500">
                Quantity: {ticket.totalQuantity}
            </p>
            <p className="w-full text-sm text-neutral-500">
                Purchased: {ticket.purchasedQuantity}
            </p>
            <p className="w-full text-sm text-blue-600">
                Available: {ticket.totalQuantity - ticket.purchasedQuantity}
            </p>

            {/* Actions */}
            <div className="w-full flex items-center justify-end mt-4 gap-3">
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-neutral-300 text-black hover:bg-neutral-300"
                            type="button"
                        >
                            Edit
                        </Button>
                    </DialogTrigger>
                    <div className="flex flex-col gap-4">
                        <DialogContent className="w-full flex flex-col gap-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Edit Ticket</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3">
                                <Label htmlFor="title" className="text-neutral-500">Ticket Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Ticket Title"
                                    value={ticketName}
                                    onChange={(e) => setTicketName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description" className="text-neutral-500">Description</Label>
                                <textarea
                                    id="description"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border border-neutral-300 focus:border-blue-600 focus:outline-hidden rounded-md py-2 px-3"
                                />
                            </div>
                            {/* Paid/Free Toggle */}
                            <div className="flex items-center justify-between py-2">
                                <div className="flex flex-col">
                                    <Label className="text-neutral-700 font-medium">
                                        {isPaid ? "Paid Ticket" : "Free Ticket"}
                                    </Label>
                                    <span className="text-xs text-neutral-500">
                                        {isPaid ? "Ticket requires payment" : "Ticket is free"}
                                    </span>
                                </div>
                                <Switch
                                    checked={isPaid}
                                    onCheckedChange={handleToggleChange}
                                />
                            </div>
                            {isPaid && (
                                <div className="grid gap-3">
                                    <Label htmlFor="price" className="text-neutral-500">Price</Label>
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
                                <Label htmlFor="price" className="text-neutral-500">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    placeholder="Quantity"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                />
                                {
                                    quantityError && (
                                        <span className="text-xs text-red-600">Quantity cannot be lower that the purchased quantity of: {ticket.purchasedQuantity}</span>
                                    )
                                }
                            </div>
                            <DialogFooter className="w-full flex flex-row sm:justify-between justify-between px-4 sm:px-20">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-md border-neutral-400 text-neutral-500 hover:bg-neutral-300 py-6 px-8 font-semibold"
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

                <Button
                    className="bg-red-500 hover:bg-red-500"
                    type="button"
                    onClick={handleDelete}
                >
                    {isDeleteLoading ? <LoaderSmall /> : "Delete"}
                </Button>
            </div>
        </div>
    );
};
