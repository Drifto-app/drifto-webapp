"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import * as React from "react";
import { showTopToast } from "@/components/toast/toast-util";
import { authApi } from "@/lib/axios";
import { LoaderSmall } from "@/components/ui/loader";
import { GoDownload, GoPulse } from "react-icons/go";
import { MdCreditCard } from "react-icons/md";
import { IoIosHelpCircleOutline } from "react-icons/io";

export const WalletPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <WalletContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}


interface WalletContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

const WalletContent = ({
    prev, currentPathUrl, className, ...props
}: WalletContentProps) => {
    const router = useRouter();

    const [wallet, setWallet] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const actionButtons: {
        text: string, icon: ReactNode, onClick: () => void;
    }[] = [
            { text: "Transactions", icon: <GoPulse size={20} />, onClick: () => { router.push(`/m/wallet/transactions?prev=${encodeURIComponent(currentPathUrl)}`) } },
            { text: "Account", icon: <MdCreditCard size={20} />, onClick: () => router.push(`/m/settings/payment-method?prev=${encodeURIComponent(currentPathUrl)}`) },
            { text: "Withdraw", icon: <GoDownload size={20} />, onClick: () => { router.push(`/m/wallet/withdraw?prev=${encodeURIComponent(currentPathUrl)}`) } },
            { text: "Support", icon: <IoIosHelpCircleOutline size={20} />, onClick: () => { } }
        ]

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleWalletFetch = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.get('/wallet/user')
            setWallet(response.data.data);
        } catch (error: any) {
            showTopToast("error", "Error fetching user wallet");
            setError("Error fetching user wallet");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        handleWalletFetch()
    }, [])

    return (
        <div
            className={cn(
                "w-full min-h-[100dvh] flex flex-col",
                className,
            )}
            {...props}
        >
            <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
                        Wallet
                    </p>
                    <div className="w-5" /> {/* Spacer for centering */}
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col gap-6 pt-6 px-4">
                <div className="w-full flex flex-col px-4 py-6 rounded-lg bg-black text-white gap-6">
                    <p className="text-sm font-semibold">Withdrawable Balance</p>
                    {isLoading ? <LoaderSmall /> : <p className="font-black text-2xl">
                        {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                        }).format(wallet?.balance || 0)}
                    </p>}
                </div>
                <div className="w-full grid grid-cols-2 gap-5">
                    {actionButtons.map((item, index) => (
                        <span key={index} className="flex gap-2 items-center px-2 py-3 rounded-md border-1 border-border text-blue-800" onClick={item.onClick}>
                            {item.icon}
                            <p className="text-base text-foreground">{item.text}</p>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

