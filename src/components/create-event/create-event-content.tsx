"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  IoLocationOutline,
  IoPlanetOutline,
  IoWalletOutline,
} from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { CoverImageUploader } from "@/components/ui/cover-image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/event-page/date-time-input";
import { LocationSearchDialog } from "@/components/event-page/location-search-dialog";
import { EventTagDialog } from "@/components/event-page/event-tag-edit";
import { EventThemeSelector } from "@/components/event-page/event-theme";
import { ImageSnapshots } from "@/components/ui/image-snapshot";
import { v4 as uuidv4 } from "uuid";
import { FiTrash2 } from "react-icons/fi";
import { GoCalendar, GoTag } from "react-icons/go";
import { TbUsers } from "react-icons/tb";
import Image from "next/image";
import { LuClock } from "react-icons/lu";
import { SnapshotCarousel } from "@/components/event-page/image-silder";
import { Switch } from "@/components/ui/switch";
import { LoaderSmall } from "@/components/ui/loader";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { CreateEventSuccess } from "@/components/create-event/create-success";
import { getErrorMessage } from "@/lib/error-message";
import { CoverVideoUploader } from "../ui/cover-video";
import { Linkify } from "@/lib/linkify";
import {
  DEFAULT_EVENT_THEME,
  EventThemeColors,
  getEventThemeBackground,
  isEventThemeLight,
} from '@/lib/event-theme';
import { useTheme } from 'next-themes';
import createEventImage from "@/assests/createeventpic.jpg";

interface CreateEventContentProps extends React.ComponentProps<"div"> {
  prev: string | null;
  variant?: "mobile" | "desktop";
}

type ActiveScreenType = "intro" | "details" | "ticket" | "preview" | "success";

interface IntroObjectType {
  title: string;
  text: string;
  icon: ReactNode;
}

const intoObjects: IntroObjectType[] = [
  {
    title: "Share Your Passion",
    text: "Turn what you love into an unforgettable experience for others.",
    icon: <HiSparkles size={28} className="text-blue-500 animate-float-subtle" />,
  },
  {
    title: "Be Discovered",
    text: "Showcase your experience to those who are eager to try something new.",
    icon: <IoPlanetOutline size={28} className="text-foreground dark:text-neutral-200 animate-float-subtle-slow" />,
  },
  {
    title: "Earn While Inspiring",
    text: "Monetize your ideas and make a difference, one experience at a time.",
    icon: <IoWalletOutline size={28} className="text-green-500 animate-float-subtle-delayed" />,
  },
];

interface TicketDataType {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  isPaid: boolean;
  nameError: boolean;
  descriptionError: boolean;
  priceError: boolean;
  quantityError: boolean;
}

type CreatedEventResponse = Record<string, unknown>;

interface LocationResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  city?: string;
  state?: string;
}

