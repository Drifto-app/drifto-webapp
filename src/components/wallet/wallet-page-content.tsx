'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { ScreenProvider } from '@/components/screen/screen-provider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentProps, ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FaArrowLeft } from 'react-icons/fa';
import * as React from 'react';
import { showTopToast } from '@/components/toast/toast-util';
import { authApi } from '@/lib/axios';
import { LoaderSmall } from '@/components/ui/loader';
import { GoDownload, GoPulse } from 'react-icons/go';
import { MdCreditCard } from 'react-icons/md';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { ArrowLeft, WalletCards } from 'lucide-react';
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from '@/lib/routes';

export const WalletPageContent = ({
  variant = 'mobile',
}: { variant?: 'mobile' | 'desktop' } = {}) => {
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;

  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <WalletContent
          prev={prev}
          currentPathUrl={pathname + '?' + searchParams}
          variant={variant}
        />
      </ScreenProvider>
    </ProtectedRoute>
  );
};

interface WalletContentProps extends ComponentProps<'div'> {
  prev: string | null;
  currentPathUrl: string;
  variant?: 'mobile' | 'desktop';
}

const WalletContent = ({
  prev,
  currentPathUrl,
  variant = 'mobile',
  className,
  ...props
}: WalletContentProps) => {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const [wallet, setWallet] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const actionButtons: {
    text: string;
    icon: ReactNode;
    onClick: () => void;
  }[] = [
    {
      text: 'Transactions',
      icon: <GoPulse size={20} />,
      onClick: () => {
        router.push(
          withPrev(
            isDesktop
              ? DESKTOP_ROUTES.walletTransactions
              : MOBILE_ROUTES.walletTransactions,
            currentPathUrl,
          ),
        );
      },
    },
    {
      text: 'Account',
      icon: <MdCreditCard size={20} />,
      onClick: () =>
        router.push(
          withPrev(
            isDesktop
              ? DESKTOP_ROUTES.paymentMethods
              : MOBILE_ROUTES.paymentMethods,
            currentPathUrl,
          ),
        ),
    },
    {
      text: 'Withdraw',
      icon: <GoDownload size={20} />,
      onClick: () => {
        router.push(
          withPrev(
            isDesktop
              ? DESKTOP_ROUTES.walletWithdraw
              : MOBILE_ROUTES.walletWithdraw,
            currentPathUrl,
          ),
        );
      },
    },
    {
      text: 'Support',
      icon: <IoIosHelpCircleOutline size={20} />,
      onClick: () => {},
    },
  ];

  const handleBackClick = () => {
    router.push(
      prev ??
        (isDesktop
          ? `${DESKTOP_ROUTES.settings}?section=payment-method`
          : MOBILE_ROUTES.settings),
    );
  };

  const handleWalletFetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.get('/wallet/user');
      setWallet(response.data.data);
    } catch {
      showTopToast('error', 'Error fetching user wallet');
      setError('Error fetching user wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleWalletFetch();
  }, []);

  if (isDesktop) {
    return (
      <div
        className={cn('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="desktop-page-header-inner flex h-20 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleBackClick}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Wallet
                </p>
                <h1 className="truncate text-2xl font-black">
                  Wallet overview
                </h1>
              </div>
            </div>
            <Button
              className="rounded-full bg-blue-800 hover:bg-blue-800"
              onClick={() =>
                router.push(
                  withPrev(DESKTOP_ROUTES.walletWithdraw, currentPathUrl),
                )
              }
            >
              <GoDownload size={18} />
              Withdraw
            </Button>
          </div>
        </header>

        <main className="desktop-page-container py-8">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Withdrawable balance
                  </p>
                  {isLoading ? (
                    <div className="mt-6">
                      <LoaderSmall />
                    </div>
                  ) : (
                    <p className="mt-4 text-5xl font-black tracking-tight">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                      }).format(wallet?.balance || 0)}
                    </p>
                  )}
                  {error ? (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                  ) : null}
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                  <WalletCards size={26} />
                </span>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Quick actions
              </p>
              <div className="mt-4 grid gap-3">
                {actionButtons.map((item) => (
                  <button
                    key={item.text}
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-left transition hover:border-blue-800/40 hover:bg-accent"
                    onClick={item.onClick}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                      {item.icon}
                    </span>
                    <span className="font-black">{item.text}</span>
                  </button>
                ))}
              </div>
            </aside>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn('w-full min-h-[100dvh] flex flex-col', className)}
      {...props}
    >
      <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
        <div className="flex flex-row items-center px-8">
          <FaArrowLeft
            size={16}
            onClick={handleBackClick}
            className="cursor-pointer hover:text-muted-foreground transition-colors"
            aria-label="Go back"
            role="button"
            tabIndex={0}
          />
          <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
            Wallet
          </p>
          <div className="w-5" /> {/* Spacer for centering */}
        </div>
      </div>
      <div className="w-full flex-1 flex flex-col gap-6 pt-6 px-4">
        <div className="w-full flex flex-col px-4 py-6 rounded-lg bg-black text-white gap-6">
          <p className="text-sm font-semibold">Withdrawable Balance</p>
          {isLoading ? (
            <LoaderSmall />
          ) : (
            <p className="font-black text-2xl">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
              }).format(wallet?.balance || 0)}
            </p>
          )}
        </div>
        <div className="w-full grid grid-cols-2 gap-5">
          {actionButtons.map((item, index) => (
            <span
              key={index}
              className="flex gap-2 items-center px-2 py-3 rounded-md border-1 border-border text-blue-800"
              onClick={item.onClick}
            >
              {item.icon}
              <p className="text-base text-foreground">{item.text}</p>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
