/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cn } from "@/lib/utils";
import { CoverImageUploader } from "@/components/ui/cover-image";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationSearchDialog } from "@/components/event-page/location-search-dialog";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/event-page/date-time-input";
import { ImageSnapshots } from "@/components/ui/image-snapshot";
import { EventTagDialog } from "@/components/event-page/event-tag-edit";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/event-page/edit-ticket-card";
import { NewTicketCard } from "@/components/event-page/new-ticket-card";
import { authApi } from "@/lib/axios";
import { LoaderSmall } from "@/components/ui/loader";
import { showTopToast } from "@/components/toast/toast-util";
import { EventThemeSelector } from "@/components/event-page/event-theme";
import { CoverVideoUploader } from '@/components/ui/cover-video';
import { DEFAULT_EVENT_THEME, EventThemeColors, getEventThemeBackground, isEventThemeLight } from '@/lib/event-theme';
import { useTheme } from "next-themes";
import { CalendarDays, ImageIcon, MapPin, Save, Settings2, Tags, Ticket } from "lucide-react";

interface EventEditProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    setEvent: (event: { [key: string]: any }) => void;
    setMainActiveScreen: (activeScreen: string, title?: string) => void;
    onThemeChange?: (theme: EventThemeColors) => void;
    variant?: "mobile" | "desktop";
}

interface HeaderItem {
    value: string;
    label: string;
}

const headerItems: HeaderItem[] = [
    { value: 'details', label: "Details" },
    { value: 'tickets', label: "Tickets" }
]

