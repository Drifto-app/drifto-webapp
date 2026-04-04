"use client"

import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {SearchType} from "@/components/search/search-component";
import {LuFilter, LuUsers} from "react-icons/lu";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import {DateRange} from "react-day-picker";
import {DateRangeType} from "@/components/search/advance-search";
import { MdOutlineDateRange } from "react-icons/md";
import {TbCategory, TbCurrencyNaira } from "react-icons/tb";
import {useEventTags} from "@/store/event-tag-store";
import {GoTag} from "react-icons/go";
import {GrLocation} from "react-icons/gr";
import {Autocomplete, useLoadScript} from "@react-google-maps/api";
import { Input } from "../ui/input";
import {AlertCircle, Search } from "lucide-react";
import {Loader} from "@/components/ui/loader";


export const FilterTypeDialog = ({
    searchText, setSearchText
}: {
    searchText: SearchType;
    setSearchText: (text: SearchType) => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [eventType, setEventType] = useState<SearchType>(searchText)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogTrigger asChild>
                <div
                    className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border-1 border-border"
                >
                    <LuFilter size={20} />
                    <span className="capitalize text-sm leading-none">{searchText.toLowerCase() || "Type"}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0">
                <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select search type</DialogTitle>
                    <p className="text-neutral-400 text-sm font-semibold">Choose what to search for: Events or Users</p>
                </DialogHeader>
                <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-4">
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            eventType === "EVENT" ? "bg-neutral-950 text-white" : "border-neutral-400"
                            )}
                        onClick={() => {setEventType("EVENT")}}
                    >
                        Event
                    </div>
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            eventType === "USER" ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setEventType("USER")}}
                    >
                        User
                    </div>
                </div>
                <div className="w-full flex items-center justify-between px-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                        onClick={() => {
                            setSearchText(eventType)
                            setIsOpen(false)
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const FilterDateDialog = ({
    dateValue, setDateValue
}: {
    dateValue: DateRangeType | null;
    setDateValue: (value: DateRangeType) => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        dateValue ? {from: dateValue.from, to: dateValue.to} : undefined
    )


    const formatRange = (range: DateRangeType | null) => {
        if (!dateValue || !range?.from || !range?.to) return "";
        const fromMonth = range.from.toLocaleString("en-US", { month: "short" });
        const toMonth = range.to.toLocaleString("en-US", { month: "short" });

        if (fromMonth === toMonth) {
            return `${fromMonth} ${range.from.getDate()} - ${range.to.getDate()}`;
        }

        return `${fromMonth} ${range.from.getDate()} - ${toMonth} ${range.to.getDate()}`;
    };

    const title = formatRange(dateValue);

    const selectedDateRangeString = () => {
        let fromString = "";
        let toString = "";

        if(dateRange?.from) {
            fromString = dateRange.from.toLocaleString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        }

        if(dateRange?.to) {
            toString = dateRange.to.toLocaleString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        }

        return `${fromString} - ${toString}`;
    };


    const currentYear = new Date().getFullYear()
    const maxYear = currentYear + 10

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogTrigger asChild>
                <div
                    className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border-1 border-border"
                >
                    <MdOutlineDateRange size={20} />
                    <span className="capitalize text-sm leading-none whitespace-nowrap">{title || "Date"}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0">
                <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select a date</DialogTitle>
                    <p className="text-neutral-400 text-sm font-semibold">You can also select a range of dates</p>
                </DialogHeader>
                <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-4">
                    <div className="w-full text-center text-sm">
                        {selectedDateRangeString()}
                    </div>
                    <div className="border-2 border-border rounded-md p-2">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDateRange(date!)
                            }}
                            startMonth={new Date(currentYear, 0)}
                            endMonth={new Date(maxYear, 0)}
                        />
                    </div>
                </div>
                <div className="w-full flex items-center justify-between px-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                        onClick={() => {
                            setIsOpen(false)
                            setDateValue({
                                to: dateRange?.to,
                                from: dateRange?.from,
                            })
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const FilterPriceDialog = ({
    isTicketPaid, setIsTicketPaid
}: {
    isTicketPaid: boolean | null;
    setIsTicketPaid: (value: boolean | null) => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isPaid, setIsPaid] = useState<boolean | null>(isTicketPaid);

    const title = () => {
        switch (isTicketPaid) {
            case null:
                return "Price";
            case true:
                return "Premium";
            case false:
                return "Free";
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogTrigger asChild>
                <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border">
                    <TbCurrencyNaira size={20} className="flex-shrink-0" />
                    <span className="capitalize text-sm leading-none">{title()}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0">
                <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select a price</DialogTitle>
                    <p className="text-neutral-400 text-sm font-semibold">Choose from free to premium (paid events)</p>
                </DialogHeader>
                <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-4">
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isPaid === null ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsPaid(null)}}
                    >
                        All
                    </div>
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isPaid === false ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsPaid(false)}}
                    >
                        Free
                    </div>
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isPaid === true ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsPaid(true)}}
                    >
                        Premium
                    </div>
                </div>
                <div className="w-full flex items-center justify-between px-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                        onClick={() => {
                            setIsTicketPaid(isPaid)
                            setIsOpen(false)
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const FilterHostDialog = ({
    isHostVerified, setIsHostVerified,
                                  }: {
    isHostVerified: boolean | null;
    setIsHostVerified: (value: boolean | null) => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(isHostVerified);

    const title = () => {
        switch (isHostVerified) {
            case null:
                return "Host";
            case true:
                return "Verified";
            case false:
                return "Not Verified";
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogTrigger asChild>
                <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border">
                    <LuUsers size={20} className="flex-shrink-0" />
                    <span className="capitalize text-sm leading-none whitespace-nowrap">{title()}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0">
                <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select a host type</DialogTitle>
                    <p className="text-neutral-400 text-sm font-semibold">Choose either verified or unverified hosts</p>
                </DialogHeader>
                <div className="w-full flex flex-col items-center justify-center gap-4 px-4 py-4">
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isVerified === null ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsVerified(null)}}
                    >
                        All
                    </div>
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isVerified === true ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsVerified(true)}}
                    >
                        Verified
                    </div>
                    <div
                        className={cn(
                            "w-full py-4 font-semibold rounded-md flex items-center justify-center border-1",
                            isVerified === false ? "bg-neutral-950 text-white" : "border-neutral-400"
                        )}
                        onClick={() => {setIsVerified(false)}}
                    >
                        Not Verified
                    </div>
                </div>
                <div className="w-full flex items-center justify-between px-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                        onClick={() => {
                            setIsHostVerified(isVerified)
                            setIsOpen(false)
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const FilterCategoryDialog = ({
    categories, setCategories,
}: {
    categories: string[] | null;
    setCategories: (value: string[] | null) => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [eventCategories, setEventCategories] = useState<string[] | null>(categories);

    const title = () => {
        if(!categories || categories.length === 0) {
            return "Categories";
        } else {
            return categories.join(', ') ;
        }
    }

    const onTagRemove = (value: string) => {
        setEventCategories((item) => {
            return item ? item.filter((i) => i !== value) : null;
        })
    }

    const onTagAdd = (tag: string) => {
        if (!eventCategories) {
            setEventCategories([tag]);
        } else {
            setEventCategories([...eventCategories, tag]);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogTrigger asChild>
                <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border">
                    <TbCategory size={20} className="flex-shrink-0" />
                    <span className="capitalize text-sm leading-none truncate max-w-20">{title()}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0">
                <DialogHeader className="text-left w-full border-b-1 border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select a categories</DialogTitle>
                    <p className="text-neutral-400 text-sm font-semibold">Select one or more categories. Scroll to explore all available option</p>
                </DialogHeader>
                <div className="w-full grid grid-col-1 min-[350px]:grid-cols-2 gap-3 max-h-100 overflow-y-auto flex-grow no-scrollbar px-4 py-4">
                    {useEventTags().map((tag, index) => {
                        const isSelected = eventCategories?.includes(tag.name);
                        return (
                            <Button
                                variant={`${isSelected ? "default" : "outline"}`}
                                key={index}
                                className={`px-2 py-2 text-sm rounded-md font-semibold truncate`}
                                onClick={() => isSelected ? onTagRemove(tag.name) : onTagAdd(tag.name)}
                            >
                                <GoTag size={25} />
                               <span>{tag.name}</span>
                            </Button>
                        );
                    })}
                </div>
                <div className="w-full flex items-center justify-between px-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-800"
                        onClick={() => {
                            setCategories(eventCategories)
                            setIsOpen(false)
                        }}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

interface LocationData {
    coordinates: {
        lat: number;
        lng: number;
    };
    city: string;
    state: string;
    fullAddress: string;
    placeId?: string;
}

interface GoogleMapComponentProps {
    center: { lat: number; lng: number };
    onMapClick: (location: LocationData) => void;
    markerPosition: { lat: number; lng: number } | null;
    onMapLoad?: (map: google.maps.Map) => void;
    googleMapsApiKey: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
                                                                   center,
                                                                   onMapClick,
                                                                   markerPosition,
                                                                   onMapLoad
                                                               }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: 10,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            // styles: [
            //     {
            //         featureType: "poi",
            //         elementType: "labels",
            //         stylers: [{ visibility: "off" }]
            //     }
            // ]
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        // Initialize marker
        const marker = new google.maps.Marker({
            position: center,
            map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        markerRef.current = marker;

        // Map click handler
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
            const position = event.latLng;
            if (!position || !geocoderRef.current) return;

            const coordinates = {
                lat: position.lat(),
                lng: position.lng()
            };

            marker.setPosition(position);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 750);

            // Reverse geocode to get address
            geocoderRef.current.geocode(
                { location: position },
                (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const result = results[0];
                        const addressComponents = result.address_components;

                        let city = '';
                        let state = '';

                        addressComponents?.forEach(component => {
                            const types = component.types;
                            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                city = component.long_name;
                            } else if (types.includes('administrative_area_level_1')) {
                                state = component.long_name;
                            }
                        });

                        onMapClick({
                            coordinates,
                            city: city || 'Unknown City',
                            state: state || 'Unknown State',
                            fullAddress: result.formatted_address,
                            placeId: result.place_id
                        });
                    } else {
                        // Fallback if geocoding fails
                        onMapClick({
                            coordinates,
                            city: 'Unknown Location',
                            state: 'Unknown State',
                            fullAddress: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
                        });
                    }
                }
            );
        });

        // Marker drag handler
        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
            const position = event.latLng;
            if (!position || !geocoderRef.current) return;

            const coordinates = {
                lat: position.lat(),
                lng: position.lng()
            };

            geocoderRef.current.geocode(
                { location: position },
                (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const result = results[0];
                        const addressComponents = result.address_components;

                        let city = '';
                        let state = '';

                        addressComponents?.forEach(component => {
                            const types = component.types;
                            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                city = component.long_name;
                            } else if (types.includes('administrative_area_level_1')) {
                                state = component.long_name;
                            }
                        });

                        onMapClick({
                            coordinates,
                            city: city || 'Unknown City',
                            state: state || 'Unknown State',
                            fullAddress: result.formatted_address,
                            placeId: result.place_id
                        });
                    }
                }
            );
        });

        if (onMapLoad) {
            onMapLoad(map);
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
        };
    }, [center, onMapClick, onMapLoad]);

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

    return (
        <div
            ref={mapRef}
            className="w-full h-64 rounded-lg border-2 border-border"
            style={{ minHeight: '256px' }}
        />
    );
};

