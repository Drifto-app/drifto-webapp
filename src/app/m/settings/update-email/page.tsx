import { Suspense } from "react";
import {UpdateEmailPageContent} from "@/components/settings/update-email";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function UpdateEmailPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <UpdateEmailPageContent />
        </Suspense>
    )
}
