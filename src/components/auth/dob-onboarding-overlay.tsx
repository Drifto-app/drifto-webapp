"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { getErrorMessage } from "@/lib/error-message";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
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
    const [isDesktop, setIsDesktop] = useState(false);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = () => setIsDesktop(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

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
        } catch (error: unknown) {
            showTopToast(
                "error",
                getErrorMessage(error, "Failed to save date of birth.")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        setShowDobOnboarding(false);
    };

    const content = (
        <>
            <div className="relative w-full rounded-t-lg bg-blue-800 px-6 pb-5 pt-6 text-white lg:rounded-t-[1.5rem]">
                <div className="absolute inset-0 overflow-hidden rounded-t-lg opacity-10 lg:rounded-t-[1.5rem]">
                    <div className="absolute left-6 top-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                    <div className="absolute bottom-2 right-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
                </div>

                <div className="relative z-10 text-left">
                    <p className="mb-1 text-3xl">Welcome</p>
                    <h2 className="text-2xl font-bold text-white">
                        Finish setting up Drifto
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-blue-100">
                        Your date of birth helps us personalize recommended experiences and keep account settings accurate.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex w-full flex-col items-center gap-4 px-6 pt-4">
                    <div className="w-full text-center">
                        <p className="mb-1 text-sm font-medium text-muted-foreground">
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
                    <div className="rounded-xl border-2 border-border bg-muted/30 p-2">
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

            <div className="flex w-full flex-col items-center gap-3 px-6 py-4">
                <Button
                    className="w-full rounded-xl bg-blue-800 py-6 text-base font-semibold text-white shadow-md shadow-blue-950/10 transition-all duration-200 hover:bg-blue-900"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <LoaderSmall /> : "Continue"}
                </Button>
                <button
                    type="button"
                    onClick={handleSkip}
                    className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    disabled={isSubmitting}
                >
                    Skip for now
                </button>
            </div>
        </>
    );

    if (isDesktop) {
        return (
            <Dialog open={showDobOnboarding} onOpenChange={(open) => { if (!open) handleSkip(); }}>
                <DialogContent
                    className="max-h-[90dvh] max-w-xl overflow-hidden rounded-[1.5rem] border-border bg-background p-0"
                    showCloseButton={false}
                >
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={showDobOnboarding} onOpenChange={(open) => { if (!open) handleSkip(); }}>
            <DrawerContent className="z-[1100] max-h-[95dvh]">
                {content}
            </DrawerContent>
        </Drawer>
    );
};
