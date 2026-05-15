import { Suspense } from 'react';
import { AddPaymentInfoPageContent } from '@/components/settings/payment-method-add';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function DesktopAddPaymentMethodPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <AddPaymentInfoPageContent variant="desktop" />
    </Suspense>
  );
}
