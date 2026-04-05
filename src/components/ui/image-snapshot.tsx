"use client"

import * as React from "react";
import { Plus, X } from "lucide-react";
import { authApi } from "@/lib/axios";
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
}

export const ImageSnapshots = ({
                                   initialImages = [],
                                   onImageAdd,
                                   setSubmitDisabled,
                                   onImageRemove,
                                   maxImages = 10,
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
        } catch (error: any) {
            showTopToast(
                "error",
                error?.response?.data?.description || "Upload failed. Please try again."
            );
            return null;
        }
    };

    // (kept) single add API, now uses helper
    const handleImageAdd = async (file: File) => {
        if (images.length >= maxImages) {
            showTopToast("error", `Maximum ${maxImages} images allowed`);
            return;
        }
        setIsUploading(true);
        setSubmitDisabled(true);
        const url = await uploadSingle(file);
        if (url) {
            const next = [...images, url];
            setImages(next);
            onImageAdd?.(next);
        }
        setIsUploading(false);
        setSubmitDisabled(false);
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
            <div className="w-full bg-background rounded-lg p-4">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/40 transition">
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
            <div className="w-full rounded-lg">
                <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-3">
                        {images.map((src, idx) => (
                            <div key={src} className="w-[60%] flex-none relative">
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
                            <div className="w-[60%] flex-none relative">
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
