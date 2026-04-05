"use client"

import {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import * as React from "react";

interface UserEventProps extends ComponentProps<"div"> {
    event: {[key: string]: any};
}

export const UserEventCard = ({
    event, className, ...props
}: UserEventProps) => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const pathname = usePathname();

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4",
                className,
            )}
            {...props}
        >
            <div className="relative w-full max-h-[30vh] overflow-hidden">
                <Image
                    src={event.titleImage}
                    alt={event.title}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover rounded-lg"
                    style={{ maxHeight: "30vh" }}
                    onClick={() => {router.push(`/m/events/${event.id}?prev=${encodeURIComponent(pathname + "?" + searchParams)}`)}}
                />
                {event.original && <span className="absolute top-4 left-2 rounded-full bg-background py-2 px-2 text-xs shadow-md font-semibold text-foreground">
                    Drifto Original
                </span>}
            </div>
            <div className="w-full flex flex-col">
                <span className="font-black text-lg capitalize leading-tight truncate">{event.title}</span>
                <span className="capitalize text-neutral-500 font-semibold">{`${event.city}, ${event.state}`}</span>
                <span className="text-neutral-500 font-semibold">
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
