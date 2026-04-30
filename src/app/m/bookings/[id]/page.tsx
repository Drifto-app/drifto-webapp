"use client";

import { authApi } from "@/lib/axios";
import { ArrowLeft, Download, Inbox, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { toPng } from "html-to-image";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { useAuthStore } from "@/store/auth-store";
import { showTopToast } from "@/components/toast/toast-util";

export default function Page() {
  const [tickets, setTickets] = useState<any[]>();
  const [eventDetails, setEventDetails] = useState<any>();
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();

  const fetchTickets = async () => {
    const response = await authApi.get("/userTicket/plan/ticket/" + id, {
      params: { pageNumber: 1, pageSize: 10 },
    });

    const data = response.data.data.data;
    setTickets(data);
    console.log(data);
  };
  const fetchEventDetails = async () => {
    const response = await authApi.get("/event/" + id, {
      params: { pageNumber: 1, pageSize: 10 },
    });

    const data = response.data.data;
    setEventDetails(data);
    console.log(data);
  };
  useEffect(() => {
    fetchTickets();
    fetchEventDetails();
  }, []);
  return (
    <ProtectedRoute>
      <ScreenProvider>
        <div className="pb-20">
          <DetailsHeader title={eventDetails?.title ?? ""} />
          <div className=" flex flex-col gap-8 p-6">
            {eventDetails &&
              tickets?.map((ticket: any, index) => {
                return (
                  <div key={ticket.id}>
                    <TicketCard
                      title={eventDetails?.title}
                      titleImg={eventDetails?.titleImage}
                      name={`${user?.firstName} ${user?.lastName}`}
                      ticketName={ticket.ticketName}
                      date={eventDetails?.startTime}
                      used={ticket.markedUsed}
                      index={index}
                      noOfTickets={tickets.length}
                      ticketReference={ticket.ticketReference}
                      eventId={id!.toString()}
                    />
                  </div>
                );
              })}
          </div>
          <div className=" w-full fixed bottom-0 bg-white border-t border-t-neutral-400 py-4 flex justify-center">
            <button
              onClick={() => {
                router.push(`/m/refund/${id}?prev=${encodeURIComponent(`/m/bookings/${id}`)}`);
              }}
              className="outline-none border-none bg-white text-blue-700 text-sm font-md"
            >
              Request a refund
            </button>
          </div>
        </div>
      </ScreenProvider>
    </ProtectedRoute>
  );
}
interface headerProp {
  title: string;
}
function DetailsHeader({ title }: headerProp) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full border-b-1 border-b-neutral-300 flex flex-col gap-3 h-20 justify-center"
      )}
    >
      <div className="flex flex-row items-center px-8">
        <FaArrowLeft
          size={16}
          onClick={() => router.push("/?screen=plans")}
          className="cursor-pointer hover:text-neutral-700 transition-colors"
        />
        <p className="font-semibold text-neutral-950 text-sm w-full text-center capitalize truncate ml-4">
          {title}
        </p>
      </div>
    </div>
  );
}
function formatTimestamp(ts: string) {
  const date = new Date(ts);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Sat
    month: "long", // November
    day: "numeric", // 8
    year: "numeric", // 2025
    hour: "numeric", // 3
    minute: "2-digit", // 00
    hour12: true, // AM/PM
  };

  // Format and remove the comma before the time
  return new Intl.DateTimeFormat("en-US", options)
    .format(date)
    .replace(", ", " ");
}
interface ticketCardProp {
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

function TicketCard({
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
}: ticketCardProp) {
  const router = useRouter();
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
    } catch (err) {
      showTopToast("error", "Failed to download ticket");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-2">
        <div className=" text-blue-600 px-3  flex items-center justify-center rounded-full border border-black text-xs">
          <span>{used ? "Used" : "Not Used"}</span>
        </div>
        <button
          className=" px-2 py-1 border border-black rounded-full"
          onClick={() =>
            router.push(
              `/m/events/${eventId}?prev=${encodeURIComponent(
                `/m/bookings/${eventId}`
              )}`
            )
          }
        >
          <Inbox size={18} />
        </button>
        <button
          className="p-2 border border-black rounded-full flex items-center justify-center"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? <Loader2 className="animate-spin" /> : <Download size={18} />}
        </button>
      </div>

      {/* Capturable ticket section */}
      <div ref={cardRef} className="shadow-2xl rounded-b-2xl bg-white">
        <Image
          className="rounded-t-2xl w-full h-48 object-cover"
          alt={title.toString()}
          width={800}
          height={200}
          priority={false}
          src={titleImg?.toString()}
        />
        <div className="p-4">
          <h4 className="text-lg font-semibold first-letter:capitalize">
            {title}
          </h4>
          <div className="grid mt-4 grid-cols-2 gap-4">
            <div>
              <h5>Name</h5>
              <p className="break-all font-semibold text-sm">{name}</p>
            </div>
            <div>
              <h5>Event Date</h5>
              <p className="break-all font-semibold text-sm">
                {formatTimestamp(date?.toString())}
              </p>
            </div>
            <div>
              <h5>Ticket Name</h5>
              <p className="break-all font-semibold text-sm">{ticketName}</p>
            </div>
            <div>
              <h5>Reference</h5>
              <p className="break-all font-semibold text-sm">
                {ticketReference}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="border-t border-black w-full"></div>
            <div className="w-fit break-normal whitespace-nowrap">
              {index + 1} of {noOfTickets}
            </div>
            <div className="border-t border-black w-full"></div>
          </div>
          <div className="flex justify-center py-8">
            <QRCode size={128} value={ticketReference.toString()} />
          </div>
        </div>
      </div>
    </div>
  );
}
