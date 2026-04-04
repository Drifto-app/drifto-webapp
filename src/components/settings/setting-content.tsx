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
                                    className="pl-12 border-transparent bg-neutral-100 hover:bg-neutral-200/50 focus-visible:bg-neutral-200 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl h-[48px] text-[16px] text-neutral-900 placeholder:text-neutral-500 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        {searchQuery === "" && (   
                            <div className="mx-1 mb-4 w-[calc(100%-8px)] flex flex-row items-center pl-4 py-3 shadow-md border-neutral-200 border-[1px] rounded-xl cursor-pointer bg-white" onClick={() => router.push(`/m/event-create?prev=${encodeURIComponent(currentPathUrl)}`)}>
                                <span className="max-w-[60%] flex flex-col gap-1">
                                    <h4 className="font-bold text-[16px]">Become a Drifto Host</h4>
                                    <p className="text-neutral-500 leading-tight text-[13px]">Share what you love. Create moments that matter and get paid.</p>
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
                        )}
                        <div className="w-full flex flex-col px-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((item, i) => (
                                    <span
                                        key={i}
                                        className="w-full flex items-center gap-4 py-[18px] border-b-neutral-300 border-b-[1px] hover:bg-neutral-50 transition-colors cursor-pointer"
                                        onClick={item.onClickFunction}
                                    >
                                        <span className="text-neutral-900 flex-shrink-0 w-7 flex justify-center">
                                            {item.icon}
                                        </span>
                                        <p className="text-[17px] font-normal text-neutral-900">{item.name}</p>
                                    </span>
                                ))
                            ) : (
                                <p className="text-center text-neutral-500 py-6">No settings found.</p>
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
                "w-full min-h-[100dvh] flex flex-col",
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    "w-full border-b border-b-neutral-300 flex flex-col gap-4 justify-center h-20 flex-shrink-0"
                )}
            >
                <div className="flex flex-row items-center px-8">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className="cursor-pointer hover:text-neutral-700 transition-colors"
                        aria-label="Go back"
                        role="button"
                        tabIndex={0}
                    />
                    <p className="font-semibold text-neutral-950 text-md w-full text-center capitalize truncate ml-4">
                        {titleText()}
                    </p>
                </div>
            </div>
            {render()}
        </div>
    )
}