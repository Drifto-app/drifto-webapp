"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { FiBell, FiPhone } from "react-icons/fi";
import { IoCardOutline } from "react-icons/io5";
import { TbArrowsLeftRight } from "react-icons/tb";
import { AiOutlineQrcode } from "react-icons/ai";
import { BsBank, BsGrid3X3Gap } from "react-icons/bs";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PayButton } from "@/components/payment/pay-button";
import { useAuthStore } from "@/store/auth-store";
import { OrderSuccessDetails } from "@/components/order/order-sucess";
import { showTopToast } from "@/components/toast/toast-util";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/axios';
import { LoaderSmall } from '@/components/ui/loader';

interface PaymentContentProps extends React.ComponentProps<"div"> {
    order: { [key: string]: any };
    orderContent: { [key: string]: any };
    setOrderContent: (content: { [key: string]: any }) => void;
    prev: string | null;
}

interface PaymentOptions {
    title: string;
    icon: React.ReactNode,
    value: string;
    header: string
}

const paymentsOptions: PaymentOptions[] = [
    { title: "Pay with Card", icon: <IoCardOutline size={24} className="text-blue-800" />, value: "card", header: "Card Payment" },
    { title: "Pay with Bank Transfer", icon: <TbArrowsLeftRight size={24} className="text-blue-800" />, value: "bank_transfer", header: "Bank Transfer Payment" },
    { title: "Pay with USSD", icon: <FiPhone size={24} className="text-blue-800" />, value: "ussd", header: "USSD Payment" },
    { title: "Pay with Bank", icon: <BsBank size={24} className="text-blue-800" />, value: "bank", header: "Bank Account Payment" },
]

