'use client';

import { ReactNode } from 'react';
import { Bounce, ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { EventTagsProvider } from "@/hooks/event-tags-providers";
import { useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppearanceProvider } from '@/components/appearance/appearance-provider';
import { DobOnboardingOverlay } from '@/components/auth/dob-onboarding-overlay';


interface ClientProvidersProps {
    children: ReactNode;
}

function AppProviders({ children }: ClientProvidersProps) {
    const { resolvedTheme } = useTheme();

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <AuthProvider>
                <EventTagsProvider>
                    {children}
                    <DobOnboardingOverlay />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick={false}
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                        transition={Bounce}
                    />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 2000,
                            style: {
                                marginTop: '20px',
                            },
                        }}
                        className="top-4"
                    />
                </EventTagsProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export function ClientProviders({ children }: ClientProvidersProps) {
    return (
        <AppearanceProvider>
            <AppProviders>{children}</AppProviders>
        </AppearanceProvider>
    );
}
