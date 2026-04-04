"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import * as React from "react";
import {ComponentProps, useCallback, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft, FaChevronRight} from "react-icons/fa";
import {UserPaymentInfo} from "@/components/wallet/user-payment-infos";

export const PaymentSettingsPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <PaymentSettingsContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface PaymentSettingsContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

export const PaymentSettingsContent = ({
                                           prev, currentPathUrl, className, ...props
                                       }: PaymentSettingsContentProps) => {
    const router = useRouter();

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };


    return (
        <div
            className={cn(
                "w-full min-h-[100dvh] flex flex-col bg-background",
                className,
            )}
            {...props}
        >
            <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={20}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
                        Payment Settings
                    </p>
                    <div className="w-5" />
                </div>
            </div>

            {/* Content */}
            <div className="w-full flex-1 flex flex-col gap-6 px-4 pt-6 pb-8">
                {/* Wallet Section */}
                <div
                    className="w-full flex items-center justify-between py-4 cursor-pointer hover:bg-background transition-colors rounded-lg px-2"
                    onClick={() => router.push(`/m/wallet?prev=${encodeURIComponent(currentPathUrl)}`)}
                    role="button"
                    tabIndex={0}
                >
                    <h3 className="font-semibold text-lg text-foreground">Wallet</h3>
                    <FaChevronRight size={16} className="text-neutral-400" />
                </div>

                <div className="w-full flex flex-col gap-4">
                    <h3 className="font-semibold text-lg text-foreground">Manage Accounts</h3>

                    <UserPaymentInfo
                        detailsType="BANK_ACCOUNT_DETAILS"
                        maxHeight="500px"
                        isManage={true}
                    />

                    <a
                        className="w-full text-blue-700 text-center font-semibold text-base hover:text-blue-800 transition-colors"
                        href={`/m/settings/payment-method/add?prev=${encodeURIComponent(currentPathUrl)}`}
                    >
                        Add Account Number
                    </a>
                </div>
            </div>
        </div>
    )
}