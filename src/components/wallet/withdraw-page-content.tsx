"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import * as React from "react";
import { ComponentProps, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { TbCurrencyNaira } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { LoaderSmall } from "@/components/ui/loader";
import { UserPaymentInfo } from "@/components/wallet/user-payment-infos";
import { showTopToast } from "@/components/toast/toast-util";
import { authApi } from "@/lib/axios";

export const WalletWithdrawalPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <WalletTransactionsContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface WalletWithdrawalContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

export const WalletTransactionsContent = ({
    prev, currentPathUrl, className, ...props
}: WalletWithdrawalContentProps) => {
    const router = useRouter();

    const [amount, setAmount] = useState<string>("");
    const [paymentInfo, setPaymentInfo] = useState<Record<string, any> | null>(null)

    const [inputError, setInputError] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [hasAccounts, setHasAccounts] = useState(false);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleAmountChange = (raw: string) => {
        setInputError(null);

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

        const numValue = parseFloat(cleaned);

        if (numValue < 100) {
            setInputError("Amount must be ₦100 or more");
        }

        setAmount(cleaned);
    };

    const handleAccountsLoad = useCallback(
        (accounts: Array<Record<string, any>>) => {
            setHasAccounts(accounts.length > 0);
        },
        []
    );

    const handleSubmit = async () => {
        if (!paymentInfo) return

        const param = {
            amount: parseFloat(amount),
            paymentInfoId: paymentInfo.id,
        }

        setLoading(true);

        try {
            await authApi.post("/wallet/withdraw", param)
            setAmount("")
            showTopToast("success", "Withdrawal request successfully")
        } catch (error: any) {
            showTopToast("error", "Error making withdrawal request")
        }
        finally {
            setLoading(false);
        }
    }

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
                        Withdrawal
                    </p>
                    <div className="w-5" /> {/* Spacer for centering */}
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col gap-4 items-center justify-between px-4 pt-6 pb-8">
                <div className="w-full flex flex-col gap-4">
                    <h3 className="font-bold text-lg w-full">Enter amount you want to withdraw</h3>
                    <p className="text-neutral-500 w-full leading-tight">Enter an amount of at least 100 Naira. Make sure you have already stored your account number in the payment settings screen so we can deposit the money there.</p>
                    <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
                            <TbCurrencyNaira size={20} className="text-muted-foreground" />
                            <Input
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className="border-none shadow-none text-base p-0 w-full"
                                required
                            />
                        </div>
                        {inputError && (<p className="text-red-600 text-sm">{inputError}</p>)}
                    </div>
                    <h3 className="font-bold text-base w-full">Your accounts info</h3>
                    <UserPaymentInfo
                        detailsType="BANK_ACCOUNT_DETAILS"
                        maxHeight="500px"
                        onAccountsLoad={handleAccountsLoad}
                        paymentInfo={paymentInfo}
                        setPaymentInfo={setPaymentInfo}
                    />
                    <a className="w-full text-blue-800 text-center font-semibold" href={`/m/settings/payment-method/add?prev=${encodeURIComponent(currentPathUrl)}`}>Add account number</a>
                </div>
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-base mt-8"
                    disabled={isLoading || !!inputError || !amount || !hasAccounts || !paymentInfo}
                    onClick={handleSubmit}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}