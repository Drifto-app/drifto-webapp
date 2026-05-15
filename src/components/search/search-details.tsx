'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { IoClose, IoOptionsOutline, IoSearchSharp } from 'react-icons/io5';
import { SearchSuggestion } from '@/components/search/search-suggestion';
import { useState } from 'react';
import { SearchComponent } from '@/components/search/search-component';
import { AdvanceSearch } from '@/components/search/advance-search';
import { Button } from '@/components/ui/button';

interface SearchDetailsProps extends React.ComponentProps<'div'> {
  prev: string | null;
  variant?: 'mobile' | 'desktop';
}

export type ActiveScreenType = 'suggestion' | 'search' | 'advance-search';

export const SearchDetails = ({
  prev,
  variant = 'mobile',
  className,
  ...props
}: SearchDetailsProps) => {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const [activeScreen, setActiveScreen] =
    useState<ActiveScreenType>('suggestion');
  const [searchText, setSearchText] = useState<string>('');
  const [committed, setCommitted] = useState(false);

  // toggled when user hits Enter, to tell the child to “commit” the search
  const [commitToken, setCommitToken] = useState<number>(0);

  const handleSearchChange = (value: string) => {
    setSearchText(value);

    if (value.trim()) {
      setActiveScreen('search');
    } else {
      setActiveScreen('suggestion');
      setCommitted(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      // fire a new token so the child can react in useEffect
      setCommitToken(Date.now());
      setCommitted(true);
    }
  };

  const handleBackClick = () => {
    router.push(prev ?? '/');
  };

  if (activeScreen === 'advance-search') {
    return (
      <AdvanceSearch setActiveScreen={setActiveScreen} variant={variant} />
    );
  }

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
                  aria-label="Go back"
                >
                  <FaArrowLeft size={16} />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    Discover
                  </p>
                  <h1 className="truncate text-3xl font-black tracking-tight">
                    Search Drifto
                  </h1>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setActiveScreen('advance-search')}
              >
                <IoOptionsOutline size={18} />
                Advanced filters
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-sm transition focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-800/10">
                <IoSearchSharp
                  size={24}
                  className="shrink-0 text-muted-foreground"
                />
                <Input
                  name="search"
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  className="h-full min-w-0 flex-1 border-none bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                  placeholder="Search events, creators, hosts, and communities"
                  aria-label="Search"
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {searchText ? (
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    onClick={() => handleSearchChange('')}
                    aria-label="Clear search"
                  >
                    <IoClose size={18} />
                  </button>
                ) : null}
              </div>
              <Button
                type="button"
                className="h-14 rounded-2xl bg-blue-800 px-7 hover:bg-blue-800"
                disabled={!searchText.trim()}
                onClick={() => {
                  if (!searchText.trim()) return;
                  setCommitToken(Date.now());
                  setCommitted(true);
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </header>

        <main className="desktop-page-container py-8">
          {activeScreen === 'search' ? (
            <SearchComponent
              searchText={searchText}
              commitToken={commitToken}
              committed={committed}
              variant={variant}
            />
          ) : (
            <SearchSuggestion variant={variant} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full flex flex-col min-h-[100dvh]',
        isDesktop && 'bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'w-full border-b border-border flex flex-col gap-6 justify-center pt-6 pb-4 flex-shrink-0',
          isDesktop &&
            'sticky top-0 z-40 bg-background/90 px-[var(--desktop-gutter)] backdrop-blur',
        )}
      >
        <div
          className={cn('flex flex-row items-center px-8', isDesktop && 'px-0')}
        >
          <FaArrowLeft
            size={20}
            onClick={handleBackClick}
            className="cursor-pointer hover:text-muted-foreground transition-colors"
            aria-label="Go back"
            role="button"
            tabIndex={0}
          />
          <p
            className={cn(
              'font-semibold text-foreground text-md w-full capitalize truncate ml-4',
              isDesktop ? 'text-left text-2xl font-black' : 'text-center',
            )}
          >
            Search
          </p>
        </div>

        <div
          className={cn(
            'flex flex-row items-center px-4 gap-3',
            isDesktop && 'max-w-4xl px-0',
          )}
        >
          <div className="w-full flex items-center rounded-full border-1 border-neutral-400 px-4 h-12">
            <div className="flex items-center w-full h-full">
              <IoSearchSharp size={30} className="text-neutral-400" />
              <Input
                name="search"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                className="w-full h-full outline-none border-none shadow-none placeholder:text-neutral-400 placeholder:font-semibold text-base"
                placeholder="Search"
                aria-label="Search"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {searchText && (
              <div
                className="text-neutral-500"
                onClick={() => {
                  handleSearchChange('');
                }}
              >
                <IoClose size={20} />
              </div>
            )}
          </div>
          <div
            className="rounded-full p-2 border-1 border-neutral-400"
            onClick={() => setActiveScreen('advance-search')}
          >
            <IoOptionsOutline size={25} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className={cn(isDesktop && 'desktop-page-container py-6')}>
        {activeScreen === 'search' ? (
          <SearchComponent
            searchText={searchText}
            commitToken={commitToken}
            committed={committed}
            variant={variant}
          />
        ) : (
          <SearchSuggestion variant={variant} />
        )}
      </div>
    </div>
  );
};
