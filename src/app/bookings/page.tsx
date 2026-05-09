import { redirect } from "next/navigation";
import { DESKTOP_ROUTES } from "@/lib/routes";

export default function BookingsListPage() {
    redirect(DESKTOP_ROUTES.bookings);
}
