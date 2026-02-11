"use client";
import { useEffect, useState } from "react";
import AppleSignin from "react-apple-signin-auth";
import { showTopToast } from "@/components/toast/toast-util";
import { FaApple } from "react-icons/fa";

interface AppleButtonProps {
    onSuccess: (response: any) => Promise<void>;
}

export default function AppleButton({ onSuccess }: AppleButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    const handleAppleResponse = async (response: any) => {
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
        <div
            className="w-full flex justify-center items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AppleSignin
                authOptions={authOptions}
                uiType="dark"
                className="apple-auth-btn"
                noDefaultStyle={false}
                buttonExtraChildren="Continue with Apple"
                onSuccess={handleAppleResponse}
                onError={(error: any) => {
                    console.error(error);
                    showTopToast("error", 'Apple Auth failed');
                }}
                render={(props: any) => (
                    <button
                        {...props}
                        style={{
                            width: "100%",
                            height: 40,
                            border: "1px solid #dadce0",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            color: "#3c4043",
                            fontSize: "14px",
                            fontWeight: 500,
                            fontFamily: "'Google Sans', arial, sans-serif",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            padding: "0 12px",
                        }}
                    >
                        {/* Hover Overlay */}
                        {isHovered && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(60, 64, 67, 0.04)",
                                    pointerEvents: "none"
                                }}
                            />
                        )}
                        <div style={{ marginRight: 10, display: "flex", alignItems: "center" }}>
                            <FaApple size={18} />
                        </div>
                        <span style={{ whiteSpace: "nowrap" }}>Continue with Apple</span>
                    </button>
                )}
            />
        </div>
    );
}
