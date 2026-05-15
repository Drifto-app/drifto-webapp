"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { cn } from "@/lib/utils";
import { LoaderSmall } from "../ui/loader";

// Entity types for reporting
export type ReportEntityType = "POST" | "COMMENT" | "EVENT";

// Report reasons enum matching the API
export type ReportReason =
    | "SCAM_OR_FRAUD"
    | "INAPPROPRIATE_OR_OFFENSIVE_CONTENT"
    | "FAKE_OR_MISLEADING_EVENT"
    | "WRONG_INFORMATION"
    | "SPAM"
    | "HARASSMENT_OR_HATE_SPEECH"
    | "OTHERS";

interface ReportReasonOption {
    value: ReportReason;
    label: string;
}

// Reasons for Event and Comment
const eventReasons: ReportReasonOption[] = [
    { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
    { value: "INAPPROPRIATE_OR_OFFENSIVE_CONTENT", label: "Inappropriate or offensive content" },
    { value: "FAKE_OR_MISLEADING_EVENT", label: "Fake or misleading event" },
    { value: "WRONG_INFORMATION", label: "Wrong information" },
    { value: "OTHERS", label: "Other" },
];

// Reasons for Post
const postReasons: ReportReasonOption[] = [
    { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
    { value: "INAPPROPRIATE_OR_OFFENSIVE_CONTENT", label: "Inappropriate or offensive content" },
    { value: "SPAM", label: "Spam" },
    { value: "HARASSMENT_OR_HATE_SPEECH", label: "Harassment or hate speech" },
    { value: "OTHERS", label: "Other" },
];

interface ReportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    entityType: ReportEntityType;
    eventId?: string;
    postId?: string;
    commentId?: string;
}

export const ReportDrawer = ({
    isOpen,
    onClose,
    entityType,
    eventId,
    postId,
    commentId,
}: ReportDrawerProps) => {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDesktop, setIsDesktop] = useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = () => setIsDesktop(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const reasons = useMemo(() => {
        if (entityType === "POST") {
            return postReasons;
        }
        return eventReasons;
    }, [entityType]);

    const title = useMemo(() => {
        switch (entityType) {
            case "EVENT":
                return "Report Event";
            case "POST":
                return "Report Post";
            case "COMMENT":
                return "Report Comment";
            default:
                return "Report";
        }
    }, [entityType]);

    const handleReasonChange = useCallback((reason: ReportReason) => {
        setSelectedReason(reason);
        // Clear description when switching away from "OTHERS"
        if (reason !== "OTHERS") {
            setDescription("");
        }
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= 500) {
            setDescription(value);
        }
    }, []);

    const resetForm = useCallback(() => {
        setSelectedReason(null);
        setDescription("");
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    const handleSubmit = useCallback(async () => {
        if (!selectedReason) {
            showTopToast("error", "Please select a reason for reporting");
            return;
        }

        if (selectedReason === "OTHERS" && !description.trim()) {
            showTopToast("error", "Please provide a description");
            return;
        }

        setIsSubmitting(true);

        try {
            const requestBody: {
                entityType: ReportEntityType;
                reason: ReportReason;
                description?: string;
                eventId?: string;
                postId?: string;
                commentId?: string;
            } = {
                entityType,
                reason: selectedReason,
            };

            if (description.trim()) {
                requestBody.description = description.trim();
            } else {
                requestBody.description = selectedReason;
            }

            if (entityType === "EVENT" && eventId) {
                requestBody.eventId = eventId;
            } else if (entityType === "POST" && postId) {
                requestBody.postId = postId;
            } else if (entityType === "COMMENT" && commentId) {
                requestBody.commentId = commentId;
            }

            await authApi.post("/report/", requestBody);

            showTopToast("success", "Report submitted successfully");
            handleClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit report";
            showTopToast("error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedReason, description, entityType, eventId, postId, commentId, handleClose]);

    const reportContent = (
        <>
            <div className="mt-4 grid gap-2">
                {reasons.map((reason, index) => (
                    <button
                        key={reason.value}
                        type="button"
                        className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                            selectedReason === reason.value
                                ? "border-blue-800 bg-blue-800/10 ring-1 ring-blue-800/20 dark:border-blue-400/40 dark:bg-blue-400/10 dark:ring-blue-400/20"
                                : "border-border hover:bg-accent",
                            index === reasons.length - 1 && "mb-0"
                        )}
                        onClick={() => handleReasonChange(reason.value)}
                    >
                        <span className="text-sm text-foreground">{reason.label}</span>
                        <div
                            className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                selectedReason === reason.value
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-border"
                            )}
                        >
                            {selectedReason === reason.value && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {selectedReason === "OTHERS" && (
                <div className="mt-4 flex flex-col gap-2">
                    <label className="text-sm text-neutral-500">
                        Tell us briefly what&apos;s wrong
                    </label>
                    <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Describe the issue..."
                        className="min-h-[110px] w-full resize-none rounded-xl border border-border bg-background p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={500}
                    />
                    <div className="text-right text-xs text-neutral-400">
                        {description.length}/500
                    </div>
                </div>
            )}
        </>
    );

    const submitButton = (
        <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="h-12 w-full rounded-full bg-blue-800 text-base font-bold text-white hover:bg-blue-900 disabled:text-white/60"
        >
            {isSubmitting ? <LoaderSmall /> : "Submit Report"}
        </Button>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-h-[calc(100vh-4rem)] overflow-y-auto sm:max-w-xl">
                    <DialogHeader className="border-b border-border pb-4">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Help us understand what&apos;s wrong
                        </DialogDescription>
                    </DialogHeader>
                    {reportContent}
                    <DialogFooter className="pt-2">
                        {submitButton}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DrawerContent className="z-[99999]">
                <div className="w-full px-4 pb-6">
                    <DrawerHeader className="border-b border-border px-0 text-center">
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>
                            Help us understand what&apos;s wrong
                        </DrawerDescription>
                    </DrawerHeader>
                    {reportContent}
                    <DrawerFooter className="px-0 pt-6">
                        {submitButton}
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
