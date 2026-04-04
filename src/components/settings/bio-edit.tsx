"use client"

import {ProtectedRoute} from "@/components/auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChangeEvent, ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import {FaArrowLeft} from "react-icons/fa";
import {AiOutlineGlobal} from "react-icons/ai";
import {FiInstagram, FiTwitter, FiFacebook} from "react-icons/fi";
import {MdOutlineDateRange} from "react-icons/md";
import * as React from "react";
import {useAuthStore} from "@/store/auth-store";
import {Button} from "@/components/ui/button";
import {LoaderSmall} from "@/components/ui/loader";
import {showTopToast} from "@/components/toast/toast-util";
import {authApi} from "@/lib/axios";
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";

export const BioPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <BioContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    )
}

interface BioContentProps extends ComponentProps<"div">{
    prev: string | null;
    currentPathUrl: string;
}

export const BioContent = ({
                               prev, currentPathUrl, className, ...props
                           }: BioContentProps) => {
    const router = useRouter();
    const {user, setUser} = useAuthStore()

    const [bio, setBio] = useState<string>(user?.bio || "");
    const [dob, setDob] = useState<Date>(user?.dob ? new Date(user.dob) : new Date());
    const [website, setWebsite] = useState<string>(user?.website || "");
    const [instagramHandle, setInstagramHandle] = useState<string>(user?.instagramHandle || "");
    const [twitterHandle, setTwitterHandle] = useState<string>(user?.twitterHandle || "");
    const [facebookHandle, setFacebookHandle] = useState<string>(user?.facebookHandle || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModified, setIsModified] = useState<boolean>(false);

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const checkIfModified = () => {
        const originalDob = user?.dob ? new Date(user.dob) : new Date();
        const hasChanges =
            bio !== (user?.bio || "") ||
            dob.getTime() !== originalDob.getTime() ||
            website !== (user?.website || "") ||
            instagramHandle !== (user?.instagramHandle || "") ||
            twitterHandle !== (user?.twitterHandle || "") ||
            facebookHandle !== (user?.facebookHandle || "");
        setIsModified(hasChanges);
    };

    const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setBio(e.target.value);
        setTimeout(checkIfModified, 0);
    };

    const handleWebsiteChange = (e: ChangeEvent<HTMLInputElement>) => {
        setWebsite(e.target.value);
        setTimeout(checkIfModified, 0);
    };

    const handleInstagramChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInstagramHandle(e.target.value);
        setTimeout(checkIfModified, 0);
    };

    const handleTwitterChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTwitterHandle(e.target.value);
        setTimeout(checkIfModified, 0);
    };

    const handleFacebookChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFacebookHandle(e.target.value);
        setTimeout(checkIfModified, 0);
    };

    const DatePickerDialog = () => {
        const [isOpen, setIsOpen] = useState<boolean>(false);
        const [selectedDate, setSelectedDate] = useState<Date>(dob);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
        };

        const displayDate = (date: Date) => {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
        };

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentDay = new Date().getDate();

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-background">
                        <MdOutlineDateRange size={20} className="text-muted-foreground" />
                        <span className="text-base">{displayDate(dob)}</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="px-0">
                    <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                        <DialogTitle className="text-xl">Select Date of Birth</DialogTitle>
                        <p className="text-neutral-400 text-sm font-semibold">Choose your date of birth</p>
                    </DialogHeader>
                    <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-4">
                        <div className="w-full text-center text-sm">
                            {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                        <div className="border-2 border-border rounded-md p-2">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    if (date) setSelectedDate(date);
                                }}
                                startMonth={new Date(1950, 0)}
                                endMonth={new Date(currentYear, currentMonth)}
                                hidden={{ after: new Date(currentYear, currentMonth, currentDay) }}
                                defaultMonth={selectedDate}
                            />
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-between px-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="default"
                            className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                            onClick={() => {
                                setDob(selectedDate);
                                setIsOpen(false);
                                setTimeout(checkIfModified, 0);
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const handleBioUpdate = async () => {
        setIsLoading(true);

        const param = {
            bio: bio.trim(),
            dob: dob.toISOString().split('T')[0],
            website: website.trim(),
            instagramHandle: instagramHandle.trim(),
            twitterHandle: twitterHandle.trim(),
            facebookHandle: facebookHandle.trim(),
        }

        try {
            await authApi.patch("/user/update", param);

            setUser({
                ...user,
                bio: bio.trim(),
                dob: dob.toISOString().split('T')[0],
                website: website.trim(),
                instagramHandle: instagramHandle.trim(),
                twitterHandle: twitterHandle.trim(),
                facebookHandle: facebookHandle.trim(),
            });
            setIsModified(false);

            showTopToast("success", "Bio & socials updated successfully.");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description || "Update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    const isContinueDisabled = isLoading || !isModified;

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
                        Bio & Socials
                    </p>
                    <div className="w-5" /> {/* Spacer for centering */}
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col py-8 px-8 justify-between">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground">About You</h2>
                        <textarea
                            placeholder="Describe something about you"
                            value={bio}
                            onChange={handleBioChange}
                            rows={7}
                            className="py-2 px-3 bg-background rounded-md border-1 border-border focus:border-blue-600 focus:border-1 focus:outline-hidden"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground">Date of Birth</h2>
                        <DatePickerDialog />
                    </div>

                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground">Social Links</h2>
                        <div className="flex flex-col gap-3">
                            {/* Website */}
                            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
                                <AiOutlineGlobal size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Website"
                                    value={website}
                                    onChange={handleWebsiteChange}
                                    className="border-none shadow-none text-base p-0 w-full"
                                />
                            </div>

                            {/* Instagram */}
                            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
                                <FiInstagram size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Instagram"
                                    value={instagramHandle}
                                    onChange={handleInstagramChange}
                                    className="border-none shadow-none text-base p-0 w-full"
                                />
                            </div>

                            {/* Twitter */}
                            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
                                <FiTwitter size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Twitter"
                                    value={twitterHandle}
                                    onChange={handleTwitterChange}
                                    className="border-none shadow-none text-base p-0 w-full"
                                />
                            </div>

                            {/* Facebook */}
                            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
                                <FiFacebook size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Facebook"
                                    value={facebookHandle}
                                    onChange={handleFacebookChange}
                                    className="border-none shadow-none text-base p-0 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-lg mt-8"
                    disabled={isContinueDisabled}
                    onClick={handleBioUpdate}
                >
                    {isLoading ? <LoaderSmall /> : "Continue"}
                </Button>
            </div>
        </div>
    )
}