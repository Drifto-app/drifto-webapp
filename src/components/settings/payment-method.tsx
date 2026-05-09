'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { ScreenProvider } from '@/components/screen/screen-provider';
import * as React from 'react';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import { UserPaymentInfo } from '@/components/wallet/user-payment-infos';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from '@/lib/routes';

export const PaymentSettingsPageContent = ({
  variant = 'mobile',
}: { variant?: 'mobile' | 'desktop' } = {}) => {
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <PaymentSettingsContent
          prev={prev}
          currentPathUrl={pathname + '?' + searchParams}
          variant={variant}
        />
      </ScreenProvider>
    </ProtectedRoute>
  );
};

interface PaymentSettingsContentProps extends ComponentProps<'div'> {
  prev: string | null;
  currentPathUrl: string;
  variant?: 'mobile' | 'desktop';
}

export const PaymentSettingsContent = ({
  prev,
  currentPathUrl,
  variant = 'mobile',
  className,
  ...props
}: PaymentSettingsContentProps) => {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const handleBackClick = () => {
    router.push(
      prev ?? (isDesktop ? DESKTOP_ROUTES.settings : MOBILE_ROUTES.settings),
    );
  };

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
                  Settings
                </p>
                <h1 className="truncate text-2xl font-black">
                  Payment methods
                </h1>
              </div>
            </div>
            <Button
              className="rounded-full bg-blue-800 hover:bg-blue-800"
              asChild
            >
              <Link
                href={withPrev(DESKTOP_ROUTES.addPaymentMethod, currentPathUrl)}
              >
                Add account
              </Link>
            </Button>
          </div>
        </header>

        <main className="desktop-page-container grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                <CreditCard size={22} />
              </span>
              <div>
                <h2 className="text-xl font-black">Manage payout accounts</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Saved bank accounts are used for wallet withdrawals and
                  eligible paid-ticket refunds.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <UserPaymentInfo
                detailsType="BANK_ACCOUNT_DETAILS"
                maxHeight="560px"
                isManage={true}
                variant="desktop"
              />
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Wallet
            </p>
            <h3 className="mt-3 text-xl font-black">Balance and withdrawals</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open wallet to view balance, transaction history, and withdrawal
              requests.
            </p>
            <Button
              variant="outline"
              className="mt-5 w-full rounded-full"
              onClick={() =>
                router.push(withPrev(DESKTOP_ROUTES.wallet, currentPathUrl))
              }
            >
              Open wallet
            </Button>
          </aside>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full min-h-[100dvh] flex flex-col bg-background',
        className,
      )}
      {...props}
    >
      <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
        <div className="flex flex-row items-center px-8">
          <FaArrowLeft
            size={20}
            onClick={handleBackClick}
            className="cursor-pointer hover:text-muted-foreground transition-colors"
            aria-label="Go back"
            role="button"
            tabIndex={0}
          />
          <p className="font-semibold text-foreground text-md w-full text-center capitalize truncate ml-4">
            Payment Settings
          </p>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex-1 flex flex-col gap-6 px-4 pt-6 pb-8">
        {/* Wallet Section */}
        <div
          className="w-full flex items-center justify-between py-4 cursor-pointer hover:bg-background transition-colors rounded-lg px-2"
          onClick={() =>
            router.push(`/m/wallet?prev=${encodeURIComponent(currentPathUrl)}`)
          }
          role="button"
          tabIndex={0}
        >
          <h3 className="font-semibold text-lg text-foreground">Wallet</h3>
          <FaChevronRight size={16} className="text-neutral-400" />
        </div>

        <div className="w-full flex flex-col gap-4">
          <h3 className="font-semibold text-lg text-foreground">
            Manage Accounts
          </h3>

          <UserPaymentInfo
            detailsType="BANK_ACCOUNT_DETAILS"
            maxHeight="500px"
            isManage={true}
          />

          <a
            className="w-full text-blue-700 text-center font-semibold text-base hover:text-blue-800 transition-colors"
            href={`/m/settings/payment-method/add?prev=${encodeURIComponent(currentPathUrl)}`}
          >
            Add Account Number
          </a>
        </div>
      </div>
    </div>
  );
};
