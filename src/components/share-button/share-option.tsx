"use client";

import * as React from "react";
import { Dialog } from "@headlessui/react";
import { MdCancel } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaCopy, FaWhatsapp, FaLinkedin, FaTelegram } from "react-icons/fa";
import { canUseNativeShare, shareViaWeb, copyToClipboard, openSocialShare } from "@/lib/share-utils";
import {FaXTwitter} from "react-icons/fa6";
import {showTopToast} from "@/components/toast/toast-util";

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
            className="fixed inset-0 z-99 flex items-center sm:items-center justify-center"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black opacity-70" onClick={onClose} />

            {/* Panel */}
            <Dialog.Panel
                className="relative bg-background w-full max-w-md mx-4 mb-0 sm:mb-4
               rounded-t-2xl sm:rounded-2xl shadow-xl
               max-h-[80vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <IoShareSocialOutline size={24} className="text-muted-foreground" />
                        <Dialog.Title className="text-lg font-semibold text-gray-900">Share Event</Dialog.Title>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                        <MdCancel size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {/* Event Preview */}
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 capitalize">{title}</h3>
                        <p className="text-xs text-gray-500 break-all">{url}</p>
                    </div>

                    {/* Share Options */}
                    <div className="p-4 space-y-3">
                        {isNativeShareSupported && (
                            <button
                                onClick={handleNativeShare}
                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-accent/40 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <IoShareSocialOutline size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Quick Share</p>
                                    <p className="text-sm text-gray-500">Share via system apps</p>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-accent/40 transition-colors"
                        >
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                <FaCopy size={20} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Copy Link</p>
                                <p className="text-sm text-gray-500">Copy to clipboard</p>
                            </div>
                        </button>

                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={option.onClick}
                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-accent/40 transition-colors"
                            >
                                <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center`}>
                                    <div className="text-white">{option.icon}</div>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">{option.name}</p>
                                    <p className="text-sm text-gray-500">Share on {option.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">Share this event with friends and family</p>
                </div>
            </Dialog.Panel>
        </Dialog>
    );
};
