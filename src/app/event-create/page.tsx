import { Suspense } from "react";
import CreateEventComponent from "@/components/create-event/create-event-component";
import { CreateEventPageSkeleton } from "@/components/ui/page-skeletons";

export default function DesktopCreateEventPage() {
    return (
        <Suspense fallback={<CreateEventPageSkeleton />}>
            <CreateEventComponent variant="desktop" />
        </Suspense>
    );
}
