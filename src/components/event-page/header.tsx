import * as React from "react";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTheme } from 'next-themes';
import { getEventThemeBackground, isEventThemeLight } from '@/lib/event-theme';

interface SingleEventHeaderProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    activeScreen?: string;
    setActiveScreen?: (activeScreen: string) => void;
    prev: string | null;
    isCoHost: boolean;
    isCoHostComponent?: boolean;
    title?: string;
    onBackClick?: () => void; // New prop for custom back navigation
}

interface HeaderItem {
    value: string;
    label: string;
}

const headerItems: HeaderItem[] = [
    { value: 'details', label: "Details" },
    { value: 'map', label: "Map" },
    { value: 'reviews', label: "Reviews" },
    { value: 'related', label: "Related" },
]

export const SingleEventHeader = ({
    title = "Manage Event", isCoHostComponent = false, isCoHost, event, activeScreen, setActiveScreen, prev, onBackClick, className, ...props
}: SingleEventHeaderProps) => {
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    const headerStyle = getEventThemeBackground(event?.eventTheme, resolvedTheme);
    const isLightSurface = isEventThemeLight(event?.eventTheme, resolvedTheme);
    const headerBorderClass = isLightSurface ? "border-black/15" : "border-white/15";

    const handleBackClick = () => {
        if (onBackClick) {
            // Use custom back navigation if provided
            onBackClick();
        } else if (isCoHostComponent) {
            if (activeScreen !== "details") {
                setActiveScreen?.(prev || 'details');
                return
            }
            router.push(prev !== null ? prev : "/");
        } else {
            // Default router navigation
            router.push(prev !== null ? prev : "/");
        }
    }

    if (isCoHost) {
        return (
            <div className={cn(
                "w-full border-b flex flex-col gap-3 justify-center bg-background text-foreground",
                headerBorderClass,
                className
            )} style={headerStyle} {...props}>
                <div className="flex flex-row items-center px-8 py-6">
                    <FaArrowLeft
                        size={16}
                        onClick={handleBackClick}
                        className={cn(
                            "cursor-pointer transition-colors",
                            isLightSurface ? "text-black/80 hover:text-black" : "text-white/85 hover:text-white"
                        )}
                    />
                    <p className={cn(
                        "font-semibold text-md w-full text-center capitalize truncate ml-4",
                        isLightSurface ? "text-black" : "text-white"
                    )}>
                        {isCoHostComponent ? title : "Manage Event"}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-full border-b flex h-28 flex-col justify-between gap-5 bg-background text-foreground",
            headerBorderClass,
            className
        )} style={headerStyle} {...props}>
            <div className="flex flex-row items-center pt-8 px-8">
                <FaArrowLeft
                    size={16}
                    onClick={handleBackClick}
                    className={cn(
                        "cursor-pointer transition-colors",
                        isLightSurface ? "text-black/80 hover:text-black" : "text-white/85 hover:text-white"
                    )}
                />
                <p className={cn(
                    "font-semibold text-md w-full text-center capitalize truncate ml-4",
                    isLightSurface ? "text-black" : "text-white"
                )}>
                    {event.title}
                </p>
            </div>
            <ul className="flex flex-row justify-between px-4">
                {headerItems.map((item) => (
                    <li key={item.value} className="flex-shrink-0">
                        <div
                            onClick={() => setActiveScreen!(item.value)}
                            className={cn(
                                "flex flex-col items-center pb-1 border-b-2 cursor-pointer px-4 transition-colors",
                                activeScreen === item.value
                                    ? isLightSurface
                                        ? "border-black text-black"
                                        : "border-white text-white"
                                    : isLightSurface
                                        ? "border-transparent text-black/55 hover:text-black"
                                        : "border-transparent text-white/65 hover:text-white"
                            )}
                        >
                            <span className="text-sm mt-1 whitespace-nowrap">
                                {item.label}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
