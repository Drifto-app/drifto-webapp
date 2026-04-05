import { Suspense } from "react";
import {HelpSupportPageContent} from "@/components/settings/help-support";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";


export default function HelpSupportPage() {
    return (
        <Suspense
            fallback={<SettingsDetailSkeleton />}
        >
            <HelpSupportPageContent />
        </Suspense>
    );
}
