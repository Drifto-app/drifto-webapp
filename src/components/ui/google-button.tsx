import { useEffect, useRef, useState } from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { showTopToast } from '@/components/toast/toast-util';

interface GoogleButtonProps {
    onSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
}

export default function GoogleButton({ onSuccess }: GoogleButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const updateWidth = () => {
            setWidth(Math.floor(container.getBoundingClientRect().width));
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="flex min-h-10 w-full items-center justify-center">
            {width > 0 && (
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={() => showTopToast('error', 'Google Auth failed')}
                    useOneTap={false}
                    theme="outline"
                    width={width}
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="left"
                />
            )}
        </div>
    );
}
