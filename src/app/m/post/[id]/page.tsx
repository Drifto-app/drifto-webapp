"use client"

import { SinglePostContent } from '@/components/post/post-single-display';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { ScreenProvider } from '@/components/screen/screen-provider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import * as React from 'react';

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const queryParams = useSearchParams();
  const prev = queryParams?.get("prev") ?? null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!id || Array.isArray(id)) {
    return (
      <ProtectedRoute>
        <ScreenProvider>
          <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="bg-red-500 text-white p-4 rounded">Invalid Post ID</div>
          </div>
        </ScreenProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <div className="w-full ">
          <SinglePostContent postId={id} prev={prev} currentPathUrl={pathname + "?" + searchParams} />
        </div>
      </ScreenProvider>
    </ProtectedRoute>
  )
}
