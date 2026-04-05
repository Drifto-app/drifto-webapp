"use client"

import { ComponentProps, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaChevronRight, FaRegIdBadge, FaRegUser } from "react-icons/fa";
import * as React from "react";
import { LogoutButton } from "@/components/settings/logout-button";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { IoCashOutline, IoDocumentTextOutline } from "react-icons/io5";
import { MdNavigateNext, MdPayment } from "react-icons/md";
import { TbTools } from "react-icons/tb";
import { IoMdHappy, IoMdSearch } from "react-icons/io";
import { PiAt } from "react-icons/pi";
import { Palette } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import infoImage from "@/assests/settings-info.jpg"
import { Input } from "@/components/ui/input";

interface SettingContentProps extends ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

interface SettingsOptionType {
    name: string;
    value: string;
    icon: ReactNode;
    onClickFunction: () => void;
}

export const SettingContent = ({
    prev, currentPathUrl, className, ...props
}: SettingContentProps) => {
    const router = useRouter();
    const { user } = useAuthStore();

    const [activeScreen, setActiveScreen] = useState<string>("settings");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const settingsOptions: SettingsOptionType[] = [
        { name: "Profile & Preferences", value: "profile", icon: <FaRegUser size={20} />, onClickFunction: () => setActiveScreen("profile") },
        { name: "Appearance", value: "appearance", icon: <Palette size={20} />, onClickFunction: () => router.push(`/m/settings/appearance?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "Host Settings", value: "host-settings", icon: <FaRegIdBadge size={20} />, onClickFunction: () => setActiveScreen("host-settings") },
        { name: "Payment Methods", value: "payment-method", icon: <MdPayment size={20} />, onClickFunction: () => router.push(`/m/settings/payment-method?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "My Refunds", value: "refunds", icon: <IoCashOutline size={20} />, onClickFunction: () => router.push(`/m/refund-history?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "Privacy Policy", value: "privacy-policy", icon: <IoDocumentTextOutline size={20} />, onClickFunction: () => router.push(`/m/settings/privacy-policy?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "Help & Support", value: "support", icon: <TbTools size={20} />, onClickFunction: () => router.push(`/m/settings/help-support?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "Invite Friends", value: "invite", icon: <IoMdHappy size={22} />, onClickFunction: () => router.push(`/m/settings/invite-friends?prev=${encodeURIComponent(currentPathUrl)}`) },
        { name: "Connect With Us", value: "connect", icon: <PiAt size={20} />, onClickFunction: () => router.push(`/m/settings/connect-page?prev=${encodeURIComponent(currentPathUrl)}`) },
    ]

    const handleBackClick = () => {
        if (activeScreen === "settings") {
            router.push(prev ?? "/?screen=profile");
        }

        setActiveScreen("settings");
    };

    const titleText = () => {
        if (activeScreen === "profile") {
            return "Profile & Preferences";
        }

        return "Settings";
    }

    const render = () => {
        switch (activeScreen) {
            case "host-settings":
                return (
                    <div className="flex-1 w-full px-6">
                        <div className="w-full flex flex-col pt-6">
                            <span
                                className="w-full flex justify-between py-4 text-base items-center cursor-pointer"
                                onClick={() => router.push(`/m/settings/edit-profile?prev=${encodeURIComponent(currentPathUrl)}`)}
                            >
                                <p>Edit Profile</p>
                                <FaChevronRight size={14} className="text-neutral-400" />
                            </span>
                            <span
                                className="w-full flex justify-between py-4 text-lg items-center cursor-pointer"
                                onClick={() => router.push(`/m/wallet?prev=${encodeURIComponent(currentPathUrl)}`)}
                            >
                                <p>Wallet</p>
                                <FaChevronRight size={16} className="text-neutral-400" />
                            </span>
                            <span
                                className="w-full flex justify-between py-4 text-lg items-center cursor-pointer"
                                onClick={() => router.push(
                                    `/m/user-events?id=${user?.id}&prev=${encodeURIComponent(currentPathUrl)}`
                                )}

                            >
                                <p>Experience</p>
                                <FaChevronRight size={16} className="text-neutral-400" />
                            </span>
                        </div>
                    </div>
                )
            case "profile":
                return (
                    <div className="flex-1 w-full px-6">
                        <div className="w-full flex flex-col pt-6">
                            <span
                                className="w-full flex justify-between py-4 text-lg items-center cursor-pointer"
                                onClick={() => router.push(`/m/settings/edit-profile?prev=${encodeURIComponent(currentPathUrl)}`)}
                            >
                                <p>Edit Profile</p>
                                <FaChevronRight size={16} className="text-neutral-400" />
                            </span>
                            <span
                                className="w-full flex justify-between py-4 text-lg items-center cursor-pointer"
                                onClick={() => router.push(`/m/settings/preferences?prev=${encodeURIComponent(currentPathUrl)}`)}
                            >
                                <p>Preferences</p>
                                <FaChevronRight size={16} className="text-neutral-400" />
                            </span>
                            <span
                                className="w-full flex justify-between py-4 text-lg items-center cursor-pointer"
                                onClick={() => router.push(`/m/settings/delete-account?prev=${encodeURIComponent(currentPathUrl)}`)}

                            >
                                <p>Delete Account</p>
                                <FaChevronRight size={16} className="text-neutral-400" />
                            </span>
                        </div>
                    </div>
                )
            default:
                const filteredOptions = settingsOptions.filter((opt) => opt.name.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="flex-1 flex flex-col px-4 pb-10 pt-2">
                        <div className="px-1 mb-4">
                            <div className="relative">
                                <IoMdSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <Input
                                    type="text"
                                    placeholder="Search settings..."
                                    className="h-[48px] w-full rounded-2xl border-transparent bg-muted pl-12 text-[16px] text-foreground placeholder:text-muted-foreground hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* {searchQuery === "" && (   
                            <div className="mx-1 mb-4 flex w-[calc(100%-8px)] cursor-pointer flex-row items-center rounded-xl border border-border bg-card pl-4 py-3 shadow-md" onClick={() => router.push(`/m/event-create?prev=${encodeURIComponent(currentPathUrl)}`)}>
                                <span className="max-w-[60%] flex flex-col gap-1">
                                    <h4 className="font-bold text-[16px]">Become a Drifto Host</h4>
                                    <p className="text-[13px] leading-tight text-muted-foreground">Share what you love. Create moments that matter and get paid.</p>
                                </span>
                                <span className="w-[40%] h-24 flex flex-row items-center relative">
                                    <Image
                                        src={infoImage}
                                        alt={"Become a host"}
                                        fill
                                        className="object-contain"
                                        loading="eager"
                                    />
                                </span>
                            </div>
                        )} */}
                        <div className="w-full flex flex-col px-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((item, i) => (
                                    <span
                                        key={i}
                                        className="flex w-full cursor-pointer items-center gap-4 border-b border-border py-[18px] transition-colors hover:bg-accent/50"
                                        onClick={item.onClickFunction}
                                    >
                                        <span className="flex w-7 flex-shrink-0 justify-center text-foreground">
                                            {item.icon}
                                        </span>
                                        <p className="text-[17px] font-normal text-foreground">{item.name}</p>
                                    </span>
                                ))
                            ) : (
                                <p className="py-6 text-center text-muted-foreground">No settings found.</p>
                            )}
                        </div>
                        <LogoutButton className="px-1" />
                    </div>
                )
        }
    }

    return (
        <div
            className={cn(
                "w-full min-h-[100dvh] flex flex-col bg-background text-foreground",
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    "flex h-20 w-full flex-shrink-0 flex-col justify-center gap-4 border-b border-border bg-background/95 backdrop-blur"
                )}
            >
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className="cursor-pointer transition-colors hover:text-muted-foreground"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="ml-4 w-full truncate text-center text-md font-semibold capitalize text-foreground">
                        {titleText()}
                    </p>
                </div>
            </div>
            {render()}
        </div>
    )
}
