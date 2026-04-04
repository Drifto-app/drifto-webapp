"use client"

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { HiOutlineGlobe } from "react-icons/hi";
import { IoGameControllerOutline, IoMusicalNotes } from "react-icons/io5";
import { MdOutlineMovie, MdOutlineSportsBasketball, MdSpa } from "react-icons/md";
import { GiCrafting, GiMountainClimbing, GiPaintBrush, GiPalmTree, GiWeightLiftingUp } from "react-icons/gi";
import {
    FaBookOpen,
    FaBriefcase,
    FaCameraRetro,
    FaChild, FaGamepad,
    FaHandHoldingHeart,
    FaHandsHelping, FaLaptopCode,
    FaMoon, FaPaw, FaPlane,
    FaUtensils
} from "react-icons/fa";
import { FaEarthAfrica, FaTicketSimple } from "react-icons/fa6";

interface EventItem {
    value: string | null;
    icon: React.ReactNode
    label: string;
}

const eventItems: EventItem[] = [
    { value: null, icon: <FaEarthAfrica size={25} />, label: "Explore" },
    { value: "gaming", icon: <FaGamepad size={25} />, label: "Games" },
    { value: "music", icon: <FaTicketSimple size={25} />, label: "Music" },
    { value: "sports", icon: <MdOutlineSportsBasketball size={25} />, label: "Sports" },
    { value: "adventure", icon: <GiMountainClimbing size={25} />, label: "Adventure" },
    { value: "art & culture", icon: <GiPaintBrush size={25} />, label: "Art & Culture" },
    { value: "business & talks", icon: <FaBriefcase size={25} />, label: "Business & Talks" },
    { value: "causes", icon: <FaHandHoldingHeart size={25} />, label: "Causes" },
    { value: "diy & crafts", icon: <GiCrafting size={25} />, label: "DIY & Crafts" },
    { value: "family", icon: <FaChild size={25} />, label: "Family" },
    { value: "fashion", icon: <GiPalmTree size={25} />, label: "Fashion" },
    { value: "fitness", icon: <GiWeightLiftingUp size={25} />, label: "Fitness" },
    { value: "food & drinks", icon: <FaUtensils size={25} />, label: "Food & Drinks" },
    { value: "learning", icon: <FaBookOpen size={25} />, label: "Learning" },
    { value: "meetups", icon: <FaHandsHelping size={25} />, label: "Meetups" },
    { value: "movies & film", icon: <MdOutlineMovie size={25} />, label: "Movies & Film" },
    { value: "nightlife", icon: <FaMoon size={25} />, label: "Nightlife" },
    { value: "photography", icon: <FaCameraRetro size={25} />, label: "Photography" },
    { value: "pets & animals", icon: <FaPaw size={25} />, label: "Pets & Animals" },
    { value: "recreation", icon: <GiPalmTree size={25} />, label: "Recreation" },
    { value: "shows", icon: <GiCrafting size={25} />, label: "Shows" },
    { value: "tech", icon: <FaLaptopCode size={25} />, label: "Tech" },
    { value: "travel", icon: <FaPlane size={25} />, label: "Travel" },
    { value: "volunteering", icon: <FaHandsHelping size={25} />, label: "Volunteering" },
    { value: "wellness", icon: <MdSpa size={25} />, label: "Wellness" },
];

