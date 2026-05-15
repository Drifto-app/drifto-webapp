import { Suspense } from 'react';
import { WalletWithdrawalPageContent } from '@/components/wallet/withdraw-page-content';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function WalletWithdrawPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <WalletWithdrawalPageContent variant="desktop" />
    </Suspense>
  );
}
