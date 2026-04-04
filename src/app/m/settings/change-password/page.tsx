import {Suspense} from "react";
import {PasswordPageContent} from "@/components/settings/change-password";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function ChangePasswordPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <PasswordPageContent />
        </Suspense>
    )
}
