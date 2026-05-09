"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {TabType} from "@/components/profile-display/profile-display";


interface TabsProps {
    active: TabType | null;
    onClick?: (value: TabType) => void;
    variant?: "mobile" | "desktop";
}

interface TabOption {
    label: string;
    value: TabType;
}

const TAB_OPTIONS: TabOption[] = [
    { label: "Profile", value: "profile" },
    { label: "Favourites", value: "favourites" },
];

export function ProfileTabs({ active, onClick, variant = "mobile" }: TabsProps) {
    const handleTabClick = (value: TabType) => {
        onClick?.(value);
    };

    return (
        <ul
            className={cn(
                "flex flex-row w-full overflow-x-auto no-scrollbar",
                variant === "desktop"
                    ? "rounded-full border border-border bg-card p-1 shadow-sm"
                    : "mt-4 border-b border-border"
            )}
        >
            {TAB_OPTIONS.map((tab) => (
                <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    isActive={active === tab.value}
                    onClick={handleTabClick}
                    variant={variant}
                />
            ))}
        </ul>
    );
}

interface TabProps {
    label: string;
    value: TabType;
    isActive: boolean;
    onClick: (value: TabType) => void;
    variant: "mobile" | "desktop";
}

function Tab({ label, value, isActive, onClick, variant }: TabProps) {
    return (
        <li className="flex-1">
            <div
                onClick={() => onClick(value)}
                className={cn(
                    "flex flex-col items-center cursor-pointer transition-all",
                    variant === "desktop"
                        ? "rounded-full px-4 py-2.5"
                        : "border-b-2 pb-3",
                    variant === "desktop"
                        ? isActive
                            ? "bg-blue-800 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        : isActive
                            ? "border-b-neutral-800 dark:border-b-blue-500 opacity-100"
                            : "opacity-60 border-transparent"
                )}
            >
        <span
            className={cn(
                "whitespace-nowrap transition-colors",
                variant === "desktop"
                    ? "text-sm font-black"
                    : isActive
                    ? "text-md font-bold text-foreground dark:text-white"
                    : "text-[15px] text-muted-foreground dark:text-neutral-400"
            )}
        >
          {label}
        </span>
            </div>
        </li>
    );
}
