import * as React from "react";
import { cn } from "@/lib/utils";

interface EventSingleContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface EventSingleContentTextProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    headText: string;
    isLine?: boolean;
}

function EventSingleContent({ className, children, ...props }: EventSingleContentProps) {
    return (
        <div
            data-slot="input"
            className={cn(
                "flex flex-row gap-4 rounded-2xl bg-background w-full py-3 px-4 items-center justify-start shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

function EventSingleContentText({ headText, isLine = true, className, children, ...props }: EventSingleContentTextProps) {
    return (
        <div
            data-slot="input"
            className={cn(
                "flex flex-col gap-4 rounded-2xl bg-background w-full py-4 px-6 items-center justify-start shadow-md",
                className
            )}
            {...props}
        >
            <p className={cn(
                "font-semibold w-full",
                isLine && "border-b-neutral-black border-b-1 pb-2"
            )}>{headText}</p>
            {children}
        </div>
    );
}

export { EventSingleContent, EventSingleContentText };
