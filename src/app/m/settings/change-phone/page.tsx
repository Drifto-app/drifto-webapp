import {Suspense} from "react";
import {UpdatePhonePageContent} from "@/components/settings/change-phone";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function ChangePhonePage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <UpdatePhonePageContent />
        </Suspense>
    )
}
