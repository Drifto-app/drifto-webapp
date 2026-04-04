"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { BottomNavbar } from "@/components/nav-mobile/bottom-navbar";
import { useRef, useState } from "react";
import { HeaderMobile } from "@/components/header-mobile/header-mobile";
import { EventDisplay } from "@/components/event-display/event-display";
import { useAuthStore } from "@/store/auth-store";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { useSearchParams, useRouter } from "next/navigation";
import PlanningDisplay from "./planning-display/planning-display";
import { PostDisplay } from "@/components/post/post-display";
import { ProfileDisplay } from "@/components/profile-display/profile-display";
import UpdateDisplay from "./updates-display";

interface EventDisplayRef {
  refresh: () => void;
}

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuthStore.getState();
  const { isAuthenticated, isLoading, hasTriedRefresh, locationPublic } = useAuthStore();

  const screen = searchParams?.get("screen");

  const [activeScreen, setActiveScreen] = useState<string>(screen ?? "events");
  const [location, setLocation] = useState<string | null>(isAuthenticated ? user?.city : locationPublic?.city);
  const eventDisplayRef = useRef<EventDisplayRef>(null);

  const handleScreen = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("screen", value);
    router.replace(`?${params.toString()}`);

    setActiveScreen(value);
  };

  // Function to handle events refresh
  const handleEventsRefresh = () => {
    if (eventDisplayRef.current) {
      eventDisplayRef.current.refresh();
    }
  };

  const render = () => {
    switch (activeScreen) {
      case "plans":
        return <PlanningDisplay handleScreenChange={handleScreen} />;
      case "posts":
        return <PostDisplay />;
      case "updates":
        return (
          <div className="w-full">
            <UpdateDisplay />
          </div>
        );
      case "profile":
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

  if (hasTriedRefresh && !isLoading && !isAuthenticated) {
    return (
      <ScreenProvider>
        <div className="min-h-[100dvh] flex flex-col w-full">
          <div className="w-full flex-1 bg-background">
            <HeaderMobile
              location={location}
              setLocation={setLocation}
              activeScreen={activeScreen}
            />
            <EventDisplay ref={eventDisplayRef} location={location} />
          </div>
        </div>
      </ScreenProvider>
    )
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <div className="min-h-[100dvh] flex flex-col w-full">
          {render()}
          <BottomNavbar
            activeScreen={activeScreen}
            setActiveScreen={handleScreen}
            onEventsRefresh={handleEventsRefresh}
          />
        </div>
      </ScreenProvider>
    </ProtectedRoute>
  );
}
