'use client';

import { ComponentProps } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { ScreenProvider } from '@/components/screen/screen-provider';
import { cn } from '@/lib/utils';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import {
  SEARCH_BORDER_COLORS,
  SearchBorderColorId,
  useAppearanceStore,
} from '@/store/appearance-store';

export const AppearancePageContent = () => {
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <AppearanceContent prev={prev} currentPathUrl={pathname + '?' + searchParams} />
      </ScreenProvider>
    </ProtectedRoute>
  );
};

interface AppearanceContentProps extends ComponentProps<'div'> {
  prev: string | null;
  currentPathUrl: string;
}

const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; helper: string }> = [
  { value: 'system', label: 'System', helper: 'Follow your device appearance automatically.' },
  { value: 'light', label: 'Light', helper: 'Use light surfaces and white event fallbacks.' },
  { value: 'dark', label: 'Dark', helper: 'Use dark surfaces and #121212 event fallbacks.' },
];

export const AppearanceContent = ({
  prev,
  currentPathUrl,
  className,
  ...props
}: AppearanceContentProps) => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const homeSearchBorderColor = useAppearanceStore((state) => state.homeSearchBorderColor);
  const setHomeSearchBorderColor = useAppearanceStore((state) => state.setHomeSearchBorderColor);

  const handleBackClick = () => {
    router.push(prev ?? '/m/settings');
  };

  const activeTheme = (theme ?? 'system') as 'light' | 'dark' | 'system';

  return (
    <div
      className={cn('min-h-[100dvh] w-full bg-background text-foreground', className)}
      {...props}
    >
      <div className="sticky top-0 z-20 flex h-20 w-full items-center border-b border-border bg-background/95 px-8 backdrop-blur">
        <FaArrowLeft
          size={18}
          onClick={handleBackClick}
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Go back"
          role="button"
          tabIndex={0}
        />
        <p className="ml-4 w-full text-center text-md font-semibold capitalize text-foreground">
          Appearance
        </p>
        <div className="w-[18px]" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 md:px-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Theme Customization
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Personalise Drifto</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how the app looks across every page and screen.
              </p>
            </div>
            <div className="grid gap-3">
              {themeOptions.map((option) => {
                const isActive = activeTheme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors',
                      isActive
                        ? 'border-foreground bg-accent text-accent-foreground'
                        : 'border-border bg-background hover:bg-accent/60',
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.helper}</span>
                    </span>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold',
                        isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {isActive ? 'Selected' : option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Active appearance now resolves to <span className="font-semibold text-foreground">{resolvedTheme}</span>.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Home Search Bar
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Border Color</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Customize the home search bar border using the fixed palette from the approved design.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex flex-wrap gap-4">
                {SEARCH_BORDER_COLORS.map((color) => {
                  const isActive = homeSearchBorderColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      aria-label={`Use ${color.label} border color`}
                      onClick={() => setHomeSearchBorderColor(color.id as SearchBorderColorId)}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-105',
                        isActive ? 'border-foreground shadow-[0_0_0_4px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_4px_rgba(255,255,255,0.12)]' : 'border-transparent',
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {isActive ? <FaCheck className="text-sm text-white" /> : null}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Preview
                </p>
                <div className="flex min-h-28 flex-col justify-center gap-3 rounded-[24px] bg-card px-4 py-4">
                  <div className="text-center text-sm font-semibold text-foreground">Choose your location</div>
                  <div
                    className="flex items-center rounded-full border px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.35)]"
                    style={{ borderColor: SEARCH_BORDER_COLORS.find((item) => item.id === homeSearchBorderColor)?.value }}
                  >
                    <span className="text-muted-foreground">Start your search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
