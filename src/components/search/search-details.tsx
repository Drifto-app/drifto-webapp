"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import {IoClose, IoOptionsOutline, IoSearchSharp} from "react-icons/io5";
import { SearchSuggestion } from "@/components/search/search-suggestion";
import { useState } from "react";
import { SearchComponent } from "@/components/search/search-component";
import {AdvanceSearch} from "@/components/search/advance-search";

interface SearchDetailsProps extends React.ComponentProps<"div"> {
    prev: string | null;
}

export type ActiveScreenType = "suggestion" | "search" | "advance-search";

export const SearchDetails = ({ prev, className, ...props }: SearchDetailsProps) => {
    const router = useRouter();

    const [activeScreen, setActiveScreen] = useState<ActiveScreenType>("suggestion");
    const [searchText, setSearchText] = useState<string>("");
    const [committed, setCommitted] = useState(false);

    // toggled when user hits Enter, to tell the child to “commit” the search
    const [commitToken, setCommitToken] = useState<number>(0);

    const handleSearchChange = (value: string) => {
        setSearchText(value);

        if (value.trim()) {
            setActiveScreen("search");
        } else {
            setActiveScreen("suggestion");
            setCommitted(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchText.trim()) {
            // fire a new token so the child can react in useEffect
            setCommitToken(Date.now());
            setCommitted(true);
        }
    };

    const handleBackClick = () => {
        router.push(prev ?? "/");
    };

    if(activeScreen === "advance-search") {
        return (
            <AdvanceSearch setActiveScreen={setActiveScreen} />
        )
    }

    return (
        <div className={cn("w-full flex flex-col min-h-[100dvh]", className)} {...props}>
            <div className="w-full border-b border-border flex flex-col gap-6 justify-center pt-6 pb-4 flex-shrink-0">
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
                        Search
                    </p>
                </div>

                <div className="flex flex-row items-center px-4 gap-3">
                    <div className="w-full flex items-center rounded-full border-1 border-neutral-400 px-4 h-12">
                        <div className="flex items-center w-full h-full">
                            <IoSearchSharp size={30} className="text-neutral-400" />
                            <Input
                                name="search"
                                type="search"
                                inputMode="search"
                                enterKeyHint="search"
                                className="w-full h-full outline-none border-none shadow-none placeholder:text-neutral-400 placeholder:font-semibold text-base"
                                placeholder="Search"
                                aria-label="Search"
                                value={searchText}
                                onChange={(e) => handleSearchChange(e.target.value) }
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {searchText && (
                            <div className="text-neutral-500" onClick={() => {handleSearchChange("")}}>
                                <IoClose size={20}/>
                            </div>
                        )}
                    </div>
                    <div className="rounded-full p-2 border-1 border-neutral-400" onClick={() => setActiveScreen("advance-search")}>
                        <IoOptionsOutline size={25} className="text-muted-foreground" />
                    </div>
                </div>
            </div>

            {activeScreen === "search" ? (
                <SearchComponent searchText={searchText} commitToken={commitToken} committed={committed}/>
            ) : (
                <SearchSuggestion />
            )}
        </div>
    );
};
