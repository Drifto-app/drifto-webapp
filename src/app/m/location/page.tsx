import {Suspense} from "react";
import LocationPageContent from "@/components/location-change/location-page";
import { LocationPageSkeleton } from "@/components/ui/page-skeletons";

export default function LocationChangePage() {

    return (
        <Suspense fallback={<LocationPageSkeleton />}>
            <LocationPageContent />
        </Suspense>
    )
}
