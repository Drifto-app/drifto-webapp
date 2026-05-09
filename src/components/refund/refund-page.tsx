'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { authApi } from '@/lib/axios';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { UserPaymentInfo } from '@/components/wallet/user-payment-infos';
import { UserListSkeleton } from '@/components/ui/page-skeletons';
import { showTopToast } from '@/components/toast/toast-util';
import { DESKTOP_ROUTES, MOBILE_ROUTES, withPrev } from '@/lib/routes';

// Types
interface Ticket {
  id: string;
  ticketName: string;
  ticketReference: string;
  paid: boolean;
}

interface RefundRequest {
  userTicketReference: string;
  accountNumber?: string;
  bankCode?: string;
  bankName?: string;
}

interface LoadingState {
  tickets: boolean;
  refund: boolean;
}

interface ErrorState {
  tickets: string | null;
  refund: string | null;
}

interface RefundPageComponentProps {
  variant?: 'mobile' | 'desktop';
}

export default function RefundPageComponent({
  variant = 'mobile',
}: RefundPageComponentProps = {}) {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prev = searchParams?.get('prev') ?? null;
  const isDesktop = variant === 'desktop';

  // State management
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [paymentInfo, setPaymentInfo] = useState<Record<string, any> | null>(
    null,
  );

  const [loading, setLoading] = useState<LoadingState>({
    tickets: false,
    refund: false,
  });

  const [errors, setErrors] = useState<ErrorState>({
    tickets: null,
    refund: null,
  });

  // API calls
  const fetchTickets = useCallback(async () => {
    if (!id) return;

    setLoading((prev) => ({ ...prev, tickets: true }));
    setErrors((prev) => ({ ...prev, tickets: null }));

    try {
      const response = await authApi.get(`/userTicket/plan/ticket/${id}`, {
        params: { pageNumber: 1, pageSize: 10 },
      });

      const data = response.data?.data?.data || [];
      setTickets(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch tickets';
      setErrors((prev) => ({ ...prev, tickets: errorMessage }));
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading((prev) => ({ ...prev, tickets: false }));
    }
  }, [id]);

  const handleRefundTicket = useCallback(
    async (refundData: RefundRequest) => {
      setLoading((prev) => ({ ...prev, refund: true }));
      setErrors((prev) => ({ ...prev, refund: null }));

      try {
        await authApi.post('refund/userTicket', refundData);
        router.push(
          isDesktop ? DESKTOP_ROUTES.refundHistory : '/?screen=plans',
        );
      } catch {
        const errorMessage = 'Failed to process refund';
        // setErrors((prev) => ({ ...prev, refund: errorMessage }));
        showTopToast('error', errorMessage);
      } finally {
        setLoading((prev) => ({ ...prev, refund: false }));
      }
    },
    [isDesktop, router],
  );

  // Event handlers
  const handleTicketSelect = useCallback((ticket: Ticket) => {
    setSelectedTicket((prev) => (prev?.id === ticket.id ? undefined : ticket));
  }, []);

  const handleAccountsLoad = useCallback(() => {}, []);

  const handleConfirmRefund = useCallback(() => {
    if (!selectedTicket) return;

    if (selectedTicket.paid && !paymentInfo) return;

    const refundData: RefundRequest = {
      userTicketReference: selectedTicket.ticketReference,
    };

    if (selectedTicket.paid) {
      refundData.accountNumber = paymentInfo!.accountNumber || '';
      refundData.bankCode = paymentInfo!.bankCode || '';
      refundData.bankName = paymentInfo!.bankName || '';
    }

    handleRefundTicket(refundData);
  }, [selectedTicket, paymentInfo, handleRefundTicket]);

  // Effects
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Computed values
  const shouldShowBankSelection =
    selectedTicket?.paid === true || selectedTicket === undefined;
  const isConfirmDisabled =
    !selectedTicket || loading.refund || (selectedTicket.paid && !paymentInfo);

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="desktop-page-header-inner flex h-20 items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push(prev || DESKTOP_ROUTES.bookings)}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bookings
              </p>
              <h1 className="text-lg font-black">Request a refund</h1>
            </div>
          </div>
        </header>

        <div className="desktop-page-container desktop-two-column-page grid gap-10 py-10">
          <section className="min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-black">
                Select the ticket to refund
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You can select only one ticket at a time.
              </p>
            </div>

            <div>
              {loading.tickets ? (
                <LoadingSpinner message="Loading tickets..." />
              ) : errors.tickets ? (
                <ErrorMessage message={errors.tickets} onRetry={fetchTickets} />
              ) : (
                <TicketList
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  onTicketSelect={handleTicketSelect}
                />
              )}
            </div>

            {shouldShowBankSelection && (
              <section className="mt-10">
                <h2 className="text-lg font-black">Account</h2>
                <p className="mb-3 text-sm text-muted-foreground">
                  Refunds for paid tickets are sent to a saved bank account.
                </p>
                <UserPaymentInfo
                  detailsType="BANK_ACCOUNT_DETAILS"
                  maxHeight="500px"
                  onAccountsLoad={handleAccountsLoad}
                  paymentInfo={paymentInfo}
                  setPaymentInfo={setPaymentInfo}
                />
                <div className="mt-3">
                  <a
                    href={withPrev(
                      DESKTOP_ROUTES.addPaymentMethod,
                      `${pathname ?? ''}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`,
                    )}
                    className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
                  >
                    + Add account
                  </a>
                </div>
              </section>
            )}
          </section>

          <aside className="min-w-0">
            <div className="sticky top-28 flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Refund summary
                </p>
                <div className="mt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ticket</span>
                    <span className="font-semibold">
                      {selectedTicket ? selectedTicket.ticketName : '—'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-semibold">
                      {selectedTicket
                        ? selectedTicket.paid
                          ? 'Paid'
                          : 'Free'
                        : '—'}
                    </span>
                  </div>
                </div>

                <Button
                  className="mt-5 h-12 w-full rounded-full"
                  disabled={isConfirmDisabled}
                  onClick={handleConfirmRefund}
                >
                  {loading.refund ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processing…
                    </>
                  ) : (
                    'Confirm refund'
                  )}
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  A 10% fee may apply for paid ticket refunds.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] bg-accent/40">
      <RefundHeader title="Request Refund" prev={prev} />

      <main className="p-4 pb-24">
        {/* Instructions */}
        <div className="mb-8">
          <h1 className="text-base font-semibold mb-2">
            Select the ticket you want a refund for
          </h1>
          <p className="text-sm text-gray-600">
            Select the ticket you want a refund for. You can select only one
            ticket at a time.
          </p>
        </div>

        {/* Error Display */}
        {/*{errors.refund && (*/}
        {/*    <ErrorMessage*/}
        {/*        message={errors.refund}*/}
        {/*        onDismiss={() => setErrors((prev) => ({ ...prev, refund: null }))}*/}
        {/*    />*/}
        {/*)}*/}

        {/* Tickets Section */}
        <section className="mb-8">
          {loading.tickets ? (
            <LoadingSpinner message="Loading tickets..." />
          ) : errors.tickets ? (
            <ErrorMessage message={errors.tickets} onRetry={fetchTickets} />
          ) : (
            <TicketList
              tickets={tickets}
              selectedTicket={selectedTicket}
              onTicketSelect={handleTicketSelect}
            />
          )}
        </section>

        {/* Bank Selection Section */}
        {shouldShowBankSelection && (
          <section>
            <h2 className="text-lg font-bold mb-4">Account</h2>
            <UserPaymentInfo
              detailsType="BANK_ACCOUNT_DETAILS"
              maxHeight="500px"
              onAccountsLoad={handleAccountsLoad}
              paymentInfo={paymentInfo}
              setPaymentInfo={setPaymentInfo}
            />
          </section>
        )}

        <section className="w-full flex justify-center py-6">
          <a
            href={withPrev(
              MOBILE_ROUTES.settings + '/payment-method/add',
              `${pathname ?? ''}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`,
            )}
            className="text-blue-800 font-semibold transition-colors"
          >
            Add Account
          </a>
        </section>
      </main>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 w-full border-t border-border bg-background p-4 flex justify-center">
        <button
          disabled={isConfirmDisabled}
          onClick={handleConfirmRefund}
          className="w-10/12 flex items-center justify-center gap-2 p-3 rounded-md disabled:bg-neutral-600 disabled:cursor-not-allowed text-white bg-blue-800 hover:bg-blue-800 font-bold text-base transition-colors"
        >
          {loading.refund ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            'Confirm'
          )}
        </button>
      </div>
    </div>
  );
}