export const CreateEventContent = ({
  prev,
  variant = "mobile",
  className,
  ...props
}: CreateEventContentProps) => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const isDesktop = variant === "desktop";

  const [event, setEvent] = useState<CreatedEventResponse | null>(null);
  const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("intro");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [stopDateError, setStopDateError] = useState<string | null>(null);
  const [isSelectedTicketPaid, setIsSelectedTicketPaid] =
    useState<boolean>(true);
  const [currentTicketData, setCurrentTicketData] = useState<TicketDataType>({
    id: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
    isPaid: false,
    nameError: false,
    descriptionError: false,
    priceError: false,
    quantityError: false,
  });

  const [titleImage, setTitleImage] = useState<string | undefined>(undefined);
  const [coverVideo, setCoverVideo] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<
    | {
      latitude: number;
      longitude: number;
    }
    | undefined
  >(undefined);
  const [locationSecure, setLocationSecure] = useState<boolean>(false);
  const [isFeeOnUser, setFeeOnUser] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [stopTime, setStopTime] = useState<Date | undefined>(undefined);
  const [isAgeRestricted, setIsAgeRestricted] = useState<boolean>(false);
  const [minimumAge, setMinimumAge] = useState<string>(String(""));
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [tickets, setTickets] = useState<TicketDataType[]>([]);
  const [eventTheme, setEventTheme] = useState<EventThemeColors>(DEFAULT_EVENT_THEME);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeScreen]);

  const isDetailsInValid =
    submitDisabled ||
    !title ||
    !description ||
    !startTime ||
    !!startDateError ||
    !stopTime ||
    !!stopDateError ||
    !address ||
    !city ||
    !state ||
    !coordinates ||
    !eventTags ||
    eventTags.length === 0 ||
    !eventTheme ||
    !titleImage;

  const detailsContainerStyle = React.useMemo(
    () => getEventThemeBackground(eventTheme, resolvedTheme),
    [eventTheme, resolvedTheme],
  );

  const isLightEventSurface = React.useMemo(
    () => isEventThemeLight(eventTheme, resolvedTheme),
    [eventTheme, resolvedTheme],
  );

  const createScreenTextClass = isLightEventSurface ? "text-black" : "text-white";
  const createScreenMutedTextClass = isLightEventSurface ? "text-black/65" : "text-white/70";
  const createScreenFieldClass = isLightEventSurface
    ? "border-black/10 bg-white/92 text-black placeholder:text-black/45"
    : "border-white/18 bg-black/28 text-white placeholder:text-white/45";
  const createScreenCardClass = isLightEventSurface
    ? "border-black/10 bg-white/24"
    : "border-white/12 bg-black/18";
  const isDesktopThemePreview =
    isDesktop &&
    Boolean(detailsContainerStyle) &&
    (activeScreen === "details" || activeScreen === "preview");
  const desktopThemeTextClass = isDesktopThemePreview ? createScreenTextClass : "text-foreground";
  const desktopThemeMutedTextClass = isDesktopThemePreview ? createScreenMutedTextClass : "text-muted-foreground";
  const desktopThemePanelClass = isDesktopThemePreview
    ? isLightEventSurface
      ? "border-black/10 bg-white/80 text-black"
      : "border-white/12 bg-black/35 text-white"
    : "border-border bg-card text-card-foreground";
  const desktopThemeSubPanelClass = isDesktopThemePreview
    ? isLightEventSurface
      ? "border-black/10 bg-white/55 text-black"
      : "border-white/10 bg-black/25 text-white"
    : "border-border bg-background";
  const desktopThemeHeaderClass = isDesktopThemePreview
    ? isLightEventSurface
      ? "border-black/10 bg-white/30"
      : "border-white/10 bg-black/25"
    : "border-border bg-background/90";

  const handleBackClick = () => {
    if (activeScreen === "details") {
      setActiveScreen("intro");
    } else if (activeScreen === "ticket") {
      setActiveScreen("details");
    } else if (activeScreen === "preview") {
      setActiveScreen("ticket");
    } else {
      router.push(prev != null ? prev : "/");
    }
  };

  const handleTitleImageChange = useCallback((newUrl: string) => {
    setTitleImage(newUrl);
  }, []);

  const handleCoverVideoChange = useCallback((newUrl: string | null) => {
    if (!newUrl) {
      setCoverVideo(undefined);
      return;
    }
    setCoverVideo(newUrl);
  }, []);

  const handleLocationChange = (locationData: LocationResult) => {
    setCoordinates({
      latitude: locationData.coordinates.lat,
      longitude: locationData.coordinates.lng,
    });
    setAddress(locationData.address);
    setCity(locationData.city);
    setState(locationData.state);
  };

  const handleStartDateChange = (value: Date) => {
    const valueDate = new Date(value);
    const stopTimeValue: Date | null = stopTime ? new Date(stopTime) : null;

    // Always update the state first
    setStartTime(value);

    // Then validate and set errors
    setStartDateError(null);

    if (valueDate < new Date()) {
      setStartDateError(
        "Start date or time cannot be before the current date or time"
      );
      return;
    }

    if (stopTimeValue && valueDate >= stopTimeValue) {
      setStartDateError(
        "Start date or time must be before the stop date or time"
      );
      return;
    }

    // Clear stop date error if it's now valid
    if (stopTimeValue && stopDateError && valueDate < stopTimeValue) {
      setStopDateError(null);
    }
  };

  const handleStopDateChange = (value: Date) => {
    const valueDate = new Date(value);
    const startTimeValue: Date | null = startTime ? new Date(startTime) : null;

    // Always update the state first
    setStopTime(value);

    // Then validate and set errors
    setStopDateError(null);

    if (valueDate < new Date()) {
      setStopDateError(
        "Stop date or time cannot be before the current date or time"
      );
      return;
    }

    if (startTimeValue && valueDate <= startTimeValue) {
      setStopDateError(
        "Stop date or time must be after the start date or time"
      );
      return;
    }

    // Clear start date error if it's now valid
    if (startTimeValue && startDateError && valueDate > startTimeValue) {
      setStartDateError(null);
    }
  };

  const handleMinimumAgeChange = (raw: string) => {
    // integers only
    const numericStr = raw.replace(/\D/g, "");
    // normalize leading zeros (optional)
    const normalized = numericStr.replace(/^0+(?=\d)/, "");
    setMinimumAge(normalized);

    const value = normalized === "" ? 0 : parseInt(normalized, 10);
    setIsAgeRestricted(value > 0);
  };

  const handleTicketAdd = (newTicket: TicketDataType) => {
    let hasErrors = false;
    const errors: string[] = [];
    const updatedTicket = { ...newTicket };

    // Validate name
    if (!newTicket.name.trim()) {
      updatedTicket.nameError = true;
      errors.push("Ticket name is required");
      hasErrors = true;
    } else {
      updatedTicket.nameError = false;
    }

    // Validate description
    if (!newTicket.description.trim()) {
      updatedTicket.descriptionError = true;
      errors.push("Ticket description is required");
      hasErrors = true;
    } else {
      updatedTicket.descriptionError = false;
    }

    // Validate price for paid tickets
    if (isSelectedTicketPaid) {
      const priceValue = parseFloat(newTicket.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        updatedTicket.priceError = true;
        errors.push("Paid tickets must have a price greater than 0");
        hasErrors = true;
      } else {
        updatedTicket.priceError = false;
      }
    }

    // Validate quantity (always required > 0)
    const quantityValue = parseInt(newTicket.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      updatedTicket.quantityError = true;
      errors.push("Ticket quantity must be greater than 0");
      hasErrors = true;
    } else {
      updatedTicket.quantityError = false;
    }

    // If there are errors, update state with errors and show toasts
    if (hasErrors) {
      setCurrentTicketData(updatedTicket);
      errors.forEach(error => showTopToast("error", error));
      return;
    }

    const newTicketData: TicketDataType = { ...newTicket, id: uuidv4() };

    setTickets([...tickets, newTicketData]);
    setCurrentTicketData({
      id: "",
      name: "",
      description: "",
      price: "",
      quantity: "",
      isPaid: false,
      nameError: false,
      descriptionError: false,
      priceError: false,
      quantityError: false,
    });
  };

  const handleTicketRemove = (ticketId: string) => {
    setTickets((prev) => prev.filter((i) => i.id !== ticketId));
  };

  const handleTicketPriceChange = (raw: string) => {
    // Allow only digits and a single decimal point
    let cleaned = raw.replace(/[^0-9.]/g, "");

    // Prevent more than one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places if decimal exists
    if (parts.length === 2) {
      cleaned = parts[0] + "." + parts[1].slice(0, 2);
    }

    const numValue = parseFloat(cleaned);

    setCurrentTicketData({
      ...currentTicketData,
      price: cleaned,
      isPaid: !isNaN(numValue) && numValue > 0,
      priceError: false, // Clear error when price changes
    });
  };

  const handleTicketQuantityChange = (raw: string) => {
    // integers only
    const numericStr = raw.replace(/\D/g, "");
    // normalize leading zeros (optional)
    const normalized = numericStr.replace(/^0+(?=\d)/, "");
    const value = normalized === "" ? 0 : parseInt(normalized, 10);

    if (value < 1) {
      setCurrentTicketData({
        ...currentTicketData,
        quantity: normalized,
        quantityError: true,
      });
      return;
    }

    setCurrentTicketData({
      ...currentTicketData,
      quantity: normalized,
      quantityError: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const isSubmitDataInvalid: boolean =
      !title ||
      !description ||
      !startTime ||
      !stopTime ||
      !titleImage ||
      !address ||
      !city ||
      !state ||
      !coordinates?.latitude ||
      !coordinates?.longitude ||
      (isAgeRestricted && !minimumAge) ||
      eventTags.length <= 0 ||
      eventTheme.length < 2 ||
      tickets.length === 0;

    if (isSubmitDataInvalid) {
      setLoading(false);
      showTopToast("error", "Please fill in all required fields before submitting");
      return;
    }

    const paramTickets: {
      title: string;
      description: string;
      price: number;
      totalQuantity: number;
      paid: boolean;
    }[] = [];

    for (const ticket of tickets) {
      paramTickets.push({
        title: ticket.name,
        description: ticket.description,
        price:
          ticket.price === "" || !ticket.price ? 0 : parseFloat(ticket.price),
        totalQuantity: parseInt(ticket.quantity),
        paid: ticket.isPaid,
      });
    }

    const params = {
      title,
      description,
      isLocationSecure: locationSecure,
      isPublic,
      startTime,
      stopTime,
      screenshots,
      titleImage,
      coverVideo,
      city,
      state,
      location: coordinates,
      address,
      isAgeRestricted,
      isFeeOnUser,
      minimumAge:
        minimumAge === "" || minimumAge === "0"
          ? null
          : parseInt(minimumAge, 10),
      tags: eventTags,
      eventTheme: eventTheme,
      tickets: paramTickets,
    };

    try {
      const response = await authApi.post(`/event/create`, params);

      setEvent(response.data.data);
      showTopToast("success", "Create experience successfully");
      setActiveScreen("success");
    } catch (error: unknown) {
      showTopToast("error", getErrorMessage(error, "Failed to create event"));
    } finally {
      setLoading(false);
    }
  };

  const headerTitle = () => {
    switch (activeScreen) {
      case "intro":
        return "";
      case "details":
        return "Create Event";
      case "ticket":
        return "Pricing & Capacity";
      case "preview":
        return "Preview & Settings";
    }
  };

  const desktopSteps: Array<{
    value: ActiveScreenType;
    title: string;
    description: string;
  }> = [
    { value: "intro", title: "Start", description: "Hosting brief" },
    { value: "details", title: "Details", description: "Media, time, place" },
    { value: "ticket", title: "Tickets", description: "Pricing and capacity" },
    { value: "preview", title: "Review", description: "Publish settings" },
  ];

  const currentStepIndex = Math.max(
    desktopSteps.findIndex((step) => step.value === activeScreen),
    0,
  );

  const canOpenDesktopStep = (step: ActiveScreenType) => {
    if (step === "intro" || step === "details") return true;
    if (step === "ticket") return !isDetailsInValid;
    if (step === "preview") return !isDetailsInValid && tickets.length > 0;
    return false;
  };

  const isPreviewDataInvalid =
    !title ||
    !description ||
    !startTime ||
    !stopTime ||
    !titleImage ||
    !address ||
    !city ||
    !state ||
    !coordinates?.latitude ||
    !coordinates?.longitude ||
    (isAgeRestricted && !minimumAge) ||
    eventTags.length <= 0 ||
    eventTheme.length < 2 ||
    tickets.length === 0;

  const renderDesktopSummary = () => (
    <aside className="sticky top-8 flex h-fit flex-col gap-4">
      <div className={cn("overflow-hidden rounded-2xl border", desktopThemePanelClass)}>
        <div className="relative aspect-[16/10] bg-muted">
          <Image
            src={titleImage || createEventImage}
            alt={title || "Event preview"}
            fill
            sizes="360px"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", desktopThemeMutedTextClass)}>
              Draft preview
            </p>
            <h2 className="mt-2 line-clamp-2 text-xl font-black capitalize">
              {title || "Untitled event"}
            </h2>
            <p className={cn("mt-1 line-clamp-2 text-sm", desktopThemeMutedTextClass)}>
              {description || "Add a short description to help guests understand the experience."}
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className={desktopThemeMutedTextClass}>Tickets</span>
              <span className="font-bold">{tickets.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className={desktopThemeMutedTextClass}>Visibility</span>
              <span className="font-bold">{isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className={desktopThemeMutedTextClass}>Location</span>
              <span className="max-w-40 truncate text-right font-bold">
                {city && state ? `${city}, ${state}` : "Not set"}
              </span>
            </div>
          </div>

          {activeScreen === "details" && (
            <Button
              className="h-12 w-full rounded-full"
              disabled={isDetailsInValid}
              onClick={() => setActiveScreen("ticket")}
              type="button"
            >
              Continue to tickets
            </Button>
          )}
          {activeScreen === "ticket" && (
            <Button
              className="h-12 w-full rounded-full"
              disabled={tickets.length === 0}
              onClick={() => setActiveScreen("preview")}
              type="button"
            >
              Review event
            </Button>
          )}
          {activeScreen === "preview" && (
            <Button
              className="h-12 w-full rounded-full"
              disabled={loading || isPreviewDataInvalid}
              onClick={handleSubmit}
              type="submit"
            >
              {loading ? <LoaderSmall /> : "Publish event"}
            </Button>
          )}
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5", desktopThemePanelClass)}>
        <p className="font-black">Required before publishing</p>
        <div className="mt-4 grid gap-3 text-sm">
          {[
            ["Event details", !isDetailsInValid],
            ["At least one ticket", tickets.length > 0],
            ["Preview reviewed", activeScreen === "preview"],
          ].map(([label, done]) => (
            <div key={String(label)} className="flex items-center justify-between gap-3">
              <span className={desktopThemeMutedTextClass}>{label}</span>
              <span className={cn("font-bold", done ? "text-green-700" : "text-muted-foreground")}>
                {done ? "Done" : "Open"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  const renderDesktopIntro = () => (
    <div className="grid min-h-[calc(100vh-88px)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
          Host workspace
        </p>
        <h1 className="mt-4 max-w-3xl text-6xl font-black leading-[0.95] tracking-tight">
          Build the event guests will remember.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Create a polished experience page, define tickets, and review the guest-facing presentation before publishing.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {intoObjects.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-800/10">
                {item.icon}
              </span>
              <h3 className="mt-4 font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button
            className="h-12 rounded-full px-7"
            onClick={() => setActiveScreen("details")}
            type="button"
          >
            Create event
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full px-7"
            onClick={handleBackClick}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </section>

      <aside className="flex items-center">
        <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative aspect-[4/5] bg-muted">
            <Image
              src={createEventImage}
              alt="Create event"
              fill
              priority
              sizes="420px"
              className="object-cover"
            />
          </div>
        </div>
      </aside>
    </div>
  );

  const renderDesktopDetails = () => (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-6">
        <div className={cn("rounded-2xl border p-6", desktopThemePanelClass)}>
          <div className="mb-5">
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Media</p>
            <h2 className="mt-1 text-2xl font-black">Cover and gallery</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <CoverImageUploader
              imageValue={titleImage}
              onImageValueChange={handleTitleImageChange}
              mediaFileType={"EVENT_HEADER"}
              setSubmitDisabled={setSubmitDisabled}
            />
            <div className="grid gap-4">
              <CoverVideoUploader
                videoValue={coverVideo}
                onVideoValueChange={handleCoverVideoChange}
                mediaFileType={"EVENT_COVER_VIDEO"}
                setSubmitDisabled={setSubmitDisabled}
              />
              <ImageSnapshots
                setSubmitDisabled={setSubmitDisabled}
                initialImages={screenshots}
                maxImages={20}
                onImageAdd={setScreenshots}
                onImageRemove={setScreenshots}
              />
            </div>
          </div>
        </div>

        <div className={cn("rounded-2xl border p-6", desktopThemePanelClass)}>
          <div className="mb-5">
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Basics</p>
            <h2 className="mt-1 text-2xl font-black">Event information</h2>
          </div>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="desktop-title">Title</Label>
              <Input
                id="desktop-title"
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn("h-12", isDesktopThemePreview ? createScreenFieldClass : "bg-background")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desktop-description">Description</Label>
              <textarea
                id="desktop-description"
                placeholder="Describe the experience"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                className={cn(
                  "rounded-md border px-3 py-3 text-sm outline-none transition focus:border-blue-700",
                  isDesktopThemePreview ? createScreenFieldClass : "border-border bg-background",
                )}
                required
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

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={cn("rounded-2xl border p-6", desktopThemePanelClass)}>
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Location</p>
            <h2 className="mt-1 text-2xl font-black">Where guests meet</h2>
            <div className="mt-5">
              <LocationSearchDialog
                currentLocation={{ coordinates, address, city, state }}
                onLocationUpdate={handleLocationChange}
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              />
            </div>
            <div className={cn("mt-4 rounded-xl border p-4", desktopThemeSubPanelClass)}>
              <p className="text-sm font-semibold">{address || "No location selected"}</p>
              <p className={cn("mt-1 text-sm", desktopThemeMutedTextClass)}>
                {[city, state].filter(Boolean).join(", ") || "Choose a location to continue"}
              </p>
            </div>
          </div>

          <div className={cn("rounded-2xl border p-6", desktopThemePanelClass)}>
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Discovery</p>
            <h2 className="mt-1 text-2xl font-black">Tags and rules</h2>
            <div className="mt-5 grid gap-5">
              <EventTagDialog
                currentEventTags={eventTags}
                onTagAdd={(tag: string) => setEventTags([...eventTags, tag])}
                onTagRemove={(tag: string) => setEventTags((value) => value.filter((i) => i !== tag))}
              />
              <EventThemeSelector currentEventTheme={eventTheme} setEventTheme={setEventTheme} />
              <div className="grid gap-2">
                <Label htmlFor="desktop-min-age">Minimum age</Label>
                <Input
                  id="desktop-min-age"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="No restriction"
                  value={minimumAge}
                  onChange={(e) => handleMinimumAgeChange(e.target.value)}
                  className={cn("h-12", isDesktopThemePreview ? createScreenFieldClass : "bg-background")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {renderDesktopSummary()}
    </div>
  );

  const renderDesktopTickets = () => (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className={cn("h-fit rounded-2xl border p-6", desktopThemePanelClass)}>
          <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Ticket builder</p>
          <h2 className="mt-1 text-2xl font-black">Pricing and capacity</h2>

          <div className={cn("mt-6 grid grid-cols-2 rounded-full border p-1", desktopThemeSubPanelClass)}>
            <button
              type="button"
              onClick={() => {
                setIsSelectedTicketPaid(true);
                setCurrentTicketData((prev) => ({ ...prev, priceError: false }));
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                isSelectedTicketPaid ? "bg-blue-800 text-white" : cn(desktopThemeMutedTextClass, "hover:opacity-80")
              )}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSelectedTicketPaid(false);
                setCurrentTicketData((prev) => ({ ...prev, price: "", priceError: false }));
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                !isSelectedTicketPaid ? "bg-blue-800 text-white" : cn(desktopThemeMutedTextClass, "hover:opacity-80")
              )}
            >
              Free
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="desktop-ticket-name">Ticket name</Label>
              <Input
                id="desktop-ticket-name"
                value={currentTicketData.name}
                onChange={(e) =>
                  setCurrentTicketData({ ...currentTicketData, name: e.target.value, nameError: false })
                }
                className={cn("h-12", isDesktopThemePreview ? createScreenFieldClass : "bg-background")}
                placeholder="General admission"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desktop-ticket-description">Description</Label>
              <textarea
                id="desktop-ticket-description"
                value={currentTicketData.description}
                onChange={(e) =>
                  setCurrentTicketData({ ...currentTicketData, description: e.target.value, descriptionError: false })
                }
                rows={4}
                className={cn(
                  "rounded-md border px-3 py-3 text-sm outline-none transition focus:border-blue-700",
                  isDesktopThemePreview ? createScreenFieldClass : "border-border bg-background",
                )}
                placeholder="What this ticket includes"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {isSelectedTicketPaid && (
                <div className="grid gap-2">
                  <Label htmlFor="desktop-ticket-price">Price</Label>
                  <Input
                    id="desktop-ticket-price"
                    value={currentTicketData.price}
                    onChange={(e) => handleTicketPriceChange(e.target.value)}
                    className={cn("h-12", isDesktopThemePreview ? createScreenFieldClass : "bg-background")}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="desktop-ticket-quantity">Quantity</Label>
                <Input
                  id="desktop-ticket-quantity"
                  value={currentTicketData.quantity}
                  onChange={(e) => handleTicketQuantityChange(e.target.value)}
                  className={cn("h-12", isDesktopThemePreview ? createScreenFieldClass : "bg-background")}
                  placeholder="100"
                />
              </div>
            </div>
            <Button
              className="h-12 rounded-full"
              onClick={() => handleTicketAdd(currentTicketData)}
              type="button"
              disabled={
                !currentTicketData.name.trim() ||
                !currentTicketData.description.trim() ||
                !currentTicketData.quantity.trim() ||
                parseInt(currentTicketData.quantity) <= 0 ||
                (isSelectedTicketPaid && (!currentTicketData.price.trim() || parseFloat(currentTicketData.price) <= 0))
              }
            >
              Add ticket
            </Button>
          </div>
        </div>

        <div className={cn("rounded-2xl border p-6", desktopThemePanelClass)}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", desktopThemeMutedTextClass)}>Inventory</p>
              <h2 className="mt-1 text-2xl font-black">Created tickets</h2>
            </div>
            <span className="rounded-full bg-blue-800/10 px-3 py-1 text-sm font-bold text-blue-800">
              {tickets.length} total
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className={cn("mt-8 rounded-2xl border border-dashed p-10 text-center", desktopThemeSubPanelClass)}>
              <p className="font-bold">No tickets yet</p>
              <p className={cn("mt-1 text-sm", desktopThemeMutedTextClass)}>Create at least one ticket to continue.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className={cn("rounded-2xl border p-4", desktopThemeSubPanelClass)}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black capitalize">{ticket.name}</h3>
                      <p className={cn("mt-1 line-clamp-2 text-sm", desktopThemeMutedTextClass)}>{ticket.description}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-red-600 hover:text-red-700"
                      onClick={() => handleTicketRemove(ticket.id)}
                      type="button"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="font-bold">{ticket.price ? `₦ ${ticket.price}` : "Free"}</span>
                    <span className={desktopThemeMutedTextClass}>Qty {ticket.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {renderDesktopSummary()}
    </div>
  );

  const renderDesktopPreview = () => (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className={cn("overflow-hidden rounded-2xl border", desktopThemePanelClass)}>
          <div className="relative aspect-[16/10] bg-muted">
            <Image
              src={titleImage || "/createeventpic.jpg"}
              alt={title || "Event preview"}
              fill
              className="object-cover"
              sizes="720px"
            />
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {eventTags.map((item) => (
                <span key={item} className="rounded-full bg-blue-800/10 px-3 py-1 text-sm font-bold text-blue-800">
                  {item}
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-4xl font-black capitalize tracking-tight">{title || "Untitled event"}</h2>
            <p className={cn("mt-3 text-base leading-7", desktopThemeMutedTextClass)}>{description}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className={cn("rounded-2xl border p-5", desktopThemePanelClass)}>
            <p className="font-black">Event details</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <GoCalendar />
                <span>
                  {startTime?.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }) || "Start time not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IoLocationOutline />
                <span>{[address, city, state].filter(Boolean).join(", ") || "Location not set"}</span>
              </div>
            </div>
          </div>

          <div className={cn("rounded-2xl border p-5", desktopThemePanelClass)}>
            <p className="font-black">Tickets</p>
            <div className="mt-4 grid gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className={cn("rounded-xl border p-4", desktopThemeSubPanelClass)}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold capitalize">{ticket.name}</span>
                    <span className="font-bold text-blue-800">{ticket.price ? `₦ ${ticket.price}` : "Free"}</span>
                  </div>
                  <p className={cn("mt-1 text-sm", desktopThemeMutedTextClass)}>Quantity: {ticket.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("rounded-2xl border p-5", desktopThemePanelClass)}>
            <p className="font-black">Publish settings</p>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Pass fees to ticket buyer", checked: isFeeOnUser, onChange: () => setFeeOnUser(!isFeeOnUser) },
                { label: "Secure exact location", checked: locationSecure, onChange: () => setLocationSecure(!locationSecure) },
                { label: "Public event", checked: isPublic, onChange: () => setIsPublic(!isPublic) },
              ].map((setting) => (
                <label key={setting.label} className={cn("flex items-center justify-between gap-4 rounded-xl border p-4", desktopThemeSubPanelClass)}>
                  <span className="font-semibold">{setting.label}</span>
                  <Switch
                    size="medium"
                    checked={setting.checked}
                    onCheckedChange={setting.onChange}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {renderDesktopSummary()}
    </div>
  );

  const renderDesktopContent = () => {
    switch (activeScreen) {
      case "details":
        return renderDesktopDetails();
      case "ticket":
        return renderDesktopTickets();
      case "preview":
        return renderDesktopPreview();
      default:
        return renderDesktopIntro();
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "details":
        return (
          <div className="w-full">
            <CoverImageUploader
              imageValue={titleImage}
              onImageValueChange={handleTitleImageChange}
              mediaFileType={"EVENT_HEADER"}
              setSubmitDisabled={setSubmitDisabled}
            />
            <div className="w-full flex flex-col px-4 gap-5 mt-4 pb-15">
              <div className="grid gap-2">
                <Label htmlFor="title" className={createScreenMutedTextClass}>
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn("py-6", createScreenFieldClass)}
                  required
                />
              </div>
              <div className="grid gap-2 ">
                <Label htmlFor="description" className={createScreenMutedTextClass}>
                  Description
                </Label>
                <textarea
                  id="decription"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className={cn(
                    "rounded-md border-1 px-3 py-2 focus:border-blue-600 focus:border-1 focus:outline-hidden",
                    createScreenFieldClass,
                  )}
                  required
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <DateTimePicker
                  date={startTime}
                  setDate={handleStartDateChange}
                  label="start date & time"
                />
                {startDateError && (
                  <p className="text-xs text-red-600">{startDateError}</p>
                )}
              </div>
              <div className="w-full">
                <DateTimePicker
                  date={stopTime}
                  setDate={handleStopDateChange}
                  label="stop date & time"
                />
                {stopDateError && (
                  <p className="text-xs text-red-600">{stopDateError}</p>
                )}
              </div>
              <div className="grid gap-2 w-full">
                <Label htmlFor="m-age" className={createScreenMutedTextClass}>
                  Minimum Age
                </Label>
                <Input
                  id="m-age"
                  name="m-age"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Minimum Age"
                  value={minimumAge}
                  onChange={(e) => handleMinimumAgeChange(e.target.value)}
                  className={cn("py-2", createScreenFieldClass)}
                />
              </div>
              <div className="grid gap-2">
                <div className={createScreenMutedTextClass}>Location</div>
                <LocationSearchDialog
                  currentLocation={{ coordinates, address, city, state }}
                  onLocationUpdate={handleLocationChange}
                  googleMapsApiKey={
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="flex flex-col">
                  <div className={cn("font-bold", createScreenTextClass)}>Event Genre</div>
                  <p className={cn("text-xs font-semibold", createScreenMutedTextClass)}>
                    Select genres that best describe your event
                  </p>
                </div>
                <EventTagDialog
                  currentEventTags={eventTags}
                  onTagAdd={(tag: string) => setEventTags([...eventTags, tag])}
                  onTagRemove={(tag: string) =>
                    setEventTags((value) => value.filter((i) => i !== tag))
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="flex flex-col">
                  <div className={cn("font-bold", createScreenTextClass)}>Event Theme</div>
                  <p className={cn("text-xs font-semibold", createScreenMutedTextClass)}>
                    Select a theme that sets the vibe for your event
                  </p>
                </div>
                <EventThemeSelector
                  currentEventTheme={eventTheme}
                  setEventTheme={setEventTheme}
                />
              </div>
              <div className="grid gap-2 w-full">
                <div className="flex flex-col">
                  <div className={cn("font-bold", createScreenTextClass)}>Event Snapshots</div>
                  <p className={cn("text-xs font-semibold", createScreenMutedTextClass)}>
                    Choose up to 20 pictures that best represent you experience
                  </p>
                </div>
                <ImageSnapshots
                  setSubmitDisabled={setSubmitDisabled}
                  initialImages={screenshots}
                  maxImages={20}
                  onImageAdd={setScreenshots}
                  onImageRemove={setScreenshots}
                />
              </div>
              <div className="grid gap-2 w-full">
                <div className="flex flex-col">
                  <div className={cn("font-bold", createScreenTextClass)}>Cover Video (Optional)</div>
                  <p className={cn("text-xs font-semibold", createScreenMutedTextClass)}>
                    Add short video teaser (max 60s) to grab attention
                  </p>
                </div>
                <CoverVideoUploader
                  videoValue={coverVideo}
                  onVideoValueChange={handleCoverVideoChange}
                  mediaFileType={"EVENT_COVER_VIDEO"}
                  setSubmitDisabled={setSubmitDisabled}
                  className="mb-10"
                />
              </div>
              <Button
                className="bg-blue-800 hover:bg-blue-800 font-semibold text-sm py-6 rounded-md"
                onClick={() => setActiveScreen("ticket")}
                disabled={isDetailsInValid}
                type="button"
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case "ticket":
        return (
          <div className="w-full flex-1">
            <div className="w-full flex flex-col gap-6 px-4 py-4">
              <div className={cn(
                "flex w-full flex-col items-center justify-center gap-4 rounded-md border-1 px-4 py-4 shadow-md",
                createScreenCardClass,
              )}>
                <h2 className={cn("font-bold text-xl", createScreenTextClass)}>Create Ticket for Event</h2>
                <div
                  className={cn("flex w-full items-center justify-between rounded-md border", createScreenCardClass)}
                >
                  <span
                    className={`w-[50%] text-center font-semibold cursor-pointer pl-4 py-3 border-b-2  ${isSelectedTicketPaid
                      ? `${createScreenTextClass} border-blue-500`
                      : `${createScreenMutedTextClass} border-transparent`
                      }`}
                    onClick={() => {
                      setIsSelectedTicketPaid(true);
                      setCurrentTicketData(prev => ({ ...prev, priceError: false }));
                    }}
                  >
                    Paid
                  </span>
                  <span
                    className={`w-[50%] text-center font-semibold pr-4cursor-pointer py-3 border-b-2 ${!isSelectedTicketPaid
                      ? `${createScreenTextClass} border-blue-500`
                      : `${createScreenMutedTextClass} border-transparent`
                      }`}
                    onClick={() => {
                      setIsSelectedTicketPaid(false);
                      setCurrentTicketData(prev => ({ ...prev, price: "", priceError: false }));
                    }}
                  >
                    Free
                  </span>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className={createScreenMutedTextClass}>
                      Ticket Name
                    </Label>
                    <Input
                      id="ticket-name"
                      type="text"
                      placeholder="Ticket Name"
                      value={currentTicketData.name}
                      onChange={(e) =>
                        setCurrentTicketData({
                          ...currentTicketData,
                          name: e.target.value,
                          nameError: false,
                        })
                      }
                      className={cn("py-6", createScreenFieldClass)}
                      required
                    />
                    {currentTicketData.nameError && (
                      <span className="text-xs text-red-600">
                        Ticket name is required
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title" className={createScreenMutedTextClass}>
                      Description
                    </Label>
                    <textarea
                      id="ticket-decription"
                      placeholder="Ticket Description"
                      value={currentTicketData.description}
                      onChange={(e) =>
                        setCurrentTicketData({
                          ...currentTicketData,
                          description: e.target.value,
                          descriptionError: false,
                        })
                      }
                      rows={5}
                      className={cn(
                        "rounded-md border-1 px-3 py-2 focus:border-blue-600 focus:border-1 focus:outline-hidden",
                        createScreenFieldClass,
                      )}
                      required
                    />
                    {currentTicketData.descriptionError && (
                      <span className="text-xs text-red-600">
                        Ticket description is required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 items-start">
                    {isSelectedTicketPaid && (
                      <div className="grid gap-2 w-full">
                        <Label htmlFor="title" className={createScreenMutedTextClass}>
                          Price
                        </Label>
                        <Input
                          id="ticket-price"
                          type="text"
                          placeholder="Ticket Price"
                          value={currentTicketData.price}
                          onChange={(e) =>
                            handleTicketPriceChange(e.target.value)
                          }
                          className={cn("py-6", createScreenFieldClass)}
                          required
                        />
                        {currentTicketData.priceError && (
                          <span className="text-xs text-red-600">
                            Paid tickets must have a price greater than 0
                          </span>
                        )}
                      </div>
                    )}
                    <div className="grid gap-2 w-full">
                      <Label htmlFor="title" className={createScreenMutedTextClass}>
                        Quantity
                      </Label>
                      <Input
                        id="ticket-quantity"
                        type="text"
                        placeholder="Ticket Quantity"
                        value={currentTicketData.quantity}
                        onChange={(e) =>
                          handleTicketQuantityChange(e.target.value)
                        }
                        className={cn("py-6", createScreenFieldClass)}
                        required
                      />
                      {currentTicketData.quantityError && (
                        <span className="text-xs text-red-600">
                          Quantity cannot be lower than 1
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="py-7 text-md font-semibold bg-blue-800 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleTicketAdd(currentTicketData)}
                    type="button"
                    disabled={
                      !currentTicketData.name.trim() ||
                      !currentTicketData.description.trim() ||
                      !currentTicketData.quantity.trim() ||
                      parseInt(currentTicketData.quantity) <= 0 ||
                      (isSelectedTicketPaid && (!currentTicketData.price.trim() || parseFloat(currentTicketData.price) <= 0))
                    }
                  >
                    + Create Ticket
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {tickets.length > 0 && (
                  <h3 className={cn("font-semibold text-xl", createScreenTextClass)}>
                    You created tickets ({tickets.length})
                  </h3>
                )}
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-md border-1 p-4 shadow-md",
                      createScreenCardClass,
                    )}
                  >
                    <div className="flex justify-between w-full items-center">
                        <span className={cn("font-semibold text-sm leading-none capitalize", createScreenTextClass)}>
                          {ticket.name}
                        </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="px-2 py-1 border-none shadow-none"
                        onClick={() => handleTicketRemove(ticket.id)}
                        type="button"
                      >
                        <FiTrash2 className="text-red-600" />
                      </Button>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <span className={cn("flex items-center gap-1", createScreenTextClass)}>
                        <GoTag className="text-blue-800" />
                        {ticket.price ? ticket.price : "0.00"}
                      </span>
                      <span className={cn("flex items-center gap-1", createScreenMutedTextClass)}>
                        <TbUsers className="text-blue-800" />
                        Qty: {ticket.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="py-7 text-lg font-bold bg-blue-800 hover:bg-blue-800"
                onClick={() => setActiveScreen("preview")}
                disabled={tickets.length === 0}
                type="button"
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case "preview":
        const isPreviewDataInvalid =
          !title ||
          !description ||
          !startTime ||
          !stopTime ||
          !titleImage ||
          !address ||
          !city ||
          !state ||
          !coordinates?.latitude ||
          !coordinates?.longitude ||
          (isAgeRestricted && !minimumAge) ||
          eventTags.length <= 0 ||
          eventTheme.length < 2 ||
          tickets.length === 0;

        return (
          <div className="w-full flex-1">
            <div className="w-full flex flex-col gap-3 px-4 pt-6 pb-15">
              <div className="relative h-80 rounded-full w-full">
                <Image
                  src={titleImage || "/createeventpic.jpg"}
                  alt="Cover preview"
                  fill
                  className="object-cover h-full w-full rounded-lg"
                />
              </div>
              <h3 className={cn("font-bold text-2xl", createScreenTextClass)}>{title}</h3>
              <div className={cn("flex flex-col gap-4 font-medium text-md", createScreenMutedTextClass)}>
                <div className="w-full flex items-center justify-start gap-4">
                  <div className="flex items-center gap-1">
                    <GoCalendar size={20} />
                    <span className="leading-none">
                      {startTime?.toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LuClock size={20} />
                    <span className="leading-none">
                      {startTime?.toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IoLocationOutline size={27} />
                  <p className="leading-tight">{`${address}, ${city}, ${state}`}</p>
                </div>
                <Linkify text={description} className="text-lg leading-tight" />
                <div className="flex flex-wrap gap-2">
                  {eventTags.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "inline-block rounded-full px-3 py-1 text-sm font-medium",
                        isLightEventSurface ? "bg-black/10 text-black/75" : "bg-white/10 text-white/75",
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className={cn("font-bold text-lg", createScreenTextClass)}>Snapshots</div>
                  <SnapshotCarousel snapshots={screenshots} />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className={cn("font-bold text-lg", createScreenTextClass)}>Tickets</div>
                  <div className="flex flex-col gap-2 w-full">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={cn(
                          "flex flex-col gap-2 rounded-md px-4 py-4",
                          isLightEventSurface ? "bg-black/8" : "bg-white/8",
                        )}
                      >
                        <span className={cn("font-bold", createScreenTextClass)}>
                          {ticket.name}
                        </span>
                        <div className="w-full flex justify-between items-center">
                          <span className="text-blue-700 font-semibold">
                            {ticket.price || "FREE"}
                          </span>
                          <span className={cn("font-medium text-sm", createScreenMutedTextClass)}>
                            Quantity: {ticket.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full flex flex-col gap-6">
                  <div className="w-full flex gap-4 items-center">
                    <Switch
                      id="secure-location"
                      size="medium"
                      checked={isFeeOnUser}
                      onCheckedChange={() => {
                        setFeeOnUser(!isFeeOnUser);
                      }}
                    />
                    <span className={cn("font-semibold", createScreenTextClass)}>
                      Pass fees to the ticket buyer
                    </span>
                  </div>
                  <div className="w-full flex gap-4 items-center">
                    <Switch
                      id="secure-location"
                      size="medium"
                      checked={locationSecure}
                      onCheckedChange={() => {
                        setLocationSecure(!locationSecure);
                      }}
                    />
                    <span className={cn("font-semibold", createScreenTextClass)}>Extra Security</span>
                  </div>
                  <div className="w-full flex gap-4 items-center">
                    <Switch
                      id="secure-location"
                      size="medium"
                      checked={isPublic}
                      onCheckedChange={() => {
                        setIsPublic(!isPublic);
                      }}
                    />
                    <span className={cn("font-semibold", createScreenTextClass)}>
                      Make this event public
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="py-7 text-lg font-bold bg-blue-800 hover:bg-blue-800 mt-6"
                onClick={handleSubmit}
                disabled={loading || isPreviewDataInvalid}
              >
                {loading ? <LoaderSmall /> : "Create"}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full flex flex-col flex-1 items-start gap-6 py-2 px-6 min-h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-1 w-full mb-2">
               <h1 className="font-black text-3xl text-foreground">Create Magic</h1>
               <p className="text-muted-foreground font-medium tracking-tight">What makes a great event is a great host.</p>
            </div>
            <div className="w-full flex flex-col gap-4">
              {intoObjects.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-4 items-center w-full rounded-2xl border border-border dark:border-neutral-800 bg-transparent py-4 px-4 shadow-sm"
                >
                  <div className="bg-muted/40/50 dark:bg-neutral-800/50 rounded-xl p-3 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-[1.05rem] text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium leading-tight">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full mt-auto mt-8 pb-6">
      <Button
        className={cn(
          "rounded-xl py-6 text-[1.05rem] font-semibold bg-blue-700 hover:bg-blue-800 text-white",
          isDesktop ? "w-auto px-8" : "w-full"
        )}
        onClick={() => setActiveScreen("details")}
        type="button"
      >
                Create Event
              </Button>
            </div>
          </div>
        );
    }
  };

  if (isDesktop) {
    if (activeScreen === "success") {
      return (
        <div className={cn("min-h-screen bg-background", className)} {...props}>
          <CreateEventSuccess
            onContinue={() => {
              router.push("/?screen=plans");
            }}
            event={event!}
            variant="desktop"
          />
        </div>
      );
    }

    return (
      <main
        className={cn(
          "min-h-screen",
          isDesktopThemePreview ? desktopThemeTextClass : "bg-background text-foreground",
          className,
        )}
        style={isDesktopThemePreview ? detailsContainerStyle : undefined}
        {...props}
      >
        <header className={cn("sticky top-0 z-50 border-b backdrop-blur", desktopThemeHeaderClass)}>
          <div className="desktop-page-header-inner flex h-20 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleBackClick}
                aria-label="Back"
              >
                <FaArrowLeft size={16} />
              </Button>
              <div className="min-w-0">
                <p className={cn("text-xs font-bold uppercase tracking-[0.24em]", desktopThemeMutedTextClass)}>
                  Create event
                </p>
                <h1 className="truncate text-xl font-black">
                  {activeScreen === "intro" ? "Host a new experience" : headerTitle()}
                </h1>
              </div>
            </div>

            {activeScreen !== "intro" && (
              <div className="hidden items-center gap-2 lg:flex">
                {desktopSteps.map((step, index) => {
                  const isActive = activeScreen === step.value;
                  const isComplete = index < currentStepIndex;

                  return (
                    <button
                      key={step.value}
                      type="button"
                      disabled={!canOpenDesktopStep(step.value)}
                      onClick={() => setActiveScreen(step.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
                        isActive
                          ? "border-blue-800 bg-blue-800 text-white"
                          : isComplete
                            ? "border-green-700/30 bg-green-700/10 text-green-700"
                            : isDesktopThemePreview
                              ? isLightEventSurface
                                ? "border-black/10 bg-white/55 text-black/65 hover:text-black"
                                : "border-white/10 bg-black/25 text-white/70 hover:text-white"
                              : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-xs">
                        {index + 1}
                      </span>
                      {step.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        <div className="desktop-page-container py-8">
          {activeScreen !== "intro" && (
            <div className="mb-8 grid gap-3 lg:hidden">
              {desktopSteps.map((step, index) => (
                <button
                  key={step.value}
                  type="button"
                  disabled={!canOpenDesktopStep(step.value)}
                  onClick={() => setActiveScreen(step.value)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left disabled:opacity-40",
                    activeScreen === step.value
                      ? "border-blue-800 bg-blue-800 text-white"
                      : isDesktopThemePreview
                        ? desktopThemePanelClass
                        : "border-border bg-card",
                  )}
                >
                  <span>
                    <span className="block text-sm font-black">{step.title}</span>
                    <span className={cn("block text-xs", activeScreen === step.value ? "text-white/65" : desktopThemeMutedTextClass)}>
                      {step.description}
                    </span>
                  </span>
                  <span className="text-sm font-black">{index + 1}</span>
                </button>
              ))}
            </div>
          )}
          <form>{renderDesktopContent()}</form>
        </div>
      </main>
    );
  }

  return (
    <div
      className={cn(
        "w-full min-h-[100dvh] flex flex-col bg-background text-foreground",
        isDesktop && "border-x border-border shadow-sm",
        className
      )}
      style={activeScreen === "details" ? detailsContainerStyle : undefined}
      {...props}
    >
      {activeScreen !== "success" ? (
        <>
          <div
            className={cn(
              "w-full flex flex-col gap-3 h-20 justify-center",
              activeScreen !== "intro" ? "border-b-1 border-border" : "",
              className
            )}
            {...props}
          >
            <div className="flex flex-row items-center px-8">
              <FaArrowLeft
                size={20}
                onClick={handleBackClick}
                className="cursor-pointer hover:text-muted-foreground transition-colors"
              />
              {activeScreen !== "intro" && (
                <p className={cn(
                  "font-semibold text-md w-full text-center capitalize truncate ml-4",
                  activeScreen === "details" || activeScreen === "ticket" || activeScreen === "preview"
                    ? createScreenTextClass
                    : "text-foreground",
                )}>
                  {headerTitle()}
                </p>
              )}
            </div>
          </div>
          <form className="flex-1 flex flex-col">{renderScreen()}</form>
        </>
      ) : (
        <CreateEventSuccess
          onContinue={() => {
            router.push("/?screen=plans");
          }}
          event={event!}
        />
      )}
    </div>
  );
};
