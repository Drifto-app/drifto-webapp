"use client"

import { ComponentProps, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";
import { showTopToast } from "@/components/toast/toast-util";
import { LoaderSmall } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { IoLogOutOutline } from "react-icons/io5";

interface LogoutButtonProps extends ComponentProps<"div"> {}

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
                <div
                    className={cn(
                        "w-full flex items-center gap-4 py-[18px] border-b-[1px] border-b-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer",
                        className,
                    )}
                    role="button"
                    tabIndex={0}
                    {...props}
                >
                    <span className="text-red-600 flex-shrink-0 w-7 flex justify-center">
                        <IoLogOutOutline size={26} className="text-red-600" />
                    </span>
                    <p className="text-[17px] font-normal text-red-600">Sign out</p>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 bg-white border-neutral-200 text-neutral-900 shadow-xl">
                <DialogTitle className="text-xl text-center font-semibold mb-2">Sign out</DialogTitle>
                <DialogDescription className="text-md text-center text-neutral-500 mb-6">
                    Are you sure you want to sign out of your account?
                </DialogDescription>
                <DialogFooter className="w-full flex flex-row justify-between gap-4 px-2 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="text-md flex-1 rounded-full py-6 border-neutral-300 hover:bg-neutral-100 bg-transparent text-neutral-900 font-medium transition-colors">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className="text-md flex-1 py-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                        disabled={isLoading}
                        onClick={handleLogout}
                    >
                        {isLoading ? <LoaderSmall /> : "Sign out"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
