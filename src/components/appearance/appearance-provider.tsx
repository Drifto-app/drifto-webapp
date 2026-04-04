'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { getSearchBorderColorValue, useAppearanceStore } from '@/store/appearance-store';

function AppearanceEffects() {
  const homeSearchBorderColor = useAppearanceStore((state) => state.homeSearchBorderColor);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--home-search-border-color',
      getSearchBorderColorValue(homeSearchBorderColor),
    );
  }, [homeSearchBorderColor]);

  return null;
}

interface AppearanceProviderProps {
  children: ReactNode;
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppearanceEffects />
      {children}
    </ThemeProvider>
  );
}
