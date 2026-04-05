import { Suspense } from 'react';
import LoginPage from '@/components/auth/auth-page';
import { AuthPageSkeleton } from '@/components/ui/page-skeletons';

export default function AuthPage() {

    return (
      <Suspense fallback={<AuthPageSkeleton />}>
          <LoginPage />
      </Suspense>
    )
}
