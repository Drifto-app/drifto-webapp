"use client"

import React, { useState } from "react";
import PageHeader from "@/components/page-header/page-header";
import { ProfileTabs } from "@/components/profile-display/tabs";
import { UserProfile } from "@/components/profile-display/user-profile";
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { UserEventFavourites } from "@/components/profile-display/user-event-favourites";

export type TabType = "profile" | "favourites";


interface ProfileDisplayProps {
    handleScreenChange: (value: string) => void;
}

export type ActiveScreenType = "profile" | "subscribers" | "posts" | "orders"

const titleText: { value: string, screen: ActiveScreenType }[] = [
    { screen: "subscribers", value: "subscribers" },
    { screen: "posts", value: "Posts" },
    { screen: "orders", value: "Orders" },
]

export const ProfileDisplay = ({ handleScreenChange }: ProfileDisplayProps) => {


    const [currentTab, setCurrentTab] = useState<TabType>("profile")

    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("profile");

    const title = titleText.find((item) => item.screen === activeScreen)?.value

    const render = () => {
        switch (currentTab) {
            case "favourites":
                return (
                    <UserEventFavourites handleScreenChange={handleScreenChange}/>
                )
            default:
                return (
                    <UserProfile handleScreenChange={handleScreenChange} activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
                )
        }
    }

    return (
        <div className={cn(
            "w-full min-h-[100dvh] bg-accent/40 flex flex-col relative",
            activeScreen !== "profile" && "z-99999"
        )}>
            {activeScreen !== "profile"
                ? <div className={"w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center"}>
                    <div className="flex flex-row items-center px-8">
                        <FaArrowLeft
                            size={16}
                            onClick={() => setActiveScreen("profile")}
                            className="cursor-pointer hover:text-muted-foreground transition-colors"
                        />
                        <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
                            {title}
                        </p>
                    </div>
                </div>
                : <div className="p-2">
                    <PageHeader headerTitle="Account" prev={"/?screen=profile"} />
                    <ProfileTabs active={currentTab} onClick={setCurrentTab} />
                </div>}
            <div className="w-full flex-1">
                {render()}
            </div>
        </div>
    )
}