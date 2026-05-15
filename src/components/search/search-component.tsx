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
import { authApi } from '@/lib/axios';
import { Loader } from '@/components/ui/loader';
import { showTopToast } from '@/components/toast/toast-util';
import { RecentSearchCard } from '@/components/search/search-card';
import {
  SearchResultsSkeleton,
  UserListSkeleton,
} from '@/components/ui/page-skeletons';

export type SearchType = 'EVENT' | 'USER';

interface SearchComponentProps extends ComponentProps<'div'> {
  searchText?: string;
  commitToken?: number;
  committed?: boolean;
  variant?: 'mobile' | 'desktop';
}

export const SearchComponent = ({
  searchText = '',
  commitToken,
  committed = false,
  variant = 'mobile',
  className,
  ...props
}: SearchComponentProps) => {
  const [searchType, setSearchType] = useState<SearchType>('EVENT');
  const isDesktop = variant === 'desktop';

  // suggestions
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionData, setSuggestionData] = useState<{
    [key: string]: any;
  } | null>(null);

  // results
  const [resultsLoading, setResultsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);

  // >>> RESET when parent uncommits (e.g., input cleared)
  useEffect(() => {
    if (!committed) {
      setSuggestionData(null);
      setUsers([]);
      setEvents([]);
      setPage(1);
      setHasMore(true);
    }
  }, [committed]);

  // suggestions while typing (only when NOT committed)
  useEffect(() => {
    if (!searchText.trim() || committed) {
      setSuggestionData(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSuggestionLoading(true);
        const response = await authApi.get('/search/suggestion', {
          params: { search: searchText.trim() },
        });
        setSuggestionData(response.data.data);
      } catch {
        showTopToast('error', 'Something went wrong');
      } finally {
        setSuggestionLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchText, committed]);

  // core loader with in-flight guard + functional page update
  const loadResults = useCallback(
    async (pageNum: number, q: string, type: SearchType) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setResultsLoading(true);
      try {
        const response = await authApi.get('/search', {
          params: {
            search: q,
            searchType: type,
            pageNumber: pageNum,
            pageSize: 20,
          },
        });
        const payload = response.data.data;

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
      } catch {
        showTopToast('error', 'Error');
      } finally {
        setResultsLoading(false);
        inFlightRef.current = false;
      }
    },
    [],
  );

  // run committed search on every Enter (commitToken bump)
  useEffect(() => {
    if (!commitToken || !searchText.trim()) return;
    setUsers([]);
    setEvents([]);
    setPage(1);
    setHasMore(true);
    void loadResults(1, searchText.trim(), searchType);
  }, [commitToken, loadResults, searchText, searchType]);

  // re-run first page when switching tabs in committed mode
  useEffect(() => {
    if (!committed || !searchText.trim()) return;
    setUsers([]);
    setEvents([]);
    setPage(1);
    setHasMore(true);
    void loadResults(1, searchText.trim(), searchType);
  }, [committed, loadResults, searchText, searchType]);

  // IntersectionObserver to trigger loading more when sentinel enters view
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const rootEl = scrollRef.current ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          committed &&
          hasMore &&
          !resultsLoading &&
          !inFlightRef.current &&
          searchText.trim()
        ) {
          void loadResults(page, searchText.trim(), searchType);
        }
      },
      {
        root: rootEl,
        rootMargin: '200px',
        threshold: 0,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    committed,
    hasMore,
    resultsLoading,
    page,
    searchText,
    searchType,
    loadResults,
  ]);

  const Tab = ({ label, type }: { label: string; type: SearchType }) => (
    <button
      className={cn(
        'rounded-full border font-semibold transition',
        isDesktop ? 'px-5 py-2.5 text-sm' : 'px-5 py-2',
        searchType === type
          ? 'bg-blue-800 text-white border-blue-800'
          : 'bg-transparent text-foreground border-border hover:bg-accent',
      )}
      onClick={() => setSearchType(type)}
    >
      {label}
    </button>
  );

  if (isDesktop) {
    return (
      <section
        className={cn(
          'grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]',
          className,
        )}
        {...props}
      >
        <div className="min-w-0 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Search results
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {committed ? `"${searchText.trim()}"` : 'Live suggestions'}
              </h2>
            </div>
            {searchText.trim() && committed ? (
              <div className="flex gap-2 rounded-full border border-border bg-background p-1">
                <Tab label="Events" type="EVENT" />
                <Tab label="Users" type="USER" />
              </div>
            ) : null}
          </div>

          {!committed ? (
            <div className="p-5">
              {suggestionLoading ? (
                <UserListSkeleton count={4} />
              ) : !suggestionData ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
                  <p className="text-lg font-black">Start typing to search</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Suggestions will appear here before you run a full search.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-black">Events</h3>
                    {suggestionData.events.data.length ? (
                      <div className="grid gap-3">
                        {suggestionData.events.data.map(
                          (event: { [key: string]: any }) => (
                            <RecentSearchCard
                              item={event}
                              type={'event'}
                              key={event.id}
                              variant={variant}
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                        No event suggestions
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-3 font-black">Users</h3>
                    {suggestionData.users.data.length ? (
                      <div className="grid gap-3">
                        {suggestionData.users.data.map(
                          (user: { [key: string]: any }) => (
                            <RecentSearchCard
                              item={user}
                              type={'user'}
                              key={user.id}
                              variant={variant}
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                        No user suggestions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5">
              {resultsLoading && users.length === 0 && events.length === 0 ? (
                <SearchResultsSkeleton count={5} />
              ) : searchType === 'USER' ? (
                users.length ? (
                  <div className="grid gap-3" ref={scrollRef}>
                    {users.map((user) => (
                      <RecentSearchCard
                        item={user}
                        type={'user'}
                        key={user.id}
                        variant={variant}
                      />
                    ))}
                    <div ref={sentinelRef} className="h-1" aria-hidden />
                    {resultsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader className="h-8 w-8" />
                      </div>
                    ) : null}
                    {!hasMore ? (
                      <p className="text-center text-sm text-muted-foreground">
                        No more users
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                    No users found
                  </p>
                )
              ) : events.length ? (
                <div className="grid gap-3" ref={scrollRef}>
                  {events.map((event) => (
                    <RecentSearchCard
                      item={event}
                      type={'event'}
                      key={event.id}
                      variant={variant}
                    />
                  ))}
                  <div ref={sentinelRef} className="h-1" aria-hidden />
                  {resultsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader className="h-8 w-8" />
                    </div>
                  ) : null}
                  {!hasMore ? (
                    <p className="text-center text-sm text-muted-foreground">
                      No more events
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                  No events found
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-32 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Search mode
            </p>
            <h3 className="mt-3 text-xl font-black">
              {committed ? 'Results' : 'Suggestions'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Type to preview matching events and people. Press Enter or use the
              Search button for paginated results.
            </p>
          </div>
        </aside>
      </section>
    );
  }

  return (
    <div className={cn('w-full flex-1', className)} {...props}>
      {/* Tabs */}
      {searchText.trim() && committed && (
        <div className="w-full px-4 pt-3 pb-2 flex gap-3">
          <Tab label="Events" type="EVENT" />
          <Tab label="Users" type="USER" />
        </div>
      )}

      {/* SUGGESTIONS (typing) */}
      {!committed && (
        <div className="px-4 py-2">
          {suggestionLoading ? (
            <div className="py-4">
              <UserListSkeleton count={4} />
            </div>
          ) : !suggestionData ? (
            <div className="text-center text-neutral-500 py-10">
              Start typing to see suggestions
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Events preview */}
              <div>
                <h3 className="font-semibold mb-2">Events</h3>
                {suggestionData.events.data.length ? (
                  <ul className="flex flex-col gap-3">
                    {suggestionData.events.data.map(
                      (event: { [key: string]: any }) => (
                        <RecentSearchCard
                          item={event}
                          type={'event'}
                          key={event.id}
                          variant={variant}
                        />
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-neutral-400">No event suggestions</p>
                )}
              </div>

              {/* Users preview */}
              <div>
                <h3 className="font-semibold mb-2">Users</h3>
                {suggestionData.users.data.length ? (
                  <ul className="flex flex-col gap-3">
                    {suggestionData.users.data.map(
                      (user: { [key: string]: any }) => (
                        <RecentSearchCard
                          item={user}
                          type={'user'}
                          key={user.id}
                          variant={variant}
                        />
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-neutral-400">No user suggestions</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTS (after Enter) */}
      {committed && (
        <div
          className="flex-1 overflow-y-auto px-4 no-scrollbar pb-15"
          ref={scrollRef}
          // Ensure the container can actually scroll (tweak as needed or replace with a Tailwind class)
          style={{ maxHeight: 'calc(100dvh - 200px)' }}
        >
          {resultsLoading && users.length === 0 && events.length === 0 ? (
            <SearchResultsSkeleton count={4} />
          ) : searchType === 'USER' ? (
            users.length ? (
              <ul className="flex flex-col gap-4">
                {users.map((user) => (
                  <RecentSearchCard
                    item={user}
                    type={'user'}
                    key={user.id}
                    variant={variant}
                  />
                ))}
                {resultsLoading && (
                  <div className="flex justify-center py-4">
                    <Loader className="h-8 w-8" />
                  </div>
                )}
                {/* Sentinel to trigger next page */}
                <div ref={sentinelRef} className="h-1" aria-hidden />
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
              {events.map((event) => (
                <RecentSearchCard
                  item={event}
                  type={'event'}
                  key={event.id}
                  variant={variant}
                />
              ))}
              {resultsLoading && (
                <div className="flex justify-center py-4">
                  <Loader className="h-8 w-8" />
                </div>
              )}
              {/* Sentinel to trigger next page */}
              <div ref={sentinelRef} className="h-1" aria-hidden />
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
  );
};
