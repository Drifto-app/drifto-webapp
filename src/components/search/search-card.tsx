'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import { useRecentSearchStore } from '@/store/recent-search-store';
import { IoClose } from 'react-icons/io5';
import { ComponentProps } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserVerificationBadge } from '@/components/ui/user-placeholder';
import defaultImage from '@/assests/default.jpeg';
import { DESKTOP_ROUTES } from '@/lib/routes';

interface RecentSearchCardProps extends React.ComponentProps<'div'> {
  item: { [key: string]: any };
  removeSearch?: (id: string) => void;
  type: 'event' | 'user';
  variant?: 'mobile' | 'desktop';
}

interface SuggestionEventCardProp extends ComponentProps<'div'> {
  event: { [key: string]: any };
  variant?: 'mobile' | 'desktop';
}

export const RecentSearchCard = ({
  item,
  type,
  removeSearch,
  variant = 'mobile',
  className,
  ...props
}: RecentSearchCardProps) => {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { addSearch } = useRecentSearchStore();

  const onClick = () => {
    const prev = pathname + '?' + searchParams;

    addSearch(item, type);
    if (type === 'user') {
      const path =
        variant === 'desktop'
          ? DESKTOP_ROUTES.userDetail(item.id)
          : `/m/user/${item.id}`;
      router.push(`${path}?prev=${encodeURIComponent(prev)}`);
    } else {
      const path =
        variant === 'desktop'
          ? DESKTOP_ROUTES.eventDetail(item.id)
          : `/m/events/${item.id}`;
      router.push(`${path}?prev=${encodeURIComponent(prev)}`);
    }
  };

  if (type === 'event') {
    const date = new Date(item.startTime);
    const formatedDate = date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const formattedTime = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    if (isDesktop) {
      return (
        <article
          className={cn(
            'group flex min-w-0 cursor-pointer gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/40 hover:shadow-md',
            className,
          )}
          onClick={onClick}
          {...props}
        >
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image
              src={item.eventTitleImage || item.titleImage || defaultImage}
              alt={item.title ?? 'Event'}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1 py-1">
            <p className="line-clamp-2 text-base font-black capitalize text-foreground">
              {item.title}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="font-semibold capitalize">Event</span>
              <span>{formatedDate}</span>
              <span>{formattedTime}</span>
            </div>
          </div>
          {removeSearch ? (
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                removeSearch(item.id);
              }}
              aria-label="Remove recent search"
            >
              <IoClose size={16} />
            </button>
          ) : null}
        </article>
      );
    }

    return (
      <div
        className={cn(
          'flex flex-row items-center px-2 justify-between',
          className,
        )}
        {...props}
      >
        <div className="w-full flex gap-3 items-center" onClick={onClick}>
          <div className="relative w-14 h-14 rounded-full flex items-center justify-center">
            <AspectRatio ratio={1}>
              <Image
                src={item.eventTitleImage || defaultImage}
                alt={item.title ?? 'Title'}
                fill
                className="object-cover rounded-md"
              />
            </AspectRatio>
          </div>
          <div className="w-full max-w-[70%] flex flex-col">
            <p className="w-full capitalize text-foreground text-sm font-bold line-clamp-2">
              {item.title}
            </p>
            <ul className="text-neutral-400 text-sm capitalize flex list-disc gap-5 font-medium truncate">
              <li className="first:list-none">{type}</li>
              <li>{formatedDate}</li>
              <li>{formattedTime}</li>
            </ul>
          </div>
        </div>
        {removeSearch ? (
          <div className="p-2" onClick={() => removeSearch(item.id)}>
            <IoClose size={16} className="text-neutral-400" />
          </div>
        ) : null}
      </div>
    );
  }

  if (isDesktop) {
    return (
      <article
        className={cn(
          'group flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/40 hover:shadow-md',
          className,
        )}
        onClick={onClick}
        {...props}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src={item.profileImage || defaultImage}
            alt={item.username || 'User'}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-base font-black text-foreground">
              {item.username}
            </p>
            <UserVerificationBadge user={item} />
          </div>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            User profile
          </p>
        </div>
        {removeSearch ? (
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              removeSearch(item.id);
            }}
            aria-label="Remove recent search"
          >
            <IoClose size={16} />
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-row items-center px-2 justify-between cursor-pointer',
        className,
      )}
      {...props}
    >
      <div className="w-full flex gap-3 items-center" onClick={onClick}>
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          onClick={onClick}
        >
          <AspectRatio ratio={1}>
            <Image
              src={item.profileImage || defaultImage}
              alt={item.username}
              fill
              className="object-cover rounded-full"
            />
          </AspectRatio>
        </div>
        <div className="w-full  max-w-[70%] flex flex-col" onClick={onClick}>
          <div className="flex gap-2 items-center">
            <p className="text-foreground text-sm font-bold truncate">
              {item.username}
            </p>
            <UserVerificationBadge user={item} />
          </div>
          <p className="text-sm capitalize text-neutral-400">{type}</p>
        </div>
      </div>
      {removeSearch ? (
        <div className="p-2" onClick={() => removeSearch(item.id)}>
          <IoClose size={16} className="text-neutral-400" />
        </div>
      ) : null}
    </div>
  );
};

export const SuggestionEventCard = ({
  event,
  variant = 'mobile',
  className,
  ...props
}: SuggestionEventCardProp) => {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (variant === 'desktop') {
    return (
      <article
        className={cn(
          'group w-64 cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/40 hover:shadow-md',
          className,
        )}
        {...props}
        onClick={() => {
          const path = DESKTOP_ROUTES.eventDetail(event.id);
          router.push(
            `${path}?prev=${encodeURIComponent(pathname + '?' + searchParams)}`,
          );
        }}
      >
        <div className="relative bg-muted">
          <AspectRatio ratio={4 / 3}>
            <Image
              src={event.titleImage || event.eventTitleImage || defaultImage}
              alt={event.title || 'Event'}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </AspectRatio>
          {event.original && (
            <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Original
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="line-clamp-2 text-sm font-black capitalize leading-5">
            {event.title}
          </p>
        </div>
      </article>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-start px-2 gap-2', className)}
      {...props}
      onClick={() => {
        const path = `/m/events/${event.id}`;
        router.push(
          `${path}?prev=${encodeURIComponent(pathname + '?' + searchParams)}`,
        );
      }}
    >
      <div className="relative w-50 flex rounded-md items-center justify-center">
        <AspectRatio ratio={4 / 3}>
          <Image
            src={event.titleImage}
            alt={event.title}
            fill
            className="object-cover rounded-md"
          />
        </AspectRatio>
        {event.original && (
          <div className="absolute top-2 left-2 rounded-full bg-background px-2 py-[2px] shadow-md text-foreground">
            <span className="text-[10px] font-semibold text-muted-foreground leading-0">
              Drifto Original
            </span>
          </div>
        )}
      </div>
      <div className="w-50 font-bold capitalize line-clamp-2 leading-tight">
        {event.title}
      </div>
    </div>
  );
};
