import {Suspense} from "react";
import {ProfilePicturePageContent} from "@/components/settings/profile-picture";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function ProfilePicture() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <ProfilePicturePageContent />
        </Suspense>
    )
}
