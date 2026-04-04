import { Suspense } from "react";
import { PrivacyPageContent } from "@/components/settings/privacy-policy";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";


export default function PrivacyPoliciesPage() {
    return (
        <Suspense
            fallback={<SettingsDetailSkeleton />}
        >
            <PrivacyPageContent />
        </Suspense>
    );
}
