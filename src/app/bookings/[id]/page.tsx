"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { DesktopBookingDetail } from "@/components/bookings/desktop-booking-detail";

export default function BookingDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;

    if (!id) return null;

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <DesktopBookingDetail eventId={id} />
            </ScreenProvider>
        </ProtectedRoute>
    );
}
