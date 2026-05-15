'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import { ScreenProvider } from '@/components/screen/screen-provider';
import * as React from 'react';
import { ComponentProps, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { FaArrowLeft } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { TbCurrencyNaira } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { LoaderSmall } from '@/components/ui/loader';
import { UserPaymentInfo } from '@/components/wallet/user-payment-infos';
import { showTopToast } from '@/components/toast/toast-util';
import { authApi } from '@/lib/axios';
import { ArrowLeft } from 'lucide-react';
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from '@/lib/routes';

export const WalletWithdrawalPageContent = ({
  variant = 'mobile',
}: { variant?: 'mobile' | 'desktop' } = {}) => {
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <WalletTransactionsContent
          prev={prev}
          currentPathUrl={pathname + '?' + searchParams}
          variant={variant}
        />
      </ScreenProvider>
    </ProtectedRoute>
  );
};

interface WalletWithdrawalContentProps extends ComponentProps<'div'> {
  prev: string | null;
  currentPathUrl: string;
  variant?: 'mobile' | 'desktop';
}

export const WalletTransactionsContent = ({
  prev,
  currentPathUrl,
  variant = 'mobile',
  className,
  ...props
}: WalletWithdrawalContentProps) => {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const [amount, setAmount] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<Record<string, any> | null>(
    null,
  );

  const [inputError, setInputError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [hasAccounts, setHasAccounts] = useState(false);

  const handleBackClick = () => {
    router.push(
      prev ?? (isDesktop ? DESKTOP_ROUTES.wallet : MOBILE_ROUTES.wallet),
    );
  };

  const handleAmountChange = (raw: string) => {
    setInputError(null);

    // Allow only digits and a single decimal point
    let cleaned = raw.replace(/[^0-9.]/g, '');

    // Prevent more than one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places if decimal exists
    if (parts.length === 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }

    const numValue = parseFloat(cleaned);

    if (numValue < 100) {
      setInputError('Amount must be ₦100 or more');
    }

    setAmount(cleaned);
  };

  const handleAccountsLoad = useCallback(
    (accounts: Array<Record<string, any>>) => {
      setHasAccounts(accounts.length > 0);
    },
    [],
  );

  const handleSubmit = async () => {
    if (!paymentInfo) return;

    const param = {
      amount: parseFloat(amount),
      paymentInfoId: paymentInfo.id,
    };

    setLoading(true);

    try {
      await authApi.post('/wallet/withdraw', param);
      setAmount('');
      showTopToast('success', 'Withdrawal request successfully');
    } catch {
      showTopToast('error', 'Error making withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  if (isDesktop) {
    return (
      <div
        className={cn('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="desktop-page-header-inner flex h-20 items-center gap-4">
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
              <h1 className="truncate text-2xl font-black">Withdraw funds</h1>
            </div>
          </div>
        </header>

        <main className="desktop-page-container grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Withdrawal amount</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Enter an amount of at least 100 Naira and select the account where
              Drifto should send the payout.
            </p>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Amount
                </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-background px-4 transition focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-800/10">
                  <TbCurrencyNaira
                    size={22}
                    className="text-muted-foreground"
                  />
                  <Input
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="h-full border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                    required
                  />
                </div>
                {inputError ? (
                  <p className="text-sm text-red-600">{inputError}</p>
                ) : null}
              </div>

              <div>
                <h3 className="font-black">Payout account</h3>
                <div className="mt-3">
                  <UserPaymentInfo
                    detailsType="BANK_ACCOUNT_DETAILS"
                    maxHeight="500px"
                    onAccountsLoad={handleAccountsLoad}
                    paymentInfo={paymentInfo}
                    setPaymentInfo={setPaymentInfo}
                    variant="desktop"
                  />
                </div>
                <Link
                  className="mt-4 inline-flex text-sm font-bold text-blue-800"
                  href={withPrev(
                    DESKTOP_ROUTES.addPaymentMethod,
                    currentPathUrl,
                  )}
                >
                  + Add account number
                </Link>
              </div>
            </div>
          </section>

          <aside className="min-w-0">
            <div className="sticky top-28 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Summary
              </p>
              <p className="mt-3 text-3xl font-black">
                {amount
                  ? new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    }).format(Number(amount))
                  : '₦0.00'}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Withdrawals require a saved payout account. Minimum withdrawal
                amount is ₦100.
              </p>
              <Button
                className="mt-5 h-12 w-full rounded-full bg-blue-800 hover:bg-blue-800"
                disabled={
                  isLoading ||
                  !!inputError ||
                  !amount ||
                  !hasAccounts ||
                  !paymentInfo
                }
                onClick={handleSubmit}
              >
                {isLoading ? <LoaderSmall /> : 'Continue'}
              </Button>
            </div>
          </aside>
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
            Withdrawal
          </p>
          <div className="w-5" /> {/* Spacer for centering */}
        </div>
      </div>
      <div className="w-full flex-1 flex flex-col gap-4 items-center justify-between px-4 pt-6 pb-8">
        <div className="w-full flex flex-col gap-4">
          <h3 className="font-bold text-lg w-full">
            Enter amount you want to withdraw
          </h3>
          <p className="text-neutral-500 w-full leading-tight">
            Enter an amount of at least 100 Naira. Make sure you have already
            stored your account number in the payment settings screen so we can
            deposit the money there.
          </p>
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex items-center gap-3 px-4 py-2 border border-border rounded-lg focus-within:border-blue-600">
              <TbCurrencyNaira size={20} className="text-muted-foreground" />
              <Input
                placeholder="Amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="border-none shadow-none text-base p-0 w-full"
                required
              />
            </div>
            {inputError && <p className="text-red-600 text-sm">{inputError}</p>}
          </div>
          <h3 className="font-bold text-base w-full">Your accounts info</h3>
          <UserPaymentInfo
            detailsType="BANK_ACCOUNT_DETAILS"
            maxHeight="500px"
            onAccountsLoad={handleAccountsLoad}
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
          />
          <a
            className="w-full text-blue-800 text-center font-semibold"
            href={`/m/settings/payment-method/add?prev=${encodeURIComponent(currentPathUrl)}`}
          >
            Add account number
          </a>
        </div>
        <Button
          className="w-full bg-blue-800 hover:bg-blue-800 py-8 font-semibold text-base mt-8"
          disabled={
            isLoading || !!inputError || !amount || !hasAccounts || !paymentInfo
          }
          onClick={handleSubmit}
        >
          {isLoading ? <LoaderSmall /> : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
