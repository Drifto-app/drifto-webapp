"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Edit3,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import { authApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ThemedLogo } from "@/components/ui/themed-logo";
import { EventDetailPageSkeleton } from "@/components/ui/page-skeletons";
import { showTopToast } from "@/components/toast/toast-util";
import { useAuthStore } from "@/store/auth-store";
import { Linkify } from "@/lib/linkify";
import { CoverVideoSection } from "@/components/event-page/cover-video-section";
import { SingleEventMap } from "@/components/event-page/event-map";
import { SingleEventReviews } from "@/components/event-page/event-review";
import { SingleEventRelated } from "@/components/event-page/event-related";
import { UserEventSinglePlaceholder } from "@/components/ui/user-placeholder";
import { useShare } from "@/hooks/share-option";
import { ShareDialog } from "@/components/share-button/share-option";
import { ReportDrawer } from "@/components/report/report-drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/error-message";
import { getEventThemeBackground, isEventThemeLight } from "@/lib/event-theme";
import { getEventDisplayStatusMeta } from "@/lib/event-status";
import { DESKTOP_ROUTES, withPrev } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface DesktopEventPageProps {
  eventId: string;
}

interface EventTicketSummary {
  price?: number | string;
  purchasedQuantity?: number;
}

type EventUserSummary = Record<string, unknown> & {
  id?: string;
};

interface DesktopEvent {
  [key: string]: unknown;
  id: string;
  slug?: string;
  title: string;
  description?: string;
  startTime?: string | Date;
  stopTime?: string | Date;
  titleImage?: string;
  titleFileUrl?: string;
  coverVideo?: string | null;
  eventTheme?: string[] | null;
  original?: boolean;
  eventDisplayStatus?: string | null;
  locationSecure?: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  tickets?: EventTicketSummary[];
  numberOfPurchasedTickets?: number;
  isLikedByUser?: boolean;
  hostCollaborationStatus?: string | null;
  totalLikes?: number;
  totalComments?: number;
  eventTags?: string[];
  coHosts?: EventUserSummary[];
}

const formatCurrency = (value: number) => {
  if (value === 0) return "Free";
  return `₦ ${value.toFixed(2)}`;
};

const getStartingPrice = (event: DesktopEvent) => {
  if (!event.tickets?.length) return "Unavailable";

  const minPrice = event.tickets.reduce((min: number, ticket) => {
    const currentPrice = Number(ticket.price);
    if (!Number.isFinite(currentPrice)) return min;
    return currentPrice < min ? currentPrice : min;
  }, Infinity);

  return minPrice === Infinity ? "Unavailable" : formatCurrency(minPrice);
};

const getPurchasedTickets = (event: DesktopEvent) => {
  if (!event.tickets?.length) return event.numberOfPurchasedTickets ?? 0;

  return event.tickets.reduce((sum: number, ticket) => {
    return sum + (ticket.purchasedQuantity ?? 0);
  }, 0);
};

