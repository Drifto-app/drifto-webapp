import {Suspense} from "react";
import {UserEventsPageContent} from "@/components/user/user-events-page";
import { UserEventsPageSkeleton } from "@/components/ui/page-skeletons";

export default function UserEventsPage() {

    return (
        <Suspense fallback={<UserEventsPageSkeleton />}>
            <UserEventsPageContent />
        </Suspense>
    )
}
