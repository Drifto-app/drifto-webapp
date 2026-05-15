"use client";

import RefundPageComponent from "@/components/refund/refund-page";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";

export default function RefundTicketPage() {
    return (
        <ProtectedRoute>
            <ScreenProvider>
                <RefundPageComponent variant="desktop" />
            </ScreenProvider>
        </ProtectedRoute>
    );
}
