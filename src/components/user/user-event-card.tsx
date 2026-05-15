"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import * as React from "react";
import { DESKTOP_ROUTES } from "@/lib/routes";

interface UserEventProps extends ComponentProps<"div"> {
    event: {[key: string]: any};
    variant?: "mobile" | "desktop";
}

export const UserEventCard = ({
    event, variant = "mobile", className, ...props
}: UserEventProps) => {
    const router = useRouter();
    const isDesktop = variant === "desktop";

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const prev = `${pathname}?${searchParams}`;
    const eventPath = isDesktop
        ? `${DESKTOP_ROUTES.eventDetail(event.id)}?prev=${encodeURIComponent(prev)}`
        : `/m/events/${event.id}?prev=${encodeURIComponent(prev)}`;

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4",
                isDesktop && "overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/30 hover:shadow-md",
                className,
            )}
            {...props}
        >
            <div className={cn("relative w-full overflow-hidden", isDesktop ? "aspect-[16/10] rounded-xl" : "max-h-[30vh]")}>
                <Image
                    src={event.titleImage}
                    alt={event.title}
                    fill={isDesktop}
                    width={isDesktop ? undefined : 800}
                    height={isDesktop ? undefined : 500}
                    className={cn("object-cover cursor-pointer", isDesktop ? "h-full w-full rounded-xl" : "w-full h-auto rounded-lg")}
                    style={isDesktop ? undefined : { maxHeight: "30vh" }}
                    onClick={() => {router.push(eventPath)}}
                />
                {event.original && <span className="absolute top-4 left-2 rounded-full bg-background py-2 px-2 text-xs shadow-md font-semibold text-foreground">
                    Drifto Original
                </span>}
            </div>
            <div className={cn("w-full flex flex-col", isDesktop && "px-1 pb-1")}>
                <span className={cn("font-black capitalize leading-tight truncate", isDesktop ? "text-base" : "text-lg")}>{event.title}</span>
                <span className="capitalize text-sm text-muted-foreground font-semibold">{`${event.city}, ${event.state}`}</span>
                <span className="text-sm text-muted-foreground font-semibold">
                    {`${
                        new Date(event.startTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric"
                        })
                    } - 
                    ${
                        new Date(event.stopTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric"
                        })
                    }
                    `}
                </span>
            </div>
        </div>
    )
}
