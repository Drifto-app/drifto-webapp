"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import {ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import * as React from "react";
import {useRouter} from "next/navigation";
import {FaHeart} from "react-icons/fa";
import {IoMdHeartEmpty} from "react-icons/io";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";
import { DESKTOP_ROUTES } from "@/lib/routes";


interface EventFavouriteCardProps extends ComponentProps<"div"> {
    eventContent: {[key: string]: any};
    onUnReact: (eventId: string) => void;
    variant?: "mobile" | "desktop";
}

export const EventFavouriteCard = ({
    eventContent, onUnReact, variant = "mobile", className, ...props
}: EventFavouriteCardProps) => {
    const router = useRouter();
    const isDesktop = variant === "desktop";

    const [isLiked, setIsLiked] = useState<boolean>(true);
    const [isLikedLoading, setIsLikedLoading] = useState<boolean>(false);

    const handleReaction = async () => {
        if (isLikedLoading) return;

        setIsLikedLoading(true);

        try {
            setIsLiked(!isLiked);
            await authApi.post(`/reaction/react`, {
                reactionType: "EVENT",
                eventId: eventContent.eventId,
            })
            onUnReact(eventContent.eventId)
        } catch (err: any) {
            showTopToast("error", err.message);
            setIsLiked(!isLiked);
        } finally {
            setIsLikedLoading(false);
        }
    }

    return (
        <div
            className={cn(
                "w-full",
                isDesktop && "overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/30 hover:shadow-md",
                className,
            )}
            {...props}
        >
            <div className="w-full flex flex-col gap-4">
                <div className={cn("relative w-full overflow-hidden", isDesktop ? "aspect-[16/10] rounded-xl" : "max-h-[30vh]")}>
                    <Image
                        src={eventContent.titleFileUrl}
                        alt={eventContent.title}
                        fill={isDesktop}
                        width={isDesktop ? undefined : 800}
                        height={isDesktop ? undefined : 500}
                        className={cn("object-cover cursor-pointer", isDesktop ? "h-full w-full rounded-xl" : "w-full h-auto rounded-lg")}
                        style={isDesktop ? undefined : { maxHeight: "30vh" }}
                        onClick={() => {
                            const path = isDesktop
                                ? DESKTOP_ROUTES.eventDetail(eventContent.eventId)
                                : `/m/events/${eventContent.eventId}`;

                            router.push(`${path}?prev=${encodeURIComponent(`/?screen=profile`)}`)
                        }}
                    />
                    {eventContent.original && <span className="absolute top-4 left-2 rounded-full bg-background py-2 px-2 text-xs shadow-md font-semibold text-foreground">
                            Drifto Original
                    </span>}
                    <div className="p-3 absolute top-3 right-2 z-1000 h-15 w-15" onClick={handleReaction}>
                        <button className="absolute top-3 right-2 text-white rounded-full bg-neutral-800 p-2 opacity-90 z-90" disabled={isLikedLoading}>
                            {isLiked ? (
                              <FaHeart
                                size={25}
                                className="text-red-500 animate-[heartBeat_0.3s_ease-in-out]"
                                style={{
                                    animation: 'heartBeat 0.2s ease-in-out'
                                }}
                              />
                            ) : (
                                <IoMdHeartEmpty size={25} />
                            )}
                        </button>
                    </div>
                </div>
                <div className={cn("font-black capitalize leading-tight line-clamp-2", isDesktop ? "px-1 pb-1 text-base" : "text-lg")}>{eventContent.title}</div>
            </div>
        </div>
    )
}
