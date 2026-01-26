"use client"

import { ComponentProps, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";
import { showTopToast } from "@/components/toast/toast-util";
import { api } from "@/lib/axios";
import { LoaderSmall } from "@/components/ui/loader";
import { useRouter } from "next/navigation";

interface LogoutButtonProps extends ComponentProps<"button"> {

}

export const LogoutButton = ({
    className, ...props
}: LogoutButtonProps) => {
    const { logout } = useAuthStore()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleLogout = async () => {
        setIsLoading(true)

        try {
            await logout()
            // Redirect to login page without 'next' parameter to prevent
            // redirecting back to settings page after login
            router.replace('/login')
        } catch (error: any) {
            showTopToast("error", "Error logging out")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className={cn(
                        "w-full rounded-sm bg-blue-800 hover:bg-blue-800 focus:outline-none text-lg font-bold py-7 shadow-2xl",
                        className,
                    )}
                    {...props}
                >
                    Sign Out
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="text-xl text-center">Delete Event</DialogTitle>
                <DialogDescription className="text-md text-center">
                    Are you sure you want to sign out?
                </DialogDescription>
                <DialogFooter className="w-full flex flex-row sm:justify-between justify-between px-4 sm:px-20">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="text-xl bg-neutral-300 py-6 px-8 font-semibold">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="secondary"
                        className="text-xl py-6 px-8 bg-red-600 text-white font-semibold"
                        disabled={isLoading}
                        onClick={handleLogout}
                    >
                        {isLoading ? <LoaderSmall /> : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}