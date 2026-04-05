"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useState} from "react";
import {cn, passwordRegex} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";

export const PasswordPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <PasswordContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface PasswordContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const PasswordContent = ({
    prev, currentPathUrl, className, ...props
}: PasswordContentProps) => {
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleOldPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOldPassword(e.target.value);
    };

    const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const isFormValid = () => {
        return (
            oldPassword.trim() !== "" &&
            newPassword.trim() !== "" &&
            confirmPassword.trim() !== "" &&
            passwordRegex.test(newPassword) &&
            newPassword === confirmPassword
        );
    };

    const handlePasswordUpdate = async () => {
        if (!isFormValid()) {
            if (!passwordRegex.test(newPassword)) {
                showTopToast("error", "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
                return;
            }
            if (newPassword !== confirmPassword) {
                showTopToast("error", "New password and confirm password do not match");
                return;
            }
            showTopToast("error", "Please fill in all fields");
            return;
        }

        setIsLoading(true);

        const param = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
        };

        try {
            await authApi.patch("/user/update/password", param);

            showTopToast("success", "Password updated successfully.");

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            router.push(prev ?? "/m/settings");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Password update failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const isContinueDisabled = isLoading || !isFormValid();

    const showPasswordRequirementsMessage = newPassword && !passwordRegex.test(newPassword);
    const showPasswordMismatchMessage = confirmPassword && newPassword !== confirmPassword;

    return (
        <div
            className={cn(
                "w-full min-h-[100dvh] flex flex-col bg-background",
                className,
            )}
            {...props}
        >
            <div className="w-full border-b border-border bg-background flex flex-col gap-3 justify-center h-20 flex-shrink-0">
                <div className="flex flex-row items-center px-6">
                    <FaArrowLeft
                        size={20}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-muted-foreground transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col py-8 px-6 justify-between">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-foreground">Change Your Password</h1>
                        <p className="text-neutral-500 text-base">
                            Change your password by entering the current one and creating a new one.
                        </p>
                    </div>

                    {/* Password Fields */}
                    <div className="flex flex-col gap-6">
                        {/* Current Password */}
                        <div className="relative">
                            <Input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Current Password"
                                value={oldPassword}
                                onChange={handleOldPasswordChange}
                                className="w-full py-7 text-base pr-16 rounded-md border-2 border-border focus:border-blue-500 bg-background"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm font-medium hover:text-blue-600"
                            >
                                {showOldPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* New Password */}
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                className="w-full py-7 text-base pr-16 rounded-md border-2 border-border focus:border-blue-500 bg-background"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm font-medium hover:text-blue-600"
                            >
                                {showNewPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {showPasswordRequirementsMessage && (
                            <p className="text-red-600 text-sm -mt-4">
                                Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                            </p>
                        )}

                        {/* Confirm Password */}
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className="w-full py-7 text-base pr-16 rounded-md border-2 border-border focus:border-blue-500 bg-background"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm font-medium hover:text-blue-600"
                            >
                                {showNewPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {showPasswordMismatchMessage && (
                            <p className="text-red-600 text-sm -mt-4">
                                Passwords do not match
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg rounded-md mt-8"
                    disabled={isContinueDisabled}
                    onClick={handlePasswordUpdate}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}