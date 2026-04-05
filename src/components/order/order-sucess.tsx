"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface OrderSuccessProps extends React.ComponentProps<"div"> {}

export const OrderSuccessDetails = ({
    className, ...props
}: OrderSuccessProps) => {
    const router = useRouter();
    const checkmarkRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        let origin = { x: 0.5, y: 0.4 };

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            
            if (checkmarkRef.current) {
                const rect = checkmarkRef.current.getBoundingClientRect();
                origin = {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                };
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
                disableForReducedMotion: true
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(
            "w-full flex flex-col justify-between items-center px-6 py-8 min-h-[calc(100vh-80px)]",
            className
        )} {...props}>
            <div className="flex flex-col items-center justify-center w-full sm:max-w-[70vw] gap-2 mt-20 relative z-10">
                <div 
                    ref={checkmarkRef} 
                    className="rounded-full bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.4)] p-5 mb-6"
                >
                    <FiCheck className="text-white text-6xl" strokeWidth={4} />
                </div>
                <h1 className="w-full text-center font-black text-3xl">You're all set</h1>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">Enjoy your experience</p>
            </div>
            
            <div className="w-full mt-auto mt-12 pb-6 relative z-10">
                <Button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[1.05rem] py-6 rounded-xl w-full"
                    onClick={() => {
                        router.push("/?screen=plans")
                    }}
                >
                    Continue
                </Button>
            </div>
        </div>
    )
}