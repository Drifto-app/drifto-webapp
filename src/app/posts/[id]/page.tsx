"use client";

import * as React from "react";
import { SinglePostContent } from "@/components/post/post-single-display";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";

export default function DesktopPostPage() {
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
          <div className="flex h-screen w-full flex-col items-center justify-center">
            <div className="rounded bg-red-500 p-4 text-white">Invalid Post ID</div>
          </div>
        </ScreenProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <SinglePostContent
          postId={id}
          prev={prev}
          currentPathUrl={`${pathname}?${searchParams}`}
          variant="desktop"
        />
      </ScreenProvider>
    </ProtectedRoute>
  );
}
