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

interface EventEditProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    setEvent: (event: { [key: string]: any }) => void;
    setMainActiveScreen: (activeScreen: string, title?: string) => void;
    onThemeChange?: (theme: [string, string]) => void;
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
    event, className, setEvent, setMainActiveScreen, onThemeChange, ...props
}: EventEditProps) => {
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
    const [eventTheme, setEventTheme] = useState<[string, string]>(event.eventTheme === null ? ["#fff", "#fff"] : event.eventTheme);

    const handleThemeChange = React.useCallback((theme: [string, string]) => {
        setEventTheme(theme);
        onThemeChange?.(theme);
    }, [onThemeChange]);

    const detailsContainerStyle = React.useMemo(() => {
        if (!eventTheme || eventTheme.length !== 2) return undefined;
        const [c1, c2] = eventTheme;
        return { background: `linear-gradient(to bottom, ${c1}, ${c2})` } as const;
    }, [eventTheme]);


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
                    <div className="px-3 flex flex-col gap-3 pt-2">
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
                        <div className="w-full flex flex-col gap-5 px-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="text-neutral-500">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="py-6 bg-white"
                                />
                            </div>
                            <div className="grid gap-2 ">
                                <Label htmlFor="description" className="text-neutral-500">Description</Label>
                                <textarea
                                    id="decription"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={8}
                                    className="py-2 px-3 bg-white rounded-md border-1 border-neutral-200 focus:border-blue-600 focus:border-1 focus:outline-hidden"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="text-neutral-500">Location</div>
                                <LocationSearchDialog
                                    currentLocation={{ coordinates, address, city, state }}
                                    onLocationUpdate={handleLocationChange}
                                    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                                />
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="secure-location" className="text-neutral-500">Secure Location</Label>
                                <div className="flex flex-row justify-between items-center rounded-md px-4 py-4 bg-white gap-2">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold">Hide Exact Location</h3>
                                        <p className="text-sm text-neutral-500">Enable to hide the exact location fromm attendees until necessary</p>
                                    </div>
                                    <Switch id="secure-location" size="medium" checked={locationSecure} onCheckedChange={() => { setLocationSecure(!locationSecure) }} />
                                </div>
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="event-visible" className="text-neutral-500">Event Visibility</Label>
                                <div className="flex flex-row justify-between items-center rounded-md px-4 py-4 bg-white gap-2">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold">Public Event</h3>
                                        <p className="text-sm text-neutral-500">Enable to make the event visible to all users.</p>
                                    </div>
                                    <Switch id="event-visible" size="medium" checked={isPublic} onCheckedChange={() => { setIsPublic(!isPublic) }} />
                                </div>
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="fee-bearer" className="text-neutral-500">Fee Bearer</Label>
                                <div className="flex flex-row justify-between items-center rounded-md px-4 py-4 bg-white gap-2">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold">Pass fee to the ticket buyer</h3>
                                        <p className="text-sm text-neutral-500">Enable to charge ticket fees directly to the buyer.</p>
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
                                <Label htmlFor="m-age" className="text-neutral-500">Minimum Age</Label>
                                <Input
                                    id="m-age"
                                    name="m-age"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    placeholder="Minimum Age"
                                    value={minimumAge}
                                    onChange={(e) => handleMinimumAgeChange(e.target.value)}
                                    className="py-2 bg-white"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="text-neutral-500">Event Tags</div>
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
                                    <div className="font-bold">Event Theme</div>
                                    <p className="text-neutral-400 text-xs font-semibold">Select a theme that sets the vibe for your event</p>
                                </div>
                                <EventThemeSelector currentEventTheme={eventTheme} setEventTheme={handleThemeChange} />
                            </div>
                            <div className="grid gap-2 w-full">
                                <Label htmlFor="m-age" className="text-neutral-500">Snapshots</Label>
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
                                    disabled={loading || !!startDateError || !!stopDateError || submitDisabled}
                                    onClick={handleUpdateSubmit}>
                                    {loading ? <LoaderSmall /> : "Confirm Changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className={cn(
            "w-full min-h-[85vh]",
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
                                    ? "border-neutral-950 text-neutral-950"
                                    : "border-transparent text-neutral-500"
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
