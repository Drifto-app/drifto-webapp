"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  ChartNoAxesColumnIncreasing,
  Edit3,
  Link2,
  QrCode,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DESKTOP_ROUTES, withPrev } from "@/lib/routes";
import { authApi } from "@/lib/axios";
import { showTopToast } from "@/components/toast/toast-util";
import { getErrorMessage } from "@/lib/error-message";
import { EventEdit } from "@/components/event-page/event-edit";
import { EventEarnings } from "@/components/event-page/event-earnings";
import { FindAttendees } from "@/components/event-page/find-attendees";
import { CoHostManage } from "@/components/event-page/co-host-manage";
import { HostInvites } from "@/components/event-page/host-invites";
import { EventReferral } from "@/components/event-page/event-referral";

interface DesktopEventHostPageProps {
  event: Record<string, any>;
  prev: string | null;
  setEvent: React.Dispatch<React.SetStateAction<Record<string, any> | null>>;
}

type HostScreen =
  | "overview"
  | "tickets"
  | "event-earnings"
  | "edit"
  | "co-host-manage"
  | "host-invites"
  | "referral-manage";

const hostScreens: Array<{
  value: HostScreen;
  label: string;
  description: string;
  icon: React.ReactNode;
  hostOnly?: boolean;
}> = [
  {
    value: "overview",
    label: "Overview",
    description: "Event control center",
    icon: <ShieldCheck size={18} />,
  },
  {
    value: "tickets",
    label: "Attendees",
    description: "Scan and check in",
    icon: <QrCode size={18} />,
  },
  {
    value: "event-earnings",
    label: "Earnings",
    description: "Sales and payout stats",
    icon: <ChartNoAxesColumnIncreasing size={18} />,
  },
  {
    value: "edit",
    label: "Edit event",
    description: "Details and tickets",
    icon: <Edit3 size={18} />,
  },
  {
    value: "co-host-manage",
    label: "Co-hosts",
    description: "Manage collaborators",
    icon: <Users size={18} />,
    hostOnly: true,
  },
  {
    value: "host-invites",
    label: "Invites",
    description: "Pending co-host invites",
    icon: <UserRoundPlus size={18} />,
    hostOnly: true,
  },
  {
    value: "referral-manage",
    label: "Referrals",
    description: "Track partner codes",
    icon: <Link2 size={18} />,
    hostOnly: true,
  },
];

const titleByScreen: Record<HostScreen, string> = {
  overview: "Host overview",
  tickets: "Attendees and check-in",
  "event-earnings": "Event earnings",
  edit: "Edit event",
  "co-host-manage": "Manage co-hosts",
  "host-invites": "Host invites",
  "referral-manage": "Referral tracking",
};

function normalizeScreen(value: string | null): HostScreen {
  if (
    value === "tickets" ||
    value === "event-earnings" ||
    value === "edit" ||
    value === "co-host-manage" ||
    value === "host-invites" ||
    value === "referral-manage"
  ) {
    return value;
  }

  return "overview";
}

