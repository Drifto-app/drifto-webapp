'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {useAuthStore} from '@/store/auth-store';
import {Loader} from "@/components/ui/loader";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const queryString = searchParams?.toString();

    const { isAuthenticated, isLoading, hasTriedRefresh } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hasTriedRefresh && !isLoading && !isAuthenticated) {
            const safePathname = pathname ?? '/';
            const currentPath = queryString ? `${safePathname}?${queryString}` : safePathname;
            const returnUrl = encodeURIComponent(currentPath);

            router.replace(`${redirectTo}?next=${returnUrl}`);
        }
    }, [isAuthenticated, isLoading, router, redirectTo, hasTriedRefresh, pathname, queryString]);

    if (isLoading) {
        return (
           <div className="w-full h-screen flex flex-col items-center justify-center">
               <Loader className="h-10 w-10"/>
           </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
