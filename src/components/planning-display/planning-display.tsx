import React, { useCallback, useEffect, useState, useRef, ComponentProps } from 'react';
import Image from "next/image";
import PageHeader from "../page-header/page-header";
import { Tabs } from "./tabs";
import { authApi } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, Radio, Upload, ChevronDown } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useShare } from "@/hooks/share-option";
import { ShareDialog } from "@/components/share-button/share-option";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { showTopToast } from "@/components/toast/toast-util";
import defaultImage from "@/assests/default.jpeg";
import { FaRegHeart } from 'react-icons/fa';
import { BiCalendarAlt } from 'react-icons/bi';
import { PiFireSimpleBold } from 'react-icons/pi';
import { AddToCalendar } from "@/components/share-button/add-to-calendar";
import { BookingCardSkeleton, EventCardSkeleton } from "@/components/ui/page-skeletons";

// Types
interface BookingItem {
  eventId: string;
  title: string;
  titleImage: string;
  startTime: string;
  stopTime: string;
  numberOfTickets: number;
  address: string;
  eventDisplayStatus?: string;
}

interface EventItem {
  id: string;
  description: string;
  titleImage: string;
  title: string;
  coHosts: any[];
  startTime: string | Date;
}

interface BookingsResponse {
  data: {
    data: BookingItem[];
  };
}

type TabType = "bookings" | "events" | null;
type UserPlanType = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

// Constants
const BOOKING_API_CONFIG = {
  pageNumber: 1,
  pageSize: 10,
};

const EVENT_API_CONFIG = {
  pageNumber: 1,
  pageSize: 10,
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};

const FILTER_OPTIONS = [
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

// Custom hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const observer = useRef<IntersectionObserver>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, callback]
  );

  return lastElementRef;
}

// Utility Functions
const formatDateRange = (startTime: string, endTime: string): string => {
  const startDate = new Date(startTime);
  const formattedStartDate = startDate.toLocaleString(
    "en-US",
    DATE_FORMAT_OPTIONS
  );

  // Remove the year from start date (everything after the last comma)
  const startDateWithoutYear = formattedStartDate.slice(
    0,
    formattedStartDate.lastIndexOf(",")
  );

  const endDate = new Date(endTime);
  const formattedEndDate = endDate.toLocaleString("en-US", DATE_FORMAT_OPTIONS);
  return `${startDateWithoutYear} - ${formattedEndDate}`;
};

// Filter Dropdown Component
interface FilterDropdownProps {
  selectedFilter: UserPlanType;
  onFilterChange: (filter: UserPlanType) => void;
}