export function DesktopEventHostPage({ event, prev, setEvent }: DesktopEventHostPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeScreen = normalizeScreen(searchParams?.get("screen") ?? null);
  const isPrimaryHost = event.hostCollaborationStatus === "HOST";
  const titleImage = event.titleImage || event.titleFileUrl || "/createeventpic.jpg";
  const isPastEvent = event.stopTime ? new Date(event.stopTime) < new Date() : false;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const visibleScreens = isPrimaryHost
    ? hostScreens
    : hostScreens.filter((screen) => !screen.hostOnly);

  const currentPath = React.useMemo(() => {
    const query = searchParams?.toString();
    return `${DESKTOP_ROUTES.eventManage(event.id)}${query ? `?${query}` : ""}`;
  }, [event.id, searchParams]);

  const setScreen = (screen: HostScreen) => {
    if (screen === "overview") {
      router.replace(DESKTOP_ROUTES.eventManage(event.id));
      return;
    }

    router.replace(`${DESKTOP_ROUTES.eventManage(event.id)}?screen=${screen}`);
  };

  const handleBack = () => {
    router.push(prev || DESKTOP_ROUTES.eventDetail(event.id));
  };

  const handleEventDelete = async () => {
    if (!isPrimaryHost || isPastEvent || isDeleting) return;

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

  const renderScreen = () => {
    switch (activeScreen) {
      case "tickets":
        return <FindAttendees event={event} variant="desktop" className="px-0" />;
      case "event-earnings":
        return <EventEarnings event={event} variant="desktop" className="px-0" />;
      case "edit":
        return (
          <EventEdit
            event={event}
            setEvent={setEvent}
            variant="desktop"
            setMainActiveScreen={(screen) => setScreen(normalizeScreen(screen))}
          />
        );
      case "co-host-manage":
        return <CoHostManage event={event} variant="desktop" className="px-0" />;
      case "host-invites":
        return <HostInvites event={event} variant="desktop" className="px-0 bg-transparent" />;
      case "referral-manage":
        return <EventReferral event={event} variant="desktop" />;
      default:
        return (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Event workspace
              </p>
              <h2 className="mt-2 text-3xl font-black capitalize tracking-tight">{event.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage tickets, attendees, earnings, collaborators, and event content from this desktop workspace.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <Ticket className="text-blue-700" size={20} />
                  <p className="mt-3 text-2xl font-black">{event.tickets?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Ticket types</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <Users className="text-blue-700" size={20} />
                  <p className="mt-3 text-2xl font-black">{event.numberOfPurchasedTickets ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Tickets sold</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <BadgeDollarSign className="text-blue-700" size={20} />
                  <p className="mt-3 text-2xl font-black">
                    {event.hostCollaborationStatus?.replaceAll("_", " ") ?? "Host"}
                  </p>
                  <p className="text-sm text-muted-foreground">Access level</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {visibleScreens.filter((screen) => screen.value !== "overview").map((screen) => (
                  <button
                    key={screen.value}
                    type="button"
                    onClick={() => setScreen(screen.value)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition hover:border-blue-800/40 hover:bg-accent"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800 text-white">
                      {screen.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-black">{screen.label}</span>
                      <span className="block text-xs text-muted-foreground">{screen.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <aside className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={titleImage} alt={event.title} fill className="object-cover" sizes="320px" />
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-muted-foreground">Public event page</p>
                <Button
                  variant="outline"
                  className="mt-4 w-full rounded-full"
                  onClick={() => router.push(withPrev(DESKTOP_ROUTES.eventDetail(event.id), currentPath))}
                >
                  View event
                </Button>
                {isPrimaryHost && !isPastEvent && (
                  <Button
                    variant="outline"
                    className="mt-3 w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 size={17} />
                    Delete event
                  </Button>
                )}
              </div>
            </aside>
          </div>
        );
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <header className="h-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="desktop-page-header-inner flex h-20 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack} aria-label="Back">
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Host workspace
              </p>
              <h1 className="truncate text-xl font-black">{titleByScreen[activeScreen]}</h1>
            </div>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => router.push(DESKTOP_ROUTES.eventDetail(event.id))}>
            View event
          </Button>
        </div>
      </header>

      <div className="desktop-page-container grid h-[calc(100vh-5rem)] gap-8 overflow-hidden py-8 lg:grid-cols-[clamp(17rem,18vw,20rem)_minmax(0,1fr)]">
        <aside className="h-fit max-h-full overflow-hidden rounded-2xl border border-border bg-card p-3">
          <nav className="grid gap-1">
            {visibleScreens.map((screen) => {
              const isActive = activeScreen === screen.value;
              return (
                <button
                  key={screen.value}
                  type="button"
                  onClick={() => setScreen(screen.value)}
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-white/15" : "bg-background text-foreground")}>
                    {screen.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black leading-5">{screen.label}</span>
                    <span className={cn("block truncate text-xs leading-5", isActive ? "text-white/65" : "text-muted-foreground")}>
                      {screen.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-h-0 min-w-0 overflow-y-auto overscroll-contain pr-1">{renderScreen()}</section>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              This permanently removes this event. This action cannot be undone.
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
