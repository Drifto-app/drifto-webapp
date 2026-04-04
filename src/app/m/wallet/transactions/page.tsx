import {Suspense} from "react";
import {WalletTransactionsPageContent} from "@/components/wallet/transaction-page-content";
import { WalletPageSkeleton } from "@/components/ui/page-skeletons";

export default function WalletTransactionPage() {

    return (
        <Suspense fallback={<WalletPageSkeleton />}>
            <WalletTransactionsPageContent />
        </Suspense>
    )
}