const tabColors: { [key: string]: any } = {
    'Explore': { active: '#1976D2', inactive: '#1976D2' },
    'Games': { active: '#00796B', inactive: '#00796B' },
    'Music': { active: '#F57C00', inactive: '#F57C00' },
    'Sports': { active: '#C62828', inactive: '#C62828' },
    'Adventure': { active: '#2E7D32', inactive: '#2E7D32' },
    'Art & Culture': { active: '#455A64', inactive: '#455A64' },
    'Business & Talks': { active: '#6A1B9A', inactive: '#6A1B9A' },
    'Causes': { active: '#0288D1', inactive: '#0288D1' },
    'DIY & Crafts': { active: '#9E9D24', inactive: '#9E9D24' },
    'Family': { active: '#5D4037', inactive: '#5D4037' },
    'Fashion': { active: '#9E9D24', inactive: '#9E9D24' },
    'Fitness': { active: '#F4511E', inactive: '#F4511E' },
    'Food & Drinks': { active: '#D32F2F', inactive: '#D32F2F' },
    'Learning': { active: '#FFA000', inactive: '#FFA000' },
    'Meetups': { active: '#00838F', inactive: '#00838F' },
    'Movies & Film': { active: '#6A1B9A', inactive: '#6A1B9A' },
    'Nightlife': { active: '#283593', inactive: '#283593' },
    'Photography': { active: '#5D4037', inactive: '#5D4037' },
    'Pets & Animals': { active: '#00796B', inactive: '#00796B' },
    'Recreation': { active: '#2E7D32', inactive: '#2E7D32' },
    'Shows': { active: '#0288D1', inactive: '#0288D1' },
    'Tech': { active: '#0288D1', inactive: '#0288D1' },
    'Travel': { active: '#FF5722', inactive: '#FF5722' },
    'Volunteering': { active: '#00838F', inactive: '#00838F' },
    'Wellness': { active: '#00838F', inactive: '#00838F' },
};

export function Tabs({
    active, onClick
}: {
    active: string | null;
    onClick?: (v: string | null) => void;
}) {
    const [animatingTab, setAnimatingTab] = useState<string | null>(null);

    const handleTabClick = (value: string | null) => {
        // Trigger animation
        const key = value ?? "explore";
        setAnimatingTab(key);

        // Call the onClick handler
        onClick?.(value);

        // Clear animation state after animation completes
        setTimeout(() => {
            setAnimatingTab(null);
        }, 500); // Increased to account for full animation
    };

    // CSS keyframes for bounce then scale animation
    const bounceScaleAnimation = `
        @keyframes iconBounceScale {
            0% { transform: translateY(0) scale(1); }
            20% { transform: translateY(-6px) scale(1); }
            40% { transform: translateY(0) scale(1); }
            60% { transform: translateY(-3px) scale(1); }
            80% { transform: translateY(0) scale(1.2); }
            100% { transform: translateY(0) scale(1); }
        }
    `;

    return (
        <>
            <style>{bounceScaleAnimation}</style>
            <ul className="flex flex-row flex-nowrap w-full gap-1 overflow-x-auto px-4 pt-2 no-scrollbar">
                {eventItems.map((item) => {
                    const colors = tabColors[item.label] || { active: '#000', inactive: '#666' };
                    const isActive = active === item.value;
                    const tabKey = item.value ?? "explore";
                    const isAnimating = animatingTab === tabKey;

                    return (
                        <li key={tabKey} className="flex-shrink-0">
                            <div
                                onClick={() => handleTabClick(item.value)}
                                className={cn(
                                    "flex flex-col items-center border-b-3 cursor-pointer px-4 gap-1",
                                    "transition-all duration-200 ease-out",
                                    isActive
                                        ? "pb-2 border-b-neutral-800 dark:border-b-blue-500 opacity-100"
                                        : "pb-0 opacity-60 border-transparent"
                                )}
                                style={{
                                    color: isActive ? colors.active : colors.inactive
                                }}
                            >
                                <span
                                    className="inline-block transition-transform duration-200"
                                    style={{
                                        animation: isAnimating ? 'iconBounceScale 0.8s ease-out forwards' : 'none',
                                        transform: !isAnimating && isActive ? 'scale(1.15)' : 'scale(1)'
                                    }}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className={cn(
                                        "mt-1 whitespace-nowrap transition-colors",
                                        isActive
                                            ? "text-sm font-bold text-foreground dark:text-white"
                                            : "text-[14px] text-muted-foreground dark:text-neutral-400",
                                    )}
                                >
                                    {item.label}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
