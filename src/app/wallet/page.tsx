import { Suspense } from 'react';
import { WalletPageContent } from '@/components/wallet/wallet-page-content';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function WalletPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <WalletPageContent variant="desktop" />
    </Suspense>
  );
}
