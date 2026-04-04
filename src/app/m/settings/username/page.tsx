import {Suspense} from "react";
import {UsernamePageContent} from "@/components/settings/username";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function UsernamePage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <UsernamePageContent />
        </Suspense>
    )
}
