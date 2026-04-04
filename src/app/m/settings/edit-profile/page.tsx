import {Suspense} from "react";
import {EditProfilePageContent} from "@/components/settings/edit-profile";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function EditProfilePage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <EditProfilePageContent />
        </Suspense>
    )
}
