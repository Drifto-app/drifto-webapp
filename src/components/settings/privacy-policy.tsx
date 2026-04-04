"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

const policies = [
    {
        id: 1,
        title: "What do we use your personal information for?",
        content:
            "We use your personal information to provide a seamless booking experience, improve our services, send important updates, and comply with legal obligations.",
    },
    {
        id: 2,
        title: "How do we protect your information?",
        content:
            "We use secure servers, encryption, and access control measures to protect your personal information from unauthorized access, alteration, or disclosure.",
    },
    {
        id: 3,
        title: "Do we share your information with third parties?",
        content:
            "We may share your information with trusted third-party service providers for payment processing, analytics, and other necessary operations. We ensure all parties comply with privacy regulations.",
    },
    {
        id: 4,
        title: "Your rights regarding your data",
        content:
            "You have the right to access, update, or delete your personal data. You can contact us to exercise these rights. If you prefer not to contact us, you can also delete your data directly from the app by going to your profile → Preferences in the Settings screen → Delete Account, and then follow the necessary steps or meet the required conditions for account deletion.",
    },
    {
        id: 5,
        title: "What happens to the content you create or share?",
        content:
            "Content you create or share on Drifto, such as reviews or experience listings, may be visible to other users. You retain ownership of your content but grant us permission to use it to improve our services.",
    },
    {
        id: 6,
        title: "How do we use your location data?",
        content:
            "We use your location data to recommend experiences near you, improve navigation, and provide relevant updates. You can control location sharing through your device settings.",
    },
    {
        id: 7,
        title: "Will this policy change?",
        content:
            "We may update this policy periodically to reflect changes in our practices. We encourage you to review it regularly. Significant changes will be communicated through the app.",
    },
    {
        id: 8,
        title: "Do we collect your information without permission?",
        content:
            "No, we only collect the information you choose to provide or that is necessary to deliver our services. We never collect personal data without your consent.",
    },
    {
        id: 9,
        title: "What happens when you request extra security for your event?",
        content:
            "When you enable extra security, the event location will remain hidden from other users until they purchase a ticket.",
    },
    {
        id: 10,
        title: 'What happens when you turn off "Make event public"?',
        content:
            "When you turn off this option, your event will not appear in searches or be visible to other users who might want to attend.",
    },
    {
        id: 11,
        title: "How do we protect your payment information?",
        content:
            "Payments are processed securely through our trusted payment partners. Drifto does not store your full card details on our servers.",
    },
    {
        id: 12,
        title: "How long do we keep your data?",
        content:
            "We retain your personal information only as long as necessary to provide our services and comply with legal obligations. After this period, data is deleted or anonymized.",
    },
    {
        id: 13,
        title: "How can you contact us for privacy concerns?",
        content:
            "If you have questions about your privacy or our data practices, you can reach out via the support section in the app or email us.",
    },
];

export const PrivacyPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <PrivacyContent prev={prev} />
            </ScreenProvider>
        </ProtectedRoute>
    );
};

interface PrivacyContentProps extends React.ComponentProps<"div"> {
    prev: string | null;
}

export const PrivacyContent = ({ prev, className, ...props }: PrivacyContentProps) => {
    const router = useRouter();

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

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
                        Privacy Policies
                    </p>
                    <div className="w-5" />
                </div>
            </div>

            {/* List */}
            <div className="w-full flex-1 flex flex-col py-6 px-2 gap-2">
                <Accordion type="single" collapsible className="w-full">
                    {policies.map((p) => (
                        <AccordionItem
                            key={p.id}
                            value={`policy-${p.id}`}
                            className="border-b border-border"
                        >
                            <AccordionTrigger className="text-left text-[16px] font-medium py-5 px-2 hover:no-underline">
                                {p.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-[14px] text-muted-foreground px-2 pb-5">
                                {p.content}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="w-full py-4 flex items-center justify-center">
                <a
                    href={`${process.env.NEXT_PUBLIC_WEBSITE_BASE_URL!}/privacy-policy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline text-base"
                >
                    Privacy Policies
                </a>
            </div>
        </div>
    );
};
