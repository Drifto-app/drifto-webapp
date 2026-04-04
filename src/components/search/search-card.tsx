"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { SearchItem, useRecentSearchStore } from "@/store/recent-search-store";
import { IoClose } from "react-icons/io5";
import { ComponentProps } from "react";
import { router } from "next/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";
import defaultImage from "@/assests/default.jpeg";

interface RecentSearchCardProps extends React.ComponentProps<"div"> {
    item: { [key: string]: any };
    removeSearch?: (id: string) => void;
    type: "event" | "user";
}

interface SuggestionEventCardProp extends ComponentProps<"div"> {
    event: { [key: string]: any }
}

export const RecentSearchCard = ({
    item, type, removeSearch, className, ...props
}: RecentSearchCardProps) => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const { addSearch } = useRecentSearchStore();

    const onClick = () => {
        const prev = pathname + "?" + searchParams

        addSearch(item, type)
        if (type === "user") {
            router.push(`/m/user/${item.id}?prev=${prev}`);
        } else {
            router.push(`/m/events/${item.id}?prev=${prev}`);
        }
    }

    if (type === "event") {
        const date = new Date(item.startTime);
        const formatedDate = date.toLocaleString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        const formattedTime = date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

        return (
            <div
                className={cn(
                    "flex flex-row items-center px-2 justify-between",
                    className
                )}
                {...props}
            >
                <div className="w-full flex gap-3 items-center"
                    onClick={onClick}>
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center">
                        <AspectRatio ratio={1}>
                            <Image
                                src={item.eventTitleImage || defaultImage}
                                alt={item.title ?? "Title"}
                                fill
                                className="object-cover rounded-md"
                            />
                        </AspectRatio>
                    </div>
                    <div className="w-full max-w-[70%] flex flex-col">
                        <p className="w-full capitalize text-foreground text-sm font-bold line-clamp-2">{item.title}</p>
                        <ul className="text-neutral-400 text-sm capitalize flex list-disc gap-5 font-medium truncate">
                            <li className="first:list-none">{type}</li>
                            <li>{formatedDate}</li>
                            <li>{formattedTime}</li>
                        </ul>
                    </div>
                </div>
                {removeSearch ? <div className="p-2" onClick={() => removeSearch(item.id)}>
                    <IoClose size={16} className="text-neutral-400" />
                </div> : null}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-row items-center px-2 justify-between cursor-pointer",
                className
            )}
            {...props}
        >
            <div className="w-full flex gap-3 items-center"
                onClick={onClick}>
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center" onClick={onClick}>
                    <AspectRatio ratio={1}>
                        <Image
                            src={item.profileImage || defaultImage}
                            alt={item.username}
                            fill
                            className="object-cover rounded-full"
                        />
                    </AspectRatio>
                </div>
                <div className="w-full  max-w-[70%] flex flex-col" onClick={onClick}>
                    <div className="flex gap-2 items-center">
                        <p className="text-foreground text-sm font-bold truncate">{item.username}</p>
                        <UserVerificationBadge user={item} />
                    </div>
                    <p className="text-sm capitalize text-neutral-400">{type}</p>
                </div>
            </div>
            {removeSearch ? <div className="p-2" onClick={() => removeSearch(item.id)}>
                <IoClose size={16} className="text-neutral-400" />
            </div> : null}
        </div>
    )
}

export const SuggestionEventCard = ({
    event, className, ...props
}: SuggestionEventCardProp) => {
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div
            className={cn(
                "flex flex-col items-start px-2 gap-2",
                className
            )}
            {...props}

            onClick={() => router.push(`/m/events/${event.id}?prev=${encodeURIComponent(pathname + "?" + searchParams)}`)}
        >
            <div className="relative w-50 flex rounded-md items-center justify-center">
                <AspectRatio ratio={4 / 3}>
                    <Image
                        src={event.titleImage}
                        alt={event.title}
                        fill
                        className="object-cover rounded-md"
                    />
                </AspectRatio>
                {event.original && (
                    <div className="absolute top-2 left-2 rounded-full bg-background px-2 py-[2px] shadow-md text-foreground">
                        <span className="text-[10px] font-semibold text-muted-foreground leading-0">
                            Drifto Original
                        </span>
                    </div>
                )}

            </div>
            <div className="w-50 font-bold capitalize line-clamp-2 leading-tight">
                {event.title}
            </div>
        </div>
    )
}
