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

interface EventReferralProps extends ComponentProps<"div"> {
  event: {[key: string]: any};
}

export const EventReferral = ({
  event, className, ...props
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
