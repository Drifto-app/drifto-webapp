"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import * as React from "react";
import {useAuthStore} from "@/store/auth-store";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {api, authApi} from "@/lib/axios";
import {Label} from "@/components/ui/label";

export const UsernamePageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <UsernameContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface UsernameContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const UsernameContent = ({
    prev, currentPathUrl, className, ...props
}: UsernameContentProps) => {
    const router = useRouter();
    const {user, setUser} = useAuthStore()

    const [username, setUsername] = useState<string>(user?.username || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModified, setIsModified] = useState<boolean>(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState<string>("");

    const usernameDebounce = useRef<NodeJS.Timeout | null>(null);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        setIsModified(newUsername !== user?.username);
    };

    useEffect(() => {
        setIsUsernameValid(null);
        setUsernameError("");
        if (usernameDebounce.current) clearTimeout(usernameDebounce.current);


        if (username === user?.username) {
            setIsUsernameValid(true);
            return;
        }

        if (username.trim().length < 3) {
            setUsernameError("Username must be at least 3 characters");
            return;
        }

        usernameDebounce.current = setTimeout(async () => {
            try {
                setIsCheckingUsername(true);
                const { data } = await api.get(
                    `/auth/username/${username}/validate`,
                );
                setIsCheckingUsername(false);

                if (!data.data) {
                    setIsUsernameValid(true);
                } else {
                    setIsUsernameValid(false);
                    setUsernameError("Username is not available");
                }
            } catch (err: any) {
                setIsCheckingUsername(false);
                setIsUsernameValid(false);
                setUsernameError("Unable to validate username");
            }
        }, 500);

        return () => {
            if (usernameDebounce.current) clearTimeout(usernameDebounce.current);
        };
    }, [username, user?.username]);

    const handleUsernameUpdate = async () => {
        if (!isUsernameValid) {
            showTopToast("error", usernameError || "Please fix your username first");
            return;
        }

        setIsLoading(true);

        const param = {
            username: username,
        }

        try {
            await authApi.patch("/user/update", param);

            setUser({...user, username: username});
            setIsModified(false);

            showTopToast("success", "Username updated successfully.");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Username update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    const isContinueDisabled = isLoading || !isModified || !isUsernameValid || isCheckingUsername;

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
                        Username
                    </p>
                    <div className="w-5" />
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col py-8 px-4 justify-between">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                            Username
                        </Label>
                        <div className="relative flex flex-row gap-2">
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={handleUsernameChange}
                                required
                                className={cn(
                                    "w-full pr-10 py-6 text-base",
                                    isUsernameValid === false && "border-red-500",
                                    isUsernameValid === true && isModified && "border-green-500"
                                )}
                            />
                            {isCheckingUsername && (
                                <LoaderSmall className="absolute right-3 top-1/2 transform -translate-y-1/2" />
                            )}
                        </div>
                        {usernameError && (
                            <p className="text-sm text-red-600">{usernameError}</p>
                        )}
                        {isUsernameValid === true && isModified && (
                            <p className="text-sm text-green-500">Username is valid</p>
                        )}
                    </div>
                    {/*<div className="text-right">*/}
                    {/*    <button*/}
                    {/*        type="button"*/}
                    {/*        className="text-blue-800 text-sm font-medium hover:underline"*/}
                    {/*        onClick={() => /!* Handle more info *!/}*/}
                    {/*    >*/}
                    {/*        More Info*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg"
                    disabled={isContinueDisabled}
                    onClick={handleUsernameUpdate}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}