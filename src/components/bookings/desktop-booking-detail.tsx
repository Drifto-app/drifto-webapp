"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, RotateCcw, Ticket as TicketIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import driftoLogo from "@/assests/logo.png";
import { authApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { showTopToast } from "@/components/toast/toast-util";
import { BookingDetailsPageSkeleton } from "@/components/ui/page-skeletons";
import { DESKTOP_ROUTES, withPrev } from "@/lib/routes";

interface DesktopBookingDetailProps {
  eventId: string;
}

interface UserTicket {
  id: string;
  ticketName: string;
  ticketReference: string;
  markedUsed: boolean;
}

interface BookingEvent {
  title?: string;
  titleImage?: string;
  startTime?: string | Date;
}

function formatTimestamp(ts?: string | Date) {
  if (!ts) return "";
  const date = new Date(ts);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date).replace(", ", " ");
}

export function DesktopBookingDetail({ eventId }: DesktopBookingDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [eventDetails, setEventDetails] = useState<BookingEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [t, e] = await Promise.all([
          authApi.get(`/userTicket/plan/ticket/${eventId}`, {
            params: { pageNumber: 1, pageSize: 50 },
          }),
          authApi.get(`/event/${eventId}`),
        ]);
        setTickets(t.data?.data?.data ?? []);
        setEventDetails(e.data?.data ?? null);
      } catch {
        showTopToast("error", "Could not load booking");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) {
    return <BookingDetailsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="desktop-page-header-inner flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push(DESKTOP_ROUTES.bookings)}
              aria-label="Back to bookings"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your booking
              </p>
              <h1 className="truncate text-lg font-black capitalize">
                {eventDetails?.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => router.push(DESKTOP_ROUTES.eventDetail(eventId))}
            >
              <TicketIcon size={16} />
              View event
            </Button>
            <Button
              variant="outline"
              className="rounded-full text-blue-700 hover:text-blue-800"
              onClick={() =>
                router.push(withPrev(DESKTOP_ROUTES.refund(eventId), DESKTOP_ROUTES.bookingDetail(eventId)))
              }
            >
              <RotateCcw size={16} />
              Request refund
            </Button>
          </div>
        </div>
      </header>

      <div className="desktop-page-container py-10">
        {tickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <p className="text-lg font-semibold">No tickets found for this booking.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {tickets.map((ticket, index) => (
              <DesktopTicketCard
                key={ticket.id}
                index={index}
                noOfTickets={tickets.length}
                title={eventDetails?.title ?? ""}
                titleImg={eventDetails?.titleImage ?? ""}
                date={eventDetails?.startTime ?? ""}
                name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
                ticketName={ticket.ticketName}
                ticketReference={ticket.ticketReference}
                used={ticket.markedUsed}
                eventId={eventId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DesktopTicketCardProps {
  title: string;
  titleImg: string;
  name: string;
  ticketName: string;
  date: string | Date;
  ticketReference: string;
  used: boolean;
  index: number;
  noOfTickets: number;
  eventId: string;
}

function DesktopTicketCard({
  eventId,
  title,
  titleImg,
  name,
  ticketName,
  date,
  ticketReference,
  used,
  index,
  noOfTickets,
}: DesktopTicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `ticket-${ticketReference}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      showTopToast("error", "Failed to download ticket");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${used
            ? "border-neutral-300 bg-neutral-100 text-neutral-600"
            : "border-blue-700 text-blue-700"
            }`}
        >
          {used ? "Used" : "Not used"}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={DESKTOP_ROUTES.eventDetail(eventId)}
            className="rounded-full border border-border p-2 transition hover:border-foreground"
            aria-label="View event"
          >
            <TicketIcon size={16} />
          </Link>
          <button
            type="button"
            className="rounded-full border border-border p-2 transition hover:border-foreground disabled:opacity-50"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download ticket"
          >
            {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          </button>
        </div>
      </div>

      <div ref={cardRef} className="bg-background">
        {titleImg && (
          <Image
            className="h-40 w-full object-cover"
            alt={title}
            width={800}
            height={200}
            priority={false}
            src={titleImg}
          />
        )}
        <div className="p-5">
          <h4 className="text-base font-semibold capitalize">{title}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
              <p className="break-all font-semibold">{name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
              <p className="font-semibold">{formatTimestamp(date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket</p>
              <p className="font-semibold">{ticketName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference</p>
              <p className="break-all text-xs font-semibold">{ticketReference}</p>
            </div>
          </div>

          <div className="my-5 flex items-center gap-2">
            <div className="h-px w-full bg-border" />
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {index + 1} of {noOfTickets}
            </span>
            <div className="h-px w-full bg-border" />
          </div>

          <div className="flex justify-center pb-2">
            <div className="relative inline-block">
              <QRCode size={128} value={ticketReference} />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background pl-1.5 pr-2"
                style={{ width: "19%", height: "19%", minWidth: 30, minHeight: 30 }}
              >
                <Image
                  src={driftoLogo}
                  alt="Drifto"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
