import { Suspense } from "react";
import { RefundHistoryPageContent } from "@/components/refund/refund-history";
import { RefundHistoryPageSkeleton } from "@/components/ui/page-skeletons";

export default function RefundHistoryPage() {
    return (
        <Suspense fallback={<RefundHistoryPageSkeleton />}>
            <RefundHistoryPageContent variant="desktop" />
        </Suspense>
    );
}
