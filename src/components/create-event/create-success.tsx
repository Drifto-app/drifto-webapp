import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, CheckCircle2, MapPin, Share2, Ticket } from 'lucide-react';
import { useShare } from '@/hooks/share-option';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/share-button/share-option';

type CreatedEvent = Record<string, unknown> & {
    id?: string;
    slug?: string;
    title?: string;
    description?: string;
    titleImage?: string;
    titleFileUrl?: string;
    startTime?: string | Date;
    address?: string;
    city?: string;
    state?: string;
    tickets?: Array<{ price?: string | number; quantity?: string | number }>;
};

interface CreateSuccessProps {
    event: CreatedEvent;
    onContinue: () => void;
    variant?: 'mobile' | 'desktop';
}

export const CreateEventSuccess = ({ event, onContinue, variant = 'mobile' }: CreateSuccessProps) => {
    const eventPath = `/event/${event.slug ?? event.id ?? ''}`;
    const eventUrl = event && `${typeof window !== 'undefined' ? window.location.origin : ''}${eventPath}`;
    const eventTitle = event.title ?? 'Your event';
    const eventDescription = event.description ?? '';
    const eventImage = event.titleImage || event.titleFileUrl || '/createeventpic.jpg';
    const startDate = event.startTime ? new Date(event.startTime) : null;
    const locationLabel = [event.address, event.city, event.state].filter(Boolean).join(', ');
    const ticketCount = event.tickets?.length ?? 0;
    const {
        isShareDialogOpen,
        closeShareDialog,
        handleQuickShare,
    } = useShare({
        title: eventTitle,
        url: eventUrl,
        description: eventDescription
    });

    if (variant === 'desktop') {
        return (
            <>
                <main className="min-h-screen bg-background px-[var(--desktop-gutter)] py-8 text-foreground">
                    <div className="grid min-h-[calc(100vh-64px)] items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
                        <section>
                            <div className="inline-flex items-center gap-2 rounded-full border border-green-700/20 bg-green-700/10 px-4 py-2 text-sm font-black text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
                                <CheckCircle2 size={17} />
                                Published
                            </div>

                            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight tracking-tight xl:text-6xl">
                                Your event is live.
                            </h1>
                            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-muted-foreground">
                                Share it now, review the guest-facing page, or head back to Plans to manage bookings and host activity.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button
                                    onClick={handleQuickShare}
                                    className="h-12 rounded-full px-6"
                                    type="button"
                                >
                                    <Share2 size={18} />
                                    Share event
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-12 rounded-full px-6"
                                >
                                    <Link href={eventPath}>
                                        View event
                                        <ArrowRight size={17} />
                                    </Link>
                                </Button>
                                <Button
                                    onClick={onContinue}
                                    variant="ghost"
                                    className="h-12 rounded-full px-6"
                                    type="button"
                                >
                                    Go to Plans
                                </Button>
                            </div>

                            <div className="mt-10 grid max-w-2xl gap-3 md:grid-cols-3">
                                {[
                                    {
                                        icon: <Share2 size={18} />,
                                        title: 'Share early',
                                        text: 'Start sending the event while it is fresh.',
                                    },
                                    {
                                        icon: <Ticket size={18} />,
                                        title: 'Track bookings',
                                        text: 'Plans keeps your orders and attendee activity together.',
                                    },
                                    {
                                        icon: <CheckCircle2 size={18} />,
                                        title: 'Keep it updated',
                                        text: 'Make changes before guests start arriving.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-2xl border border-border bg-card p-4 text-card-foreground"
                                    >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                                            {item.icon}
                                        </span>
                                        <p className="mt-4 font-black">{item.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="min-w-0">
                            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                                <div className="relative aspect-[16/10] bg-muted">
                                    <Image
                                        src={eventImage}
                                        alt={eventTitle}
                                        fill
                                        sizes="620px"
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-2 text-xs font-black shadow-sm backdrop-blur">
                                        Drifto event
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h2 className="line-clamp-2 text-3xl font-black capitalize tracking-tight">
                                        {eventTitle}
                                    </h2>
                                    {eventDescription && (
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                            {eventDescription}
                                        </p>
                                    )}

                                    <div className="mt-6 grid gap-3">
                                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                                            <CalendarDays className="text-blue-800 dark:text-blue-300" size={19} />
                                            <span className="text-sm font-bold">
                                                {startDate
                                                    ? startDate.toLocaleString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                    })
                                                    : 'Date not set'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                                            <MapPin className="text-blue-800 dark:text-blue-300" size={19} />
                                            <span className="line-clamp-1 text-sm font-bold capitalize">
                                                {locationLabel || 'Location not set'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                                            <Ticket className="text-blue-800 dark:text-blue-300" size={19} />
                                            <span className="text-sm font-bold">
                                                {ticketCount} {ticketCount === 1 ? 'ticket type' : 'ticket types'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <ShareDialog
                    isOpen={isShareDialogOpen}
                    onClose={closeShareDialog}
                    title={eventTitle}
                    url={eventUrl}
                    description={eventDescription}
                />
            </>
        );
    }

    return (
        <>
            <div className="w-full flex-1 flex flex-col">
                {/* Main Content */}
                <div className="px-6 pt-12">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[pop_500ms_cubic-bezier(0.22,1,0.36,1)_both]">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-[pop_500ms_cubic-bezier(0.22,1,0.36,1)_both_120ms]">
                                <Check className="w-8 h-8 text-white stroke-[3]" />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-2xl font-bold text-foreground text-center mb-12 leading-tight">
                        Your event has been created successfully
                    </h1>

                    {/* Tips Card */}
                    <div className="bg-accent/40 shadow-md rounded-lg p-6 mb-8 space-y-6 text-md">
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">
                                Engage Your Guests! The more you interact, the better the experience.
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground font-medium mb-1">
                                Spread the Word! Share your experience to attract more participants.
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground font-medium mb-1">
                                Something Came Up? If you need to make changes, let your participants know early.
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground">
                                Need urgent assistance? Contact{' '}
                                <a href="mailto:support@drifto.app" className="font-semibold text-foreground">Drifto Support</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 pb-8 space-y-3">
                    {/* Share Event Button */}
                    <Button
                        onClick={handleQuickShare}
                        className="w-full bg-background text-lg border border-border rounded-lg py-7 flex items-center justify-center gap-3 hover:bg-accent/40 transition-colors"
                    >
                        <Share2 className="w-5 h-5 text-blue-600" />
                        <span className="text-foreground font-semibold">Share Event</span>
                    </Button>

                    {/* Continue Button */}
                    <Button
                        onClick={onContinue}
                        className="w-full text-lg bg-blue-600 text-white rounded-lg py-7 font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Continue
                    </Button>
                </div>

                {/* Bottom Indicator */}
                <div className="flex justify-center pb-2">
                    <div className="w-32 h-1 bg-muted rounded-full"></div>
                </div>
            </div>

            <ShareDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                title={eventTitle}
                url={eventUrl}
                description={eventDescription}
            />
        </>
    );
};
