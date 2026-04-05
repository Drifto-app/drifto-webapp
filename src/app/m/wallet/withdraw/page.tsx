import {Suspense} from "react";
import {WalletWithdrawalPageContent} from "@/components/wallet/withdraw-page-content";
import { WalletPageSkeleton } from "@/components/ui/page-skeletons";

export default function WalletWithdrawPage() {

    return (
        <Suspense fallback={<WalletPageSkeleton />}>
            <WalletWithdrawalPageContent />
        </Suspense>
    )
}
