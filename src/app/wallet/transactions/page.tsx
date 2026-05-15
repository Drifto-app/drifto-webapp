import { Suspense } from 'react';
import { WalletTransactionsPageContent } from '@/components/wallet/transaction-page-content';
import { TransactionListSkeleton } from '@/components/ui/page-skeletons';

export default function WalletTransactionsPage() {
  return (
    <Suspense fallback={<TransactionListSkeleton />}>
      <WalletTransactionsPageContent variant="desktop" />
    </Suspense>
  );
}
