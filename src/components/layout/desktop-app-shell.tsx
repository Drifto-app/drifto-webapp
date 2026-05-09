'use client';

import { useState, type FocusEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { BiCalendarAlt } from 'react-icons/bi';
import { FaHashtag, FaRegUser } from 'react-icons/fa';
import { LuInbox } from 'react-icons/lu';
import { PiFireSimpleBold } from 'react-icons/pi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoaderSmall } from '@/components/ui/loader';
import { showTopToast } from '@/components/toast/toast-util';
import { DESKTOP_ROUTES, withPrev } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import logoMark from '@/assests/logo.png';

export type DesktopSection =
  | 'events'
  | 'plans'
  | 'posts'
  | 'updates'
  | 'profile';

interface DesktopNavItem {
  value: DesktopSection;
  label: string;
  eyebrow: string;
  icon: ReactNode;
}

const desktopNavItems: DesktopNavItem[] = [
  {
    value: 'events',
    label: 'Events',
    eyebrow: 'Find experiences',
    icon: <PiFireSimpleBold size={18} />,
  },
  {
    value: 'plans',
    label: 'Plans',
    eyebrow: 'Bookings',
    icon: <BiCalendarAlt size={18} />,
  },
  {
    value: 'posts',
    label: 'Posts',
    eyebrow: 'Posts and people',
    icon: <FaHashtag size={18} />,
  },
  {
    value: 'updates',
    label: 'Updates',
    eyebrow: 'Requests',
    icon: <LuInbox size={18} />,
  },
  {
    value: 'profile',
    label: 'Profile',
    eyebrow: 'Profile',
    icon: <FaRegUser size={18} />,
  },
];

interface DesktopAppShellProps {
  activeScreen: DesktopSection;
  children: ReactNode;
  location: string | null;
  onCreateExperience?: () => void;
  onLocationChange?: () => void;
  onSearch?: () => void;
  onScreenChange: (value: DesktopSection) => void;
}

export function DesktopAppShell({
  activeScreen,
  children,
  location,
  onCreateExperience,
  onLocationChange,
  onSearch,
  onScreenChange,
}: DesktopAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const visibleNavItems = isAuthenticated
    ? desktopNavItems
    : desktopNavItems.filter((item) => item.value === 'events');
  const queryString = searchParams?.toString();
  const currentPath = `${pathname ?? '/'}${queryString ? `?${queryString}` : ''}`;
  const accountName = user?.username || user?.firstName || 'Account';
  const avatarFallback = accountName.slice(0, 1).toUpperCase();
  const compactLogoSrc =
    resolvedTheme === 'dark' ? '/logo-white.svg' : logoMark;

  const goToSettings = () => {
    router.push(withPrev(DESKTOP_ROUTES.settings, currentPath));
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace('/login');
    } catch {
      showTopToast('error', 'Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSidebarBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsSidebarExpanded(false);
    }
  };

  const handleNavClick = (value: DesktopSection) => {
    onScreenChange(value);
    setIsSidebarExpanded(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn('grid h-screen w-full grid-cols-[5.25rem_minmax(0,1fr)]')}
      >
        <aside
          className="group/sidebar relative z-[60] h-screen min-w-0"
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          onFocusCapture={() => setIsSidebarExpanded(true)}
          onBlurCapture={handleSidebarBlur}
        >
          <div
            className={cn(
              'absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-border bg-card/95 px-3 py-5 backdrop-blur-xl',
              'transition-[width,box-shadow,background-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
              isSidebarExpanded
                ? 'w-[var(--desktop-sidebar-width)] shadow-xl shadow-black/5'
                : 'w-[5.25rem]',
            )}
          >
            <Link
              href="/"
              aria-label="Drifto home"
              className="flex h-12 items-center gap-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/30"
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm shadow-blue-950/15">
                <Image
                  src={compactLogoSrc}
                  alt="Drifto"
                  fill
                  sizes="48px"
                  className="object-contain p-2"
                  priority
                />
              </span>
              <span
                className={cn(
                  'relative flex h-12 w-32 shrink-0 items-center overflow-hidden transition-opacity duration-150 motion-reduce:transition-none',
                  isSidebarExpanded ? 'opacity-100' : 'opacity-0',
                )}
              >
                <p className="font-poppins font-bold text-3xl">drifto</p>
              </span>
            </Link>

            <button
              type="button"
              onClick={onLocationChange}
              aria-label={`Current city: ${location || 'choose location'}`}
              title={location || 'Choose location'}
              className={cn(
                'mt-8 overflow-hidden border border-border bg-background text-left shadow-sm',
                'hover:border-blue-800/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/30',
                isSidebarExpanded
                  ? 'h-auto min-h-14 w-full rounded-[1.5rem] p-4'
                  : 'flex h-14 w-14 items-center justify-center rounded-full p-0',
              )}
            >
              <span
                className={cn(
                  'items-center gap-3',
                  isSidebarExpanded ? 'flex justify-between' : 'hidden',
                )}
              >
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground',
                    isSidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0',
                  )}
                >
                  Current city
                </span>
                {isSidebarExpanded && (
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                )}
              </span>
              <span
                className={cn(
                  'flex items-center gap-2',
                  isSidebarExpanded ? 'mt-3 justify-start' : 'justify-center',
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-800 text-white">
                  <MapPin size={17} />
                </span>
                <span
                  className={cn(
                    'min-w-0 overflow-hidden',
                    isSidebarExpanded ? 'w-full opacity-100' : 'w-0 opacity-0',
                  )}
                >
                  <span className="block truncate text-xl font-black capitalize">
                    {location || 'Choose location'}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                    Update local recommendations
                  </span>
                </span>
              </span>
            </button>

            <nav className="mt-8 flex min-h-0 flex-1 flex-col gap-2">
              {visibleNavItems.map((item) => {
                const isActive = activeScreen === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleNavClick(item.value)}
                    aria-label={item.label}
                    title={item.label}
                    className={cn(
                      'group/nav relative flex h-14 w-full items-center gap-3 overflow-hidden rounded-2xl px-2 text-left transition-[background-color,color,box-shadow] duration-200 ease-out motion-reduce:transition-none',
                      isActive
                        ? 'bg-blue-800 text-white shadow-lg shadow-blue-950/10'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'ml-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color] duration-200',
                        isActive
                          ? 'bg-white/15'
                          : 'bg-background text-foreground group-hover/nav:bg-blue-800 group-hover/nav:text-white',
                      )}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 overflow-hidden',
                        isSidebarExpanded
                          ? 'w-full opacity-100'
                          : 'w-0 opacity-0',
                      )}
                    >
                      <span className="block text-sm font-black">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          'block text-xs',
                          isActive ? 'text-white/60' : 'text-muted-foreground',
                        )}
                      >
                        {item.eyebrow}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div
              className={cn(
                'overflow-hidden border border-border bg-blue-800 text-white',
                isSidebarExpanded
                  ? 'w-full rounded-[1.75rem] p-4'
                  : 'flex w-14 justify-center rounded-full p-2',
              )}
            >
              <p
                className={cn(
                  'overflow-hidden text-sm font-black',
                  isSidebarExpanded
                    ? 'block h-auto opacity-100'
                    : 'hidden h-0 opacity-0',
                )}
              >
                Host on Drifto
              </p>
              <p
                className={cn(
                  'overflow-hidden text-xs leading-5 text-white/60',
                  isSidebarExpanded
                    ? 'mt-1 block h-auto opacity-100'
                    : 'mt-0 hidden h-0 opacity-0',
                )}
              >
                {isAuthenticated
                  ? 'Create an experience and invite your community.'
                  : 'Sign in to start hosting experiences.'}
              </p>
              <Button
                className={cn(
                  'h-10 rounded-full bg-white text-neutral-950 hover:bg-white/90',
                  isSidebarExpanded ? 'mt-4 w-full px-4' : 'mt-0 w-10 p-0',
                )}
                disabled={!onCreateExperience}
                onClick={onCreateExperience}
                title={isAuthenticated ? 'Create' : 'Sign in to host'}
                aria-label={
                  isAuthenticated ? 'Create experience' : 'Sign in to host'
                }
              >
                <Plus size={16} />
                <span className={cn(isSidebarExpanded ? 'inline' : 'hidden')}>
                  {isAuthenticated ? 'Create' : 'Sign in to host'}
                </span>
              </Button>
            </div>
          </div>
        </aside>

        <section className="h-screen min-w-0 overflow-y-auto">
          <header className="sticky top-0 z-50 grid h-20 grid-cols-[minmax(180px,0.7fr)_minmax(320px,1fr)_auto] items-center gap-5 border-b border-border bg-background/85 px-[calc(var(--desktop-gutter)+var(--desktop-sidebar-width)-5.25rem)] backdrop-blur">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                {
                  desktopNavItems.find((item) => item.value === activeScreen)
                    ?.eyebrow
                }
              </p>
              <h1 className="truncate text-2xl font-black tracking-tight">
                {
                  desktopNavItems.find((item) => item.value === activeScreen)
                    ?.label
                }
              </h1>
            </div>

            {activeScreen === 'events' ? (
              <button
                type="button"
                onClick={onSearch}
                className="flex h-12 min-w-0 items-center gap-3 rounded-full border border-border bg-card px-5 text-left text-muted-foreground shadow-sm transition hover:border-blue-800/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/30"
              >
                <Search size={18} className="shrink-0 text-foreground" />
                <span className="truncate text-sm font-semibold">
                  Search events, people, places
                </span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full border-border bg-card"
                    onClick={goToSettings}
                  >
                    <Settings size={16} />
                    Settings
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-12 max-w-56 items-center gap-3 rounded-full border border-border bg-card px-3 pr-2 text-left shadow-sm transition hover:border-blue-800/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/30"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user?.profileImage}
                            alt={accountName}
                          />
                          <AvatarFallback className="bg-blue-800 text-xs font-black text-white">
                            {avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {accountName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            Account
                          </span>
                        </span>
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-72 rounded-2xl p-2"
                    >
                      <DropdownMenuLabel className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user?.profileImage}
                              alt={accountName}
                            />
                            <AvatarFallback className="bg-blue-800 text-sm font-black text-white">
                              {avatarFallback}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">
                              {accountName}
                            </p>
                            <p className="truncate text-xs font-medium text-muted-foreground">
                              {user?.email || 'Drifto account'}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="rounded-xl py-3 font-semibold"
                        onClick={goToSettings}
                      >
                        <Settings size={16} />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="rounded-xl py-3 font-semibold text-red-600 focus:text-red-600"
                        disabled={isLoggingOut}
                        onSelect={(event) => {
                          event.preventDefault();
                          void handleLogout();
                        }}
                      >
                        {isLoggingOut ? <LoaderSmall /> : <LogOut size={16} />}
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  asChild
                  className="rounded-full bg-blue-800 px-5 text-white hover:bg-blue-900"
                >
                  <Link href="/login">
                    <LogIn size={16} />
                    Sign in
                  </Link>
                </Button>
              )}
            </div>
          </header>

          <div className="px-[calc(var(--desktop-gutter)+var(--desktop-sidebar-width)-5.25rem)] py-8">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
