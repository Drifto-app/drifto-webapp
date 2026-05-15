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
    variant?: "mobile" | "desktop";
}

export type ActiveScreenType = "profile" | "subscribers" | "posts" | "orders" | "events"

const titleText: { value: string, screen: ActiveScreenType }[] = [
    { screen: "subscribers", value: "subscribers" },
    { screen: "posts", value: "Posts" },
    { screen: "orders", value: "Orders" },
    { screen: "events", value: "Experiences" },
]

export const ProfileDisplay = ({ handleScreenChange, variant = "mobile" }: ProfileDisplayProps) => {


    const [currentTab, setCurrentTab] = useState<TabType>("profile")

    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("profile");

    const title = titleText.find((item) => item.screen === activeScreen)?.value
    const isDesktop = variant === "desktop";

    const render = () => {
        switch (currentTab) {
            case "favourites":
                return (
                    <UserEventFavourites handleScreenChange={handleScreenChange} variant={variant} />
                )
            default:
                return (
                    <UserProfile
                        handleScreenChange={handleScreenChange}
                        activeScreen={activeScreen}
                        setActiveScreen={setActiveScreen}
                        variant={variant}
                    />
                )
        }
    }

    if (isDesktop) {
        return (
            <div className="min-h-full w-full bg-background text-foreground">
                <div className="desktop-page-container py-6">
                    {activeScreen === "profile" ? (
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                                    Account
                                </p>
                                <h1 className="mt-1 text-4xl font-black tracking-tight">Profile</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Manage your public presence, posts, subscribers, favourites, and hosting activity.
                                </p>
                            </div>
                            <div className="w-full max-w-sm">
                                <ProfileTabs active={currentTab} onClick={setCurrentTab} variant="desktop" />
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setActiveScreen("profile")}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:bg-accent"
                                aria-label="Back to profile"
                            >
                                <FaArrowLeft size={14} />
                            </button>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                                    Profile
                                </p>
                                <h1 className="text-3xl font-black capitalize tracking-tight">{title}</h1>
                            </div>
                        </div>
                    )}

                    {render()}
                </div>
            </div>
        );
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
