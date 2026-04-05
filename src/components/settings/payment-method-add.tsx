"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft, FaSearch} from "react-icons/fa";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";

export const AddPaymentInfoPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <AddPaymentInfoContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface AddPaymentInfoContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const AddPaymentInfoContent = ({
    prev, currentPathUrl, className, ...props
}: AddPaymentInfoContentProps) => {
    const router = useRouter();

    const [accountNumber, setAccountNumber] = useState<string>("");
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [selectedBankName, setSelectedBankName] = useState<string>("");
    const [banks, setBanks] = useState<Array<Record<string, any>>>([]);
    const [filteredBanks, setFilteredBanks] = useState<Array<Record<string, any>>>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [resolvedAccount, setResolvedAccount] = useState<Record<string, any> | null>(null);
    const [isLoadingBanks, setIsLoadingBanks] = useState<boolean>(false);
    const [isResolvingAccount, setIsResolvingAccount] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    // Load banks on component mount
    useEffect(() => {
        const loadBanks = async () => {
            setIsLoadingBanks(true);
            try {
                const response = await authApi.get("/paymentInfo/banks");
                const banksData = response.data.data;
                setBanks(banksData);
                setFilteredBanks(banksData);
            } catch (error: any) {
                showTopToast("error", "Failed to load banks");
            } finally {
                setIsLoadingBanks(false);
            }
        };

        loadBanks();
    }, []);

    // Filter banks based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredBanks(banks);
        } else {
            const filtered = banks.filter(bank =>
                bank.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBanks(filtered);
        }
    }, [searchTerm, banks]);

    // Debounced account resolution
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Reset resolved account when inputs change
        setResolvedAccount(null);

        // Only resolve if we have both account number and bank code
        if (accountNumber.length >= 10 && selectedBank) {
            debounceRef.current = setTimeout(async () => {
                await resolveAccount();
            }, 800);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [accountNumber, selectedBank]);

    const resolveAccount = async () => {
        setIsResolvingAccount(true);

        try {
            const params = {
                bankAccountNumber: accountNumber,
                bankCode: selectedBank,
            };

            const response = await authApi.get("/paymentInfo/bank/resolve-account", {params});

            if (response.data.data) {
                setResolvedAccount({
                    accountNumber: accountNumber,
                    accountName: response.data.data,
                    bankCode: selectedBank,
                });
            }
        } catch (error: any) {
            showTopToast("error", "Failed to resolve account");
            setResolvedAccount(null);
        } finally {
            setIsResolvingAccount(false);
        }
    };

    const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Only numbers
        setAccountNumber(value);
    };

    const handleBankSelect = (value: string) => {
        setSelectedBank(value);
        const bank = banks.find(b => b.code === value);
        setSelectedBankName(bank?.name || "");
    };

    const handleSubmit = async () => {
        if (!resolvedAccount) {
            showTopToast("error", "Please wait for account verification");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            accountNumber: resolvedAccount.accountNumber,
            bankCode: resolvedAccount.bankCode,
            bankName: selectedBankName,
        };

        try {
            await authApi.post("/paymentInfo/bank", payload);
            showTopToast("success", "Payment info added successfully");
            router.push(prev ?? "/m/settings");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Failed to add payment info");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isContinueDisabled = !resolvedAccount || isResolvingAccount || isSubmitting;

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
                        Add Payment Info
                    </p>
                    <div className="w-5" />
                </div>
            </div>

            <div className="flex-1 flex flex-col px-6 py-8 justify-between">
                <div className="flex flex-col gap-8">
                    {/* Account Number Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-xl font-bold text-foreground">
                            Enter your account number
                        </h2>
                        <p className="text-neutral-500 text-sm">
                            Enter at least 10 digits account number
                        </p>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Account Number"
                                value={accountNumber}
                                onChange={handleAccountNumberChange}
                                maxLength={10}
                                className="w-full py-6 text-base rounded-md border-2 border-border"
                            />
                            {isResolvingAccount && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <LoaderSmall />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Banks Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">
                                Available Banks
                            </h2>
                        </div>
                        <p className="text-neutral-500 text-sm">
                            Choose your bank
                        </p>

                        {/* Search Input */}
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                            <Input
                                type="text"
                                placeholder="Search banks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-6 pl-12 text-base rounded-md border-2 border-border"
                            />
                        </div>

                        {/* Banks List */}
                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto no-scrollbar">
                            {isLoadingBanks ? (
                                <div className="flex justify-center py-4">
                                    <LoaderSmall />
                                </div>
                            ) : filteredBanks.length > 0 ? (
                                filteredBanks.map((bank) => (
                                    <button
                                        key={bank.id}
                                        onClick={() => handleBankSelect(bank.code)}
                                        className={cn(
                                            "w-full py-4 px-4 text-left rounded-md border-2 transition-colors",
                                            selectedBank === bank.code
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-border hover:border-border"
                                        )}
                                    >
                                        <p className="text-foreground font-medium">
                                            {bank.name}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-neutral-500 text-center py-4">No banks found</p>
                            )}
                        </div>
                    </div>

                    {/* Resolved Account Display */}
                    {resolvedAccount && (
                        <div className="flex flex-col gap-2 p-4 bg-green-50 border-2 border-green-500 rounded-md">
                            <p className="text-sm text-muted-foreground font-medium">Account Name</p>
                            <p className="text-lg font-bold text-foreground">
                                {resolvedAccount.accountName}
                            </p>
                        </div>
                    )}
                </div>

                {/* Continue Button */}
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg rounded-md mt-8"
                    disabled={isContinueDisabled}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}