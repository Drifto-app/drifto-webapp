'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import { ActiveScreenType } from '@/components/search/search-details';
import { FaArrowLeft } from 'react-icons/fa';
import * as React from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import {
  FilterCategoryDialog,
  FilterDateDialog,
  FilterHostDialog,
  FilterLocationDialog,
  FilterPriceDialog,
  FilterTypeDialog,
} from '@/components/search/advance-search-filter-dialogs';
import { Loader } from '@/components/ui/loader';
import { RecentSearchCard } from '@/components/search/search-card';
import { authApi } from '@/lib/axios';
import { showTopToast } from '@/components/toast/toast-util';
import { SearchType } from '@/components/search/search-component';
import {
  EventCardSkeleton,
  UserListSkeleton,
} from '@/components/ui/page-skeletons';
import { ArrowLeft } from 'lucide-react';

interface AdvanceSearchProps extends ComponentProps<'div'> {
  setActiveScreen: (activeScreen: ActiveScreenType) => void;
  variant?: 'mobile' | 'desktop';
}

export type DateRangeType = { to?: Date; from?: Date };

export const AdvanceSearch = ({
  setActiveScreen,
  variant = 'mobile',
  className,
  ...props
}: AdvanceSearchProps) => {
  const isDesktop = variant === 'desktop';
  const [searchType, setSearchType] = useState<SearchType>('EVENT');
  const [dateRange, setDateRange] = useState<DateRangeType | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isTicketPaid, setIsTicketPaid] = useState<boolean | null>(null);
  const [isHostVerified, setIsHostVerified] = useState<boolean | null>(null);
  const [eventTags, setEventTags] = useState<string[] | null>(null);

  const [resultsLoading, setResultsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [commitToken, setCommitToken] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLLIElement | null>(null);
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleBackClick = () => {
    setActiveScreen('suggestion');
  };

  // --- Core loader (called for initial fetch and infinite scroll) ---
  const loadResults = useCallback(
    async (pageNum: number, type: SearchType) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setResultsLoading(true);

      // Cancel any previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Build query params
      const params: { [key: string]: any } = {
        pageNumber: pageNum,
      };

      if (type) params.searchType = type.toUpperCase();

      const toISOYMDNoon = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)
          .toISOString()
          .slice(0, 10);

      if (dateRange) {
        if (dateRange.from) params.startDate = toISOYMDNoon(dateRange.from);
        if (dateRange.to) params.endDate = toISOYMDNoon(dateRange.to);
      }

      if (location) params.location = location.toLowerCase();
      if (isTicketPaid !== null) params.isTicketPaid = isTicketPaid;
      if (isHostVerified !== null)
        params.hostVerificationStatus = isHostVerified;
      if (eventTags && eventTags.length > 0) {
        if (eventTags.length <= 1) {
          params.eventCategories = eventTags[0].toLowerCase();
        } else {
          params.eventCategories = eventTags.join('&');
        }
      }

      try {
        // NOTE: axios expects params inside an options object
        const response = await authApi.get('/search', {
          signal: controller.signal,
          params,
        });

        const payload = response?.data?.data ?? {};

        if (type === 'USER') {
          const batch = payload?.users?.data ?? [];
          setUsers((prev) => (pageNum === 1 ? batch : [...prev, ...batch]));
          setHasMore(!payload?.users?.isLast);
        } else {
          const batch = payload?.events?.data ?? [];
          setEvents((prev) => (pageNum === 1 ? batch : [...prev, ...batch]));
          setHasMore(!payload?.events?.isLast);
        }

        setPage((prev) => prev + 1);
      } catch (error: any) {
        // Ignore abort errors as they are expected on new searches/unmounts
        if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
          showTopToast('error', 'Something went wrong while searching.');
        }
      } finally {
        setResultsLoading(false);
        inFlightRef.current = false;
      }
    },
    [dateRange, eventTags, isHostVerified, isTicketPaid, location],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // --- New search "commit": reset + initial fetch ---
  useEffect(() => {
    if (!commitToken) return;

    // Reset lists & paging
    setUsers([]);
    setEvents([]);
    setPage(1);
    setHasMore(true);
    setIsSearched(true);

    void loadResults(1, searchType);
  }, [commitToken, searchType, loadResults]);

  // --- Infinite scroll observer ---
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const rootEl = scrollRef.current ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          isSearched &&
          hasMore &&
          !resultsLoading &&
          !inFlightRef.current
        ) {
          void loadResults(page, searchType);
        }
      },
      {
        root: rootEl, // null => window; element => your scroll container
        rootMargin: '400px', // start prefetch earlier
        threshold: 0,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, resultsLoading, page, searchType, isSearched, loadResults]);

  // --- Search button handler ---
  const handleSearchClick = () => {
    // Bump token to trigger reset+fetch in the effect
    setCommitToken((t) => t + 1);
  };

  if (isDesktop) {
    return (
      <div
        className={cn('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="desktop-page-container py-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex min-w-0 items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={handleBackClick}
                  aria-label="Back to search"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    Search
                  </p>
                  <h1 className="truncate text-3xl font-black tracking-tight">
                    Advanced filters
                  </h1>
                </div>
              </div>
              <Button
                onClick={handleSearchClick}
                className="h-12 rounded-full bg-blue-800 px-7 hover:bg-blue-800"
                aria-label="Run advanced search"
              >
                <IoSearchSharp size={18} />
                Search
              </Button>
            </div>

            <div className="mt-6 overflow-x-auto no-scrollbar">
              <div className="flex min-w-max gap-3">
                <FilterTypeDialog
                  setSearchText={setSearchType}
                  searchText={searchType}
                />
                <FilterDateDialog
                  dateValue={dateRange}
                  setDateValue={setDateRange}
                />
                <FilterPriceDialog
                  isTicketPaid={isTicketPaid}
                  setIsTicketPaid={setIsTicketPaid}
                />
                <FilterHostDialog
                  isHostVerified={isHostVerified}
                  setIsHostVerified={setIsHostVerified}
                />
                <FilterLocationDialog
                  location={location}
                  setLocation={setLocation}
                  googleMapsApiKey={
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                  }
                />
                <FilterCategoryDialog
                  categories={eventTags}
                  setCategories={setEventTags}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="desktop-page-container grid gap-6 py-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Filtered results
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {isSearched
                  ? `${searchType === 'USER' ? users.length : events.length} loaded`
                  : 'Ready to search'}
              </h2>
            </div>

            {!isSearched ? (
              <div className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
                <IoSearchSharp size={44} className="text-blue-800" />
                <p className="mt-4 text-lg font-black">
                  Build a focused search
                </p>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Choose filters above, then run search to find matching events
                  or users.
                </p>
              </div>
            ) : (
              <div className="p-5">
                {resultsLoading && users.length === 0 && events.length === 0 ? (
                  searchType === 'USER' ? (
                    <UserListSkeleton count={5} />
                  ) : (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <EventCardSkeleton key={index} />
                      ))}
                    </div>
                  )
                ) : searchType === 'USER' ? (
                  users.length ? (
                    <ul className="grid gap-3">
                      {users.map((user, index) => (
                        <RecentSearchCard
                          item={user}
                          type={'user'}
                          key={index}
                          variant={variant}
                        />
                      ))}
                      <li
                        ref={sentinelRef}
                        className="h-1 list-none"
                        aria-hidden
                      />
                      {resultsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader className="h-8 w-8" />
                        </div>
                      ) : null}
                      {!hasMore ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No more users
                        </p>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                      No users found
                    </p>
                  )
                ) : events.length ? (
                  <ul className="grid gap-3">
                    {events.map((event, index) => (
                      <RecentSearchCard
                        item={event}
                        type={'event'}
                        key={index}
                        variant={variant}
                      />
                    ))}
                    <li
                      ref={sentinelRef}
                      className="h-1 list-none"
                      aria-hidden
                    />
                    {resultsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader className="h-8 w-8" />
                      </div>
                    ) : null}
                    {!hasMore ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No more events
                      </p>
                    ) : null}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                    No events found
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-32 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Active filters
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <FilterSummary
                  label="Type"
                  value={searchType === 'USER' ? 'Users' : 'Events'}
                />
                <FilterSummary label="Location" value={location || 'Any'} />
                <FilterSummary
                  label="Price"
                  value={
                    isTicketPaid === null
                      ? 'Any'
                      : isTicketPaid
                        ? 'Paid'
                        : 'Free'
                  }
                />
                <FilterSummary
                  label="Host"
                  value={
                    isHostVerified === null
                      ? 'Any'
                      : isHostVerified
                        ? 'Verified'
                        : 'Any host'
                  }
                />
                <FilterSummary
                  label="Categories"
                  value={eventTags?.length ? eventTags.join(', ') : 'Any'}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn('w-full min-h-[100dvh] flex flex-col', className)}
        {...props}
      >
        <div className="w-full border-b border-border flex flex-col gap-6 justify-center pt-6 pb-4 flex-shrink-0">
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
              Customize Search
            </p>
          </div>

          <div className="w-full flex items-center px-4 overflow-x-auto gap-4 no-scrollbar">
            <FilterTypeDialog
              setSearchText={setSearchType}
              searchText={searchType}
            />
            <FilterDateDialog
              dateValue={dateRange}
              setDateValue={setDateRange}
            />
            <FilterPriceDialog
              isTicketPaid={isTicketPaid}
              setIsTicketPaid={setIsTicketPaid}
            />
            <FilterHostDialog
              isHostVerified={isHostVerified}
              setIsHostVerified={setIsHostVerified}
            />
            <FilterLocationDialog
              location={location}
              setLocation={setLocation}
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            />
            <FilterCategoryDialog
              categories={eventTags}
              setCategories={setEventTags}
            />
          </div>

          {/* SEARCH BUTTON */}
          <div className="w-full px-6">
            <Button
              onClick={handleSearchClick}
              className="w-full bg-neutral-950 hover:bg-neutral-800 py-2 px-6 rounded-full flex items-center justify-center"
              aria-label="Run search"
            >
              <IoSearchSharp size={20} className="text-white" />
              <span className="text-white font-bold text-md mx-2">Search</span>
            </Button>
          </div>
        </div>

        {!isSearched ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-center font-semibold text-md">
              Looking for something specific? Use filter above to narrow it
              down!
            </p>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto px-4 no-scrollbar pt-5 pb-15"
            ref={scrollRef}
            style={{ maxHeight: 'calc(100dvh - 200px)' }}
          >
            {resultsLoading && users.length === 0 && events.length === 0 ? (
              searchType === 'USER' ? (
                <UserListSkeleton count={4} />
              ) : (
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              )
            ) : searchType === 'USER' ? (
              users.length ? (
                <ul className="flex flex-col gap-4">
                  {users.map((user, index) => (
                    <RecentSearchCard
                      item={user}
                      type={'user'}
                      key={index}
                      variant={variant}
                    />
                  ))}
                  {resultsLoading && (
                    <div className="flex justify-center py-4">
                      <Loader className="h-8 w-8" />
                    </div>
                  )}
                  {/* Sentinel to trigger next page */}
                  <li ref={sentinelRef} className="h-1" aria-hidden />
                  {!hasMore && (
                    <p className="text-center text-neutral-500 py-4">
                      No more users
                    </p>
                  )}
                </ul>
              ) : (
                <p className="text-center text-neutral-500 py-10">
                  No users found
                </p>
              )
            ) : events.length ? (
              <ul className="flex flex-col gap-4">
                {events.map((event, index) => (
                  <RecentSearchCard
                    item={event}
                    type={'event'}
                    key={index}
                    variant={variant}
                  />
                ))}
                {resultsLoading && (
                  <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8" />
                  </div>
                )}
                {/* Sentinel to trigger next page */}
                <li ref={sentinelRef} className="h-1" aria-hidden />
                {!hasMore && (
                  <p className="text-center text-neutral-500 py-4">
                    No more events
                  </p>
                )}
              </ul>
            ) : (
              <p className="text-center text-neutral-500 py-10">
                No events found
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

function FilterSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 font-semibold text-foreground">{value}</p>
    </div>
  );
}
