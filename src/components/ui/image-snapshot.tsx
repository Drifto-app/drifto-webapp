"use client"

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import {cn, MAX_IMAGE_SIZE, uploadMedia} from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LoaderSmall } from "@/components/ui/loader";
import { showTopToast } from "@/components/toast/toast-util";
import {ChangeEvent, useState} from "react";

interface ImageSnapshotsProps {
    initialImages?: string[];
    onImageAdd?: (images: string[]) => void;
    onImageRemove?: (images: string[]) => void;
    maxImages?: number;
    setSubmitDisabled: (loading: boolean) => void;
    variant?: "mobile" | "desktop";
    className?: string;
}

export const ImageSnapshots = ({
                                   initialImages = [],
                                   onImageAdd,
                                   setSubmitDisabled,
                                   onImageRemove,
                                   maxImages = 10,
                                   variant = "mobile",
                                   className,
                               }: ImageSnapshotsProps) => {
    const [images, setImages] = useState<string[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const uploadSingle = async (file: File): Promise<string | null> => {
        try {
            const response = await uploadMedia(file, "EVENT_SCREENSHOT")

            if (!response) {
                showTopToast("error", "Upload failed.");
                return null;
            }

            return response ?? null;
        } catch {
            showTopToast(
                "error",
                "Upload failed. Please try again."
            );
            return null;
        }
    };

    // NEW: batch add multiple files at once
    const handleImagesAddMany = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const all = Array.from(files);
        const imageFiles = all.filter((file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE);

        if (imageFiles.length === 0) {
            showTopToast("error", "Please select valid image files");
            return;
        }

        const slots = Math.max(0, maxImages - images.length);
        if (slots === 0) {
            showTopToast("error", `Maximum ${maxImages} images allowed`);
            return;
        }

        const toUpload = imageFiles.slice(0, slots);
        if (toUpload.length < imageFiles.length) {
            showTopToast(
                "error",
                `Only ${slots} more image${slots === 1 ? "" : "s"} allowed (extra file${
                    imageFiles.length - slots === 1 ? "" : "s"
                } ignored).`
            );
        }

        setIsUploading(true);
        setSubmitDisabled(true);

        const uploaded: string[] = [];

        for (const f of toUpload) {
            const url = await uploadSingle(f);
            if (url) uploaded.push(url);
        }

        if (uploaded.length > 0) {
            const next = [...images, ...uploaded];
            setImages(next);
            onImageAdd?.(next);
        }

        setIsUploading(false);
        setSubmitDisabled(false);
    };

    // Remove handler
    const handleImageRemove = (url: string) => {
        const next = images.filter((i) => i !== url);
        setImages(next);
        onImageRemove?.(next);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        handleImagesAddMany(files);
        e.target.value = "";
    };

    // Modal
    const openModal = (src: string) => {
        setActiveImage(src);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveImage(null);
    };

    if (images.length === 0 && !isUploading) {
        return (
            <div className={cn("w-full rounded-lg bg-background p-4", className)}>
                <label className={cn(
                    "flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition hover:bg-accent/40",
                    variant === "desktop" ? "h-36" : "h-48",
                )}>
                    <Plus className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-gray-500">Add Snapshot</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                    0 of {maxImages} snapshots
                </p>
            </div>
        );
    }

    return (
        <>
            <div className={cn("w-full min-w-0 rounded-lg", className)}>
                <div
                    className={cn(
                        "w-full min-w-0 overflow-x-auto overscroll-x-contain",
                        variant === "mobile" && "no-scrollbar",
                    )}
                >
                    <div className="flex w-max min-w-full gap-3 pb-2">
                        {images.map((src, idx) => (
                            <div key={src} className={cn("relative flex-none", variant === "desktop" ? "w-48" : "w-[60%]")}>
                                <Card
                                    className="overflow-hidden cursor-pointer py-0"
                                    onClick={() => openModal(src)}
                                >
                                    <CardContent className="p-0">
                                        <AspectRatio ratio={4 / 3}>
                                            <Image
                                                src={src}
                                                alt={`Snapshot ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </AspectRatio>
                                    </CardContent>
                                </Card>

                                <button
                                    className={cn(
                                        "absolute top-2 right-2 rounded-full bg-neutral-800 p-1 opacity-60 ",
                                        "text-white"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageRemove(src);
                                    }}
                                    aria-label="Remove image"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        ))}

                        {/* Add-button slide */}
                        {images.length < maxImages && (
                            <div className={cn("relative flex-none", variant === "desktop" ? "w-48" : "w-[60%]")}>
                                <Card className="overflow-hidden p-0">
                                    <CardContent className="p-0">
                                        <AspectRatio ratio={4 / 3}>
                                            <label
                                                className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/40 transition">
                                                {isUploading ? (
                                                    <LoaderSmall />
                                                ) : (
                                                    <>
                                                        <Plus className="w-10 h-10 text-gray-400 mb-2" />
                                                        <span className="text-gray-500">Add Snapshot</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    disabled={isUploading}
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                        </AspectRatio>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    {images.length} of {maxImages} snapshots
                </p>
            </div>

            <Dialog
                open={modalOpen}
                onClose={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
                {/* Close */}
                <div
                    className="absolute top-4 right-4 text-white cursor-pointer"
                    onClick={closeModal}
                >
                    <X size={30} />
                </div>

                <Dialog.Panel className="bg-background overflow-hidden w-full max-h-[95%]">
                    {activeImage && (
                        <Image
                            src={activeImage}
                            alt="Snapshot"
                            width={800}
                            height={600}
                            className="object-contain w-full h-auto"
                        />
                    )}
                </Dialog.Panel>
            </Dialog>
        </>
    );
};