function DetailSection({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id?: string;
  title: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-8">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DesktopEventPage({ eventId }: DesktopEventPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { isAuthenticated, isLoading, hasTriedRefresh } = useAuthStore();

  const [event, setEvent] = React.useState<DesktopEvent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isLikedLoading, setIsLikedLoading] = React.useState(false);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const currentPathUrl = React.useMemo(() => {
    const query = searchParams?.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  React.useEffect(() => {
    if (!eventId) return;
    if (isLoading || (!isAuthenticated && !hasTriedRefresh)) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = isAuthenticated
          ? await authApi.get(`/event/${eventId}`)
          : await authApi.get(`/event/public/${eventId}`);

        setEvent(response.data.data);
        setIsLiked(Boolean(response.data.data?.isLikedByUser));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Error loading event"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, hasTriedRefresh, isAuthenticated, isLoading]);

  const startDate = event?.startTime ? new Date(event.startTime) : null;
  const stopDate = event?.stopTime ? new Date(event.stopTime) : null;
  const isPastEvent = Boolean(stopDate && stopDate < new Date());
  const isHostOrCoHost = Boolean(event?.hostCollaborationStatus);
  const isPrimaryHost = event?.hostCollaborationStatus === "HOST";
  const titleImage = event?.titleImage || event?.titleFileUrl || "/createeventpic.jpg";
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const orderPath = event
    ? withPrev(DESKTOP_ROUTES.order(event.id), currentPathUrl)
    : "";
  const eventThemeStyle = React.useMemo(
    () => getEventThemeBackground(event?.eventTheme, resolvedTheme),
    [event?.eventTheme, resolvedTheme],
  );
  const isLightEventSurface = React.useMemo(
    () => isEventThemeLight(event?.eventTheme, resolvedTheme),
    [event?.eventTheme, resolvedTheme],
  );
  const hasEventTheme = Boolean(eventThemeStyle);
  const eventTextClass = hasEventTheme
    ? isLightEventSurface
      ? "text-black"
      : "text-white"
    : "text-foreground";
  const eventMutedTextClass = hasEventTheme
    ? isLightEventSurface
      ? "text-black/65"
      : "text-white/70"
    : "text-muted-foreground";
  const eventPanelClass = hasEventTheme
    ? isLightEventSurface
      ? "border-black/10 bg-white/80 text-black"
      : "border-white/12 bg-black/35 text-white"
    : "border-border bg-card text-card-foreground";
  const eventSubPanelClass = hasEventTheme
    ? isLightEventSurface
      ? "border-black/10 bg-white/55 text-black"
      : "border-white/10 bg-black/25 text-white"
    : "border-border bg-card";
  const eventHeaderClass = hasEventTheme
    ? isLightEventSurface
      ? "border-black/10 bg-white/30"
      : "border-white/10 bg-black/25"
    : "border-border bg-background/90";
  const eventNavClass = hasEventTheme
    ? isLightEventSurface
      ? "text-black/65 hover:bg-black/10 hover:text-black"
      : "text-white/70 hover:bg-white/10 hover:text-white"
    : "text-muted-foreground hover:bg-accent hover:text-foreground";

  const eventUrl =
    event && process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/event/${event.slug ?? event.id}`
      : currentPathUrl;

  const { isShareDialogOpen, closeShareDialog, handleQuickShare } = useShare({
    title: event?.title ?? "Drifto event",
    url: eventUrl,
    description: event?.description ?? "",
  });

  const handleReaction = async () => {
    if (!event || isLikedLoading) return;

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(currentPathUrl)}`);
      return;
    }

    setIsLikedLoading(true);
    const previousValue = isLiked;

    try {
      setIsLiked(!previousValue);
      await authApi.post("/reaction/react", {
        reactionType: "EVENT",
        eventId: event.id,
      });
    } catch (err: unknown) {
      setIsLiked(previousValue);
      showTopToast("error", getErrorMessage(err, "Unable to update reaction"));
    } finally {
      setIsLikedLoading(false);
    }
  };

  const scrollToReviews = () => {
    document.getElementById("event-reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetTickets = () => {
    if (!event || isPastEvent) return;

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(orderPath)}`);
      return;
    }

    router.push(orderPath);
  };

  const goToHostScreen = (screen: string) => {
    if (!event) return;
    router.push(withPrev(`${DESKTOP_ROUTES.eventManage(event.id)}?screen=${screen}`, currentPathUrl));
  };

  const handleEventDelete = async () => {
    if (!event || !isPrimaryHost || isPastEvent || isDeleting) return;

    setIsDeleting(true);

    try {
      await authApi.delete(`/event/${event.id}`);
      showTopToast("success", "Event deleted successfully.");
      router.push("/?screen=plans");
    } catch (err: unknown) {
      showTopToast("error", getErrorMessage(err, "Failed to delete event"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="desktop-page-container py-8">
          <EventDetailPageSkeleton />
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black">Unable to load event</h1>
          <p className="mt-2 text-muted-foreground">{error ?? "The event could not be found."}</p>
          <Button className="mt-6 rounded-full" onClick={() => router.push("/")}>
            Back to Discover
          </Button>
        </div>
      </main>
    );
  }

  const formattedDate = startDate?.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = startDate?.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedEndTime = stopDate?.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const hosts = event.coHosts ?? [];
  const locationLabel = event.locationSecure && !event.address
    ? `${event.city ?? "Location"}, ${event.state ?? "TBA"}`
    : [event.address, event.city, event.state].filter(Boolean).join(", ");
  const statusMeta = getEventDisplayStatusMeta(event.eventDisplayStatus);
  const StatusIcon = statusMeta.Icon;

  return (
    <main
      className={cn("min-h-screen", hasEventTheme ? eventTextClass : "bg-background text-foreground")}
      style={eventThemeStyle}
    >
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur", eventHeaderClass)}>
        <div className="desktop-page-header-inner flex h-20 items-center justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/")}
              aria-label="Back to Discover"
            >
              <ArrowLeft size={20} />
            </Button>
            <Link href="/" className="relative h-10 w-28 shrink-0">
              <ThemedLogo
                fill
                sizes="112px"
                className="object-left"
                priority
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {[
              ["details", "Details"],
              ["location", "Map"],
              ["event-reviews", "Reviews"],
              ["related-events", "Related"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(id);
                  if (!target) return;
                  const headerOffset = 96;
                  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                  window.scrollTo({ top, behavior: "smooth" });
                  if (typeof window !== "undefined" && window.history?.replaceState) {
                    window.history.replaceState(null, "", `#${id}`);
                  }
                }}
                className={cn("cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition", eventNavClass)}
              >
                {label}
              </button>
            ))}
          </nav>

          <Button className="rounded-full" onClick={handleGetTickets} disabled={isPastEvent || isHostOrCoHost}>
            <Ticket size={17} />
            {isHostOrCoHost ? "Host view" : isPastEvent ? "Event ended" : "Get tickets"}
          </Button>
        </div>
      </header>

      <div className="desktop-page-container desktop-two-column-page grid gap-10 py-8">
        <article className="min-w-0">
          <section id="details" className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] pb-6">
            <div className="min-w-0">
              <div className="relative overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={titleImage}
                  alt={event.title}
                  width={1200}
                  height={800}
                  className="aspect-[16/10] w-full object-cover"
                  priority
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {event.original && (
                    <span className="rounded-full bg-background/95 px-3 py-2 text-xs font-black shadow">
                      Drifto Original
                    </span>
                  )}
                  {isHostOrCoHost && (
                    <span className="rounded-full bg-blue-800 px-3 py-2 text-xs font-black text-white shadow">
                      {isPrimaryHost ? "Host" : "Co-host"}
                    </span>
                  )}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleReaction}
                    disabled={isLikedLoading}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/80 text-white transition hover:bg-neutral-950"
                    aria-label={isLiked ? "Unlike event" : "Like event"}
                  >
                    {isLiked ? <FaHeart className="text-red-500" size={18} /> : <IoMdHeartEmpty size={22} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickShare}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/80 text-white transition hover:bg-neutral-950"
                    aria-label="Share event"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <CoverVideoSection
                coverVideo={event.coverVideo ?? undefined}
                poster={titleImage}
                className="mt-5"
              />
            </div>

            <div className="min-w-0">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-black ${statusMeta.badgeClassName}`}
              >
                <StatusIcon size={statusMeta.iconSize} className={statusMeta.iconClassName} />
                <span className="capitalize">{statusMeta.label}</span>
              </div>
              <h1 className="mt-3 text-5xl font-black capitalize leading-tight tracking-tight">
                {event.title}
              </h1>

              <div className="mt-7 grid gap-3">
                <div className={cn("flex items-start gap-3 rounded-2xl border p-4", eventPanelClass)}>
                  <CalendarDays className="mt-1 text-blue-800" size={21} />
                  <div>
                    <p className="font-black">{formattedDate}</p>
                    <p className={cn("mt-1 text-sm font-semibold", eventMutedTextClass)}>
                      {formattedTime} - {formattedEndTime}
                    </p>
                  </div>
                </div>
                <div className={cn("flex items-start gap-3 rounded-2xl border p-4", eventPanelClass)}>
                  <MapPin className="mt-1 text-blue-800" size={21} />
                  <div>
                    <p className="font-black capitalize">{locationLabel || "Location TBA"}</p>
                    {event.locationSecure && !event.address && (
                      <p className={cn("mt-1 text-sm font-semibold", eventMutedTextClass)}>
                        Full address is shared after ticket purchase.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/m/reaction/${event.id}?prev=${encodeURIComponent(currentPathUrl)}&type=EVENT`)}
                  className={cn("rounded-2xl border p-4 text-left transition hover:border-blue-800/40", eventPanelClass)}
                >
                  <Heart size={18} className="text-blue-800" />
                  <p className="mt-3 text-2xl font-black">{event.totalLikes ?? 0}</p>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", eventMutedTextClass)}>Likes</p>
                </button>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className={cn("rounded-2xl border p-4 text-left transition hover:border-blue-800/40", eventPanelClass)}
                >
                  <MessageCircle size={18} className="text-blue-800" />
                  <p className="mt-3 text-2xl font-black">{event.totalComments ?? 0}</p>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", eventMutedTextClass)}>Reviews</p>
                </button>
                <div className={cn("rounded-2xl border p-4 text-left", eventPanelClass)}>
                  <Ticket size={18} className="text-blue-800" />
                  <p className="mt-3 text-2xl font-black">{getPurchasedTickets(event)}</p>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", eventMutedTextClass)}>Booked</p>
                </div>
              </div>
            </div>
          </section>

          <DetailSection title="About this event">
            <Linkify
              text={event.description ?? ""}
              className={cn("max-w-3xl whitespace-pre-line text-base leading-8", eventMutedTextClass)}
            />
          </DetailSection>

          {!!event.eventTags?.length && (
            <DetailSection title="Event vibe">
              <div className="flex flex-wrap gap-2">
                {event.eventTags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-black text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {hosts.length > 0 && (
            <DetailSection title="Hosted by">
              <div className="grid gap-4 md:grid-cols-2">
                {hosts.map((coHost, index) => (
                  <UserEventSinglePlaceholder
                    user={coHost}
                    key={coHost.id ?? index}
                    isHost={index + 1 === hosts.length}
                    prev={currentPathUrl}
                    variant="desktop"
                  />
                ))}
              </div>
            </DetailSection>
          )}

          <DetailSection id="location" title="Location">
            {googleMapsApiKey ? (
              <SingleEventMap
                event={event}
                googleMapsApiKey={googleMapsApiKey}
                variant="desktop"
                className={cn("overflow-hidden rounded-2xl border", eventPanelClass)}
              />
            ) : (
              <div className={cn("rounded-2xl border p-6", eventPanelClass)}>
                <p className="font-black capitalize">{locationLabel || "Location TBA"}</p>
                <p className={cn("mt-2 text-sm", eventMutedTextClass)}>Map preview is unavailable.</p>
              </div>
            )}
          </DetailSection>

          <DetailSection id="event-reviews" title="Reviews and comments">
            <SingleEventReviews
              event={event}
              currentPathUrl={currentPathUrl}
              variant="desktop"
              className={cn("rounded-2xl border p-5", eventPanelClass)}
            />
          </DetailSection>

          <DetailSection id="related-events" title="Related events">
            <SingleEventRelated
              event={event}
              currentPathUrl={currentPathUrl}
              variant="desktop"
              className="bg-transparent"
            />
          </DetailSection>
        </article>

        <aside className="min-w-0">
          <div className="sticky top-28 space-y-4">
            <div className={cn("rounded-2xl border p-5 shadow-sm", eventPanelClass)}>
              {isHostOrCoHost ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-800 text-white">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <p className="font-black">{isPrimaryHost ? "Host controls" : "Co-host controls"}</p>
                      <p className={cn("text-sm", eventMutedTextClass)}>Manage this event from your workspace.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <Button className="justify-start rounded-full" onClick={() => goToHostScreen("tickets")}>
                      <QrCode size={17} />
                      Scan tickets
                    </Button>
                    <Button variant="outline" className="justify-start rounded-full" onClick={() => goToHostScreen("event-earnings")}>
                      <ChartNoAxesColumnIncreasing size={17} />
                      Event earnings
                    </Button>
                    <Button variant="outline" className="justify-start rounded-full" onClick={() => goToHostScreen("edit")} disabled={isPastEvent}>
                      <Edit3 size={17} />
                      Edit event
                    </Button>
                    {isPrimaryHost && (
                      <>
                        <Button variant="outline" className="justify-start rounded-full" onClick={() => goToHostScreen("co-host-manage")}>
                          <Users size={17} />
                          Manage co-hosts
                        </Button>
                        <Button variant="outline" className="justify-start rounded-full" onClick={() => goToHostScreen("host-invites")}>
                          <UserRoundPlus size={17} />
                          Host invites
                        </Button>
                        {!isPastEvent && (
                          <Button
                            variant="outline"
                            className="justify-start rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:hover:bg-red-500/10"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 size={17} />
                            Delete event
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className={cn("text-sm font-black uppercase tracking-[0.18em]", eventMutedTextClass)}>
                    Starting at
                  </p>
                  <p className="mt-2 text-4xl font-black">{getStartingPrice(event)}</p>
                  <Button
                    className="mt-5 h-12 w-full rounded-full"
                    onClick={handleGetTickets}
                    disabled={isPastEvent}
                  >
                    <Ticket size={18} />
                    {isPastEvent ? "Event ended" : "Get tickets"}
                  </Button>
                  {!isAuthenticated && (
                    <p className={cn("mt-3 text-center text-xs font-semibold", eventMutedTextClass)}>
                      Sign in is required before checkout.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className={cn("rounded-2xl border p-5", eventSubPanelClass)}>
              <p className="font-black">Quick actions</p>
              <div className="mt-4 grid gap-2">
                <Button variant="outline" className="justify-start rounded-full" onClick={handleQuickShare}>
                  <Share2 size={17} />
                  Share event
                </Button>
                <Button variant="outline" className="justify-start rounded-full" onClick={scrollToReviews}>
                  <MessageCircle size={17} />
                  View comments
                </Button>
                {isAuthenticated && !isHostOrCoHost && (
                  <Button
                    variant="outline"
                    className="justify-start rounded-full text-red-600 hover:text-red-700"
                    onClick={() => setIsReportDrawerOpen(true)}
                  >
                    <Flag size={17} />
                    Report event
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              This permanently removes this event. Existing host links and guest access to the event page will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleEventDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
