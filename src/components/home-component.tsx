'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { BottomNavbar } from '@/components/nav-mobile/bottom-navbar';
import { useEffect, useRef, useState } from 'react';
import { HeaderMobile } from '@/components/header-mobile/header-mobile';
import { EventDisplay } from '@/components/event-display/event-display';
import { useAuthStore } from '@/store/auth-store';
import { ScreenProvider } from '@/components/screen/screen-provider';
import { useSearchParams, useRouter } from 'next/navigation';
import PlanningDisplay from './planning-display/planning-display';
import { PostDisplay } from '@/components/post/post-display';
import { ProfileDisplay } from '@/components/profile-display/profile-display';
import UpdateDisplay from './updates-display';
import {
  DesktopAppShell,
  type DesktopSection,
} from '@/components/layout/desktop-app-shell';
import { DESKTOP_ROUTES } from '@/lib/routes';

interface EventDisplayRef {
  refresh: () => void;
}

const desktopScreens: DesktopSection[] = [
  'events',
  'plans',
  'posts',
  'updates',
  'profile',
];

function getInitialScreen(screen: string | null | undefined): DesktopSection {
  return desktopScreens.includes(screen as DesktopSection)
    ? (screen as DesktopSection)
    : 'events';
}

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated, isLoading, hasTriedRefresh, locationPublic } =
    useAuthStore();

  const screen = searchParams?.get('screen');

  const [activeScreen, setActiveScreen] = useState<DesktopSection>(
    getInitialScreen(screen),
  );
  const [location, setLocation] = useState<string | null>(
    isAuthenticated ? user?.city : locationPublic?.city,
  );
  const eventDisplayRef = useRef<EventDisplayRef>(null);

  useEffect(() => {
    setLocation(
      isAuthenticated ? (user?.city ?? null) : (locationPublic?.city ?? null),
    );
  }, [isAuthenticated, locationPublic?.city, user?.city]);

  useEffect(() => {
    setActiveScreen(getInitialScreen(screen));
  }, [screen]);

  const handleScreen = (value: string) => {
    const nextScreen = getInitialScreen(value);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('screen', nextScreen);
    router.replace(`?${params.toString()}`);

    setActiveScreen(nextScreen);
  };

  const handleDesktopScreen = (value: string) => {
    handleScreen(value);
  };

  const handleDesktopLocationChange = () => {
    router.push(
      `${DESKTOP_ROUTES.location}?prev=${encodeURIComponent(getCurrentRootPath())}`,
    );
  };

  const getCurrentRootPath = () => {
    const currentQuery = searchParams?.toString();
    return currentQuery ? `/?${currentQuery}` : '/';
  };

  const handleSearch = () => {
    router.push(
      `${DESKTOP_ROUTES.search}?prev=${encodeURIComponent(getCurrentRootPath())}`,
    );
  };

  const handleCreateExperience = () => {
    router.push(
      `${DESKTOP_ROUTES.createEvent}?prev=${encodeURIComponent(getCurrentRootPath())}`,
    );
  };

  // Function to handle events refresh
  const handleEventsRefresh = () => {
    if (eventDisplayRef.current) {
      eventDisplayRef.current.refresh();
    }
  };

  const render = () => {
    switch (activeScreen) {
      case 'plans':
        return <PlanningDisplay handleScreenChange={handleScreen} />;
      case 'posts':
        return <PostDisplay />;
      case 'updates':
        return (
          <div className="w-full">
            <UpdateDisplay />
          </div>
        );
      case 'profile':
        return <ProfileDisplay handleScreenChange={handleScreen} />;
      default:
        return (
          <div className="w-full flex-1 bg-background">
            <HeaderMobile
              location={location}
              setLocation={setLocation}
              activeScreen={activeScreen}
            />
            <EventDisplay ref={eventDisplayRef} location={location} />
          </div>
        );
    }
  };

  const renderDesktop = () => {
    switch (activeScreen) {
      case 'plans':
        return (
          <PlanningDisplay
            handleScreenChange={handleDesktopScreen}
            variant="desktop"
          />
        );
      case 'posts':
        return <PostDisplay variant="desktop" />;
      case 'updates':
        return <UpdateDisplay variant="desktop" />;
      case 'profile':
        return (
          <ProfileDisplay
            handleScreenChange={handleDesktopScreen}
            variant="desktop"
          />
        );
      default:
        return (
          <EventDisplay
            ref={eventDisplayRef}
            location={location}
            variant="desktop"
            showCreateButton={false}
          />
        );
    }
  };

  if (hasTriedRefresh && !isLoading && !isAuthenticated) {
    return (
      <ScreenProvider>
        <div className="min-h-[100dvh] flex flex-col w-full lg:hidden">
          <div className="w-full flex-1 bg-background">
            <HeaderMobile
              location={location}
              setLocation={setLocation}
              activeScreen={activeScreen}
            />
            <EventDisplay ref={eventDisplayRef} location={location} />
          </div>
        </div>
        <div className="hidden lg:block">
          <DesktopAppShell
            activeScreen="events"
            location={location}
            onCreateExperience={handleCreateExperience}
            onLocationChange={handleDesktopLocationChange}
            onSearch={handleSearch}
            onScreenChange={handleDesktopScreen}
          >
            <EventDisplay
              ref={eventDisplayRef}
              location={location}
              variant="desktop"
              showCreateButton={false}
            />
          </DesktopAppShell>
        </div>
      </ScreenProvider>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <div className="min-h-[100dvh] flex flex-col w-full lg:hidden">
          {render()}
          <BottomNavbar
            activeScreen={activeScreen}
            setActiveScreen={handleScreen}
            onEventsRefresh={handleEventsRefresh}
          />
        </div>
        <div className="hidden lg:block">
          <DesktopAppShell
            activeScreen={activeScreen}
            location={location}
            onCreateExperience={handleCreateExperience}
            onLocationChange={handleDesktopLocationChange}
            onSearch={handleSearch}
            onScreenChange={handleDesktopScreen}
          >
            {renderDesktop()}
          </DesktopAppShell>
        </div>
      </ScreenProvider>
    </ProtectedRoute>
  );
}
