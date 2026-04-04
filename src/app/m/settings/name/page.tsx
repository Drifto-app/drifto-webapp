import { Suspense } from "react";
import {NamePageContent} from "@/components/settings/name-edit";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function UsernameChangePage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <NamePageContent />
        </Suspense>
    )
}
