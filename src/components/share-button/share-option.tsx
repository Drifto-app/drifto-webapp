"use client";

import * as React from "react";
import { Dialog } from "@headlessui/react";
import { MdCancel } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaCopy, FaWhatsapp, FaLinkedin, FaTelegram } from "react-icons/fa";
import { canUseNativeShare, shareViaWeb, copyToClipboard, openSocialShare } from "@/lib/share-utils";
import {FaXTwitter} from "react-icons/fa6";
import {showTopToast} from "@/components/toast/toast-util";
import {cn} from "@/lib/utils";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
    description?: string;
}

interface ShareOption {
    name: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            title,
                                                            url,
                                                            description = "",
                                                        }) => {
    const [isNativeShareSupported, setIsNativeShareSupported] = React.useState(false);

    React.useEffect(() => {
        setIsNativeShareSupported(canUseNativeShare());
    }, []);

    const handleNativeShare = async () => {
        const ok = await shareViaWeb({
            title: title,
            text: description,
            url: url,
        });
        if (ok) onClose();
        else showTopToast("error", "Failed to share");
    };

    const handleCopyLink = async () => {
        const ok = await copyToClipboard(url);
        if (ok) {
            showTopToast("success", "Link copied to clipboard!");
            onClose();
        } else {
            showTopToast("error", "Failed to copy link");
        }
    };

    const shareOptions: ShareOption[] = [
        {
            name: "WhatsApp",
            icon: <FaWhatsapp size={24} />,
            color: "bg-green-500",
            onClick: () => {
                openSocialShare("whatsapp", title, url, `Check out this event: ${title}`);
                onClose();
            },
        },
        {
            name: "X",
            icon: <FaXTwitter size={24} />,
            color: "bg-black",
            onClick: () => {
                openSocialShare("twitter", title, url, `Check out this event: ${title}`);
                onClose();
            },
        },
        {
            name: "LinkedIn",
            icon: <FaLinkedin size={24} />,
            color: "bg-blue-700",
            onClick: () => {
                openSocialShare("linkedin", title, url);
                onClose();
            },
        },
        {
            name: "Telegram",
            icon: <FaTelegram size={24} />,
            color: "bg-cyan-500",
            onClick: () => {
                openSocialShare("telegram", title, url, `Check out this event: ${title}`);
                onClose();
            },
        },
    ];

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-99 flex items-end justify-center px-0 sm:items-center sm:px-4"
        >
            <div className="fixed inset-0 bg-black/65 backdrop-blur-[2px]" onClick={onClose} />

            <Dialog.Panel
                className="relative flex max-h-[86vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:mb-4 sm:max-w-xl sm:rounded-2xl"
            >
                <div className="flex items-center justify-between border-b border-border p-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                            <IoShareSocialOutline size={22} />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Share
                            </p>
                            <Dialog.Title className="text-xl font-black text-foreground">Share event</Dialog.Title>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                        <MdCancel size={24} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="border-b border-border bg-card/60 p-5">
                        <h3 className="mb-1 line-clamp-2 text-sm font-black capitalize text-foreground">{title}</h3>
                        <p className="break-all text-xs leading-5 text-muted-foreground">{url}</p>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                        {isNativeShareSupported && (
                            <button
                                onClick={handleNativeShare}
                                className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-3 text-left transition hover:bg-accent"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-800">
                                    <IoShareSocialOutline size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Quick share</p>
                                    <p className="text-sm text-muted-foreground">System apps</p>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={handleCopyLink}
                            className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-3 text-left transition hover:bg-accent"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-700">
                                <FaCopy size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Copy link</p>
                                <p className="text-sm text-muted-foreground">Clipboard</p>
                            </div>
                        </button>

                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={option.onClick}
                                className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-3 text-left transition hover:bg-accent"
                            >
                                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", option.color)}>
                                    <div className="text-white">{option.icon}</div>
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{option.name}</p>
                                    <p className="text-sm text-muted-foreground">Share on {option.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Share this event with friends and family</p>
                </div>
            </Dialog.Panel>
        </Dialog>
    );
};
