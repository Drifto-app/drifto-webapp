import React from 'react';
import { Check, Share2 } from 'lucide-react';
import {useShare} from "@/hooks/share-option";
import {Button} from "@/components/ui/button";
import {ShareDialog} from "@/components/share-button/share-option";

interface CreateSuccessProps {
    event: {[key: string]: any};
    onContinue: () => void;
}

export const CreateEventSuccess = ({ event, onContinue }: CreateSuccessProps) => {
    const eventUrl = event && `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${event.slug}`;
    const {
        isShareDialogOpen,
        closeShareDialog,
        handleQuickShare,
    } = useShare({
        title: event.title,
        url: eventUrl,
        description: event.description
    });

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
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-12 leading-tight">
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
                                <a href="mailto:support@drifto.app" className="font-semibold text-gray-900">Drifto Support</a>.
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
                        <span className="text-gray-900 font-semibold">Share Event</span>
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
                    <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
                </div>
            </div>

            <ShareDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                title={event.title}
                url={eventUrl}
                description={event.description}
            />
        </>
    );
};
