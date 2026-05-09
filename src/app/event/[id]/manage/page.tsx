"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { authApi } from "@/lib/axios";
import { EventDetailPageSkeleton } from "@/components/ui/page-skeletons";
import { DesktopEventHostPage } from "@/components/event-page/desktop-event-host-page";

export default function DesktopEventManageRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const searchParams = useSearchParams();
  const prev = searchParams?.get("prev") ?? null;

  const [event, setEvent] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authApi.get(`/event/${id}`);
        setEvent(response.data.data);
      } catch (err: any) {
        setError(err.message || "Error loading event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <ScreenProvider>
          <EventDetailPageSkeleton />
        </ScreenProvider>
      </ProtectedRoute>
    );
  }

  if (error || !event?.hostCollaborationStatus) {
    return (
      <ProtectedRoute>
        <ScreenProvider>
          <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6">
              <MdErrorOutline size={28} className="text-red-500" />
              <p className="font-semibold">{error || "You do not have host access to this event"}</p>
            </div>
          </div>
        </ScreenProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <DesktopEventHostPage event={event} setEvent={setEvent} prev={prev} />
      </ScreenProvider>
    </ProtectedRoute>
  );
}
