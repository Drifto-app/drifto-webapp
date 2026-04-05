"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {TabType} from "@/components/profile-display/profile-display";


interface TabsProps {
    active: TabType | null;
    onClick?: (value: TabType) => void;
}

interface TabOption {
    label: string;
    value: TabType;
}

const TAB_OPTIONS: TabOption[] = [
    { label: "Profile", value: "profile" },
    { label: "Favourites", value: "favourites" },
];

export function ProfileTabs({ active, onClick }: TabsProps) {
    const handleTabClick = (value: TabType) => {
        onClick?.(value);
    };

    return (
        <ul className="flex flex-row w-full overflow-x-auto mt-4 no-scrollbar border-b border-border">
            {TAB_OPTIONS.map((tab) => (
                <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    isActive={active === tab.value}
                    onClick={handleTabClick}
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
}

function Tab({ label, value, isActive, onClick }: TabProps) {
    return (
        <li className="flex-1">
            <div
                onClick={() => onClick(value)}
                className={cn(
                    "flex flex-col items-center border-b-2 cursor-pointer pb-3 transition-all",
                    isActive
                        ? "border-b-neutral-800 dark:border-b-blue-500 opacity-100"
                        : "opacity-60 border-transparent"
                )}
            >
        <span
            className={cn(
                "whitespace-nowrap transition-colors",
                isActive
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
