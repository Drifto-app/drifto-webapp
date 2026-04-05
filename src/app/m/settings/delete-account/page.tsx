import {Suspense} from "react";
import {DeleteAccountPageContent} from "@/components/settings/delete-account";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function DeleteAccountPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <DeleteAccountPageContent />
        </Suspense>
    )
}
