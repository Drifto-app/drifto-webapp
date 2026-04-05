import { Suspense } from "react";
import { FaqPageContent } from "@/components/settings/faq";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";


export default function FaqPage() {
    return (
        <Suspense
            fallback={<SettingsDetailSkeleton />}
        >
            <FaqPageContent />
        </Suspense>
    );
}
