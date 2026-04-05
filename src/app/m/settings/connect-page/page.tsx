import { Suspense } from "react";
import {ConnectPageContent} from "@/components/settings/connect-page";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";


export default function ConnectPage() {
    return (
        <Suspense
            fallback={<SettingsDetailSkeleton />}
        >
            <ConnectPageContent />
        </Suspense>
    );
}
