"use client";

import * as React from "react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { LoaderSmall } from "@/components/ui/loader";

export const DobOnboardingOverlay = () => {
    const { showDobOnboarding, setShowDobOnboarding, user, setUser } =
        useAuthStore();

    const [selectedDate, setSelectedDate] = useState<Date>(
        new Date(2000, 0, 1)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();

    const handleSubmit = async () => {
        if (!selectedDate) return;

        setIsSubmitting(true);

        try {
            const dobFormatted = selectedDate.toISOString().split("T")[0];

            await authApi.patch("/user/update", {
                dob: dobFormatted,
            });

            setUser({
                ...user,
                dob: dobFormatted,
            });

            setShowDobOnboarding(false);
            showTopToast("success", "Date of birth saved!");
        } catch (error: any) {
            showTopToast(
                "error",
                error.response?.data?.description || "Failed to save date of birth."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        setShowDobOnboarding(false);
    };

    return (
        <Drawer open={showDobOnboarding} onOpenChange={(open) => { if (!open) handleSkip(); }}>
            <DrawerContent className="z-[1100] max-h-[95dvh]">
                {/* Gradient banner */}
                <div className="relative w-full px-6 pt-6 pb-5 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-t-lg">
                    <div className="absolute inset-0 opacity-10 rounded-t-lg overflow-hidden">
                        <div className="absolute top-4 left-6 w-16 h-16 rounded-full bg-white/20 blur-xl" />
                        <div className="absolute bottom-2 right-8 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
                    </div>

                    <DrawerHeader className="relative z-10 text-left p-0">
                        <p className="text-3xl mb-1">🎉</p>
                        <DrawerTitle className="text-2xl font-bold text-white">
                            Welcome to Drifto!
                        </DrawerTitle>
                        <DrawerDescription className="text-blue-100 text-sm mt-1 leading-relaxed">
                            Let&apos;s get you set up. Your date of birth helps us
                            personalize recommended experiences just for you.
                        </DrawerDescription>
                    </DrawerHeader>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                    {/* Calendar section */}
                    <div className="w-full flex flex-col items-center gap-4 px-6 pt-4">
                        <div className="w-full text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                Selected date
                            </p>
                            <p className="text-base font-semibold text-foreground">
                                {selectedDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="border-2 border-border rounded-xl p-2 bg-muted/30">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    if (date) setSelectedDate(date);
                                }}
                                startMonth={new Date(1950, 0)}
                                endMonth={new Date(currentYear, currentMonth)}
                                hidden={{
                                    after: new Date(
                                        currentYear,
                                        currentMonth,
                                        currentDay
                                    ),
                                }}
                                defaultMonth={selectedDate}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col items-center gap-3 px-6 py-4">
                    <Button
                        className="w-full py-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-md shadow-blue-700/25 hover:shadow-lg hover:shadow-blue-700/30"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <LoaderSmall /> : "Continue"}
                    </Button>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                        disabled={isSubmitting}
                    >
                        Skip for now
                    </button>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
