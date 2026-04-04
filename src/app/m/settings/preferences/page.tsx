import { Suspense } from "react";
import {UserPreferencesPageContent} from "@/components/settings/preferences";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function PreferencesPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <UserPreferencesPageContent />
        </Suspense>
    )
}