export const EventEdit = ({
    event, className, setEvent, setMainActiveScreen, onThemeChange, variant = "mobile", ...props
}: EventEditProps) => {
    const { resolvedTheme } = useTheme();
    const [activeScreen, setActiveScreen] = useState<string>("details");


    const [loading, setLoading] = useState<boolean>(false);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [startDateError, setStartDateError] = useState<string | null>(null);
    const [stopDateError, setStopDateError] = useState<string | null>(null);
    const [titleImage, setTitleImage] = useState<string | undefined>(
        event.titleImage
    );
    const [title, setTitle] = useState<string>(event.title);
    const [description, setDescription] = useState<string>(event.description);
    const [address, setAddress] = useState<string>(event.address);
    const [city, setCity] = useState<string>(event.city);
    const [state, setState] = useState<string>(event.state);
    const [coordinates, setCoordinates] = useState<{ [key: string]: number }>(event.location);
    const [locationSecure, setLocationSecure] = useState<boolean>(event.locationSecure);
    const [isPublic, setIsPublic] = useState<boolean>(event.public);
    const [isFeeOnUser, setFeeOnUser] = useState<boolean>(event.feeOnUser);
    const [startTime, setStartTime] = useState<Date | undefined>(new Date(event.startTime));
    const [stopTime, setStopTime] = useState<Date | undefined>(new Date(event.stopTime));
    const [isAgeRestricted, setIsAgeRestricted] = useState<boolean>(event.ageRestricted);
    const [minimumAge, setMinimumAge] = useState<string>(String(event.minimumAge ?? ""));
    const [eventTags, setEventTags] = useState<string[]>(event.eventTags)
    const [screenshots, setScreenshots] = useState<string[]>(event.screenshots)
    const [tickets, setTickets] = useState<any[]>(event.tickets);
    const [coverVideo, setCoverVideo] = useState<string | undefined>(event.coverVideo);
    const [eventTheme, setEventTheme] = useState<EventThemeColors>(
        event.eventTheme ?? DEFAULT_EVENT_THEME
    );

    const currentEditSnapshot = React.useMemo(() => ({
        title: title.trim(),
        description: description.trim(),
        titleImage: titleImage ?? "",
        coverVideo: coverVideo ?? "",
        address: address ?? "",
        city: city ?? "",
        state: state ?? "",
        coordinates: coordinates ?? null,
        locationSecure,
        isPublic,
        isFeeOnUser,
        startTime: startTime?.toISOString() ?? null,
        stopTime: stopTime?.toISOString() ?? null,
        isAgeRestricted,
        minimumAge: minimumAge === "" || minimumAge === "0" ? "" : minimumAge,
        eventTags,
        screenshots,
        tickets,
        eventTheme,
    }), [
        address,
        city,
        coordinates,
        coverVideo,
        description,
        eventTags,
        eventTheme,
        isAgeRestricted,
        isFeeOnUser,
        isPublic,
        locationSecure,
        minimumAge,
        screenshots,
        startTime,
        state,
        stopTime,
        tickets,
        title,
        titleImage,
    ]);
    const currentEditSnapshotKey = React.useMemo(
        () => JSON.stringify(currentEditSnapshot),
        [currentEditSnapshot],
    );
    const [savedEditSnapshotKey, setSavedEditSnapshotKey] = useState(currentEditSnapshotKey);
    const hasUnsavedChanges = savedEditSnapshotKey !== currentEditSnapshotKey;

    const handleThemeChange = React.useCallback((theme: EventThemeColors) => {
        setEventTheme(theme);
        onThemeChange?.(theme);
    }, [onThemeChange]);

    const detailsContainerStyle = React.useMemo(() => {
        return getEventThemeBackground(eventTheme, resolvedTheme);
    }, [eventTheme, resolvedTheme]);
    const isLightSurface = isEventThemeLight(eventTheme, resolvedTheme);
    const strongTextClass = isLightSurface ? "text-black" : "text-white";
    const mutedTextClass = isLightSurface ? "text-black/70" : "text-white/75";
    const appFieldClass = "!border-border !bg-card !text-foreground placeholder:!text-muted-foreground shadow-sm";
    const appPanelClass = "border-border bg-card text-card-foreground shadow-sm";
    const isDesktop = variant === "desktop";
    const isDesktopThemedDetails = isDesktop && activeScreen === "details" && Boolean(detailsContainerStyle);
    const desktopTextClass = isDesktopThemedDetails ? strongTextClass : "text-foreground";
    const desktopMutedTextClass = isDesktopThemedDetails ? mutedTextClass : "text-muted-foreground";
    const desktopPanelClass = isDesktopThemedDetails
        ? isLightSurface
            ? "border-black/10 bg-white/90 text-black shadow-sm"
            : "border-white/12 bg-black/70 text-white shadow-sm"
        : "border-border bg-card text-card-foreground";
    const desktopSubPanelClass = isDesktopThemedDetails
        ? isLightSurface
            ? "border-black/10 bg-white/78 text-black"
            : "border-white/10 bg-black/55 text-white"
        : "border-border bg-background";
    const desktopFieldClass = isDesktopThemedDetails
        ? isLightSurface
            ? "border-black/10 bg-white/95 text-black placeholder:text-black/45"
            : "border-white/18 bg-black/70 text-white placeholder:text-white/45"
        : "border-border bg-background";


    const handleCoverVideoChange = useCallback((newUrl: string | null) => {
        if (!newUrl) {
            setCoverVideo(undefined);
            return;
        }
        setCoverVideo(newUrl);
    }, []);


    const handleTitleImageChange = useCallback((newUrl: string) => {
        setTitleImage(newUrl);
    }, []);

    useEffect(() => {
        setEvent((prev: any) => ({ ...prev, tickets }));
    }, [tickets, setEvent]);

    const handleLocationChange = (locationData: { [key: string]: any }) => {
        setCoordinates({
            latitude: locationData.coordinates.lat,
            longitude: locationData.coordinates.lng
        });
        setAddress(locationData.address);
        setCity(locationData.city);
        setState(locationData.state);
    }

    const handleStartDateChange = (value: Date) => {
        const valueDate = new Date(value);
        const stopTimeValue: Date | null = stopTime ? new Date(stopTime) : null;

        // Always update the state first
        setStartTime(value);

        // Then validate and set errors
        setStartDateError(null);

        if (valueDate < new Date()) {
            setStartDateError("Start date or time cannot be before the current date or time");
            return;
        }

        if (stopTimeValue && valueDate >= stopTimeValue) {
            setStartDateError("Start date or time must be before the stop date or time");
            return;
        }

        // Clear stop date error if it's now valid
        if (stopTimeValue && stopDateError && valueDate < stopTimeValue) {
            setStopDateError(null);
        }
    }

    const handleStopDateChange = (value: Date) => {
        const valueDate = new Date(value);
        const startTimeValue: Date | null = startTime ? new Date(startTime) : null;

        // Always update the state first
        setStopTime(value);

        // Then validate and set errors
        setStopDateError(null);

        if (valueDate < new Date()) {
            setStopDateError("Stop date or time cannot be before the current date or time");
            return;
        }

        if (startTimeValue && valueDate <= startTimeValue) {
            setStopDateError("Stop date or time must be after the start date or time");
            return;
        }

        // Clear start date error if it's now valid
        if (startTimeValue && startDateError && valueDate > startTimeValue) {
            setStartDateError(null);
        }
    }

    const handleMinimumAgeChange = (raw: string) => {
        // integers only
        const numericStr = raw.replace(/\D/g, "");
        // normalize leading zeros (optional)
        const normalized = numericStr.replace(/^0+(?=\d)/, "");
        setMinimumAge(normalized);

        const value = normalized === "" ? 0 : parseInt(normalized, 10);
        setIsAgeRestricted(value > 0);
    };

    const handleTicketsChange = (updated: { [key: string]: any }) => {
        setTickets(prev =>
            prev.map(t => (t.id === updated.id ? { ...t, ...updated } : t))
        );
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        const params = {
            title,
            description,
            isLocationSecure: locationSecure,
            isPublic,
            isFeeOnUser,
            startTime,
            stopTime,
            screenshots,
            titleImage,
            city,
            state,
            location: coordinates,
            address,
            isAgeRestricted,
            coverVideo: coverVideo ? coverVideo : "",
            minimumAge: minimumAge === "" || minimumAge === "0" ? null : parseInt(minimumAge, 10),
            tags: eventTags,
            eventTheme: eventTheme,
        }

        try {
            const response = await authApi.patch(`/event/${event.id}`, params);
            showTopToast("success", "Updated successfully");
            setEvent(response.data.data);
            setSavedEditSnapshotKey(currentEditSnapshotKey);
            setMainActiveScreen("details")
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setLoading(false);
        }
    }

    const renderScreen = () => {
        switch (activeScreen) {
            case "tickets":
                return (
                    <div className="px-3 flex flex-col gap-3 pt-2 pb-28">
                        {tickets.map((ticket, index) => (
                            <TicketCard
                                key={index}
                                ticket={ticket}
                                onChange={handleTicketsChange}
                                removeTicket={(ticketId: string) => {
                                    setTickets((tickets) => {
                                        return tickets.filter((i) => i.id !== ticketId)
                                    });
                                }} />
                        ))}
                        <NewTicketCard
                            eventId={event.id}
                            addTicket={(newTicket: { [key: string]: any }) => {
                                setTickets([...tickets, newTicket]);
                            }}
                        />
                    </div>
                )

            case "details":
                return (
                    <div className="w-full">
                        <CoverImageUploader
                            imageValue={titleImage}
                            onImageValueChange={handleTitleImageChange}
                            mediaFileType={"EVENT_HEADER"}
                            setSubmitDisabled={setSubmitDisabled}
                        />
                        <div className="w-full flex flex-col gap-5 px-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className={mutedTextClass}>Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={cn("py-6 font-medium", appFieldClass)}
                                />
                            </div>
                            <div className="grid gap-2 ">
                                <Label htmlFor="description" className={mutedTextClass}>Description</Label>
                                <textarea
                                    id="decription"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={8}
                                    className={cn("py-2 px-3 rounded-md border border-border focus:border-blue-600 focus:outline-hidden", appFieldClass)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className={mutedTextClass}>Location</div>
                                <LocationSearchDialog
                                    currentLocation={{ coordinates, address, city, state }}
                                    onLocationUpdate={handleLocationChange}
                                    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                                />
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="secure-location" className={mutedTextClass}>Secure Location</Label>
                                <div className={cn("flex flex-row justify-between items-center rounded-md px-4 py-4 gap-2 border", appPanelClass)}>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-foreground">Hide Exact Location</h3>
                                        <p className="text-sm text-muted-foreground">Enable to hide the exact location fromm attendees until necessary</p>
                                    </div>
                                    <Switch id="secure-location" size="medium" checked={locationSecure} onCheckedChange={() => { setLocationSecure(!locationSecure) }} />
                                </div>
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="event-visible" className={mutedTextClass}>Event Visibility</Label>
                                <div className={cn("flex flex-row justify-between items-center rounded-md px-4 py-4 gap-2 border", appPanelClass)}>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-foreground">Public Event</h3>
                                        <p className="text-sm text-muted-foreground">Enable to make the event visible to all users.</p>
                                    </div>
                                    <Switch id="event-visible" size="medium" checked={isPublic} onCheckedChange={() => { setIsPublic(!isPublic) }} />
                                </div>
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="fee-bearer" className={mutedTextClass}>Fee Bearer</Label>
                                <div className={cn("flex flex-row justify-between items-center rounded-md px-4 py-4 gap-2 border", appPanelClass)}>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-foreground">Pass fee to the ticket buyer</h3>
                                        <p className="text-sm text-muted-foreground">Enable to charge ticket fees directly to the buyer.</p>
                                    </div>
                                    <Switch
                                        id="fee-bearer"
                                        size="medium"
                                        checked={isFeeOnUser}
                                        onCheckedChange={() => setFeeOnUser(!isFeeOnUser)}
                                    />
                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-1">
                                <DateTimePicker date={startTime} setDate={handleStartDateChange} label="start date & time" />
                                {
                                    startDateError && <p className="text-xs text-red-600">{startDateError}</p>
                                }
                            </div>
                            <div className="w-full">
                                <DateTimePicker date={stopTime} setDate={handleStopDateChange} label="stop date & time" />
                                {
                                    stopDateError && <p className="text-xs text-red-600">{stopDateError}</p>
                                }
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="m-age" className={mutedTextClass}>Minimum Age</Label>
                                <Input
                                    id="m-age"
                                    name="m-age"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    placeholder="Minimum Age"
                                    value={minimumAge}
                                    onChange={(e) => handleMinimumAgeChange(e.target.value)}
                                    className={cn("py-2 font-medium", appFieldClass)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className={mutedTextClass}>Event Tags</div>
                                <EventTagDialog
                                    currentEventTags={eventTags}
                                    onTagAdd={
                                        (tag: string) => setEventTags([...eventTags, tag])
                                    }
                                    onTagRemove={(tag: string) => setEventTags((value) => value.filter((i) => i !== tag))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex flex-col">
                                    <div className={cn("font-bold", strongTextClass)}>Event Theme</div>
                                    <p className={cn("text-xs font-semibold", mutedTextClass)}>Select a theme that sets the vibe for your event</p>
                                </div>
                                <EventThemeSelector currentEventTheme={eventTheme} setEventTheme={handleThemeChange} />
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="m-age" className={mutedTextClass}>Snapshots</Label>
                                <ImageSnapshots setSubmitDisabled={setSubmitDisabled} initialImages={screenshots} maxImages={50} onImageAdd={setScreenshots} onImageRemove={setScreenshots} />
                            </div>
                            <CoverVideoUploader
                                videoValue={coverVideo}
                                onVideoValueChange={handleCoverVideoChange}
                                mediaFileType={"EVENT_COVER_VIDEO"}
                                setSubmitDisabled={setSubmitDisabled}
                                className="mb-10"
                            />
                            <div className="pt-2 border-none w-full fixed inset-x-0 bottom-0 z-60 pb-4 flex items-center justify-center safe-area-inset-bottom">
                                <Button
                                    type="submit"
                                    className="w-[90%] text-md py-6 font-bold"
                                    disabled={loading || !!startDateError || !!stopDateError || submitDisabled || !hasUnsavedChanges}
                                    onClick={handleUpdateSubmit}>
                                    {loading ? <LoaderSmall /> : hasUnsavedChanges ? "Confirm Changes" : "No Changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    const renderDesktopSummary = () => (
        <aside className="sticky top-4 h-fit min-w-0 space-y-4">
            <div className={cn("overflow-hidden rounded-2xl border shadow-sm", desktopPanelClass)}>
                <div className="relative aspect-[16/10] bg-muted">
                    {titleImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={titleImage} alt={title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <ImageIcon size={32} />
                        </div>
                    )}
                </div>
                <div className="space-y-4 p-5">
                    <div>
                        <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", desktopMutedTextClass)}>
                            Live edit preview
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-black capitalize leading-6">{title || "Untitled event"}</h3>
                        <p className={cn("mt-1 line-clamp-3 text-sm leading-6", desktopMutedTextClass)}>
                            {description || "Event description will appear here."}
                        </p>
                    </div>
                    <div className="grid gap-3 text-sm">
                        {[
                            ["Location", [city, state].filter(Boolean).join(", ") || "Not set"],
                            ["Tickets", `${tickets.length} ticket types`],
                            ["Visibility", isPublic ? "Public" : "Private"],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-4">
                                <span className={desktopMutedTextClass}>{label}</span>
                                <span className="max-w-40 truncate text-right font-bold">{value}</span>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="submit"
                        className="h-12 w-full rounded-full"
                        disabled={loading || !!startDateError || !!stopDateError || submitDisabled || !hasUnsavedChanges}
                        onClick={handleUpdateSubmit}
                    >
                        {loading ? <LoaderSmall /> : (
                            <>
                                <Save size={17} />
                                {hasUnsavedChanges ? "Save changes" : "No changes"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <div className={cn("rounded-2xl border p-5", desktopPanelClass)}>
                <p className="font-black">Edit checklist</p>
                <div className="mt-4 grid gap-3 text-sm">
                    {[
                        ["Event basics", Boolean(title && description && titleImage)],
                        ["Location", Boolean(address && city && state)],
                        ["Tickets", tickets.length > 0],
                        ["Timing", Boolean(startTime && stopTime && !startDateError && !stopDateError)],
                    ].map(([label, done]) => (
                        <div key={String(label)} className="flex items-center justify-between gap-3">
                            <span className={desktopMutedTextClass}>{label}</span>
                            <span className={cn("font-bold", done ? "text-green-700 dark:text-green-300" : desktopMutedTextClass)}>
                                {done ? "Ready" : "Needs work"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );

    const renderDesktopDetails = () => (
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="grid min-w-0 gap-6">
                <div className={cn("overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                            <ImageIcon size={20} />
                        </span>
                        <div>
                            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Media</p>
                            <h2 className="text-xl font-black leading-7">Cover, gallery, and teaser</h2>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div className={cn("grid min-w-0 gap-4 rounded-2xl border p-4", desktopSubPanelClass)}>
                            <div>
                                <p className="text-sm font-black leading-5">Cover image</p>
                                <p className={cn("mt-1 text-sm leading-6", desktopMutedTextClass)}>
                                    Main visual shown across discovery, detail, and checkout surfaces.
                                </p>
                            </div>
                            <CoverImageUploader
                                imageValue={titleImage}
                                onImageValueChange={handleTitleImageChange}
                                mediaFileType={"EVENT_HEADER"}
                                setSubmitDisabled={setSubmitDisabled}
                                className="h-72 rounded-xl"
                            />
                        </div>

                        <div className={cn("grid min-w-0 gap-4 rounded-2xl border p-4", desktopSubPanelClass)}>
                            <div>
                                <p className="text-sm font-black leading-5">Preview video</p>
                                <p className={cn("mt-1 text-sm leading-6", desktopMutedTextClass)}>
                                    Optional teaser used for richer desktop event previews.
                                </p>
                            </div>
                            <CoverVideoUploader
                                videoValue={coverVideo}
                                onVideoValueChange={handleCoverVideoChange}
                                mediaFileType={"EVENT_COVER_VIDEO"}
                                setSubmitDisabled={setSubmitDisabled}
                                className="[&>div]:h-72"
                            />
                        </div>

                        <div className={cn("grid min-w-0 gap-4 rounded-2xl border p-4", desktopSubPanelClass)}>
                            <div>
                                <p className="text-sm font-black leading-5">Snapshots</p>
                                <p className={cn("mt-1 text-sm leading-6", desktopMutedTextClass)}>
                                    Supporting images appear as a horizontal gallery.
                                </p>
                            </div>
                            <ImageSnapshots
                                setSubmitDisabled={setSubmitDisabled}
                                initialImages={screenshots}
                                maxImages={50}
                                onImageAdd={setScreenshots}
                                onImageRemove={setScreenshots}
                                variant="desktop"
                                className="min-w-0 bg-transparent p-0"
                            />
                        </div>
                    </div>
                </div>

                <div className={cn("overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                            <CalendarDays size={20} />
                        </span>
                        <div>
                            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Basics</p>
                            <h2 className="text-xl font-black leading-7">Event information</h2>
                        </div>
                    </div>
                    <div className="grid min-w-0 gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="desktop-edit-title" className={desktopMutedTextClass}>Title</Label>
                            <Input
                                id="desktop-edit-title"
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={cn("h-12 font-medium", desktopFieldClass)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desktop-edit-description" className={desktopMutedTextClass}>Description</Label>
                            <textarea
                                id="desktop-edit-description"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={7}
                                className={cn("rounded-md border px-3 py-3 text-sm outline-none transition focus:border-blue-700", desktopFieldClass)}
                            />
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <DateTimePicker date={startTime} setDate={handleStartDateChange} label="start date & time" />
                                {startDateError && <p className="mt-2 text-xs text-red-600">{startDateError}</p>}
                            </div>
                            <div>
                                <DateTimePicker date={stopTime} setDate={handleStopDateChange} label="stop date & time" />
                                {stopDateError && <p className="mt-2 text-xs text-red-600">{stopDateError}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-rows-2">
                    <div className={cn("overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                <MapPin size={20} />
                            </span>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Location</p>
                                <h2 className="text-xl font-black leading-7">Guest meeting point</h2>
                            </div>
                        </div>
                        <div className="mt-5">
                            <LocationSearchDialog
                                currentLocation={{ coordinates, address, city, state }}
                                onLocationUpdate={handleLocationChange}
                                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                            />
                        </div>
                        <div className={cn("mt-4 rounded-xl border p-4", desktopSubPanelClass)}>
                            <p className="text-sm font-semibold capitalize">{address || "No location selected"}</p>
                            <p className={cn("mt-1 text-sm", desktopMutedTextClass)}>
                                {[city, state].filter(Boolean).join(", ") || "Choose a location to continue"}
                            </p>
                        </div>
                    </div>

                    <div className={cn("overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                <Tags size={20} />
                            </span>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Discovery</p>
                                <h2 className="text-xl font-black leading-7">Tags, theme, and age</h2>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-5">
                            <EventTagDialog
                                currentEventTags={eventTags}
                                onTagAdd={(tag: string) => setEventTags([...eventTags, tag])}
                                onTagRemove={(tag: string) => setEventTags((value) => value.filter((i) => i !== tag))}
                            />
                            <EventThemeSelector currentEventTheme={eventTheme} setEventTheme={handleThemeChange} />
                            <div className="grid gap-2">
                                <Label htmlFor="desktop-edit-min-age" className={desktopMutedTextClass}>Minimum age</Label>
                                <Input
                                    id="desktop-edit-min-age"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    placeholder="No restriction"
                                    value={minimumAge}
                                    onChange={(e) => handleMinimumAgeChange(e.target.value)}
                                    className={cn("h-12 font-medium", desktopFieldClass)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cn("overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                            <Settings2 size={20} />
                        </span>
                        <div>
                            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Settings</p>
                            <h2 className="text-xl font-black leading-7">Publishing controls</h2>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {[
                            {
                                id: "desktop-secure-location",
                                title: "Hide exact location",
                                text: "Share exact address only when needed.",
                                checked: locationSecure,
                                onChange: () => setLocationSecure(!locationSecure),
                            },
                            {
                                id: "desktop-event-visible",
                                title: "Public event",
                                text: "Make this event visible in discovery.",
                                checked: isPublic,
                                onChange: () => setIsPublic(!isPublic),
                            },
                            {
                                id: "desktop-fee-bearer",
                                title: "Pass fees to buyer",
                                text: "Charge ticket fees directly to guests.",
                                checked: isFeeOnUser,
                                onChange: () => setFeeOnUser(!isFeeOnUser),
                            },
                        ].map((setting) => (
                            <label key={setting.id} className={cn("flex items-start justify-between gap-4 rounded-2xl border p-4", desktopSubPanelClass)}>
                                <span>
                                    <span className="block text-sm font-black leading-5">{setting.title}</span>
                                    <span className={cn("mt-1 block text-sm leading-5", desktopMutedTextClass)}>{setting.text}</span>
                                </span>
                                <Switch id={setting.id} size="medium" checked={setting.checked} onCheckedChange={setting.onChange} />
                            </label>
                        ))}
                    </div>
                </div>
            </section>

            {renderDesktopSummary()}
        </div>
    );

    const renderDesktopTickets = () => (
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className={cn("min-w-0 overflow-hidden rounded-2xl border p-6", desktopPanelClass)}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopMutedTextClass)}>Tickets</p>
                        <h2 className="mt-1 text-xl font-black leading-7">Pricing and inventory</h2>
                        <p className={cn("mt-2 max-w-2xl text-sm leading-6", desktopMutedTextClass)}>
                            Update existing ticket types or add new inventory for guests.
                        </p>
                    </div>
                    <span className="rounded-full bg-blue-800/10 px-4 py-2 text-sm font-black text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                        {tickets.length} ticket types
                    </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {tickets.map((ticket, index) => (
                        <TicketCard
                            key={ticket.id ?? index}
                            ticket={ticket}
                            onChange={handleTicketsChange}
                            removeTicket={(ticketId: string) => {
                                setTickets((tickets) => {
                                    return tickets.filter((i) => i.id !== ticketId)
                                });
                            }}
                        />
                    ))}
                    <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                        <NewTicketCard
                            eventId={event.id}
                            addTicket={(newTicket: { [key: string]: any }) => {
                                setTickets([...tickets, newTicket]);
                            }}
                        />
                    </div>
                </div>
            </section>

            {renderDesktopSummary()}
        </div>
    );

    if (isDesktop) {
        return (
            <div
                className={cn(
                    "w-full rounded-2xl border border-border p-6",
                    isDesktopThemedDetails ? desktopTextClass : "bg-background/60 text-foreground",
                    className,
                )}
                style={activeScreen === "details" ? detailsContainerStyle : undefined}
                {...props}
            >
                <div className={cn("mb-6 rounded-2xl border p-2", desktopPanelClass)}>
                    <div className="grid gap-2 md:grid-cols-2">
                        {headerItems.map((item) => {
                            const isActive = activeScreen === item.value;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setActiveScreen(item.value)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition",
                                        isActive
                                            ? "bg-blue-800 text-white"
                                            : cn(desktopMutedTextClass, "hover:bg-background/50")
                                    )}
                                >
                                    {item.value === "details" ? <Settings2 size={17} /> : <Ticket size={17} />}
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <form>
                    {activeScreen === "tickets" ? renderDesktopTickets() : renderDesktopDetails()}
                </form>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full min-h-[85vh] bg-background text-foreground",
            className
        )} style={activeScreen === "details" ? detailsContainerStyle : undefined} {...props}>
            <ul className="w-full flex flex-row justify-between pt-2">
                {headerItems.map((item) => (
                    <li key={item.value} className="w-full">
                        <div
                            onClick={() => setActiveScreen!(item.value)}
                            className={cn(
                                "flex flex-col items-center pb-3 border-b-2 cursor-pointer px-4",
                                activeScreen === item.value
                                    ? (isLightSurface ? "border-neutral-950 text-black" : "border-blue-500 text-white")
                                    : (isLightSurface ? "border-transparent text-black/60" : "border-transparent text-white/65")
                            )}
                        >
                            <span className="text-md mt-1 whitespace-nowrap font-semibold">
                                {item.label}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <form className="w-full flex flex-col gap-5 pb-18">
                {
                    renderScreen()
                }
            </form>
        </div>
    )
}
