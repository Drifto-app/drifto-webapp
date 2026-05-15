"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ScreenContextValue {
    isDesktop: boolean;
    isMobile: boolean;
}

const ScreenContext = createContext<ScreenContextValue>({
    isDesktop: false,
    isMobile: true,
});

export const useScreen = () => useContext(ScreenContext);

export const ScreenProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDesktop, setIsDesktop] = useState<boolean>(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleChange = () => {
            setIsDesktop(mediaQuery.matches);
        };

        handleChange();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <ScreenContext.Provider value={{ isDesktop, isMobile: !isDesktop }}>
            {children}
        </ScreenContext.Provider>
    );
}
