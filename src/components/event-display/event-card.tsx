"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import { IoTicket } from "react-icons/io5";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { useSoundStore } from "@/store/sound-store";
import { getErrorMessage } from "@/lib/error-message";

interface EventTicket {
  price: number;
}

export interface EventSummary {
  id: string;
  title: string;
  city?: string | null;
  state?: string | null;
  startTime: string | Date;
  titleImage: string;
  coverVideo?: string | null;
  original?: boolean;
  tickets?: EventTicket[];
  numberOfPurchasedTickets?: number;
  isLikedByUser?: boolean;
}

interface EventCardProps extends React.ComponentProps<"div"> {
  event: EventSummary;
  currentPathUrl: string;
  isAuthenticated: boolean;
  variant?: "mobile" | "desktop";
}

export const EventCard = ({
  event,
  currentPathUrl,
  isAuthenticated,
  variant = "mobile",
  className,
  ...props
}: EventCardProps) => {
  const router = useRouter();
  const isDesktop = variant === "desktop";

  const [price, setPrice] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(event.isLikedByUser ?? false);
  const [isLikedLoading, setIsLikedLoading] = useState<boolean>(false);
  const [isPreviewExpanded, setPreviewExpanded] = useState(false);
  const [isPreviewPlaying, setPreviewPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInViewRef = useRef(false);
  const hoverDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isGlobalMuted, toggleGlobalMute, setActiveVideo, activeVideoId } = useSoundStore();
  const isActive = activeVideoId === event.id;
  const previewVideoUrl = event.coverVideo ?? null;

  useEffect(() => {
    if (!event.tickets?.length) {
      setPrice("");
      return;
    }

    const newPrice = event.tickets.reduce(
      (min, ticket) => (ticket.price < min ? ticket.price : min),
      Infinity
    );

    if (!Number.isFinite(newPrice)) {
      setPrice("");
    } else if (newPrice === 0) {
      setPrice("Free");
    } else {
      setPrice(newPrice.toString());
    }
  }, [event.tickets]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !previewVideoUrl) return;

    const source = video.querySelector("source");
    if (!source) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasInView = isInViewRef.current;
        isInViewRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          if (!source.src) {
            source.src = previewVideoUrl;
            video.load();
          }

          setActiveVideo(event.id);
        } else if (wasInView) {
          const currentActiveId = useSoundStore.getState().activeVideoId;
          if (currentActiveId === event.id) {
            setActiveVideo(null);
          }
        }
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: "-25% 0px -25% 0px",
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [event.id, previewVideoUrl, setActiveVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video
        .play()
        .then(() => setPreviewPlaying(true))
        .catch(() => {
          setPreviewPlaying(false);
          console.log("Video play failed");
        });
    } else {
      video.pause();
      setPreviewPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  useEffect(() => {
    return () => {
      if (hoverDelayRef.current) {
        clearTimeout(hoverDelayRef.current);
      }
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGlobalMute();
  };

  const handlePreviewEnter = () => {
    if (!isDesktop || !previewVideoUrl) return;

    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }

    hoverDelayRef.current = setTimeout(() => {
      setPreviewExpanded(true);
    }, 180);

    const video = videoRef.current;
    const source = video?.querySelector("source");
    if (!video || !source) return;

    if (!source.src) {
      source.src = previewVideoUrl;
      video.load();
    }

    setActiveVideo(event.id);
  };

  const handlePreviewLeave = () => {
    if (!isDesktop || !previewVideoUrl) return;

    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }

    setPreviewExpanded(false);
    setPreviewPlaying(false);

    const video = videoRef.current;
    const source = video?.querySelector("source");
    if (video && source) {
      video.pause();
      video.currentTime = 0;
      source.removeAttribute("src");
      video.load();
    }

    if (useSoundStore.getState().activeVideoId === event.id) {
      setActiveVideo(null);
    }
  };

  const openEvent = () => {
    router.push(
      `${isDesktop ? "/event" : "/m/events"}/${event.id}?prev=${encodeURIComponent(
        currentPathUrl
      )}`
    );
  };

  const dt = new Date(event.startTime);
  const formatted = dt.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleReaction = async () => {
    if (isLikedLoading) return;

    setIsLikedLoading(true);
    const likedState = isLiked;

    try {
      setIsLiked(!likedState);
      await authApi.post(`/reaction/react`, {
        reactionType: "EVENT",
        eventId: event.id,
      });
    } catch (err: unknown) {
      showTopToast("error", getErrorMessage(err, "Unable to update reaction"));
      setIsLiked(likedState);
    } finally {
      setIsLikedLoading(false);
    }
  };

  const eventCity = event.city || "Location TBA";

  return (
    <div
      className={cn(
        isDesktop
          ? cn(
              "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 ease-out motion-reduce:transition-none",
              previewVideoUrl && "hover:z-40 focus-within:z-40",
              isPreviewExpanded && "z-40 scale-[1.1] shadow-2xl shadow-black/20"
            )
          : "flex flex-col border-none",
        className
      )}
      {...props}
    >
      <div className={cn("flex w-full flex-col", isDesktop ? "gap-0" : "gap-1 rounded-lg")}>
        <div
          ref={containerRef}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          onFocus={handlePreviewEnter}
          onBlur={handlePreviewLeave}
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            isDesktop ? "aspect-[4/3]" : "max-h-[75vh]"
          )}
        >
          {previewVideoUrl ? (
            <video
              ref={videoRef}
              className={cn(
                "h-full w-full object-cover",
                isDesktop && "transition duration-300 group-hover:scale-105 motion-reduce:transition-none",
                !isDesktop && "rounded-lg"
              )}
              preload="none"
              muted={isGlobalMuted}
              playsInline
              loop
              controls={false}
              poster={event.titleImage}
              onClick={openEvent}
            >
              <source data-src={previewVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={event.titleImage}
              alt={event.title}
              width={800}
              height={500}
              className={cn(
                "w-full object-cover",
                isDesktop ? "h-full transition duration-300 group-hover:scale-105" : "h-auto rounded-lg"
              )}
              style={isDesktop ? undefined : { maxHeight: "75vh" }}
              onClick={openEvent}
            />
          )}

          {event.original && (
            <div className="absolute left-3 top-4 rounded-full bg-background/95 px-3 py-2 text-xs font-semibold text-foreground shadow-md">
              Drifto Original
            </div>
          )}

          {previewVideoUrl && isDesktop && !isPreviewPlaying && (
            <div className="absolute bottom-3 right-3 rounded-full bg-neutral-900/85 p-2 text-white shadow-lg">
              <Video size={16} aria-hidden="true" />
            </div>
          )}

          {previewVideoUrl && (!isDesktop || isPreviewPlaying) && (
            <div className={cn("absolute bottom-0 pt-6 pb-4", isDesktop ? "right-0 pr-3" : "left-0 pr-6 pl-2")}>
              <button
                className="rounded-full bg-neutral-800 p-2 text-white opacity-90 z-90"
                onClick={handleToggleMute}
                type="button"
                aria-label={isGlobalMuted ? "Unmute preview" : "Mute preview"}
              >
                {isGlobalMuted ? (
                  <HiVolumeOff size={16} />
                ) : (
                  <HiVolumeUp size={16} />
                )}
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div
              className="absolute right-2 top-3 z-1000 h-15 w-15 p-3"
              onClick={handleReaction}
            >
              <button
                className="absolute right-2 top-3 rounded-full bg-neutral-800 p-2 text-white opacity-90 z-90"
                disabled={isLikedLoading}
                type="button"
              >
                {isLiked ? (
                  <FaHeart
                    size={20}
                    className="text-red-500 animate-[heartBeat_0.3s_ease-in-out]"
                    style={{
                      animation: "heartBeat 0.2s ease-in-out",
                    }}
                  />
                ) : (
                  <IoMdHeartEmpty size={20} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className={cn(isDesktop ? "p-4" : "")}>
          <button type="button" onClick={openEvent} className="block w-full text-left">
            <h3 className={cn("font-semibold capitalize", isDesktop ? "line-clamp-2 text-base leading-6" : "mt-2 text-lg")}>
              {event.title}
            </h3>
          </button>

          <p className={cn("flex flex-row items-center gap-2 text-sm text-gray-500", isDesktop && "mt-2 flex-wrap")}>
            {formatted} at
            <span className="capitalize font-semibold">{eventCity}</span>
            <span className="flex flex-row items-center gap-1">
              <IoTicket size={12} />
              {event.numberOfPurchasedTickets ?? 0}
            </span>
          </p>

          {isDesktop && price && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                From
              </span>
              <span className="text-base font-black text-foreground">
                {price === "Free" ? price : "₦ " + price}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isDesktop && price && (
        <div className="mt-2 flex w-full items-center justify-end text-md font-bold text-neutral-500">
          {price === "Free" ? price : "₦ " + price}
        </div>
      )}
    </div>
  );
};
