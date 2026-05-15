"use client";

import * as React from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoutes";
import { ScreenProvider } from "@/components/screen/screen-provider";
import CommentManagePage from "@/components/comment/comment-manage";

export default function DesktopCommentPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryParams = useSearchParams();
  const prev = queryParams?.get("prev") ?? null;
  const type = queryParams?.get("type");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!id || Array.isArray(id) || !type) {
    return (
      <ProtectedRoute>
        <ScreenProvider>
          <div className="flex h-screen w-full flex-col items-center justify-center">
            <div className="rounded bg-red-500 p-4 text-white">Invalid comment route</div>
          </div>
        </ScreenProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenProvider>
        <CommentManagePage
          entityId={id}
          prev={prev}
          type={type}
          currentPathUrl={`${pathname}?${searchParams}`}
          variant="desktop"
        />
      </ScreenProvider>
    </ProtectedRoute>
  );
}
