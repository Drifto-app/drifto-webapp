"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {FaArrowLeft} from "react-icons/fa";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {Input} from "@/components/ui/input";
import {useAuthStore} from "@/store/auth-store";

export const UpdatePhonePageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <UpdatePhoneContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface UpdatePhoneContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

type ActiveScreenType = "request" | "verify" | "change";

const UpdatePhoneContent = ({
                                currentPathUrl, prev, className, ...props
                            }: UpdatePhoneContentProps) => {
    const router = useRouter();
    const {user, setUser} = useAuthStore()

    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("request");
    const [isRequestLoading, setIsRequestLoading] = useState<boolean>(false);
    const [isVerifyLoading, setIsVerifyLoading] = useState<boolean>(false);
    const [isChangeLoading, setIsChangeLoading] = useState<boolean>(false);

    const [otpValue, setOtpValue] = React.useState<string>("");
    const [newPhoneNumber, setNewPhoneNumber] = useState<string>("");

    const handleBackClick = () => {
        if(activeScreen !== "request") {
            setActiveScreen("request");
            return;
        }

        router.push(prev ?? "/m/settings");
    };

    const handleRequestVerification = async () => {
        setIsRequestLoading(true);

        const params = {
            verificationType: "ACCOUNT_PHONENUMBER_CHANGE",
        }

        try {
            await authApi.post("/verification/request", params);
            setActiveScreen("verify");
        } catch (error: any) {
            showTopToast("error", "Error request verification");
        } finally {
            setIsRequestLoading(false);
        }
    }

    const handleVerifyVerification = async () => {
        setIsVerifyLoading(true);

        const params = {
            verificationType: "ACCOUNT_PHONENUMBER_CHANGE",
            token: otpValue.trim(),
        }

        try {
            await authApi.post("/verification/verify", params);
            setOtpValue("")
            setActiveScreen("change");
        } catch (error: any) {
            showTopToast("error", "Error verifying verification");
        } finally {
            setIsVerifyLoading(false);
        }
    }

    const handlePhoneChange = async () => {
        setIsChangeLoading(true);

        const params = {
            phoneNumber: newPhoneNumber
        }

        try {
            await authApi.patch("/user/update/phoneNumber", params);
            setUser({...user, phoneNumber: newPhoneNumber});
            showTopToast("success", "Phone number updated successfully");
            router.push(prev ?? "/m/settings");
        } catch (error: any) {
            showTopToast("error", "Error updating phone number");
        } finally {
            setIsChangeLoading(false);
        }
    }

    const render = () => {
        switch (activeScreen) {
            case "change":
                return (
                    <div className="flex-1 w-full flex flex-col items-center px-4 pt-10 pb-5">
                        <div className="w-full flex flex-col items-center justify-center gap-6">
                            <span className="w-full flex flex-col gap-2 items-center text-center">
                                <p className="text-2xl font-bold">Enter Your Phone Number</p>
                                <p className="text-muted-foreground text-lg">Please enter your phone number to continue.</p>
                            </span>
                            <Input
                                type="tel"
                                name="phone"
                                placeholder="Enter phone number"
                                className="w-full shadow-md py-7 px-4 text-center rounded-2xl placeholder:text-center font-normal"
                                value={newPhoneNumber}
                                onChange={(e) => setNewPhoneNumber(e.target.value)}
                                disabled={isChangeLoading}
                                required
                            />
                            <span className="w-full px-6">
                                <Button
                                    className="w-full bg-blue-800 hover:bg-blue-800 py-7 font-semibold text-lg rounded-md"
                                    onClick={handlePhoneChange}
                                    disabled={isChangeLoading || !newPhoneNumber.trim()}
                                >
                                    {isChangeLoading ? <LoaderSmall /> : "Continue"}
                                </Button>
                            </span>
                        </div>
                    </div>
                )
            case "verify":
                return (
                    <div
                        className="flex-1 w-full flex flex-col items-center justify-between px-4 pt-10 pb-5"
                    >
                        <div className="flex flex-col items-center justify-center gap-6">
                            <span className="w-full flex flex-col gap-2 items-center text-center">
                                <p className="text-2xl font-bold">Enter the verification code</p>
                                <p className="text-muted-foreground text-lg">We sent a code to your email. Enter it below to continue.</p>
                            </span>
                            <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={otpValue}
                                onChange={(value) => setOtpValue(value)}
                                disabled={isVerifyLoading}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="otp-slot" />
                                </InputOTPGroup>
                                <InputOTPGroup>
                                    <InputOTPSlot index={1} className="otp-slot" />
                                </InputOTPGroup>
                                <InputOTPGroup>
                                    <InputOTPSlot index={2} className="otp-slot" />
                                </InputOTPGroup>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="otp-slot" />
                                </InputOTPGroup>
                                <InputOTPGroup>
                                    <InputOTPSlot index={4} className="otp-slot" />
                                </InputOTPGroup>
                                <InputOTPGroup>
                                    <InputOTPSlot index={5} className="otp-slot" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button
                            className="w-full bg-blue-800 hover:bg-blue-800 py-7 font-semibold text-lg rounded-md"
                            onClick={handleVerifyVerification}
                            disabled={isVerifyLoading || otpValue.length !== 6}
                        >
                            {isVerifyLoading ? <LoaderSmall /> : "Continue"}
                        </Button>
                    </div>
                )
            default:
                return (
                    <div
                        className='flex-1 w-full flex flex-col justify-between items-center px-4 pt-10 pb-5'
                    >
                        <span className="w-full flex flex-col gap-2 items-center text-center">
                            <p className="text-2xl font-bold">{"We need to verify it's you"}</p>
                            <p className="text-muted-foreground text-lg">We will send a verification code to your email</p>
                        </span>
                        <Button
                            className="w-full bg-blue-800 hover:bg-blue-800 py-7 font-semibold text-lg rounded-md"
                            onClick={handleRequestVerification}
                            disabled={isRequestLoading}
                        >
                            {isRequestLoading ? <LoaderSmall /> : "Continue"}
                        </Button>
                    </div>
                )
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
                        size={20}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
                        Update Phone
                    </p>
                </div>
            </div>
            {render()}
        </div>
    )
}