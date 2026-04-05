"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import * as React from "react";
import {useAuthStore} from "@/store/auth-store";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";
import {Label} from "@/components/ui/label";

export const NamePageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <NameContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface NameContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const NameContent = ({
                                prev, currentPathUrl, className, ...props
                            }: NameContentProps) => {
    const router = useRouter();
    const { user, setUser } = useAuthStore()

    const [firstName, setFirstName] = useState<string>(user?.firstName || "");
    const [lastName, setLastName] = useState<string>(user?.lastName || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModified, setIsModified] = useState<boolean>(false);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newFirstName = e.target.value;
        setFirstName(newFirstName.toLowerCase());
        checkIfModified(newFirstName, lastName);
    };

    const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newLastName = e.target.value;
        setLastName(newLastName.toLowerCase());
        checkIfModified(firstName, newLastName);
    };

    const checkIfModified = (newFirstName: string, newLastName: string) => {
        const hasChanges = newFirstName !== user?.firstName || newLastName !== user?.lastName;
        setIsModified(hasChanges);
    };

    const handleNameUpdate = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            showTopToast("error", "Please enter both first and last name");
            return;
        }

        setIsLoading(true);

        const param = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        }

        try {
            await authApi.patch("/user/update", param);

            setUser({
                ...user,
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });
            setIsModified(false);

            showTopToast("success", "Name updated successfully.");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Name update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    const isContinueDisabled = isLoading || !isModified || !firstName.trim() || !lastName.trim();

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
                        Name
                    </p>
                    <div className="w-5" /> {/* Spacer for centering */}
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col py-8 px-8 justify-between">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={handleFirstNameChange}
                                required
                                className="w-full py-6 text-base capitalize"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={handleLastNameChange}
                                required
                                className="w-full py-6 text-base capitalize"
                            />
                        </div>
                    </div>
                </div>
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg"
                    disabled={isContinueDisabled}
                    onClick={handleNameUpdate}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}
