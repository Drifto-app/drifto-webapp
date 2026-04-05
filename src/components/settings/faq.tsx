"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {IoSearchSharp} from "react-icons/io5";

const faqs = [
    {
        id: 1,
        question: "How do I book an experience?",
        answer:
            'To book an experience, start on the home screen where you will see different categories. Scroll through and select the category you like, such as "Music." After selecting your experience, follow the onscreen instructions to complete the booking process.',
    },
    {
        id: 2,
        question: "Can I cancel my booking?",
        answer:
            'After booking, go to the Plans tab, select the experience, look down (footer), and click the "Request Refund" button. You can cancel your booking as long as its not on the event day. Cancellations on the event day are not allowed, but you may request a refund within 24 hours of the event by following the proper protocol.',
    },
    {
        id: 3,
        question: "How do I contact the host?",
        answer:
            "You can contact the host before or after your booking is confirmed. You can leave a comment in the comments section for the experience which they may see and reply, or can send a message/message request in their dms",
    },
    {
        id: 4,
        question: "What payment methods are accepted?",
        answer:
            "We accept various payment methods, including credit/debit cards and mobile money. All payments are securely processed.",
    },
    {
        id: 5,
        question: "Is my personal information safe?",
        answer:
            "Yes, we prioritize your privacy and use secure servers and encryption to protect your data.",
    },
    {
        id: 6,
        question: "How do I become verified a host?",
        answer:
            "To become a verified host, first sign up for a Drifto account and start hosting experiences. As you build trust and maintain a great track record, you can request verification by emailing us, or we may verify you automatically based on your performance.",
    },
    {
        id: 7,
        question: "What is Drifto?",
        answer:
            "Drifto is a platform that connects you with unique and memorable experiences. Explore, book, and share activities to make the most out of every moment. On drifto hosts can also earn money by creating and hosting experiences for others.",
    },
    {
        id: 8,
        question: "How can I manage my bookings?",
        answer:
            "You can view or cancel your bookings and events (for hosts) directly in the app under the  Plans Tab section.",
    },
    {
        id: 9,
        question: "What should I do if I forget my password?",
        answer: 'Use the "Forgot Password" option on the login screen to reset your password.',
    },
    {
        id: 10,
        question: "How does Drifto verify hosts?",
        answer:
            "Hosts on Drifto receive a verification badge after reaching certain milestones, such as successfully hosting multiple events, maintaining good reviews, and building trust within the community. Verification shows that a host is reliable and recognized on the platform.",
    },
    {
        id: 11,
        question: "What safety measures does Drifto have in place?",
        answer:
            "We implement host verification, secure payments, and user reviews and comments to ensure safety.",
    },
    {
        id: 12,
        question: "What happens if the host cancels my booking?",
        answer:
            "If a host cancels your booking, you will be notified, and a refund or rebooking option will be provided.",
    },
    {
        id: 13,
        question: "Will our policies change?",
        answer:
            "Our policies may change over time. We encourage you to review them regularly for updates.",
    },
    {
        id: 14,
        question: "Do you collect information without my permission?",
        answer:
            "No, we only collect the information you choose to provide or that is necessary to deliver our services. We never collect personal data without your consent.",
    },
    {
        id: 15,
        question: "What happens if I turn off extra security for my event?",
        answer:
            "If you turn off extra security, your event details such as location will be visible to all users browsing Drifto. Anyone can see it without needing to purchase a ticket first.",
    },
    {
        id: 16,
        question: "What happens when you turn on extra security for your event?",
        answer:
            "When you enable extra security, the event location will remain hidden from other users until they purchase a ticket.",
    },
    {
        id: 17,
        question: 'What happens when you turn off "Make event public"?',
        answer:
            "When you turn off this option, your event will not appear in searches or be visible to other users. Only people with a direct link or invite can access it.",
    },
    {
        id: 18,
        question: "How do I get verified as a User?",
        answer:
            "Users can be verified if they are recognized community members, event influencers, or referred by trusted partners. Verification helps others trust your reviews and activity on Drifto.",
    },
    {
        id: 19,
        question: "How do Organisations get verified?",
        answer:
            "Organisations that host multiple events or are recognized brands can request verification. You may also receive verification automatically if Drifto confirms your brand identity.",
    },
    {
        id: 20,
        question: "What do verification badges mean?",
        answer:
            "Verification badges appear on profiles and events. Blue = Verified User, Gold = Verified Host, Black = Verified Organisation. They show credibility and recognition within the community.",
    },
    {
        id: 21,
        question: "How do I find people who have booked my event?",
        answer:
            'Select the event you created. Above the event cover picture, there is a search view with the text "Find people who booked". Click on it and you will be taken to the Ticket Sales screen, where you can scan QR codes of tickets from your phone or mark tickets as used manually.',
    },
];

export const FaqPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <FaqContent prev={prev} />
            </ScreenProvider>
        </ProtectedRoute>
    );
};

interface FaqContentProps extends React.ComponentProps<"div"> {
    prev: string | null;
}

export const FaqContent = ({ prev, className, ...props }: FaqContentProps) => {
    const router = useRouter();
    const [query, setQuery] = React.useState("");

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const filteredFaqs = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return faqs;
        return faqs.filter((f) =>
            f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        );
    }, [query]);

    return (
        <div className={cn("w-full min-h-[100dvh] flex flex-col", className)} {...props}>
            {/* Header */}
            <div className="w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0">
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
                        FAQs
                    </p>
                    <div className="w-5" />
                </div>
            </div>

            {/* Search */}
            <div className="w-full px-6 py-5">
                <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-full">
                    <IoSearchSharp size={25} className="text-neutral-500" />
                    <Input
                        placeholder="Search FAQs"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-none shadow-none p-0"
                    />
                </div>
            </div>

            {/* Accordion List */}
            <div className="w-full flex-1 flex flex-col px-4 pb-8">
                <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((item) => (
                        <AccordionItem key={item.id} value={`faq-${item.id}`} className="border-b border-border">
                            <AccordionTrigger className="text-left text-[16px] font-medium py-5 px-1 hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[14px] text-muted-foreground px-1 pb-5 whitespace-pre-line">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}

                    {filteredFaqs.length === 0 && (
                        <div className="text-sm text-neutral-500 py-8 text-center">No results. Try different keywords.</div>)
                    }
                </Accordion>
            </div>
        </div>
    );
};