export const FilterLocationDialog = ({
                                         location,
                                         setLocation,
                                         googleMapsApiKey = "" // Add your Google Maps API key here
                                     }: {
    location: string | null;
    setLocation: (value: string | null) => void;
    googleMapsApiKey?: string;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [locationValue, setLocationValue] = useState<string | null>(location);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 6.5244, lng: 3.3792 });
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const title = location || "Location";

    // Load Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: "en-US",
        region: "ng", // Nigeria region
    });

    // Autocomplete options for Nigeria
    const autocompleteOptions = React.useMemo(() => ({
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry'],
        types: ['(cities)'],
        componentRestrictions: {
            country: 'ng'
        }
    }), []);

    // Handle place selection from autocomplete
    const onPlaceChanged = useCallback(() => {
        if (!autocomplete) return;

        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            return;
        }

        const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };

        let city = '';
        let state = '';

        if (place.address_components) {
            place.address_components.forEach(component => {
                const types = component.types;
                if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
            });
        }

        const locationData: LocationData = {
            coordinates,
            city: city || place.name || 'Unknown City',
            state: state || 'Unknown State',
            fullAddress: place.formatted_address || '',
            placeId: place.place_id
        };

        // Update states without causing map to reload
        setSelectedLocation(locationData);
        setLocationValue(locationData.city);
        setSearchQuery(place.formatted_address || '');
        setMapCenter(coordinates);
        setMarkerPosition(coordinates);
    }, [autocomplete]);

    // Handle location selection from map
    const handleMapClick = useCallback((locationData: LocationData) => {
        setSelectedLocation(locationData);
        setLocationValue(locationData.city);
        setMarkerPosition(locationData.coordinates);
        setMapCenter(locationData.coordinates)
    }, []);

    // Apply the selected location
    const handleApply = useCallback(() => {
        setLocation(locationValue);
        setIsOpen(false);
    }, [locationValue, setLocation]);

    // Reset search when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSelectedLocation(null);
            setLocationValue(location);
            // Reset to default position if no location
            if (!location) {
                setMapCenter({ lat: 6.5244, lng: 3.3792 });
                setMarkerPosition({ lat: 6.5244, lng: 3.3792 });
            }
        }
    }, [isOpen, location]);

    // Handle loading error
    if (loadError) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border hover:bg-accent/40 transition-colors cursor-pointer">
                        <GrLocation size={20} className="flex-shrink-0" />
                        <span className="capitalize text-sm leading-none truncate max-w-20">{title}</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="px-0 max-w-md mx-auto">
                    <div className="flex items-center justify-center h-64 px-4">
                        <div className="text-center text-red-600">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Failed to load Google Maps</p>
                            <p className="text-xs text-gray-500 mt-1">Please check your API key</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Handle loading state
    if (!isLoaded) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border hover:bg-accent/40 transition-colors cursor-pointer">
                        <GrLocation size={20} className="flex-shrink-0" />
                        <span className="capitalize text-sm leading-none truncate max-w-20">{title}</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="px-0 max-w-md mx-auto">
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader />
                        <p className="text-sm text-gray-600">Loading Google Maps...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center justify-center gap-2 text-foreground font-semibold px-3 py-2 rounded-md border border-border hover:bg-accent/40 transition-colors cursor-pointer">
                    <GrLocation size={20} className="flex-shrink-0" />
                    <span className="capitalize text-sm leading-none truncate max-w-20">{title}</span>
                </div>
            </DialogTrigger>

            <DialogContent className="px-0 max-w-md mx-auto">
                <DialogHeader className="text-left w-full border-b border-border pb-4 px-4">
                    <DialogTitle className="text-xl">Select City</DialogTitle>
                    <p className="text-neutral-400 text-sm font-medium">Select city to filter search</p>
                </DialogHeader>

                <div className="px-4 py-2">
                    {/* Search Input with Autocomplete */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        <Autocomplete
                            onLoad={setAutocomplete}
                            onPlaceChanged={onPlaceChanged}
                            options={autocompleteOptions}
                        >
                            <Input
                                type="text"
                                placeholder="Search for a location"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 py-3 text-sm bg-muted border-0 focus:bg-background focus:ring-2 focus:ring-blue-500"
                            />
                        </Autocomplete>
                    </div>

                    {/* Google Maps Component */}
                    <GoogleMapComponent
                        center={mapCenter}
                        onMapClick={handleMapClick}
                        markerPosition={markerPosition}
                        googleMapsApiKey={googleMapsApiKey}
                        onMapLoad={(map) => {
                            // Additional map setup if needed
                        }}
                    />

                    {/* Selected Location Display */}
                    {selectedLocation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-800">
                                Selected: {selectedLocation.city}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                {selectedLocation.fullAddress}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="w-full flex items-center justify-between px-4 pt-4 border-t border-border">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="text-md py-6 px-10 border-neutral-800 hover:border-neutral-800"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="default"
                        className="text-md py-6 px-10 bg-blue-800 hover:bg-blue-700"
                        onClick={handleApply}
                        disabled={!locationValue}
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};