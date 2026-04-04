"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import {PiFireSimpleBold} from "react-icons/pi";
import {BiCalendarAlt} from "react-icons/bi";
import {LuInbox} from "react-icons/lu";
import {FaHashtag, FaRegUser} from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';
import {useAuthStore} from "@/store/auth-store";
import {useEffect, useMemo, useState} from "react";
import {showTopToast} from "@/components/toast/toast-util";

interface BottomNavbarProps extends React.ComponentProps<"nav"> {
    activeScreen: string;
    setActiveScreen: (value: string) => void;
    onEventsRefresh?: () => void;
}

interface NavItem {
    value: string;
    icon: React.ReactNode;
    label: string;
    badge?: boolean; // optional blue badge
}

const baseNavItems: NavItem[] = [
    { value: "events", icon: <PiFireSimpleBold size={23} />, label: "Events" },
    { value: "plans", icon: <BiCalendarAlt size={23} />, label: "Plans" },
    { value: "posts", icon: <FaHashtag size={23} />, label: "Posts" },
    { value: "updates", icon: <LuInbox size={23} />, label: "Updates" },
    { value: "profile", icon: <FaRegUser size={23} />, label: "Profile" }, // example badge
];

export const BottomNavbar = ({
                                 onEventsRefresh, activeScreen, setActiveScreen, className, ...props
                             }: BottomNavbarProps) => {
    const {user, getUser} = useAuthStore();

    const [navItems, setNavItems] = useState<NavItem[]>(baseNavItems);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                await getUser();
            } catch (err: any) {
                showTopToast("error", err.response?.data?.description);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [getUser]);

    useEffect(() => {
        const hasPlansBadge = (user?.totalUpcomingEventPlan ?? 0) > 0;

        const updatesCount =
            (user?.totalEventInvites ?? 0) +
            (user?.totalUnreadMessages ?? 0) +
            (user?.totalUserChatRequest ?? 0);

        const hasUpdatesBadge = updatesCount > 0;

        setNavItems(
            baseNavItems.map((item) => {
                if (item.value === "plans") return { ...item, badge: hasPlansBadge };
                if (item.value === "updates") return { ...item, badge: hasUpdatesBadge };
                return item;
            })
        );
    }, [user]);


    const handleClick = (val: string) => {
        if (val === "events" && activeScreen === "events" && onEventsRefresh) {
            onEventsRefresh();
        } else {
            setActiveScreen(val);
        }
    };

    return (
        <nav
            {...props}
            className={cn(
                "fixed inset-x-0 bottom-0 z-9999 bg-background border-t border-border",
                "safe-area-inset-bottom",
                className
            )}
        >
            <ul className="flex justify-around items-center py-2">
                {navItems.map((item) => (
                    <li key={uuidv4()} className="relative">
                        <div
                            onClick={() => handleClick(item.value)}
                            className={cn(
                                "flex flex-col items-center hover:text-blue-800 relative",
                                activeScreen === item.value ? "text-blue-800" : "text-neutral-400"
                            )}
                        >
                            <div className="relative">
                                {item.icon}
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-800 rounded-full border border-white"></span>
                                )}
                            </div>
                            <span className="text-xs mt-1">{item.label}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
