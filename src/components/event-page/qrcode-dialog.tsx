"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { LoaderSmall } from "@/components/ui/loader";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { authApi } from "@/lib/axios";
import { toast } from "sonner"
import { showTopToast } from "@/components/toast/toast-util";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onResult: (text: string) => void;
}

type BannerState = { type: "success" | "error"; text: string } | null;

export default function QrScannerDialog({ open, onOpenChange, onResult }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // request/scan guards
    const handlingRef = useRef(false);
    const lastTextRef = useRef<string | null>(null);
    const lastTsRef = useRef<number>(0);
    const DUP_WINDOW_MS = 3000; // ignore exact same text within 3s

    // pop-down banner
    const bannerTimerRef = useRef<number | null>(null);

    const isCameraSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const isSecureContext = () =>
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    // pop-down helpers
    const showBanner = (type: "success" | "error", text: string) => {
        if (type === "error") {
            showTopToast("error", text);
        } else {
            showTopToast("success", text);
        }
    };

    // if your QR sometimes encodes full URLs, extract the last path segment as the ref
    const extractRefFromText = (raw: string) => {
        try {
            const url = new URL(raw);
            const parts = url.pathname.split("/").filter(Boolean);
            return parts[parts.length - 1] ?? raw.trim();
        } catch {
            return raw.trim();
        }
    };

    // API call per scan
    const markTicket = async (rawText: string) => {
        const ref = extractRefFromText(rawText);
        try {
            // prevent re-entrancy while this request is in-flight
            handlingRef.current = true;

            const response = await authApi.post(`/userTicket/mark/${encodeURIComponent(ref)}`);

            // Some backends return 200 with { success:false } on logical errors—handle both
            if (response?.data?.success === false) {
                const desc = response?.data?.description || "Could not mark ticket";
                showBanner("error", desc);
            } else {
                showBanner("success", "Ticket marked as used");
                onResult?.(rawText);
            }
        } catch (e: any) {
            const status = e?.response?.data?.status as string | undefined;
            const desc = e?.response?.data?.description as string | undefined;

            if (status === "NOT_FOUND") {
                showBanner("error", "User Ticket Not Found");
            } else {
                showBanner("error", desc || e?.message || "Something went wrong");
            }
        } finally {
            window.setTimeout(() => {
                handlingRef.current = false;
            }, 200);
        }
    };

    useEffect(() => {
        if (!open) {
            stop();
            return;
        }

        if (!isCameraSupported()) {
            setError("Camera not supported in this browser");
            return;
        }
        if (!isSecureContext()) {
            setError("Camera requires HTTPS or localhost. Please use a secure connection.");
            return;
        }

        let cancelled = false;

        const start = async () => {
            setError(null);
            setStarting(true);

            try {
                const video = videoRef.current;
                if (!video) throw new Error("Video element not available");

                const reader = new BrowserMultiFormatReader();
                readerRef.current = reader;

                const constraints: MediaStreamConstraints = {
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                };

                controlsRef.current = await reader.decodeFromConstraints(constraints, video, (result, err) => {
                    if (!result) return;

                    const text = result.getText();
                    const now = Date.now();

                    // de-dupe identical scans for a brief window
                    if (text === lastTextRef.current && now - lastTsRef.current < DUP_WINDOW_MS) return;
                    if (handlingRef.current) return;

                    lastTextRef.current = text;
                    lastTsRef.current = now;

                    // ✅ call API (stream keeps running)
                    void markTicket(text);
                });

                if (cancelled) stop();
            } catch (e: any) {
                if (cancelled) return;
                console.error("Camera error:", e);
                let msg = "Unable to start camera.";
                if (e?.name === "NotAllowedError") msg = "Camera access denied. Please allow camera permissions and try again.";
                else if (e?.name === "NotFoundError") msg = "No camera found on this device.";
                else if (e?.name === "NotSupportedError") msg = "Camera not supported in this browser.";
                else if (e?.name === "NotReadableError") msg = "Camera is being used by another application.";
                else if (e?.message) msg = e.message;
                setError(msg);
            } finally {
                if (!cancelled) setStarting(false);
            }
        };

        const timer = window.setTimeout(start, 100);
        return () => {
            window.clearTimeout(timer);
            cancelled = true;
            stop();
        };
    }, [open, onResult, onOpenChange]);

    const stop = () => {
        try {
            controlsRef.current?.stop();
            controlsRef.current = null;

            if (readerRef.current) {
                // readerRef.current.reset();
                readerRef.current = null;
            }

            const video = videoRef.current;
            const stream = video?.srcObject as MediaStream | null;
            stream?.getTracks().forEach((t) => t.stop());
            if (video) {
                video.pause();
                video.srcObject = null;
            }
        } catch (e) {
            console.warn("Error during camera cleanup:", e);
        } finally {
            handlingRef.current = false;
            lastTextRef.current = null;
            lastTsRef.current = 0;

            if (bannerTimerRef.current) {
                window.clearTimeout(bannerTimerRef.current);
                bannerTimerRef.current = null;
            }
        }
    };

    const closeModal = () => {
        stop();
        onOpenChange(false);
    };

    const retryCamera = () => {
        setError(null);
        onOpenChange(false);
        setTimeout(() => onOpenChange(true), 100);
    };

    return (
        <>


            <Dialog
                open={open}
                onClose={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="absolute top-4 right-4 text-white cursor-pointer z-10" onClick={closeModal}>
                    <X size={30} />
                </div>

                <Dialog.Panel className="bg-white overflow-hidden w-full max-w-xl">
                    <div className="relative w-full aspect-[3/4] bg-black">
                        <video
                            ref={videoRef}
                            className="absolute inset-0 h-full w-full object-cover"
                            playsInline
                            muted
                            autoPlay
                        />

                        {/* scan frame overlay */}
                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <div className="w-[70%] aspect-square border-2 rounded-xl border-white/90 relative">
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white/90 rounded-tl-xl" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white/90 rounded-tr-xl" />
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white/90 rounded-bl-xl" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white/90 rounded-br-xl" />
                            </div>
                        </div>

                        {starting && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/95 bg-black/50 px-3 py-1 rounded-lg flex items-center gap-2">
                                <LoaderSmall /> <span>Starting camera…</span>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <div className="text-red-100 bg-red-600/90 px-4 py-3 rounded-lg text-sm max-w-[90%] text-center mb-4">
                                    {error}
                                </div>
                                {!error.includes("HTTPS") && !error.includes("not supported") && (
                                    <button
                                        onClick={retryCamera}
                                        className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </Dialog>
        </>
    );
}
