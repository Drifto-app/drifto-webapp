import { Suspense } from 'react';
import { DesktopSettingsPageContent } from '@/components/settings/desktop-settings-page';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function DesktopSettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <DesktopSettingsPageContent />
    </Suspense>
  );
}
