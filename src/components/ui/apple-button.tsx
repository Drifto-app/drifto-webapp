"use client";
import AppleSignin from "react-apple-signin-auth";
import type { ButtonHTMLAttributes } from "react";
import { showTopToast } from "@/components/toast/toast-util";
import { FaApple } from "react-icons/fa";

export interface AppleAuthResponse {
    identityToken?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    email?: string | null;
}

interface AppleSigninResponse {
    authorization?: {
        id_token?: string;
    };
    user?: {
        name?: {
            firstName?: string;
            lastName?: string;
        };
        email?: string;
    };
}

interface AppleButtonProps {
    onSuccess: (response: AppleAuthResponse) => Promise<void>;
}

export default function AppleButton({ onSuccess }: AppleButtonProps) {
    const handleAppleResponse = async (response: AppleSigninResponse) => {
        // Map Web Apple Sign In response to the format expected by auth-store/backend
        // Web Response: { authorization: { id_token, ... }, user: { name: { firstName, lastName }, ... } }
        // Expected: { identityToken, givenName, familyName }

        const mappedResponse = {
            identityToken: response.authorization?.id_token,
            givenName: response.user?.name?.firstName || null,
            familyName: response.user?.name?.lastName || null,
            email: response.user?.email || null
        };

        await onSuccess(mappedResponse);
    };

    const authOptions = {
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
        scope: "email name",
        redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "https://app.drifto.app/api/auth/apple/callback",
        usePopup: true,
    };

    return (
        <div className="w-full flex justify-center items-center">
            <AppleSignin
                authOptions={authOptions}
                uiType="dark"
                className="apple-auth-btn"
                noDefaultStyle={false}
                buttonExtraChildren="Continue with Apple"
                onSuccess={handleAppleResponse}
                onError={(error: unknown) => {
                    console.error(error);
                    showTopToast("error", 'Apple Auth failed');
                }}
                render={(props: ButtonHTMLAttributes<HTMLButtonElement>) => (
                    <button
                        {...props}
                        className="relative flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        <div className="mr-2 flex items-center">
                            <FaApple size={18} />
                        </div>
                        <span className="whitespace-nowrap">Continue with Apple</span>
                    </button>
                )}
            />
        </div>
    );
}
