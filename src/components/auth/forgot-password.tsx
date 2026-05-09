'use strict'

import * as React from "react";
import { cn, passwordRegex } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { emailRegex } from "@/lib/utils";
import { api } from "@/lib/axios";
import { LoaderSmall } from "@/components/ui/loader";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useCallback, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { showTopToast } from "@/components/toast/toast-util";
import { getErrorMessage } from "@/lib/error-message";

interface ForgotPasswordProps extends React.ComponentProps<"form"> {
    loginPrincipal: string;
    setForgotPassword: (val: boolean) => void;
}

export const ForgotPassword = ({
    loginPrincipal,
    className,
    setForgotPassword,
    ...props
}: ForgotPasswordProps) => {
    const [principal, setPrincipal] = React.useState<string>(loginPrincipal);
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [isVerifyForgotPassword, setIsVerifyForgotPassword] = React.useState(false);
    const [isResetPassword, setIsResetPassword] = React.useState(false);
    const [otpValue, setOtpValue] = React.useState<string>("");
    const [isResendVisible, setIsResendVisible] = useState(false);
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const delay: number = 30000

    const handleShowPassword = () => {
        setIsPasswordShow(!isPasswordShow)
    }

    const passwordsMatch = password === confirmPassword;
    const isPasswordValid = password != null && password != "" && passwordRegex.test(password);
    const showPasswordMismatchMessage = password && confirmPassword && !passwordsMatch;
    const showPasswordRequirementsMessage = password && !isPasswordValid;

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (emailRegex.test(principal)) {
                await api.post("/auth/forgotPassword", {
                    email: principal,
                });
            } else {
                await api.post("/auth/forgotPassword", {
                    username: principal,
                });
            }

            setLoading(false);
            setIsVerifyForgotPassword(true);
        } catch (err: unknown) {
            setLoading(false);
            showTopToast("error", getErrorMessage(err, 'Request failed'));
        }
    };

    const handleResendOtp = async () => {
        setIsResendVisible(false);
        setLoading(true);

        try {
            if (emailRegex.test(principal)) {
                await api.post("/auth/forgotPassword", {
                    email: principal,
                });
            } else {
                await api.post("/auth/forgotPassword", {
                    username: principal,
                });
            }

            setLoading(false);
        } catch (err: unknown) {
            setLoading(false);
            showTopToast("error", getErrorMessage(err, 'Request failed'));

        }
    }

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitOtp()
    }

    const submitOtp = useCallback(async () => {
        setLoading(true);

        try {
            if (emailRegex.test(principal)) {
                await api.post("/auth/verify/forgotPassword", {
                    email: principal,
                    token: otpValue,
                });
            } else {
                await api.post("/auth/verify/forgotPassword", {
                    username: principal,
                    token: otpValue,
                });
            }

            setLoading(false);
            setIsVerifyForgotPassword(false);
            setIsResetPassword(true);
            setOtpValue("");
        } catch (err: unknown) {
            setLoading(false);
            showTopToast("error", getErrorMessage(err, 'Request failed'));
            setOtpValue("");
        }
    }, [otpValue, principal])

    useEffect(() => {
        if (!isVerifyForgotPassword || isResendVisible) return;

        const timer = setTimeout(() => {
            setIsResendVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [isVerifyForgotPassword, isResendVisible, delay]);

    useEffect(() => {
        if (!isVerifyForgotPassword) return;

        setIsResendVisible(false)

        if (otpValue.length === 6) {
            submitOtp();
        }
    }, [otpValue, isVerifyForgotPassword, submitOtp]);

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordsMatch) {
            showTopToast("error", 'Passwords do not match');
            return;
        }

        if (!isPasswordValid) {
            showTopToast("error", 'Password does not meet requirements');
            return;
        }

        setLoading(true);

        try {
            if (emailRegex.test(principal)) {
                await api.post("/auth/resetPassword", {
                    email: principal,
                    newPassword: password,
                    confirmPassword: confirmPassword,
                });
            } else {
                await api.post("/auth/resetPassword", {
                    username: principal,
                    newPassword: password,
                    confirmPassword: confirmPassword,
                });
            }

            setLoading(false);
            setPassword("")
            setConfirmPassword("")
            setForgotPassword(true);
        } catch (err: unknown) {
            setLoading(false);
            showTopToast("error", getErrorMessage(err, 'Reset failed'));
        }
    }

    if (isVerifyForgotPassword) {
        return (
            <form className={cn("flex flex-col gap-8", className)} onSubmit={handleVerifySubmit} {...props}>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold">Reset Password</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your OTP code here.
                    </p>
                </div>
                <div className="grid gap-4 justify-center">
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
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
                    <div className="text-center text-sm">
                        Enter your one-time password.
                    </div>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                >
                    {!isLoading ? "Submit" : <LoaderSmall className="" />}
                </Button>
                <div className="flex flex-row gap-2 justify-center text-sm">
                    <p className="text-neutral-500">OTP code not received?</p>
                    {
                        isResendVisible
                            ? <div className="hover:underline cursor-pointer " onClick={handleResendOtp}>Resend</div>
                            : <div className="text-neutral-400">Resend</div>
                    }
                </div>
            </form>
        )
    }

    if (isResetPassword) {
        return (
            <form className={cn("flex flex-col gap-8", className)} onSubmit={handleResetPasswordSubmit} {...props}>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold">Reset Password</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your new password here.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-start items-center border rounded-md">
                        <Input
                            id="password"
                            placeholder="New Password"
                            type={isPasswordShow ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border-none shadow-none" />
                        <div className="px-2 cursor-pointer" onClick={handleShowPassword}>
                            {isPasswordShow
                                ? <FaEyeSlash />
                                : <FaEye />}
                        </div>
                    </div>
                    <div className="flex flex-row justify-start items-center border rounded-md">
                        <Input
                            id="confirmPassword"
                            placeholder="New Confirm Password"
                            type={isPasswordShow ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full border-none shadow-none" />
                        <div className="px-2 cursor-pointer" onClick={handleShowPassword}>
                            {isPasswordShow
                                ? <FaEyeSlash />
                                : <FaEye />}
                        </div>
                    </div>
                    {showPasswordRequirementsMessage && (
                        <p className="text-red-600 text-sm">
                            Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                        </p>
                    )}
                    {showPasswordMismatchMessage && (
                        <p className="text-red-600 text-sm">
                            Both password values must be the same
                        </p>
                    )}

                    {/*/!* Success message when passwords match and are valid *!/*/}
                    {/*{password && confirmPassword && passwordsMatch && isPasswordValid && (*/}
                    {/*    <p className="text-green-600 text-sm">*/}
                    {/*        Passwords match and meet requirements*/}
                    {/*    </p>*/}
                    {/*)}*/}
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !passwordsMatch || !isPasswordValid || !password || !confirmPassword}
                >
                    {!isLoading ? "Submit" : <LoaderSmall className="" />}
                </Button>
            </form>
        )
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleForgotSubmit} {...props}>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-extrabold">Reset Password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email or username to receive OTP
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="principal">Email or Username</Label>
                <Input
                    id="principal"
                    type="text"
                    placeholder="Email or Username"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    required
                />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
            >
                {!isLoading ? "Submit" : <LoaderSmall className="" />}
            </Button>
        </form>
    )
}
