import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function ScreenShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full min-h-[100dvh] bg-background text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MobileHeaderSkeleton({
  withSearch = false,
  centeredTitle = false,
}: {
  withSearch?: boolean;
  centeredTitle?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className={cn("space-y-2", centeredTitle ? "flex-1" : "w-44")}>
          <Skeleton className={cn("h-4 rounded-full", centeredTitle ? "mx-auto w-32" : "w-24")} />
          {!centeredTitle ? <Skeleton className="h-3 w-36 rounded-full" /> : null}
        </div>
        <Skeleton className="ml-auto h-9 w-9 rounded-full" />
      </div>
      {withSearch ? (
        <div className="pt-4">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

function BottomNavSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-2.5 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-2/5 rounded-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-2/3 rounded-full" />
          <Skeleton className="h-3.5 w-3/4 rounded-full" />
          <Skeleton className="h-3.5 w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-full" />
        <Skeleton className="h-64 w-full rounded-[24px]" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm"
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-4 w-16 rounded-full" />
              <Skeleton className="ml-auto h-3 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-3/4 rounded-full" />
          <Skeleton className="h-3.5 w-2/3 rounded-full" />
          <Skeleton className="h-3.5 w-1/2 rounded-full" />
          <Skeleton className="h-3.5 w-3/5 rounded-full" />
        </div>
      </div>
      <Skeleton className="mx-auto h-2 w-[95%] rounded-full" />
      <Skeleton className="mx-auto h-2 w-[92%] rounded-full" />
    </div>
  );
}

export function UserListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function PostFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 px-4 pb-20 pt-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 px-4 pb-24 pt-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>
      <UserListSkeleton count={count} />
    </div>
  );
}

export function CommentThreadSkeleton({
  withHero = false,
  count = 5,
}: {
  withHero?: boolean;
  count?: number;
}) {
  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      {withHero ? (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card">
          <Skeleton className="h-56 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-4/5 rounded-full" />
          </div>
        </div>
      ) : null}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-4/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <ScreenShell className="pb-28">
      <div className="mx-auto max-w-7xl">
        <MobileHeaderSkeleton withSearch />
        <div className="flex gap-2 overflow-x-hidden px-4 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="space-y-8 px-4 pb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <BottomNavSkeleton />
    </ScreenShell>
  );
}

export function SearchPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-5xl">
        <MobileHeaderSkeleton withSearch />
        <SearchResultsSkeleton />
      </div>
    </ScreenShell>
  );
}

export function SettingsPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-3xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-3 px-4 py-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-44 rounded-full" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

export function SettingsDetailSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-3xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-6">
          <div className="rounded-3xl border border-border/70 bg-card p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function AuthPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto flex min-h-[100dvh] max-w-md items-center px-4 py-10">
        <div className="w-full space-y-6 rounded-[32px] border border-border/70 bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function CreateEventPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <div className="rounded-[32px] border border-border/70 bg-card p-5">
            <div className="space-y-3">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-[28px]" />
            <Skeleton className="h-40 w-full rounded-[28px]" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function WalletPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-3xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <div className="rounded-[32px] border border-border/70 bg-card p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 flex-1 rounded-2xl" />
                <Skeleton className="h-12 flex-1 rounded-2xl" />
              </div>
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

export function EventDetailPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-5xl">
        <div className="space-y-0">
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-72 w-full rounded-none" />
        </div>
        <div className="space-y-5 px-4 py-5">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="h-4 w-1/2 rounded-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-[28px]" />
            <Skeleton className="h-32 w-full rounded-[28px]" />
          </div>
          <Skeleton className="h-48 w-full rounded-[32px]" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function UserProfilePageSkeleton() {
  return (
    <ScreenShell className="pb-28">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-0">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="px-4 pb-4">
            <div className="-mt-12 flex items-end gap-4">
              <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
              <div className="flex-1 space-y-2 pb-2">
                <Skeleton className="h-6 w-36 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
      <BottomNavSkeleton />
    </ScreenShell>
  );
}

export function PlansPageSkeleton() {
  return (
    <ScreenShell className="pb-28">
      <div className="mx-auto max-w-5xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="flex gap-2 px-4 py-4">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="space-y-5 px-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <BottomNavSkeleton />
    </ScreenShell>
  );
}

export function BookingDetailsPageSkeleton() {
  return (
    <ScreenShell className="pb-24">
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-end gap-3">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-6 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                  <Skeleton className="h-32 w-full rounded-[24px]" />
                </div>
              </div>
            </div>
          ))}
          <Skeleton className="h-5 w-36 rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function OrderPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <Skeleton className="h-64 w-full rounded-[32px]" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-36 w-full rounded-[28px]" />
            <Skeleton className="h-36 w-full rounded-[28px]" />
          </div>
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function PaymentPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <div className="rounded-[32px] border border-border/70 bg-card p-5">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function PostComposerSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <div className="rounded-[32px] border border-border/70 bg-card p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-full" />
              </div>
              <Skeleton className="h-28 w-full rounded-[28px]" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full rounded-[20px]" />
                <Skeleton className="h-24 w-full rounded-[20px]" />
                <Skeleton className="h-24 w-full rounded-[20px]" />
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </ScreenShell>
  );
}

export function PostDetailPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <CommentThreadSkeleton withHero />
      </div>
    </ScreenShell>
  );
}

export function RefundHistoryPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-3 px-4 py-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
                <Skeleton className="h-3 w-1/4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

export function LocationPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-3xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-[32px]" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-3 w-48 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

export function UserEventsPageSkeleton() {
  return (
    <ScreenShell>
      <div className="mx-auto max-w-4xl">
        <MobileHeaderSkeleton centeredTitle />
        <div className="space-y-5 px-4 py-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
