"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FaHeart, FaHotjar, FaRegCalendar } from "react-icons/fa";
import { IoMdHeartEmpty, IoMdSearch } from "react-icons/io";
import { IoLocationOutline, IoPizzaOutline, IoShareSocialOutline } from "react-icons/io5";
import { Download, QrCode, Pencil, Trash2, Share2 } from "lucide-react";
import { EventSingleContent, EventSingleContentText } from "@/components/ui/content";
import { TbTicketOff } from "react-icons/tb";
import { HiMiniUsers } from "react-icons/hi2";
import { SnapshotCarousel } from "@/components/event-page/image-silder";
import { authApi } from "@/lib/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { UserEventSinglePlaceholder } from "@/components/ui/user-placeholder";
import { MdCancel } from "react-icons/md";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "next/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShare } from "@/hooks/share-option";
import { ShareDialog } from "@/components/share-button/share-option";
import { showTopToast } from "@/components/toast/toast-util";
import { CoverVideoSection } from "./cover-video-section";
import { useAuthStore } from '@/store/auth-store';
import { ReportDrawer } from "@/components/report/report-drawer";

interface SingleEventDetailsProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    isCoHost: boolean;
    setActiveScreen?: (activeScreen: string, title?: string) => void;
}

export const SingleEventDetails = ({
    event, setActiveScreen, isCoHost, className, ...props
}: SingleEventDetailsProps) => {
    const router = useRouter();

    const { isAuthenticated } = useAuthStore();

    const [isLiked, setIsLiked] = useState<boolean>(event.isLikedByUser);
    const [isLikedLoading, setIsLikedLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeSrc, setActiveSrc] = React.useState<string | null>(null);
    const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Export event bookings as CSV
    const handleExportCSV = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            const response = await authApi.post(`/userTicket/event/${event.id}/export`, {}, {
                responseType: 'blob'
            });

            // Create a blob and download it
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_bookings.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showTopToast("success", "Booking data exported successfully!");
        } catch (err: any) {
            showTopToast("error", err.response?.data?.message || err.message || "Failed to export booking data");
        } finally {
            setIsExporting(false);
        }
    };

    // Delete event handler
    const handleEventDelete = async () => {
        setIsDeleting(true);
        try {
            await authApi.delete(`/event/${event.id}`);
            showTopToast("success", "Event deleted successfully!");
            router.push("/?screen=plans");
        } catch (err: any) {
            showTopToast("error", err.response?.data?.message || err.message || "Failed to delete event");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const startDate = new Date(event.startTime);
    const stopDate = new Date(event.stopTime);
    const formattedStartDate = startDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const formattedStopDate = stopDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });


    const formattedStartTime = startDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    const formattedStopTime = stopDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    let eventDisplayDetails: {
        icon: React.ReactNode
        value: string
        description: string
    } = {
        icon: <IoPizzaOutline size={22} />,
        value: event.eventDisplayStatus,
        description: `This event is now ${event.eventDisplayStatus}`
    }

    const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/event/${event.slug}`;
    const {
        isShareDialogOpen,
        closeShareDialog,
        handleQuickShare,
    } = useShare({
        title: event.title,
        url: eventUrl,
        description: event.description
    });

    const openModal = (src: string) => {
        setActiveSrc(src);
        setIsOpen(true);
    };
    const closeModal = () => setIsOpen(false);

    const handleReaction = async () => {
        if (isLikedLoading) return;

        setIsLikedLoading(true);

        try {
            setIsLiked(!isLiked);
            await authApi.post(`/reaction/react`, {
                reactionType: "EVENT",
                eventId: event.id,
            })
        } catch (err: any) {
            showTopToast("error", err.message);
            setIsLiked(!isLiked);
        } finally {
            setIsLikedLoading(false);
        }
    }

    if (event.eventDisplayStatus === "ACTIVE") {
        eventDisplayDetails = {
            icon: <IoPizzaOutline size={22} />,
            value: "active",
            description: `Tickets are now available`
        }
    } else if (event.eventDisplayStatus === "HOT") {
        eventDisplayDetails = {
            icon: <FaHotjar size={16} className="text-orange-600" />,
            value: "hot",
            description: `Tickets are almost sold out`
        }
    } else if (event.eventDisplayStatus === "SOLD_OUT") {
        eventDisplayDetails = {
            icon: <TbTicketOff size={18} className="text-red-600" />,
            value: "sold out",
            description: `Tickets are sold out`
        }
    }

    if (isCoHost) {
        return (
            <>
                <div className={cn(
                    "w-full px-4",
                    className,
                )} {...props}>
                    <div className="w-full flex flex-col items-center gap-6 pt-5 pb-25">
                        {/* Event Image */}
                        <div className="relative w-full max-h-[40vh] overflow-hidden rounded-lg" onClick={() => openModal(event.titleImage)}>
                            <Image
                                src={event.titleImage}
                                alt={event.title}
                                width={800}
                                height={500}
                                className="w-full h-auto rounded-lg object-cover"
                                style={{ maxHeight: '40vh' }}
                                loading="eager"
                            />

                            {event.original && (
                                <div className="absolute top-4 left-2 rounded-full py-2 px-2 text-xs shadow-md font-semibold bg-white">
                                    Drifto Original
                                </div>
                            )}
                        </div>

                        {/* Horizontal Action Buttons */}
                        <div className="w-full overflow-x-auto no-scrollbar">
                            <div className="flex flex-row gap-3 pb-2">
                                {/* Scan Tickets Button */}
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-full text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 transition-colors whitespace-nowrap"
                                    onClick={() => setActiveScreen!("tickets")}
                                >
                                    <QrCode size={18} />
                                    Scan tickets
                                </button>

                                {/* Share Event Button */}
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-full text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 transition-colors whitespace-nowrap"
                                    onClick={handleQuickShare}
                                >
                                    <Share2 size={18} />
                                    Share event
                                </button>

                                {/* Edit Event Button */}
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-full text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setActiveScreen!("edit")}
                                    disabled={new Date(event.stopTime) < new Date(Date.now())}
                                >
                                    <Pencil size={18} />
                                    Edit event
                                </button>

                                {/* Export CSV Button */}
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-full text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 transition-colors whitespace-nowrap disabled:opacity-50"
                                    onClick={handleExportCSV}
                                    disabled={isExporting}
                                >
                                    <Download size={18} className={isExporting ? "animate-pulse" : ""} />
                                    {isExporting ? "Exporting..." : "Export CSV"}
                                </button>

                                {/* Delete Event Button - Only show for HOST */}
                                {new Date(event.stopTime) > new Date(Date.now()) && event.hostCollaborationStatus === "HOST" && (
                                    <button
                                        className="flex items-center gap-2 px-4 py-2.5 border border-red-300 rounded-full text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors whitespace-nowrap"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogContent className="w-full max-w-sm sm:rounded-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-lg">Delete Event</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Are you sure you want to delete this event? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="w-full flex flex-row sm:justify-between justify-between gap-3">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={isDeleting}
                                            className="flex-1 text-base py-6 bg-neutral-300 font-semibold"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        onClick={handleEventDelete}
                                        disabled={isDeleting}
                                        className="flex-1 text-base py-6 bg-red-500 hover:bg-red-600 text-white font-semibold"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <EventSingleContentText isLine={false} headText={"Event Title:"} className="shadow-xl">
                            <h1 className="capitalize font-black text-3xl w-full text-neutral-400">{event.title}</h1>
                        </EventSingleContentText>
                        <EventSingleContentText isLine={false} headText={"Location:"} className="shadow-xl">
                            <p className="capitalize font-black text-base w-full text-neutral-400">
                                {`${event.address}, ${event.city}, ${event.state}`}
                            </p>
                        </EventSingleContentText>
                        <EventSingleContentText isLine={false} headText={"Event Time:"} className="shadow-xl items-start">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-neutral-400">{formattedStartDate} - {formattedStopDate}</p>
                                <p className="text-sm font-medium text-neutral-400">{formattedStartTime} - {formattedStopTime}</p>
                            </div>
                        </EventSingleContentText>
                        <EventSingleContentText
                            headText="Event Stats:"
                            className="space-y-2 items-start shadow-xl"
                            isLine={false}
                        >
                            <div className="w-full flex flex-row gap-1 justify-between px-6 sm:px-20">
                                <div className="w-full flex flex-col gap-1 items-center cursor-pointer" onClick={() => router.push(
                                    `/m/comment/${event.id}` +
                                    `?prev=${encodeURIComponent(`/m/events/${event.id}`)}` +
                                    `&type=EVENT`
                                )}>
                                    <p className="font-semibold text-neutral-800 text-2xl">
                                        {event.totalComments}
                                    </p>
                                    <p className="text-md text-neutral-400">
                                        comments
                                    </p>
                                </div>
                                <div className="w-full flex flex-col gap-1 items-center cursor-pointer" onClick={() => router.push(
                                    `/m/reaction/${event.id}` +
                                    `?prev=${encodeURIComponent(`/m/events/${event.id}`)}` +
                                    `&type=EVENT`
                                )}>
                                    <p className="font-semibold text-neutral-800 text-2xl">
                                        {event.totalLikes}
                                    </p>
                                    <p className="text-md text-neutral-400">
                                        likes
                                    </p>
                                </div>
                                <div className="w-full flex flex-col gap-1 items-center cursor-pointer" onClick={() => setActiveScreen!("event-earnings")}>
                                    <p className="font-semibold text-neutral-800 text-2xl">
                                        {event.tickets.reduce((min: number, ticket: { purchasedQuantity: number }) => {
                                            return ticket.purchasedQuantity
                                        }, 0)}
                                    </p>
                                    <p className="text-md text-neutral-400">
                                        tickets sold
                                    </p>
                                </div>
                            </div>
                        </EventSingleContentText>
                        <EventSingleContentText
                            headText="Event Tags"
                            className="space-y-2 items-start shadow-xl"
                            isLine={false}
                        >
                            <div className="flex flex-wrap gap-2">
                                {event.eventTags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="inline-block text-sm font-semibold px-3 py-1 bg-neutral-950 text-white rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </EventSingleContentText>
                        <EventSingleContentText isLine={false} headText={"Minimum Age:"} className="shadow-xl items-start">
                            <h2 className="text-xl font-semibold text-neutral-400">
                                {event.ageRestricted ? event.minimumAge : "No age restrictions"}
                            </h2>
                        </EventSingleContentText>
                        <EventSingleContentText isLine={false} headText="Event Description" className="flex-col shadow-xl">
                            <p className="text-sm w-full text-left text-neutral-400 font-semibold">{event.description}</p>
                        </EventSingleContentText>
                        <EventSingleContentText headText={"Event Screenshots"} isLine={false} className="flex-col shadow-xl">
                            <SnapshotCarousel snapshots={event.screenshots} />
                        </EventSingleContentText>
                        <CoverVideoSection
                            coverVideo={event.coverVideo}
                            poster={event.titleImage}
                            className="shadow-xl"
                        />
                        <EventSingleContentText isLine={false} headText="Hosts" className="flex-col items-start shadow-xl">
                            {event.coHosts.map((coHost: { [key: string]: any }, i: number) => (
                                <UserEventSinglePlaceholder
                                    user={coHost}
                                    key={coHost.id}
                                    isHost={(i + 1) === event.coHosts.length}
                                    prev={`/m/events/${event.id}`}
                                />
                            ))}
                            {event.hostCollaborationStatus == "HOST" && (
                                <div className="w-full flex flex-row gap-8 items-center text-sm text-black my-4 overflow-x-auto no-scrollbar px-2 ">
                                    <p
                                        className="whitespace-nowrap font-bold underline-offset-3 cursor-pointer  transition-colors px-4 py-2 border-1 border-neutral-400 rounded-full"
                                        onClick={() => setActiveScreen!('co-host-manage')}
                                    >
                                        Manage Co-Host
                                    </p>
                                    <p
                                        className="whitespace-nowrap font-bold underline-offset-3 cursor-pointer  transition-colors px-4 py-2 border-1 border-neutral-400 rounded-full"
                                        onClick={() => setActiveScreen!('host-invites')}
                                    >
                                        See All Host Invites
                                    </p>
                                    <p
                                        className="whitespace-nowrap font-bold underline-offset-3 cursor-pointer  transition-colors px-4 py-2 border-1 border-neutral-400 rounded-full"
                                        onClick={() => setActiveScreen!('referral-manage')}
                                    >
                                        Manage Referral
                                    </p>
                                </div>

                            )}
                        </EventSingleContentText>
                    </div>
                </div>

                <ShareDialog
                    isOpen={isShareDialogOpen}
                    onClose={closeShareDialog}
                    title={event.title}
                    url={eventUrl}
                    description={event.description}
                />

                <HeadlessDialog
                    open={isOpen}
                    onClose={closeModal}
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <div className="absolute top-4 right-4" onClick={closeModal}>
                        <MdCancel size={24} className="text-white" />
                    </div>
                    <HeadlessDialog.Panel className="bg-white overflow-hidden w-full max-h-[95%]">
                        {activeSrc && (
                            <Image
                                src={activeSrc}
                                alt="Snapshot"
                                width={800}
                                height={600}
                                className="object-contain w-full h-auto"
                            // style={{ maxHeight: "95vh" }}
                            />
                        )}
                    </HeadlessDialog.Panel>
                </HeadlessDialog>
            </>
        )
    }

    return (
        <>
            <div className={cn(
                "w-full px-4",
                className,
            )} {...props}>
                <div className="w-full py-4 flex flex-col items-center gap-4 pt-5 pb-25">
                    <div className="relative w-full max-h-[40vh] overflow-hidden rounded-lg">
                        <Image
                            src={event.titleImage}
                            alt={event.title}
                            width={800}
                            height={500}
                            className="w-full h-auto rounded-lg object-cover"
                            style={{ maxHeight: '40vh' }}
                        />

                        {event.original && (
                            <div className="absolute top-4 left-2 rounded-full py-2 px-2 text-xs shadow-md font-semibold bg-white">
                                Drifto Original
                            </div>
                        )}

                        <div className="absolute top-3 right-2 flex flex-row gap-3">
                            {isAuthenticated &&
                                <button className=" text-white rounded-full bg-neutral-800 p-2 opacity-90" onClick={handleReaction} disabled={isLikedLoading}>
                                    {isLiked ? (
                                        <FaHeart
                                            size={25}
                                            className="text-red-500 animate-[heartBeat_0.3s_ease-in-out]"
                                            style={{
                                                animation: 'heartBeat 0.2s ease-in-out'
                                            }}
                                        />
                                    ) : (
                                        <IoMdHeartEmpty size={25} />
                                    )}
                                </button>
                            }
                            <button
                                className="text-white rounded-full bg-neutral-800 p-2 opacity-90"
                                onClick={handleQuickShare}
                            >
                                <IoShareSocialOutline size={20} />
                            </button>
                        </div>
                    </div>


                    <h1 className="capitalize font-black text-xl w-full text-neutral-950">{event.title}</h1>
                    <EventSingleContent>
                        <FaRegCalendar size={15} />
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-neutral-500">{formattedStartDate} - {formattedStopDate}</p>
                            <p className="text-sm font-medium text-neutral-500">{formattedStartTime} - {formattedStopTime}</p>
                        </div>
                    </EventSingleContent>
                    <EventSingleContent>
                        <IoLocationOutline size={22} />
                        {event.locationSecure && !event.address ? (
                            <p className="font-semibold text-sm capitalize">
                                <span className="text-blue-500">Purchase ticket to see full location: </span>
                                {`${event.city}, ${event.state}`}
                            </p>
                        ) :
                            <p className="font-semibold text-sm">
                                {`${event.address}, ${event.city}, ${event.state}`}
                            </p>
                        }
                    </EventSingleContent>
                    <EventSingleContent>
                        {eventDisplayDetails.icon}
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold normal-case">This event is {eventDisplayDetails.value}</p>
                            <p className="text-sm font-medium text-neutral-400">{eventDisplayDetails.description}</p>
                        </div>
                    </EventSingleContent>
                    {event.ageRestricted && (
                        <EventSingleContent>
                            <HiMiniUsers size={22} />
                            <p className="font-semibold text-sm">This event is suitable for ages {event.minimumAge} and above</p>
                        </EventSingleContent>
                    )}
                    <EventSingleContentText
                        headText="Event Vibe"
                        className="flex flex-col space-y-2 items-start"
                    >
                        <div className="flex flex-wrap gap-2">
                            {event.eventTags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="inline-block text-sm font-semibold px-3 py-1 bg-neutral-950 text-white rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </EventSingleContentText>
                    <EventSingleContentText headText="About" className="flex-col">
                        <p className="text-sm w-full text-left">{event.description}</p>
                    </EventSingleContentText>
                    <EventSingleContentText headText="Snapshots" className="flex-col">
                        <SnapshotCarousel snapshots={event.screenshots} />
                    </EventSingleContentText>
                    <CoverVideoSection
                        coverVideo={event.coverVideo}
                        poster={event.titleImage}
                        className="flex-col"
                    />
                    <EventSingleContentText headText="Hosted By" className="flex-col items-start">
                        {event.coHosts.map((coHost: { [key: string]: any }, i: number) => (
                            <UserEventSinglePlaceholder
                                user={coHost}
                                key={coHost.id}
                                isHost={(i + 1) === event.coHosts.length}
                                prev={`/m/events/${event.id}`} />
                        ))}
                    </EventSingleContentText>
                    {isAuthenticated &&
                        <div
                            className="text-red-600 font-semibold underline w-full text-center py-2 cursor-pointer"
                            onClick={() => setIsReportDrawerOpen(true)}
                        >
                            Report Event
                        </div>
                    }
                </div>
            </div>

            <ShareDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                title={event.title}
                url={eventUrl}
                description={event.description}
            />

            <ReportDrawer
                isOpen={isReportDrawerOpen}
                onClose={() => setIsReportDrawerOpen(false)}
                entityType="EVENT"
                eventId={event.id}
            />
        </>
    )
}