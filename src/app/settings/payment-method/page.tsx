import { Suspense } from 'react';
import { PaymentSettingsPageContent } from '@/components/settings/payment-method';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function DesktopPaymentMethodsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <PaymentSettingsPageContent variant="desktop" />
    </Suspense>
  );
}
