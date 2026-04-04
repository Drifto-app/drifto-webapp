"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { IoSearchSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import {useCallback, useMemo, useState} from "react";
import {toast} from "react-toastify";
import {authApi} from "@/lib/axios";
import {LoaderSmall} from "@/components/ui/loader";
import {useAuthStore} from "@/store/auth-store";
import {showTopToast} from "@/components/toast/toast-util";

interface LocationChangeContentProps extends React.ComponentProps<"div"> {
    prev: string | null;
}

export const LocationChangeContent = ({
    prev, className, ...props
}: LocationChangeContentProps) => {
    const router = useRouter();

    const {setUser, user, isLoading, isAuthenticated, setLocationPublic} = useAuthStore()

    const [city, setCity] = React.useState<string>("");
    const [state, setState] = React.useState<string>("");
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ["places"],
        language: "en-US",
        region: "ng",
    });

    const autocompleteOptions = useMemo(
      () => ({
          types: ["(cities)"],
          componentRestrictions: { country: "ng" },
      }),
      []
    );

    const onPlaceChanged = useCallback(() => {
        if (!autocomplete) return;

        const place = autocomplete.getPlace();

        // Extract city from locality or administrative_area_level_1
        const cityComponent =
          place.address_components?.find((c) => c.types.includes("locality")) ||
          place.address_components?.find((c) =>
            c.types.includes("administrative_area_level_1")
          );
        setCity(cityComponent?.long_name || place.formatted_address || "");

        // Extract state from administrative_area_level_1
        const stateComponent = place.address_components?.find((c) =>
          c.types.includes("administrative_area_level_1")
        );
        setState(stateComponent?.long_name || "");
    }, [autocomplete]);

    const handleBackClick = () => {
        router.push(prev ?? "/");
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          if (!isLoading && isAuthenticated) {
               await authApi.patch("/user/update", {
                   city,
                   state
               })

               setUser({...user, city, state})
           } else {
                setLocationPublic({city, state})
           }

            setLoading(false);
            router.push(prev ?? "/");
        } catch (error: any) {
            showTopToast("error", error.response?.data?.description);
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className={cn("w-full min-h-[100dvh] flex flex-col", className)} {...props}>
          <div
            className={cn(
              "w-full border-b border-border flex flex-col gap-3 justify-center h-20 flex-shrink-0"
            )}
          >
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
                      Location
                  </p>
              </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between w-full flex-1 pt-6 px-4 pb-6 overflow-hidden"
          >
              <div className="w-full flex flex-col gap-4 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                      <h1 className="font-bold text-2xl">Select your City</h1>
                      <p className="font-semibold text-neutral-400">
                          Your city helps us connect you with local events and communities
                      </p>
                  </div>

                  <div className="flex items-center justify-between h-16 px-4 gap-2 rounded-full border border-border">
                      {loadError && (
                        <span className="text-sm text-red-600">
                                 Failed to load Google Maps. Please refresh.
                             </span>
                      )}

                      {!isLoaded && !loadError && (
                        <span className="text-sm text-neutral-500">Loading…</span>
                      )}

                      {isLoaded && (
                        <Autocomplete
                          onLoad={(inst) => setAutocomplete(inst)}
                          onPlaceChanged={onPlaceChanged}
                          options={autocompleteOptions as google.maps.places.AutocompleteOptions}
                          className="w-full h-full outline-none border-none shadow-none"
                        >
                            <Input
                              name="city"
                              type="text"
                              className="w-full h-full outline-none border-none shadow-none placeholder:text-neutral-400 placeholder:font-semibold text-lg"
                              placeholder="Search your city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              aria-label="Search your city"
                            />
                        </Autocomplete>
                      )}

                      <IoSearchSharp size={30} className="text-neutral-400" />
                  </div>

                  {state && (
                    <p className="text-sm text-muted-foreground px-2">
                        Detected state: <span className="font-semibold">{state}</span>
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={ !!loadError || !isLoaded || loading}
                className="bg-blue-800 hover:bg-blue-800 text-lg font-bold py-8 rounded-md disabled:opacity-60 flex-shrink-0"
              >
                  {loading ? <LoaderSmall /> : "Continue"}
              </Button>
          </form>
      </div>
    );
};