function FilterDropdown({
  selectedFilter,
  onFilterChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = FILTER_OPTIONS.find(
    (option) => option.value === selectedFilter
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-baseline ">
      <p className="text-sm font-medium">Display Plans by</p>
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-36 py-2 text-left bg-background rounded-lg border-none outline-none"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {selectedOption?.label || "Select filter"}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-36 mt-1 bg-background border border-border rounded-sm shadow-lg">
            <div className="">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-xs  border-b border-border hover:bg-accent/40 focus:outline-none focus:bg-accent/40 text-muted-foreground
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
interface BookingCardProps {
  booking: BookingItem;
  isLast?: boolean;
  lastElementRef?: (node: HTMLDivElement) => void;
}

function BookingCard({ booking, isLast, lastElementRef }: BookingCardProps) {
  const dateRange = formatDateRange(booking.startTime, booking.stopTime);
  const router = useRouter();

  return (
    <div
      className="w-full flex flex-col"
      onClick={() => {
        router.push(`/m/bookings/${booking.eventId}`);
      }}
      ref={isLast ? lastElementRef : null}
    >
      <article className=" shadow-xl flex flex-col rounded-lg overflow-hidden">
        <div className="relative">
          <Image
            src={booking.titleImage}
            alt={booking.title}
            width={800}
            height={200}
            className="w-full h-48 object-cover"
            priority={false}
          />
          <div className="absolute bottom-3 right-3">
            <AddToCalendar
              event={{
                title: booking.title,
                startTime: booking.startTime,
                stopTime: booking.stopTime,
                address: booking.address,
                description: "You have securely booked a ticket for this fantastic event!"
              }}
            />
          </div>
        </div>

        <div className="p-3 space-y-2">
          <h3 className="text-lg font-bold first-letter:uppercase line-clamp-2">
            {booking.title}
          </h3>

          <div className="space-y-1 text-xs text-gray-600 flex flex-col gap-1">
            <p className="font-normal text-sm">{dateRange}</p>
            <p className=" flex gap-2 items-center">
              <Radio /> {booking.eventDisplayStatus || "ACTIVE"}
            </p>
            <p className=" flex gap-2 items-center">
              <Briefcase size={20} />
              <span>{booking.numberOfTickets} Tickets</span>
            </p>
            <p
              className="truncate flex gap-2 items-center"
              title={booking.address}
            >
              <MapPin size={20} />
              <span>{booking.address}</span>
            </p>
          </div>
        </div>
      </article>
      {booking.numberOfTickets > 1 ? (
        <div className="flex flex-col items-center gap-1">
          <div className=" w-[95%] h-2 bg-muted rounded-b-xl"></div>
          <div className=" w-[93%] h-2 bg-muted rounded-b-xl"></div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

interface BookingsListProps {
  bookings: BookingItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  selectedFilter: UserPlanType;
  onFilterChange: (filter: UserPlanType) => void;
  handleScreenChange: (value: string) => void;
}

function BookingsList({
  bookings,
  isLoading,
  error,
  hasMore,
  loadMore,
  isLoadingMore,
  selectedFilter,
  onFilterChange,
  handleScreenChange,
}: BookingsListProps) {
  const lastElementRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading bookings: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <FilterDropdown
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
      />

      {isLoading && bookings.length === 0 ? (
        <div className="space-y-5 py-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      ) : !bookings.length ? (
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4 mt-20">
          <BiCalendarAlt size={40} className="text-blue-800" />
          <span className="flex flex-col gap-2">
            <p className="text-neutral-500 text-sm font-semibold">
              No upcoming or in-progress booking found!
            </p>
          </span>
          <Button
            onClick={() => handleScreenChange("events")}
            className="rounded-full py-5 px-5"
          >
            Find events
          </Button>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4 pb-15">
          {bookings.map((booking, index) => (
            <BookingCard
              key={booking.eventId}
              booking={booking}
              isLast={index === bookings.length - 1}
              lastElementRef={lastElementRef}
            />
          ))}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-4">
              <Loader />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Updated useBookings hook with filter support
function useBookings() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<UserPlanType>("SCHEDULED");

  const loadBookings = useCallback(
    async (
      page: number,
      reset: boolean = false,
      userPlanType: UserPlanType = currentFilter
    ) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const response = await authApi.get<BookingsResponse>(
          "/userTicket/user/plan",
          {
            params: {
              ...BOOKING_API_CONFIG,
              pageNumber: page,
              userPlanType,
            },
          }
        );

        const bookingsData = response.data.data.data;

        if (!Array.isArray(bookingsData)) {
          throw new Error("Invalid response format");
        }

        if (reset || page === 1) {
          setBookings(bookingsData);
        } else {
          setBookings((prev) => [...prev, ...bookingsData]);
        }

        // Check if there are more pages
        setHasMore(bookingsData.length === BOOKING_API_CONFIG.pageSize);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load bookings";
        setError(errorMessage);
        console.error("Error loading bookings:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentFilter]
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadBookings(currentPage + 1);
    }
  }, [currentPage, hasMore, isLoadingMore, loadBookings]);

  const refetch = useCallback(
    (userPlanType?: UserPlanType) => {
      setCurrentPage(1);
      setHasMore(true);
      loadBookings(1, true, userPlanType);
    },
    [loadBookings]
  );

  const changeFilter = useCallback(
    (newFilter: UserPlanType) => {
      setCurrentFilter(newFilter);
      setCurrentPage(1);
      setHasMore(true);
      loadBookings(1, true, newFilter);
    },
    [loadBookings]
  );

  useEffect(() => {
    loadBookings(1);
  }, [loadBookings]);

  return {
    bookings,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isLoadingMore,
    currentFilter,
    changeFilter,
  };
}

// Updated useEvents hook with infinite scroll
function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadEvents = useCallback(
    async (page: number, reset: boolean = false) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const response = await authApi.get("/event/user", {
          params: {
            ...EVENT_API_CONFIG,
            pageNumber: page,
          },
        });

        const eventsData = response.data.data.data;

        if (!Array.isArray(eventsData)) {
          throw new Error("Invalid response format");
        }

        if (reset || page === 1) {
          setEvents(eventsData);
        } else {
          setEvents((prev) => [...prev, ...eventsData]);
        }

        // Check if there are more pages
        setHasMore(eventsData.length === EVENT_API_CONFIG.pageSize);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load events";
        setError(errorMessage);
        showTopToast("error", `Error loading events: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadEvents(currentPage + 1);
    }
  }, [currentPage, hasMore, isLoadingMore, loadEvents]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadEvents(1, true);
  }, [loadEvents]);

  useEffect(() => {
    loadEvents(1);
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isLoadingMore,
  };
}

interface EventsContentProps {
  events: EventItem[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
}

function EventsContent({
  events,
  isLoading,
  hasMore,
  loadMore,
  isLoadingMore,
}: EventsContentProps) {
  const router = useRouter();
  const lastElementRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore);

  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-5 py-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (events.length <= 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4 mt-20">
        <PiFireSimpleBold size={40} className="text-blue-800" />
        <span className="flex flex-col gap-2">
          <p className="text-neutral-500 text-sm font-semibold">
            {"Looks like you haven't set up events yet"}
          </p>
        </span>
        <Button
          onClick={() => router.push(
            `/m/event-create?prev=${encodeURIComponent("/?screen=plans")}`
          )}
          className="rounded-full py-5 px-5"
        >
          Create event
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center pt-4 pb-12 flex flex-col gap-6">
      {events?.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} ref={isLast ? lastElementRef : null}>
            <EventsCard event={event} />
          </div>
        );
      })}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <Loader />
        </div>
      )}
    </div>
  );
}

interface EventsCardProp {
  event: EventItem;
}
function EventsCard({ event }: EventsCardProp) {
  const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""
    }/event/${event.id}`;
  const { isShareDialogOpen, closeShareDialog, handleQuickShare } = useShare({
    title: event.title,
    url: eventUrl,
    description: event.description,
  });

  function formatDateToMonthDay(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }

  const router = useRouter();
  return (
    <>
      <div className="flex flex-col gap-3">
        <Image
          width={800}
          height={500}
          src={event.titleImage}
          onClick={() =>
            router.push(
              `/m/events/${event.id}?prev=${encodeURIComponent(
                "/?screen=plans"
              )}`
            )
          }
          className="w-full max-h-96 object-cover rounded-2xl"
          alt=""
        />
        <h3 className=" text-left text-lg font-semibold first-letter:capitalize">
          {event.title}
        </h3>
        <div className="flex justify-between items-center">
          {event.coHosts && event.coHosts.length > 0 && (
            <span className="flex gap-3 items-center">
              <div className="relative *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
                {event.coHosts.slice(0, 4).map((cohost, index) => (
                  <Avatar key={index}>
                    <AvatarImage
                      src={cohost.profileImageUrl}
                      alt={cohost.username}
                    />
                    <AvatarFallback>
                      <Image src={defaultImage} alt={cohost.username} fill />
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p>{event.coHosts.length} hosts</p>
            </span>
          )}
          <div className="flex gap-3 items-center ml-auto">
            <span className=" text-white text-xs bg-black py-2 px-3 font-normal rounded-full flex ">
              {formatDateToMonthDay(event.startTime.toLocaleString())}
            </span>
            <span
              className=" text-white bg-black py-2 px-2 font-normal rounded-full flex"
              onClick={handleQuickShare}
            >
              <Upload size={18} />
            </span>
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={closeShareDialog}
        title={event.title}
        url={eventUrl}
        description={event.description}
      />
    </>
  );
}

interface PlanningDisplayProps {
  handleScreenChange: (value: string) => void;
}


// Main Component
export default function PlanningDisplay({ handleScreenChange }: PlanningDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bookings");
  const {
    bookings,
    isLoading,
    error,
    hasMore,
    loadMore,
    isLoadingMore,
    currentFilter,
    changeFilter,
  } = useBookings();
  const {
    events,
    isLoading: isEventsLoading,
    error: isEventsError,
    refetch,
    hasMore: hasMoreEvents,
    loadMore: loadMoreEvents,
    isLoadingMore: isLoadingMoreEvents,
  } = useEvents();

  const renderTabContent = () => {
    switch (activeTab) {
      case "bookings":
        return (
          <BookingsList
            bookings={bookings}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            loadMore={loadMore}
            isLoadingMore={isLoadingMore}
            selectedFilter={currentFilter}
            onFilterChange={changeFilter}
            handleScreenChange={handleScreenChange}
          />
        );
      case "events":
        return (
          <EventsContent
            events={events}
            isLoading={isEventsLoading}
            hasMore={hasMoreEvents}
            loadMore={loadMoreEvents}
            isLoadingMore={isLoadingMoreEvents}
          />
        );
      default:
        return null;
    }
  };

  return (
    //view hieght subtracted from navbar height
    <div className="w-full overflow-y-scroll bg-accent/40 flex flex-col min-h-[100dvh]">
      <div className="p-2">
        <PageHeader headerTitle="Plans" prev={"/?screen=plans"} />
        <Tabs active={activeTab} onClick={setActiveTab} />
      </div>

      <main className="p-4">{renderTabContent()}</main>
    </div>
  );
}
