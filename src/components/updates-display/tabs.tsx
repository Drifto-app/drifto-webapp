"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabValue = "requests" | "notifications";
// | "inbox";

interface TabsProps {
  active: TabValue | null;
  onClick?: (value: TabValue | null) => void;
}

interface TabOption {
  label: string;
  value: TabValue;
}

const TAB_OPTIONS: TabOption[] = [
  //   { label: "Inbox", value: "inbox" },
  { label: "Notifications", value: "notifications" },
  { label: "Requests", value: "requests" },
];

export function Tabs({ active, onClick }: TabsProps) {
  const handleTabClick = (value: TabValue) => {
    onClick?.(value);
  };

  return (
    <ul className="flex flex-row flex-nowrap justify-center w-full gap-6 overflow-x-auto px-4 mt-4 no-scrollbar">
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
  value: TabValue;
  isActive: boolean;
  onClick: (value: TabValue) => void;
}

function Tab({ label, value, isActive, onClick }: TabProps) {
  return (
    <li className="flex-shrink-0">
      <div
        onClick={() => onClick(value)}
        className={cn(
          "flex flex-col items-center border-b-3 cursor-pointer px-4 transition-all gap-1",
          isActive
            ? "pb-2 border-b-neutral-800 dark:border-b-blue-500 opacity-100"
            : "pb-0 opacity-60 border-transparent"
        )}
      >
        <span
          className={cn(
            "mt-1 whitespace-nowrap",
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
