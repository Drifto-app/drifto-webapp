'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from 'react';
import { useRecentSearchStore } from '@/store/recent-search-store';
import {
  RecentSearchCard,
  SuggestionEventCard,
} from '@/components/search/search-card';
import * as React from 'react';
import { authApi } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { LoaderSmall } from '@/components/ui/loader';

interface SuggestionCategory {
  value: string | null;
  label: string;
}

interface CategoryEvents {
  events: any[];
  loading: boolean;
  error: string | null;
}

const suggestionItems: SuggestionCategory[] = [
  { value: 'music', label: 'Music & Concerts' },
  { value: 'sports', label: 'Sports' },
  { value: 'art & culture', label: 'Art & Culture' },
  { value: 'business & talks', label: 'Business & Talks' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food & drinks', label: 'Food & Drinks' },
  { value: 'learning', label: 'Learning' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'tech', label: 'Tech' },
  { value: 'gaming', label: 'Games' },
  { value: 'volunteering', label: 'Volunteering' },
];

interface SearchSuggestionProps {
  variant?: 'mobile' | 'desktop';
}

export const SearchSuggestion = ({
  variant = 'mobile',
}: SearchSuggestionProps) => {
  const { user } = useAuthStore();
  const { searches, deleteSearch } = useRecentSearchStore();
  const isDesktop = variant === 'desktop';

  const [isSearchShow, setIsSearchShow] = useState<boolean>(true);
  const [categoryEvents, setCategoryEvents] = useState<{
    [key: string]: CategoryEvents;
  }>({});

  // Initialize loading states for all categories
  useEffect(() => {
    const initialState: { [key: string]: CategoryEvents } = {};
    suggestionItems.forEach((category) => {
      if (category.value) {
        initialState[category.value] = {
          events: [],
          loading: true,
          error: null,
        };
      }
    });
    setCategoryEvents(initialState);
  }, []);

  // Fetch events for a specific category
  const fetchCategoryEvents = useCallback(
    async (category: string) => {
      try {
        const params: { [key: string]: string | number } = {
          pageSize: 15,
          pageNumber: 1,
          eventTag: category,
        };

        if (user?.city) {
          params.location = user.city;
        }

        const response = await authApi.get('/feed/event', { params });

        setCategoryEvents((prev) => ({
          ...prev,
          [category]: {
            events: response.data?.data.data || [],
            loading: false,
            error: null,
          },
        }));
      } catch {
        setCategoryEvents((prev) => ({
          ...prev,
          [category]: {
            events: [],
            loading: false,
            error: 'Failed to fetch events',
          },
        }));
      }
    },
    [user?.city],
  );

  // Fetch events for all categories on mount (non-blocking)
  useEffect(() => {
    suggestionItems.forEach((category) => {
      if (category.value) {
        // Use setTimeout to make the API calls non-blocking
        setTimeout(() => {
          fetchCategoryEvents(category.value!);
        }, 0);
      }
    });
  }, [fetchCategoryEvents]);

  const renderCategorySection = (category: SuggestionCategory) => {
    if (!category.value) return null;

    const categoryData = categoryEvents[category.value];

    if (isDesktop) {
      return (
        <section
          key={category.value}
          className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black">{category.label}</h3>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Hot picks
            </span>
          </div>

          {categoryData?.loading ? (
            <div className="flex justify-center py-8">
              <LoaderSmall />
            </div>
          ) : categoryData?.error ? (
            <div className="py-8 text-sm text-red-500">
              Failed to load {category.label.toLowerCase()} events
            </div>
          ) : categoryData?.events?.length ? (
            <div className="mt-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 pb-1">
                {categoryData.events.map((event) => (
                  <SuggestionEventCard
                    event={event}
                    key={event.id}
                    variant={variant}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No {category.label.toLowerCase()} events found
            </div>
          )}
        </section>
      );
    }

    return (
      <div key={category.value} className="flex flex-col w-full gap-3">
        <h3 className="font-semibold text-md">{category.label}</h3>

        {categoryData?.loading ? (
          <div className="flex justify-center py-4">
            <LoaderSmall />
          </div>
        ) : categoryData?.error ? (
          <div className="text-red-500 text-sm py-2">
            Failed to load {category.label.toLowerCase()} events
          </div>
        ) : (
          <div className="grid grid-row-1 gap-3">
            <div className="grid grid-rows-1 gap-3">
              <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {categoryData?.events.map((event) => (
                    <div key={event.id} className="flex-none">
                      <SuggestionEventCard event={event} variant={variant} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Show "No events" message if no events found */}
            {categoryData?.events?.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-4">
                No {category.label.toLowerCase()} events found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isDesktop) {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  History
                </p>
                <h2 className="mt-1 text-2xl font-black">Recent searches</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-sm font-bold transition hover:bg-accent"
                onClick={() => setIsSearchShow(!isSearchShow)}
              >
                {!isSearchShow ? 'Show' : 'Hide'}
              </button>
            </div>
            {isSearchShow ? (
              searches.length ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {searches.map((item) => (
                    <RecentSearchCard
                      item={item.query}
                      type={item.type}
                      key={item.id}
                      removeSearch={deleteSearch}
                      variant={variant}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No recent searches yet
                </div>
              )
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Browse
              </p>
              <h2 className="mt-1 text-2xl font-black">Hot picks</h2>
            </div>
            <div className="grid gap-5">
              {suggestionItems.map((category) =>
                renderCategorySection(category),
              )}
            </div>
          </div>
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-32 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Search tips
              </p>
              <h3 className="mt-3 text-xl font-black">Find the right moment</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Search for event names, creators, tags, or people. Advanced
                filters can narrow by date, price, location, and host status.
              </p>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 pb-15">
      <div className="flex flex-col w-full px-4 pt-3 gap-4">
        <div className="flex w-full justify-between items-center">
          <p className="font-bold text-lg">Recent Search</p>
          <p
            className="text-blue-800 font-medium cursor-pointer"
            onClick={() => setIsSearchShow(!isSearchShow)}
          >
            {!isSearchShow ? 'Show' : 'Hide'}
          </p>
        </div>
        <div className="flex flex-col w-full gap-2">
          {isSearchShow
            ? searches.map((item) => (
                <RecentSearchCard
                  item={item.query}
                  type={item.type}
                  key={item.id}
                  removeSearch={deleteSearch}
                  variant={variant}
                />
              ))
            : null}
        </div>

        <div className="flex flex-col w-full gap-6">
          <p className="font-bold text-lg">Hot Picks</p>
          {suggestionItems.map((category) => renderCategorySection(category))}
        </div>
      </div>
    </div>
  );
};
