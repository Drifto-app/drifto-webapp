"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { ProtectedRoute } from "../auth/ProtectedRoutes";
import {ScreenProvider} from "@/components/screen/screen-provider";
import {FaArrowLeft} from "react-icons/fa";
import { cn } from "@/lib/utils";
import Image from "next/image";



const PLACEHOLDER_LINKS = {
    x: "https://x.com/driftoapp",
    instagram: "https://www.instagram.com/driftoapp/",
    youtube: "https://www.youtube.com/@DriftoExperience",
    linkedin: "https://www.linkedin.com/company/drifto-app/",
    drifto: process.env.NEXT_PUBLIC_WEBSITE_BASE_URL! as string,
    playstore: "https://example.com/rate-us-on-play-store",
};


export const ConnectPageContent = () => {
    const searchParams = useSearchParams();
    const prev = searchParams?.get("prev") ?? null;


    return (
        <ProtectedRoute>
            <ScreenProvider>
                <ConnectContent prev={prev} />
            </ScreenProvider>
        </ProtectedRoute>
    );
};


interface ConnectContentProps extends React.ComponentProps<"div"> {
    prev: string | null;
}


export const ConnectContent = ({ prev, className, ...props }: ConnectContentProps) => {
    const router = useRouter();


    const handleBackClick = () => {
        router.push(prev ?? "/m/settings");
    };


    const RowLink: React.FC<{ href: string; label: string } & React.ComponentProps<"a">> = ({ href, label, ...anchorProps }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" {...anchorProps}>
            <div className="w-full p-4 border border-border rounded-md bg-muted/40 cursor-pointer">
                <span className="text-base font-medium text-foreground">{label}</span>
            </div>
        </a>
    );


    return (
        <div className={cn("w-full min-h-[100dvh] flex flex-col", className)} {...props}>
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
                        Connect
                    </p>
                    <div className="w-5" />
                </div>
            </div>


            {/* Content */}
            <div className="w-full flex-1 flex flex-col py-8 px-8 gap-4">
                <RowLink href={PLACEHOLDER_LINKS.x} label="Follow us on X" />
                <RowLink href={PLACEHOLDER_LINKS.instagram} label="Follow us on Instagram" />
                <RowLink href={PLACEHOLDER_LINKS.youtube} label="Subscribe on YouTube" />
                <RowLink href={PLACEHOLDER_LINKS.linkedin} label="Connect with us on LinkedIn" />
                <RowLink href={PLACEHOLDER_LINKS.drifto} label="Explore more on Drifto" />
                {/*<RowLink href={PLACEHOLDER_LINKS.playstore} label="Rate us on Play Store" />*/}
            </div>


            <div className="w-full flex items-center justify-center border-t border-border">
                <div className="w-20 flex flex-row items-center py-4">
                    <Image
                        src={"/logo-extend.png"}
                        alt="Drifto Logo"
                        width={800}
                        height={400}
                        className="object-contain rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};