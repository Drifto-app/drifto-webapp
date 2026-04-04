"use client"

import * as React from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, AlertCircle } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";
import {Loader} from "@/components/ui/loader";
import {renderToStaticMarkup} from "react-dom/server";
import {RiMapPin2Fill} from "react-icons/ri";
import {CiLock} from "react-icons/ci";
import {MdLockOutline} from "react-icons/md";

// Move libraries array outside component to prevent reloading
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

interface GoogleMapComponentProps {
    center: { lat: number; lng: number };
    markerPosition: { lat: number; lng: number };
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
    eventTitle?: string;
    eventAddress?: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
    center, markerPosition, isFullscreen = false, onToggleFullscreen, eventTitle, eventAddress
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: isFullscreen ? 15 : 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        const svgString = encodeURIComponent(
            renderToStaticMarkup(<RiMapPin2Fill size={32} color="#dc2626" />)
        );

        // Initialize marker
        const marker = new google.maps.Marker({
            position: markerPosition,
            map,
            title: eventTitle || "Event Location",
            icon: {
                url: `data:image/svg+xml;charset=UTF-8,${svgString}`,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(16, 32),
            },
        });

        markerRef.current = marker;

        // Create info window
        if (eventTitle || eventAddress) {
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px; max-width: 250px;">
                        ${eventTitle ? `<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${eventTitle}</h3>` : ''}
                        ${eventAddress ? `<p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.4;">${eventAddress}</p>` : ''}
                    </div>
                `
            });

            infoWindowRef.current = infoWindow;

            // Show info window on marker click
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            // Auto-open info window after a short delay
            setTimeout(() => {
                infoWindow.open(map, marker);
            }, 500);
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        };
    }, [center, markerPosition, isFullscreen, eventTitle, eventAddress]);

    // Update marker position when prop changes
    useEffect(() => {
        if (markerRef.current && markerPosition) {
            markerRef.current.setPosition(markerPosition);
        }
    }, [markerPosition]);

    // Update map center when prop changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(center);
        }
    }, [center]);

    // Resize map when fullscreen changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                google.maps.event.trigger(mapInstanceRef.current!, 'resize');
                mapInstanceRef.current?.setCenter(center);
            }, 300);
        }
    }, [isFullscreen, center]);

    return (
        <div className="relative">
            {/* Fullscreen Toggle Button */}
            {onToggleFullscreen && (
                <Button
                    onClick={onToggleFullscreen}
                    variant="secondary"
                    size="sm"
                    className="absolute top-3 right-3 z-10 bg-background/90 hover:bg-background border border-border shadow-lg"
                >
                    {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                    ) : (
                        <Maximize className="h-4 w-4" />
                    )}
                </Button>
            )}

            <div
                ref={mapRef}
                className={`w-full h-full transition-all duration-300 ${
                    isFullscreen ? 'rounded-none' : 'rounded-lg'
                }`}
                style={{
                    minHeight: isFullscreen ? '85vh' : '50vh',
                }}
            />
        </div>
    );
};

interface SingleEventMapProps extends React.ComponentProps<"div"> {
    event: { [key: string]: any };
    googleMapsApiKey: string;
}

export const SingleEventMap = ({
   event, className, googleMapsApiKey, ...props
}: SingleEventMapProps) => {
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Load Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: "en-US",
        region: "ng",
    });

    // Handle fullscreen toggle
    const handleToggleFullscreen = useCallback(() => {
        setIsMapFullscreen(prev => !prev);

        // Prevent body scroll when map is fullscreen on mobile
        if (!isMapFullscreen && isMobile) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
        } else if (isMobile) {
            document.body.style.overflow = '';
            document.documentElement.style.height = '';
            document.body.style.height = '';
        }
    }, [isMapFullscreen, isMobile]);

    // Clean up body scroll when component unmounts
    useEffect(() => {
        return () => {
            if (isMobile) {
                document.body.style.overflow = '';
                document.documentElement.style.height = '';
                document.body.style.height = '';
            }
        };
    }, [isMobile]);

    // Extract location data from events
    const latitude = event?.data?.location?.latitude || event?.location?.latitude || 6.5244;
    const longitude = event?.data?.location?.longitude || event?.location?.longitude || 3.3792;
    const eventTitle = event?.data?.title || event?.title || '';
    const eventAddress = event?.data?.address || event?.address || '';

    const mapCenter = { lat: latitude, lng: longitude };
    const markerPosition = { lat: latitude, lng: longitude };

    if(event.locationSecure && !event.location) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex items-start",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                <div className="flex gap-2 w-full bg-background px-4 py-4 items-center">
                    <MdLockOutline size={25} />
                    <p className="font-semibold text-md">
                        Address shared after ticket purchase.
                    </p>
                </div>
            </div>
        );
    }

    // Handle loading error
    if (loadError) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex items-center justify-center",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Failed to load maps</p>
                    <p className="text-sm text-gray-600 mt-2">Please check your internet connection and try again</p>
                </div>
            </div>
        );
    }

    // Handle loading state
    if (!isLoaded) {
        return (
            <div
                className={cn(
                    "w-full min-h-[85vh] flex items-center justify-center",
                    className,
                    event.eventTheme !== null ? "" : "bg-muted/40",
                )}
                {...props}
            >
               <Loader />
            </div>
        );
    }

    // Render fullscreen overlay when map is fullscreen
    if (isMapFullscreen) {
        return (
            <div className="z-[9999]">
                 {/*Fullscreen Header*/}
                {/*<div className="absolute bottom-0 left-0 right-0 z-[10000] bg-background/95 backdrop-blur-sm border-b border-border p-4">*/}
                {/*    <div className="flex items-center justify-between">*/}
                {/*        <div className="flex items-center gap-3">*/}
                {/*            <MapPin className="h-5 w-5 text-red-600" />*/}
                {/*            <div>*/}
                {/*                <h3 className="text-lg font-semibold text-gray-900">{eventTitle || 'Event Location'}</h3>*/}
                {/*                {eventAddress && (*/}
                {/*                    <p className="text-sm text-gray-600 max-w-md truncate">{eventAddress}</p>*/}
                {/*                )}*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <Button*/}
                {/*            onClick={handleToggleFullscreen}*/}
                {/*            variant="outline"*/}
                {/*            size="sm"*/}
                {/*            className="flex-shrink-0"*/}
                {/*        >*/}
                {/*            <Minimize className="h-4 w-4" />*/}
                {/*        </Button>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Fullscreen Map */}
                <div className="h-[85vh]">
                    <GoogleMapComponent
                        center={mapCenter}
                        markerPosition={markerPosition}
                        isFullscreen={true}
                        onToggleFullscreen={handleToggleFullscreen}
                        eventTitle={eventTitle}
                        eventAddress={eventAddress}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full min-h-[87vh] relative flex justify-center",
                className,
                event.eventTheme !== null ? "" : "bg-muted/40",
            )}
            {...props}
        >
            <div className="w-full px-4 pt-4">
                <GoogleMapComponent
                    center={mapCenter}
                    markerPosition={markerPosition}
                    isFullscreen={false}
                    onToggleFullscreen={handleToggleFullscreen}
                    eventTitle={eventTitle}
                    eventAddress={eventAddress}
                />
            </div>
        </div>
    );
};