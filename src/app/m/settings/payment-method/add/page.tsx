import {Suspense} from "react";
import {AddPaymentInfoPageContent} from "@/components/settings/payment-method-add";
import { SettingsDetailSkeleton } from "@/components/ui/page-skeletons";

export default function PaymentMethodAddPage() {

    return (
        <Suspense fallback={<SettingsDetailSkeleton />}>
            <AddPaymentInfoPageContent />
        </Suspense>
    )
}
