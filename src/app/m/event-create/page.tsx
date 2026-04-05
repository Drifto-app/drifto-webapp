import {Suspense} from "react";
import CreateEventComponent from "@/components/create-event/create-event-component";
import { CreateEventPageSkeleton } from "@/components/ui/page-skeletons";

export default function CreateEventPage() {

    return (
        <Suspense fallback={<CreateEventPageSkeleton />}>
            <CreateEventComponent />
        </Suspense>
    )
}
