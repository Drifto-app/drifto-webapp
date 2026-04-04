import { Suspense } from 'react';
import { AppearancePageContent } from '@/components/settings/appearance';
import { SettingsDetailSkeleton } from '@/components/ui/page-skeletons';

export default function AppearancePage() {
  return (
    <Suspense
      fallback={<SettingsDetailSkeleton />}
    >
      <AppearancePageContent />
    </Suspense>
  );
}