export const PaymentContent = ({
    order, orderContent, setOrderContent, prev, className, ...props
}: PaymentContentProps) => {
    const router = useRouter();

    const { user } = useAuthStore()

    const [activeScreen, setActiveScreen] = useState<string>("payment");
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const [referralCode, setReferralCode] = useState<string>(orderContent.referralCode == null ? "" : orderContent.referralCode);
    const [referralLoading, setReferralLoading] = useState<boolean>(false);
    const [referralError, setReferralError] = useState<string | null>(null);


    const optionByValue = useMemo<Record<string, PaymentOptions>>(
        () => Object.fromEntries(paymentsOptions.map(o => [o.value, o])) as Record<string, PaymentOptions>,
        []
    );

    const title: string =
        activeScreen === "payment"
            ? "Payment Method"
            : optionByValue[activeScreen]?.header ?? "Payment Method";

    const handleBackClick = () => {
        if (activeScreen !== "payment") {
            setActiveScreen("payment");
        } else {
            router.push(prev != null ? prev : "/");
        }
    }

    const handleReferralChange = (code: string) => {
        if (!code.trim()) {
            setReferralError(null);
        }

        setReferralCode(code.toUpperCase())
    }

    const handleOrderUpdate = useCallback(async (code: string) => {
        setReferralLoading(true);

        const param = {
            referralCode: code.trim()
        }

        try {
            await authApi.patch(`/order/${orderContent.id}`, param);
            showTopToast("success", "Applied referral code")
            setReferralError(null);
            setOrderContent({ ...orderContent, referralCode: code });
        } catch (err: any) {
            const msg = err?.response?.data?.description || "Error apply referral code";
            showTopToast("error", msg);
            setReferralError(msg);
        } finally {
            setReferralLoading(false);
        }
    }, [orderContent.id])

    useEffect(() => {
        if (!referralCode?.trim() && !orderContent.referralCode) return;
        if (orderContent.referralCode === referralCode) return;
        if (referralLoading) return;

        const t = setTimeout(() => {
            handleOrderUpdate(referralCode);
        }, 700);

        return () => clearTimeout(t);
    }, [referralCode]);

    if (isSuccess) {
        return (
            <OrderSuccessDetails />
        )
    }

    const renderPayButton = (buttonValue: string, paymentType: "card" | "ussd" | "qr" | "bank_transfer" | "apple_pay" | "mobile_money" | "eft" | "bank") => {
        return (
            <PayButton
                email={user?.email}
                amount={order.totalAmount}
                reference={order.paymentReference}
                displayString={buttonValue}
                paymentType={paymentType}
                onSuccess={() => setIsSuccess(true)}
                onError={() => setActiveScreen("payment")}
                onClose={() => {
                    setActiveScreen("payment")
                    showTopToast("error", "The payment was Cancelled!")
                }}
            />
        )
    }

    const render = () => {
        switch (activeScreen) {
            case "card":
                return (
                    <div className="w-full flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                        <div className="w-full mt-15 flex flex-col">
                            <h2 className="font-bold text-lg">Proceed with Card payment</h2>
                            <p className="text-neutral-400 text-sm font-semibold">Reselect another payment method if needed.</p>
                            <div className="w-full flex justify-between text-lg font-semibold mt-20">
                                <p>Total:</p>
                                <p>₦ {orderContent.totalPrice}</p>
                            </div>
                        </div>
                        {renderPayButton("Pay with Card", "card")}
                    </div>
                )
            case "bank_transfer":
                return (
                    <div className="w-full flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                        <div className="w-full mt-15 flex flex-col">
                            <h2 className="font-bold text-lg">Proceed with Bank Transfer payment</h2>
                            <p className="text-neutral-400 text-sm font-semibold">Reselect another payment method if needed.</p>
                            <div className="w-full flex justify-between text-lg font-semibold mt-20">
                                <p>Total:</p>
                                <p>₦ {orderContent.totalPrice}</p>
                            </div>
                        </div>
                        {renderPayButton("Initiate Bank Transfer", "bank_transfer")}
                    </div>
                )
            case "ussd":
                return (
                    <div className="w-full flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                        <div className="w-full mt-15 flex flex-col">
                            <h2 className="font-bold text-lg">Proceed with USSD payment</h2>
                            <p className="text-neutral-400 text-sm font-semibold">Reselect another payment method if needed.</p>
                            <div className="w-full flex justify-between text-lg font-semibold mt-20">
                                <p>Total:</p>
                                <p>₦ {orderContent.totalPrice}</p>
                            </div>
                        </div>
                        {renderPayButton("Initiate USSD Payment", "ussd")}
                    </div>
                )
            case "bank":
                return (
                    <div className="w-full flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                        <div className="w-full mt-15 flex flex-col">
                            <h2 className="font-bold text-lg">Proceed with Bank Account payment</h2>
                            <p className="text-neutral-400 text-sm font-semibold">Reselect another payment method if needed.</p>
                            <div className="w-full flex justify-between text-lg font-semibold mt-20">
                                <p>Total:</p>
                                <p>₦ {orderContent.totalPrice}</p>
                            </div>
                        </div>
                        {renderPayButton("Pay with Bank", "bank")}
                    </div>
                )
            default:
                return (
                    <div className="w-full flex flex-col items-center px-4 gap-4 pt-4">
                        {/*<div className="flex flex-row items-center px-4 py-4 w-full gap-4 rounded-md border-border border-1">*/}
                        {/*    <FiBell size={30} className="text-green-500" />*/}
                        {/*    <p className="text-neutral-500 font-medium text-lg">Want to pay differently? Just reselect ticket first</p>*/}
                        {/*</div>*/}
                        <div className="w-full flex flex-col items-center px-4 py-4 gap-4 border-border border-1 rounded-md">
                            <h3 className="w-full text-left font-bold text-lg">
                                Order Summary
                            </h3>
                            {orderContent.orderItems.map((item: { [key: string]: any }) => (
                                <p key={item.ticketId} className="w-full capitalize text-neutral-500 text-base">
                                    {item.ticketName} - Quantity: {item.amount}
                                </p>
                            ))}
                            <div className="w-full flex justify-between text-lg font-bold border-t-1 border-border pt-4">
                                <p>Total:</p>
                                <p>₦ {orderContent.totalPrice}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-full flex items-center px-4 my-4 border-border border-1 rounded-md",
                            referralError ? "border-red-500" : "focus-within:border-blue-600"
                        )}>
                            <BsGrid3X3Gap size={20} className="text-neutral-400" />
                            <Input
                                placeholder="Referral code (Optional)"
                                className="w-full py-7 text-base border-none"
                                value={referralCode}
                                onChange={(e) => handleReferralChange(e.target.value)}
                                disabled={referralLoading}
                            />
                            {referralLoading ? <LoaderSmall /> : null}
                        </div>
                        {paymentsOptions.map((item: PaymentOptions, index: number) => (
                            <div
                                key={index}
                                className="w-full flex flex-row justify-start gap-6 border-1 border-border p-4 rounded-md"
                                onClick={() => {
                                    setActiveScreen(item.value)
                                }}
                            >
                                {item.icon}
                                <span className="text-sm font-semibold">{item.title}</span>
                            </div>
                        ))}
                    </div>
                )
        }
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col items-center min-h-[100dvh]",
                className
            )}
            {...props}
        >
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
                        {title}
                    </p>
                </div>
            </div>
            {render()}
        </div>
    )
}