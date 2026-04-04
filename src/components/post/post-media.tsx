"use client";

import {useEffect, useRef, useState} from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import {X} from "lucide-react";
import * as React from "react";
import {Dialog} from "@headlessui/react";
import {FaPlay} from "react-icons/fa";

interface MediaFile {
    mediaFileType: string;
    url: string;
    fileType: "IMAGE" | "VIDEO";
}

export const MediaCarousel = ({
                                  mediaFiles, itemClickAction
                              }: {
    mediaFiles: MediaFile[],
    itemClickAction: (index: number) => void
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    if (!mediaFiles || mediaFiles.length === 0) return null;

    const isMulti = mediaFiles.length > 1;

    const nextSlide = () => {
        if (currentIndex < mediaFiles.length - 1) {
            setCurrentIndex((p) => (p + 1));
        }
    }
    const prevSlide = () => {
        if(currentIndex > 0) {
            setCurrentIndex((p) => (p - 1))
        }
    };;
    const goToSlide = (i: number) => setCurrentIndex(i);

    const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(0); setTouchStart(e.targetTouches[0].clientX); };
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50 && isMulti) nextSlide();
        if (distance < -50 && isMulti) prevSlide();
    };

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    "relative overflow-hidden rounded-md bg-muted",
                    isMulti ? "h-80" : "" // fixed height only when multiple
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => itemClickAction(currentIndex)}
            >
                <div
                    className={cn(
                        "flex transition-transform duration-300 ease-in-out cursor-pointer",
                        isMulti ? "h-full" : ""
                    )}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {mediaFiles.map((media, index) => (
                        <div
                            key={index}
                            className={cn(
                                "w-full flex-shrink-0",
                                isMulti ? "h-full" : "max-h-[60vh]"
                            )}
                        >
                            {media.fileType === "IMAGE" ? (
                                isMulti ? (
                                    // MULTI: fixed height + cover
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={media.url}
                                            alt={`Media ${index + 1}`}
                                            fill
                                            className="object-cover rounded-lg"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <Image
                                        src={media.url}
                                        alt={`Media ${index + 1}`}
                                        style={{ maxHeight: "60vh" }}
                                        width={800}
                                        height={500}
                                        className="object-cover rounded-lg w-full h-auto"
                                        loading="lazy"
                                    />
                                )
                            ) : (
                                isMulti ? (
                                    <video
                                        className="w-full h-full object-cover rounded-lg"
                                        src={media.url}
                                        controls={false}
                                        muted
                                        playsInline
                                    >
                                        <source src={media.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <AspectRatio ratio={16 / 9}>
                                        <video
                                            className="w-full h-full object-cover rounded-lg"
                                            src={media.url}
                                            controls={false}
                                            muted
                                            playsInline
                                        >
                                            <source src={media.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </AspectRatio>
                                )
                            )}

                            {media.fileType === "VIDEO" && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 rounded-full p-3">
                                        <FaPlay size={25} className="text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isMulti && (
                <div className="flex justify-center mt-3 gap-2">
                    {mediaFiles.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "w-[6px] h-[6px] rounded-full transition-colors",
                                index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const MediaDialog = ({
                                mediaFiles,
                                initialIndex = 0,
                                isOpen,
                                onClose
                            }: {
    mediaFiles: any[],
    initialIndex?: number,
    isOpen: boolean,
    onClose: () => void,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [loadedMedia, setLoadedMedia] = useState(new Set<number>());

    const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

    const isMulti = mediaFiles.length > 1;

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Play/pause logic — only active slide plays (if video)
    useEffect(() => {
        if (!isOpen) return;
        videoRefs.current.forEach((v, i) => {
            if (!v) return;
            if (i === currentIndex) {
                v.muted = true;
                v.load();
                v.play().catch(() => { });
            } else {
                v.pause();
                v.currentTime = 0;
            }
        });
    }, [currentIndex, isOpen]);

    useEffect(() => {
        if (isOpen) return;
        videoRefs.current.forEach(v => {
            if (!v) return;
            v.pause();
            v.currentTime = 0;
        });
    }, [isOpen]);

    // Preload current and adjacent images
    useEffect(() => {
        if (isOpen) preloadAdjacentMedia();
    }, [currentIndex, isOpen]);

    const preloadAdjacentMedia = () => {
        const indicesToLoad = [
            currentIndex,
            currentIndex > 0 ? currentIndex - 1 : mediaFiles.length - 1,
            currentIndex < mediaFiles.length - 1 ? currentIndex + 1 : 0
        ];

        indicesToLoad.forEach(index => {
            const media = mediaFiles[index];
            if (media && media.fileType === "IMAGE" && !loadedMedia.has(index)) {
                const img = new window.Image();
                img.onload = () => {
                    setLoadedMedia(prev => new Set([...prev, index]));
                };
                img.src = media.url;
            }
        });
    };

    if (!isOpen || !mediaFiles || mediaFiles.length === 0) return null;

    const nextSlide = () => {
        if(currentIndex < (mediaFiles.length - 1)) {
            setCurrentIndex((prev) => (prev + 1))
        }
    };
    const prevSlide = () => {
        if(currentIndex > 0) {
            setCurrentIndex((prev) => (prev - 1))
        }
    };
    const goToSlide = (index: number) => setCurrentIndex(index);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50 && isMulti) nextSlide();
        if (distance < -50 && isMulti) prevSlide();
    };

    const handleCloseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    };

    // Handle backdrop click (clicking outside content should close)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDotClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(index);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/95"
        >
            {/* Close button with proper event handling */}
            <button
                className="absolute top-4 right-4 text-white z-50 rounded-full p-2 hover:bg-background/10 transition-colors"
                onClick={handleCloseClick}
                aria-label="Close"
                type="button"
            >
                <X size={24} />
            </button>

            <Dialog.Panel className="w-full h-full flex items-center justify-center" onClick={handleBackdropClick}>
                <div
                    className={cn(
                        "relative w-full",
                        isMulti ? "h-120 max-w-6xl" : "max-w-7xl max-h-[90vh]"
                    )}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
                >
                    <div
                        className="flex transition-transform duration-300 ease-in-out w-full h-full"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {mediaFiles.map((media, index) => (
                            <div
                                key={media.url ?? index}
                                className="w-full h-full flex-shrink-0 flex items-center justify-center relative"
                            >
                                {media.fileType === "IMAGE" ? (
                                    isMulti ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={media.url}
                                                alt={`Media ${index + 1}`}
                                                fill
                                                className="object-contain w-full"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                                priority={Math.abs(index - currentIndex) <= 1}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <Image
                                                src={media.url}
                                                alt={`Media ${index + 1}`}
                                                width={1600}
                                                height={1200}
                                                className="object-contain w-full h-auto max-h-full max-w-full"
                                                style={{ maxHeight: '85vh' }}
                                                priority
                                            />
                                        </div>
                                    )
                                ) : (
                                    <video
                                        ref={(el) => { videoRefs.current[index] = el; }}
                                        src={media.url}
                                        className={cn(
                                            "object-contain",
                                            isMulti ? "w-full h-full" : "max-w-full max-h-[90vh]"
                                        )}
                                        controls
                                        controlsList="nodownload noplaybackrate nofullscreen"
                                        playsInline
                                        autoPlay={index === currentIndex}
                                        preload={Math.abs(index - currentIndex) <= 1 ? "metadata" : "none"}
                                    >
                                        <source src={media.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isMulti && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {mediaFiles.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleDotClick(e, index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    index === currentIndex ? "bg-background" : "bg-background/50 hover:bg-background/75"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                                type="button"
                            />
                        ))}
                    </div>
                )}
            </Dialog.Panel>
        </Dialog>
    );
};

