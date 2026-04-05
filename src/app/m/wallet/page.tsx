import {Suspense} from "react";
import {WalletPageContent} from "@/components/wallet/wallet-page-content";
import { WalletPageSkeleton } from "@/components/ui/page-skeletons";

export default function WalletPage() {

    return (
        <Suspense fallback={<WalletPageSkeleton />}>
            <WalletPageContent />
        </Suspense>
    )
}
