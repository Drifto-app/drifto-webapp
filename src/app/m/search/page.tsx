import {Suspense} from "react";
import SearchContent from "@/components/search/search-content";
import { SearchPageSkeleton } from "@/components/ui/page-skeletons";

export default function SearchPage() {

    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchContent />
        </Suspense>
    )
}
