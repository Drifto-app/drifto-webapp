import {Suspense} from "react";
import {BioPageContent} from "@/components/settings/bio-edit";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";


export default function Bio() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <BioPageContent />
        </Suspense>
    )
}
