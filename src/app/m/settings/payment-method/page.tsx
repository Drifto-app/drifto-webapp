import { Suspense } from "react";
import {PaymentSettingsPageContent} from "@/components/settings/payment-method";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function PaymentMethodPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <PaymentSettingsPageContent />
        </Suspense>
    )
}
