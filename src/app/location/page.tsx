import { Suspense } from 'react';
import LocationPageContent from '@/components/location-change/location-page';
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

export default function DesktopLocationPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <LocationPageContent variant="desktop" />
    </Suspense>
  );
}
