import React, { useState, useRef, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CalendarEventData {
  title: string;
  description?: string;
  startTime: string;
  stopTime: string;
  address: string;
}

interface AddToCalendarProps {
  event: CalendarEventData;
}

export const AddToCalendar = ({ event }: AddToCalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const cleanText = (text: string) => {
    return text ? text.replace(/\s+/g, ' ').replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n') : '';
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.stopTime);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Drifto//NONSGML v1.0//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${cleanText(event.title || "Drifto Event")}`,
      `DESCRIPTION:${cleanText(event.description || "You have tickets for this event!")}`,
      `LOCATION:${cleanText(event.address || "")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"); // Windows/Outlook requires \r\n line endings

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${(event.title || "event").replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleOpenGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.stopTime);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title || "Drifto Event",
      dates: `${formatICSDate(startDate)}/${formatICSDate(endDate)}`,
      details: event.description || "You have tickets for this event!",
      location: event.address || "",
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        className="bg-white/95 hover:bg-white text-black text-xs font-semibold py-2 px-3 rounded-xl shadow-lg border border-neutral-200 flex items-center gap-2 backdrop-blur-md transition-colors h-auto m-0"
      >
        <CalendarPlus size={16} className="text-neutral-700" />
        Add to Calendar
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-20 overflow-hidden transform origin-bottom-right transition-all">
          <button
            onClick={handleDownloadICS}
            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-neutral-50 transition-colors border-b border-neutral-100"
          >
            Apple / Outlook Calendar
          </button>
          <button
            onClick={handleOpenGoogle}
            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-neutral-50 transition-colors"
          >
            Google Calendar
          </button>
        </div>
      )}
    </div>
  );
};
