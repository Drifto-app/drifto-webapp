"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "../screen/screen-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { FaArrowLeft, FaCheckSquare, FaLock } from "react-icons/fa";
import * as React from "react";
import { IoIosCheckboxOutline } from "react-icons/io";
import { IoLockClosed } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { showTopToast } from "@/components/toast/toast-util";
import { authApi } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";
import { LoaderSmall } from "@/components/ui/loader";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export const DeleteAccountPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <div className="w-full">
                    <DeleteAccountContent prev={prev} />
                </div>
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface DeleteAccountContentProps extends ComponentProps<"div"> {
    prev: string | null;
}

const checkText: string[] = [
    "Your account has no active events",
    "Your wallet balance is ₦0",
    "You don’t have any tickets still eligible for refunds",
    "You have no posts left on your profile",
]

const lockText: string[] = [
    "Your order history will still be saved",
    "Your transaction history will still be saved",
    "Any tickets you already used or that are non-refundable will remain in our system",
]

export const DeleteAccountContent = ({
    prev,
    className,
    ...props
}: DeleteAccountContentProps) => {
    const router = useRouter();
    const { clearAuth } = useAuthStore()

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleBackClick = () => {
        router.push(prev ?? "/");
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);

        try {
            await authApi.delete("/user/account")
            clearAuth()
            router.push("/login");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("w-full", className)} {...props}>
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
                        Delete Account
                    </p>
                </div>
            </div>

            <div className="w-full flex flex-col p-6 gap-6">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Thinking about deleting your account?
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-5">
                        You can close your Drifto account if a few conditions are met. These
                        steps help us keep your account secure and your data safe.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-xl font-semibold text-foreground">
                        Before deleting, please make sure:
                    </p>
                    <ul className="flex flex-col gap-2">
                        {checkText.map((item, index) => (
                            <li key={index} className="w-full flex gap-2 items-center">
                                <IoIosCheckboxOutline size={25} className="text-blue-800 flex-shrink-0" />
                                <p>{item}</p>
                            </li>
                        ))}
                    </ul>
                    <ul className="flex flex-col gap-2 pt-5">
                        {lockText.map((item, index) => (
                            <li key={index} className="w-full flex gap-2 items-center">
                                <IoLockClosed size={25} className="text-blue-800 flex-shrink-0" />
                                <p>{item}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-sm text-foreground font-medium mt-2">
                    Once your account is deleted, it cannot be restored.
                </p>
            </div>

            <div className="w-full px-6 pb-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="w-full py-6 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-[0.99] transition font-bold"
                            aria-label="Continue to delete account"
                        >
                            Continue
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle className="text-xl text-center">Delete Event</DialogTitle>
                        <DialogDescription className="text-md text-center">
                            Are you sure you want to delete your account? Action cannot be undone.
                        </DialogDescription>
                        <DialogFooter className="w-full flex flex-row sm:justify-between justify-between px-4 sm:px-20">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" className="text-xl bg-muted py-6 px-8 font-semibold">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-xl py-6 px-8 bg-red-600 text-white font-semibold"
                                disabled={isLoading}
                                onClick={handleDeleteAccount}
                            >
                                {isLoading ? <LoaderSmall /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
