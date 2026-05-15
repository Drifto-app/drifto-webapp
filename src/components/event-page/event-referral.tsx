/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentProps, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader } from '../ui/loader';
import * as React from 'react';
import { authApi } from '@/lib/axios';
import { EventReferralCard, NewEventReferralCard } from '@/components/event-page/event-referral-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserListSkeleton } from "@/components/ui/page-skeletons";
import { Handshake, Link2, TicketPercent } from 'lucide-react';

interface EventReferralProps extends ComponentProps<"div"> {
  event: {[key: string]: any};
  variant?: "mobile" | "desktop";
}

export const EventReferral = ({
  event, variant = "mobile", className, ...props
}: EventReferralProps) => {

  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferral = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await authApi.get(`/referral/event/${event.id}/info`)
      setReferrals(response.data.data.eventReferralInfo)
    } catch(error: any) {
      setError(error.response?.data?.description || "Failed to fetch event referral codes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (event?.id) {
      fetchReferral()
    }
  }, [event?.id])

  if (variant === "desktop") {
    return (
      <div className={cn("w-full", className)} {...props}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Partner tracking
                </p>
                <h2 className="mt-1 text-2xl font-black">Referral codes</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Create unique codes for promoters, ambassadors, and partners so bookings can be traced back to the right channel.
                </p>
              </div>
              <span className="rounded-full bg-blue-800/10 px-4 py-2 text-sm font-black text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                {referrals.length} active
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: "Active codes", value: referrals.length, icon: <TicketPercent size={20} /> },
                { label: "Event", value: event.title ?? "Current event", icon: <Link2 size={20} /> },
                { label: "Use case", value: "Partners", icon: <Handshake size={20} /> },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-background p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                    {item.icon}
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 truncate text-xl font-black">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-black">Active referral codes</h3>
                <NewEventReferralCard
                  eventId={event.id}
                  addReferral={(newReferral: {[key: string]: any}) => setReferrals([...referrals, newReferral])}
                />
              </div>

              {loading ? (
                <div className="grid gap-4">
                  <UserListSkeleton count={3} />
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10">
                  {error}
                </div>
              ) : referrals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                  <p className="font-black">No referral codes yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create a code to start tracking partner-driven bookings.</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {referrals.map(referral => (
                    <EventReferralCard
                      key={referral.eventReferralId}
                      referralContent={referral}
                      setReferralContent={(newReferral: {[key: string]: any}) =>
                        setReferrals(prev =>
                          [
                            ...prev.filter(r => r.eventReferralId !== newReferral.eventReferralId),
                            newReferral
                          ]
                        )
                      }
                      onDelete={(eventReferralId: string) => setReferrals((
                        referrals) => referrals.filter((r) => r.eventReferralId !== eventReferralId)
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Tracking tip</p>
            <h3 className="mt-2 text-xl font-black">Use one code per channel.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Separate codes make it easier to compare partners, posts, and private promotion links after bookings start.
            </p>
          </aside>
        </div>
      </div>
    );
  }


  return (
    <div
      className={cn(
        "w-full flex-1 bg-accent/40 py-4 px-4 flex flex-col justify-between",
        className,
      )}
      {...props}
    >
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <h2 className="font-black text-2xl">
              Referral Codes
            </h2>
            <p className="leading-tight text-neutral-500 text-medium">Create unique codes to track bookings from your partners, ambassadors, and promoters.</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <h2 className="font-black text-lg">
              Active Referral Codes
            </h2>
            {loading
              ? <div className="w-full flex flex-col gap-4">
                <UserListSkeleton count={3} />
              </div>
              : <div className="w-full flex flex-col gap-4">
                {referrals.map(referral => (
                  <EventReferralCard
                    key={referral.eventReferralId}
                    referralContent={referral}
                    setReferralContent={(newReferral: {[key: string]: any}) =>
                      setReferrals(prev =>
                        [
                          ...prev.filter(r => r.eventReferralId !== newReferral.eventReferralId),
                          newReferral
                        ]
                      )
                    }
                    onDelete={(eventReferralId: string) => setReferrals((
                      referrals) => referrals.filter((r) => r.eventReferralId !== eventReferralId)
                    )}
                  />
                ))}
              </div>
            }
          </div>
        </div>
        <NewEventReferralCard
          eventId={event.id}
          addReferral={(newReferral: {[key: string]: any}) => setReferrals([...referrals, newReferral])}
        />
      </div>
  )
}