// Component: Ticket List
interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | undefined;
  onTicketSelect: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicket,
  onTicketSelect,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tickets found for this plan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const isSelected = selectedTicket?.id === ticket.id;
        return (
          <div
            key={ticket.id}
            onClick={() => onTicketSelect(ticket)}
            className={`p-3 text-base font-normal rounded-md border-2 cursor-pointer transition-all hover:shadow-md ${
              isSelected
                ? 'text-blue-700 border-blue-700 bg-blue-50'
                : 'border-border hover:border-gray-400'
            }`}
          >
            <span className="font-medium">{ticket.ticketName}</span>
            {!ticket.paid && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                (free)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Component: Loading Spinner
interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = () => (
  <div className="py-4">
    <UserListSkeleton count={3} />
  </div>
);

// Component: Error Message
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
}) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <div className="flex items-start">
      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
      <div className="ml-3 flex-1">
        <p className="text-sm text-red-800">{message}</p>
        <div className="mt-2 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Component: Refund Header
interface RefundHeaderProps {
  title: string;
  prev: string | null;
}

const RefundHeader: React.FC<RefundHeaderProps> = ({ title, prev }) => {
  const router = useRouter();

  return (
    <header className="w-full border-b border-border bg-background shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 h-16">
        <button
          onClick={() => router.push(prev || '/?screen=plans')}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <h1 className="font-semibold text-foreground text-base capitalize truncate flex-1 text-center mx-4">
          {title}
        </h1>
        <div className="w-8 h-8" /> {/* Spacer for centering */}
      </div>
    </header>
  );
};
