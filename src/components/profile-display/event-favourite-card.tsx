"use client"

import {ComponentProps, useState} from "react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import * as React from "react";
import {useRouter} from "next/navigation";
import {FaHeart} from "react-icons/fa";
import {IoMdHeartEmpty} from "react-icons/io";
import {authApi} from "@/lib/axios";
import {showTopToast} from "@/components/toast/toast-util";


interface EventFavouriteCardProps extends ComponentProps<"div"> {
    eventContent: {[key: string]: any};
    onUnReact: (eventId: string) => void;
}

export const EventFavouriteCard = ({
    eventContent, onUnReact, className, ...props
}: EventFavouriteCardProps) => {
    const router = useRouter();

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
                className,
            )}
            {...props}
        >
            <div className="w-full flex flex-col gap-4">
                <div className="relative w-full max-h-[30vh] overflow-hidden">
                    <Image
                        src={eventContent.titleFileUrl}
                        alt={eventContent.title}
                        width={800}
                        height={500}
                        className="w-full h-auto object-cover rounded-lg"
                        style={{ maxHeight: "30vh" }}
                        onClick={() => {router.push(`/m/events/${eventContent.eventId}?prev=${encodeURIComponent(`/?screen=profile`)}`)}}
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
                <div className="font-black text-lg capitalize leading-tight line-clamp-2">{eventContent.title}</div>
            </div>
        </div>
    )
}
