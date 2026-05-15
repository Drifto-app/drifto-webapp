"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabValue = "bookings" | "events";

interface TabsProps {
  active: TabValue | null;
  onClick?: (value: TabValue | null) => void;
  variant?: "mobile" | "desktop";
}

interface TabOption {
  label: string;
  value: TabValue;
}

const TAB_OPTIONS: TabOption[] = [
  { label: "Bookings", value: "bookings" },
  { label: "Events", value: "events" },
];

export function Tabs({ active, onClick, variant = "mobile" }: TabsProps) {
  const handleTabClick = (value: TabValue) => {
    onClick?.(value);
  };
  const isDesktop = variant === "desktop";

  return (
    <ul
      className={cn(
        "flex flex-row flex-nowrap overflow-x-auto no-scrollbar",
        isDesktop
          ? "w-auto justify-start gap-2 rounded-full border border-border bg-card p-1"
          : "justify-center w-full gap-6 px-4 mt-4"
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
  value: TabValue;
  isActive: boolean;
  onClick: (value: TabValue) => void;
  variant?: "mobile" | "desktop";
}

function Tab({ label, value, isActive, onClick, variant = "mobile" }: TabProps) {
  const isDesktop = variant === "desktop";

  return (
    <li className="flex-shrink-0">
      <div
        onClick={() => onClick(value)}
        className={cn(
          "flex cursor-pointer items-center transition-all",
          isDesktop
            ? "rounded-full px-5 py-2.5"
            : "flex-col border-b-3 px-4 gap-1",
          isDesktop && isActive && "bg-blue-800 text-white shadow-sm",
          isDesktop && !isActive && "text-muted-foreground hover:bg-accent hover:text-foreground",
          !isDesktop && isActive && "pb-2 border-b-neutral-800 dark:border-b-blue-500 opacity-100",
          !isDesktop && !isActive && "pb-0 opacity-60 border-transparent"
        )}
      >
        <span
          className={cn(
            "whitespace-nowrap",
            isDesktop
              ? "text-sm font-bold"
              : "mt-1",
            !isDesktop && isActive
              ? "text-md font-bold text-foreground dark:text-white"
              : !isDesktop
                ? "text-[15px] text-muted-foreground dark:text-neutral-400"
                : undefined
          )}
        >
          {label}
        </span>
      </div>
    </li>
  );
}
