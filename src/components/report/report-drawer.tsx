"use client";

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
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { cn } from "@/lib/utils";
import { Loader, LoaderSmall } from "../ui/loader";

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

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DrawerContent className="z-[99999]">
                <div className="w-full px-4 pb-6">
                    <DrawerHeader className="text-center">
                        <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
                        <DrawerDescription className="text-sm text-neutral-500">
                            Help us understand what&apos;s wrong
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col gap-0 mt-2">
                        {reasons.map((reason, index) => (
                            <div
                                key={reason.value}
                                className={cn(
                                    "flex items-center justify-between py-4 cursor-pointer",
                                    index !== reasons.length - 1 && "border-b border-border"
                                )}
                                onClick={() => handleReasonChange(reason.value)}
                            >
                                <span className="text-sm text-foreground">{reason.label}</span>
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        selectedReason === reason.value
                                            ? "border-blue-600 bg-blue-600"
                                            : "border-border"
                                    )}
                                >
                                    {selectedReason === reason.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
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
                                className="w-full min-h-[100px] p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={500}
                            />
                            <div className="text-right text-xs text-neutral-400">
                                {description.length}/500
                            </div>
                        </div>
                    )}

                    <DrawerFooter className="px-0 pt-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedReason}
                            className="w-full py-6 rounded-lg text-base bg-blue-800 hover:bg-blue-800 font-semibold"
                        >
                            {isSubmitting ? <LoaderSmall /> : "Submit Report"}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
