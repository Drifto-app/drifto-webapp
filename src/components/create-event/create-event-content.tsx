"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  IoCashOutline,
  IoEarthOutline,
  IoGiftOutline,
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { CiCalendar, CiClock2 } from "react-icons/ci";
import { LuClock } from "react-icons/lu";
import { SnapshotCarousel } from "@/components/event-page/image-silder";
import { Switch } from "@/components/ui/switch";
import { LoaderSmall } from "@/components/ui/loader";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { CreateEventSuccess } from "@/components/create-event/create-success";
import { useShare } from "@/hooks/share-option";
import { CoverVideoUploader } from "../ui/cover-video";
import { Linkify } from "@/lib/linkify";
import {
  DEFAULT_EVENT_THEME,
  getEventThemeBackground,
  isEventThemeLight,
} from '@/lib/event-theme';
import { useTheme } from 'next-themes';

interface CreateEventContentProps extends React.ComponentProps<"div"> {
  prev: string | null;
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

export const CreateEventContent = ({
  prev,
  className,
  ...props
}: CreateEventContentProps) => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [event, setEvent] = useState<{ [key: string]: any } | null>(null);
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
  const [tickets, setTickets] = useState<any[]>([]);
  const [eventTheme, setEventTheme] = useState<[string, string]>(DEFAULT_EVENT_THEME);

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

  const handleLocationChange = (locationData: { [key: string]: any }) => {
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
    let updatedTicket = { ...newTicket };

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
      eventTheme.length !== 2 ||
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
    } catch (error: any) {
      showTopToast("error", error.response?.data?.description);
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
          eventTheme.length !== 2 ||
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
                className="w-full rounded-xl py-6 text-[1.05rem] font-semibold bg-blue-700 hover:bg-blue-800 text-white"
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

  return (
    <div
      className={cn("w-full min-h-[100dvh] flex flex-col bg-background text-foreground", className)}
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
