"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { cn } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuthStore } from "@/store/auth-store";
import { AiOutlineGlobal } from "react-icons/ai";
import { LuMail } from "react-icons/lu";
import { AtSign } from "lucide-react";
import {IoSearchSharp} from "react-icons/io5";

const policies = [
    {
        id: 1,
        title: "How do I book a premium experience?",
        content:
            "Premium experiences are special, paid events hosted by experts who have unique or exclusive content to share. These experiences often offer something more valuable than regular ones. To book a premium experience, just browse through the options, select one that interests you, and follow the steps to complete your booking. These events are designed to provide an elevated experience with added value.",
    },
    {
        id: 2,
        title: "What happens if a host cancels an experience?",
        content:
            "To request a refund, submit your reason for cancellation within 24 hours of the experience's scheduled time. Providing proof strengthens your request. \n            We will review your reason and discuss it with the host via email. If the reason is deemed valid, your refund will be approved and processed. \n            If not, we will explain why the refund request was declined.",
    },
];

export const HelpSupportPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;
    const pathname = usePathname();

    return (
        <ProtectedRoute>
            <ScreenProvider>
                <HelpSupportContent prev={prev} currentPathUrl={pathname + "?" + searchParams} />
            </ScreenProvider>
        </ProtectedRoute>
    );
};

interface HelpSupportContentProps extends React.ComponentProps<"div"> {
    prev: string | null;
    currentPathUrl: string;
}

export const HelpSupportContent = ({ prev, currentPathUrl, className, ...props }: HelpSupportContentProps) => {
    const router = useRouter();
    const { user } = useAuthStore();

    // mailto link for report issue
    const email = "support@drifto.app";
    const subject = "Drifto Issue Report";
    const fromEmail = user?.email ? `\n\nUser Email: ${user.email}` : "";
    const body = `Please describe the issue you encountered.${fromEmail}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const onSearchClick = () => {
        router.push(`/m/settings/faq?prev=${encodeURIComponent(currentPathUrl)}`);
    };


    const onEmailClick = () => {
        window.location.href = `mailto:${email}`;
    };

    const onSocialClick = () => {
        router.push(`/m/settings/connect-page?prev=${encodeURIComponent(currentPathUrl)}`);
    };

    const onWebsiteClick = () => {
        const url = process.env.NEXT_PUBLIC_WEBSITE_BASE_URL!;
        window.open(url, "_blank");
    };

    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };

    const FAQRow: React.FC<{ title: string; onClick?: () => void } & React.ComponentProps<"div">> = ({ title, onClick }) => (
        <div
            className="w-full py-4 flex items-center justify-between border-b border-border cursor-pointer"
            onClick={onClick}
        >
            <span className="text-base">{title}</span>
            <span className="text-neutral-400">›</span>
        </div>
    );

    const ContactRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }>
        = ({ icon, label, onClick }) => (
        <div
            className="w-full py-3 flex items-center gap-3 cursor-pointer"
            onClick={onClick}
        >
            <div className="text-muted-foreground">{icon}</div>
            <span className="text-base">{label}</span>
        </div>
    );

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
                        Help & Support
                    </p>
                    <div className="w-5" />
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col py-6 px-4 gap-6">
                <div className="w-full">
                    <div className="flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-full" role="button" onClick={onSearchClick}>
                        <IoSearchSharp size={25} />
                        <span className="font-bold">Search</span>
                    </div>
                </div>

                <div className="w-full mt-2">
                    <h3 className="text-base font-semibold mb-2">Popular FAQs</h3>
                    <Accordion type="single" collapsible className="w-full">
                        {policies.map((p) => (
                            <AccordionItem key={p.id} value={`policy-${p.id}`} className="border-b-1 border-border">
                                <AccordionTrigger className="text-left text-[16px] font-medium py-5 px-1 hover:no-underline">
                                    {p.title}
                                </AccordionTrigger>
                                <AccordionContent className="text-[14px] text-muted-foreground px-1 pb-5 whitespace-pre-line">
                                    {p.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <div className="text-blue-800 font-semibold cursor-pointer py-2" onClick={onSearchClick}>
                        See More
                    </div>
                </div>

                <div className="w-full">
                    <h3 className="text-base font-semibold mb-2">Contact Us</h3>
                    <div className="flex flex-col">
                        <ContactRow icon={<LuMail size={20} />} label="Email" onClick={onEmailClick} />
                        <ContactRow icon={<AtSign size={20} />} label="Social" onClick={onSocialClick} />
                        <ContactRow icon={<AiOutlineGlobal size={22} />} label="Website" onClick={onWebsiteClick} />
                    </div>
                </div>

                <div className="w-full">
                    <h3 className="text-base font-semibold mb-3">Submit a Ticket</h3>
                    <a href={mailtoUrl}>
                        <Button className="w-full bg-blue-800 hover:bg-blue-800 py-7 text-base font-semibold">
                            Report an Issue
                        </Button>
                    </a>
                </div>

            </div>
        </div>
    );
};
