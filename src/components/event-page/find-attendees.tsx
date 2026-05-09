/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, QrCode, CheckCircle } from "lucide-react";
import { CgMoreO } from "react-icons/cg";
import { authApi } from "@/lib/axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Loader, LoaderSmall } from "@/components/ui/loader";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import QrScannerDialog from "@/components/event-page/qrcode-dialog";
import { showTopToast } from "@/components/toast/toast-util";
import defaultImage from "@/assests/default.jpeg";
import { UserVerificationBadge } from "@/components/ui/user-placeholder";

interface FindAttendeesProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    variant?: "mobile" | "desktop";
}

export const FindAttendees = ({
    event, variant = "mobile", className, ...props
}: FindAttendeesProps) => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<{ [key: string]: any } | null>(null);
    const [markingUsed, setMarkingUsed] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // API function to fetch tickets
    const fetchTickets = async (pageNum: number, search: string = "") => {
        setLoading(true);

        try {
            const params: { [key: string]: string | number } = {
                pageSize: 20,
                dir: "desc",
                pageNumber: pageNum.toString(),
                ...(search.trim() && { search: search.trim() })
            };

            const response = await authApi.get(`/userTicket/event/${event.id}`, { params });

            const pageData = response.data.data;
            const data = pageData.data || [];

            setLoading(false);
            setTotalTickets(pageData.totalElements || 0);
            setHasMore(pageData.isLast === false);

            return {
                tickets: data,
                isLast: pageData.isLast,
                totalElements: pageData.totalElements || 0,
            };
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
            // Return empty array on error
            return {
                tickets: [],
                isLast: true,
                totalElements: 0,
            };
        }
    };

    // Initial load
    useEffect(() => {
        loadInitialTickets();
    }, []);

    // Search effect
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery !== "") {
                handleSearch();
            } else {
                loadInitialTickets();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const loadInitialTickets = async () => {
        const initialPage = await fetchTickets(1);
        setTickets(initialPage.tickets);
        setTotalTickets(initialPage.totalElements);
        setPage(2);
        setHasMore(initialPage.isLast === false);
    };

    const handleSearch = async () => {
        const searchResults = await fetchTickets(1, searchQuery);
        setTickets(searchResults.tickets);
        setTotalTickets(searchResults.totalElements);
        setPage(2);
        setHasMore(searchResults.isLast === false);
    };

    const loadMoreTickets = async () => {
        if (loading || !hasMore) return;

        const nextPage = await fetchTickets(page, searchQuery);
        setTickets(prev => [...prev, ...nextPage.tickets]);
        setTotalTickets(nextPage.totalElements);
        setHasMore(nextPage.isLast === false);
        setPage(prev => prev + 1);
    };

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMoreTickets();
        }
    }, [loading, hasMore, page, searchQuery]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleToggleExpand = (ticketId: string) => {
        setExpandedTicketId(prev => prev === ticketId ? null : ticketId);
    };

    const handleViewDetails = (ticket: { [key: string]: any }) => {
        setSelectedTicket(ticket);
        setExpandedTicketId(null);
        setDrawerOpen(true);
    };

    const handleMarkAsUsed = (ticket: { [key: string]: any }) => {
        setSelectedTicket(ticket);
        setExpandedTicketId(null);
        confirmMarkAsUsed(ticket);
    };

    const confirmMarkAsUsed = async (ticket?: { [key: string]: any }) => {
        const ticketToMark = ticket || selectedTicket;
        if (!ticketToMark) return;

        setMarkingUsed(true);

        try {
            // API call to mark ticket as used
            const response = await authApi.post(`/userTicket/mark/${ticketToMark.ticketReference}`);

            if (response.data.success) {
                // Update the ticket in the list
                setTickets(prev => prev.map(t =>
                    t.id === ticketToMark.id
                        ? { ...t, markedUsed: true }
                        : t
                ));
                // Update selected ticket if in drawer
                if (selectedTicket?.id === ticketToMark.id) {
                    setSelectedTicket({ ...ticketToMark, markedUsed: true });
                }
                showTopToast("success", "Ticket marked as used");
            } else {
                showTopToast("error", response.data.description);
            }
        } catch (error) {
            showTopToast("error", 'Failed to mark ticket as used. Please try again.')
        }

        setMarkingUsed(false);
    };

    if (variant === "desktop") {
        const usedCount = tickets.filter((ticket) => ticket.markedUsed).length;

        return (
            <div className={cn("w-full", className)} {...props}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                    Check-in desk
                                </p>
                                <h2 className="mt-1 text-2xl font-black">Attendees and tickets</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Search guests, inspect ticket references, and mark admissions as used from one desktop view.
                                </p>
                            </div>
                            <Button
                                onClick={() => setScannerOpen(true)}
                                className="h-11 rounded-full"
                            >
                                <QrCode className="h-4 w-4" />
                                Scan ticket
                            </Button>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {searchQuery.trim() ? "Matches" : "Total tickets"}
                                </p>
                                <p className="mt-2 text-3xl font-black">{totalTickets}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Checked in</p>
                                <p className="mt-2 text-3xl font-black text-green-700 dark:text-green-300">{usedCount}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Remaining</p>
                                <p className="mt-2 text-3xl font-black">{Math.max(totalTickets - usedCount, 0)}</p>
                            </div>
                        </div>

                        <div className="relative mt-6">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search username, email, or ticket reference"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 rounded-full bg-background pl-11"
                            />
                        </div>

                        <div
                            ref={scrollRef}
                            className="mt-5 max-h-[620px] overflow-y-auto rounded-2xl border border-border"
                        >
                            <div className="grid grid-cols-[minmax(220px,1.2fr)_minmax(140px,0.8fr)_minmax(180px,1fr)_120px] border-b border-border bg-muted/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                                <span>Guest</span>
                                <span>Ticket</span>
                                <span>Reference</span>
                                <span className="text-right">Status</span>
                            </div>

                            {tickets.length === 0 && !loading ? (
                                <div className="flex min-h-56 items-center justify-center p-8 text-center text-muted-foreground">
                                    {searchQuery ? "No matching tickets found." : "No tickets have been booked yet."}
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        type="button"
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={cn(
                                            "grid w-full grid-cols-[minmax(220px,1.2fr)_minmax(140px,0.8fr)_minmax(180px,1fr)_120px] items-center gap-4 border-b border-border px-4 py-4 text-left transition last:border-b-0 hover:bg-accent/60",
                                            selectedTicket?.id === ticket.id && "bg-blue-800/5",
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
                                                <Image
                                                    src={ticket.userPlaceHolderResponse?.profileImageUrl || defaultImage}
                                                    alt={ticket.userPlaceHolderResponse?.username || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="flex items-center gap-1 font-black">
                                                    <span className="truncate">{ticket.userPlaceHolderResponse?.username ?? "Guest"}</span>
                                                    <UserVerificationBadge user={ticket.userPlaceHolderResponse} />
                                                </span>
                                                <span className="block truncate text-sm text-muted-foreground">
                                                    {ticket.userPlaceHolderResponse?.email ?? "No email"}
                                                </span>
                                            </span>
                                        </span>
                                        <span className="truncate text-sm font-bold">{ticket.ticketName}</span>
                                        <span className="truncate text-sm font-mono text-muted-foreground">{ticket.ticketReference}</span>
                                        <span className="text-right">
                                            {ticket.markedUsed ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-700/10 px-3 py-1 text-xs font-black text-green-700 dark:text-green-300">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Used
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-blue-800/10 px-3 py-1 text-xs font-black text-blue-800 dark:text-blue-300">
                                                    Valid
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))
                            )}

                            {loading && (
                                <div className="flex justify-center py-5">
                                    <Loader />
                                </div>
                            )}

                            {!hasMore && tickets.length > 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    No more tickets to load
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="h-fit rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                            Ticket details
                        </p>
                        {selectedTicket ? (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted">
                                        <Image
                                            src={selectedTicket.userPlaceHolderResponse?.profileImageUrl || defaultImage}
                                            alt={selectedTicket.userPlaceHolderResponse?.username || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-black">{selectedTicket.userPlaceHolderResponse?.username}</p>
                                        <p className="truncate text-sm text-muted-foreground">{selectedTicket.userPlaceHolderResponse?.email}</p>
                                    </div>
                                </div>
                                {[
                                    ["Ticket", selectedTicket.ticketName],
                                    ["Reference", selectedTicket.ticketReference],
                                    ["Status", selectedTicket.markedUsed ? "Already used" : "Valid for entry"],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl border border-border bg-background p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                                        <p className="mt-1 break-words text-sm font-bold">{value}</p>
                                    </div>
                                ))}
                                {!selectedTicket.markedUsed ? (
                                    <Button
                                        onClick={() => confirmMarkAsUsed()}
                                        disabled={markingUsed}
                                        className="h-12 w-full rounded-full"
                                    >
                                        {markingUsed ? <LoaderSmall /> : "Mark as used"}
                                    </Button>
                                ) : (
                                    <div className="rounded-xl bg-green-700/10 p-4 text-center text-sm font-black text-green-700 dark:text-green-300">
                                        Ticket already used
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                Select a ticket to inspect guest and reference details.
                            </div>
                        )}
                    </aside>
                </div>

                <QrScannerDialog
                    open={scannerOpen}
                    onOpenChange={setScannerOpen}
                    onResult={(ticketReference: string) => {
                        setTickets(tickets =>
                            tickets.map(ticket =>
                                ticket.ticketReference === ticketReference
                                    ? { ...ticket, markedUsed: true }
                                    : ticket
                            )
                        );
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={cn("w-full flex-1 px-4 ", className)}
            {...props}
        >
            <div className="w-full flex flex-col gap-4 pt-5 no-scrollbar">

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search username, email or ticket reference"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-6 rounded-full bg-muted focus:bg-background"
                    />
                </div>

                {/* Tickets List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-3 pb-20 no-scrollbar"
                >
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="flex flex-col bg-background rounded-xl border border-border overflow-hidden"
                        >
                            {/* Main Card Row */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    {/* Profile Image */}
                                    <div className="relative w-12 h-12 rounded-full flex-shrink-0">
                                        <AspectRatio ratio={1 / 1}>
                                            <Image
                                                src={ticket.userPlaceHolderResponse?.profileImageUrl || defaultImage}
                                                alt={ticket.userPlaceHolderResponse?.username || "User"}
                                                fill
                                                className="object-cover rounded-full"
                                            />
                                        </AspectRatio>
                                    </div>
                                    {/* User Info */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold text-gray-900">
                                                {ticket.userPlaceHolderResponse?.username}
                                            </span>
                                            <UserVerificationBadge user={ticket.userPlaceHolderResponse} />
                                            {ticket.markedUsed && (
                                                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {ticket.ticketName}
                                        </span>
                                    </div>
                                </div>
                                {/* More Options Button */}
                                <button
                                    onClick={() => handleToggleExpand(ticket.id)}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <CgMoreO className="w-6 h-6 text-blue-600" />
                                </button>
                            </div>

                            {/* Expandable Actions */}
                            {expandedTicketId === ticket.id && (
                                <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleViewDetails(ticket)}
                                        className="text-left text-blue-600 font-medium hover:text-blue-700 transition-colors py-1"
                                    >
                                        View Ticket Details
                                    </button>
                                    {!ticket.markedUsed && (
                                        <button
                                            onClick={() => handleMarkAsUsed(ticket)}
                                            className="text-left text-blue-600 font-medium hover:text-blue-700 transition-colors py-1"
                                        >
                                            Mark as Used
                                        </button>
                                    )}
                                    {ticket.markedUsed && (
                                        <span className="text-green-600 font-medium py-1">
                                            ✓ Already Used
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-center py-4">
                            <Loader />
                        </div>
                    )}

                    {!hasMore && tickets.length > 0 && (
                        <div className="text-center py-4 text-gray-500">
                            No more tickets to load
                        </div>
                    )}
                </div>
            </div>

            {/* Scan Ticket Button */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
                <Button
                    onClick={() => setScannerOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <QrCode className="w-4 h-4" />
                    Scan Ticket
                </Button>
                <QrScannerDialog
                    open={scannerOpen}
                    onOpenChange={setScannerOpen}
                    onResult={(ticketReference: string) => {
                        setTickets(tickets =>
                            tickets.map(ticket =>
                                ticket.ticketReference === ticketReference
                                    ? { ...ticket, markedUsed: true }
                                    : ticket
                            )
                        );
                    }}
                />
            </div>

            {/* Ticket Details Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader className="text-center">
                            <DrawerTitle>Ticket Details</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col gap-4 px-6 pb-6">
                            {/* Buyer */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Buyer:</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">
                                        {selectedTicket?.userPlaceHolderResponse?.username}
                                    </span>
                                    <UserVerificationBadge user={selectedTicket?.userPlaceHolderResponse || {}} />
                                </div>
                            </div>
                            {/* Ticket Type */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Ticket Type:</span>
                                <span className="font-medium">{selectedTicket?.ticketName}</span>
                            </div>
                            {/* Email */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-medium text-sm text-right max-w-[200px] break-all">
                                    {selectedTicket?.userPlaceHolderResponse?.email}
                                </span>
                            </div>
                            {/* Reference */}
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Reference:</span>
                                <span className="font-medium text-sm text-right max-w-[200px] break-all">
                                    {selectedTicket?.ticketReference}
                                </span>
                            </div>
                        </div>
                        <DrawerFooter className="px-6 pb-8">
                            {!selectedTicket?.markedUsed ? (
                                <Button
                                    onClick={() => confirmMarkAsUsed()}
                                    disabled={markingUsed}
                                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                                >
                                    {markingUsed ? <LoaderSmall /> : "Mark as Used"}
                                </Button>
                            ) : (
                                <div className="w-full py-4 text-center text-green-600 font-semibold bg-green-50 rounded-lg">
                                    ✓ Ticket Already Used
                                </div>
                            )}
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
