import { InviteFriendsPageContent } from "@/components/settings/invite-friends";
import {Suspense} from "react";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function InviteFriendsPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <InviteFriendsPageContent />
        </Suspense>
    )
}
