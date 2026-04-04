import {Suspense} from "react";
import SettingsPageContent from "@/components/settings/settings-page";
import { SettingsPageSkeleton } from "@/components/ui/page-skeletons";

export default function SettingsPage() {

    return (
        <Suspense fallback={<SettingsPageSkeleton />}>
            <SettingsPageContent />
        </Suspense>
    )
}
