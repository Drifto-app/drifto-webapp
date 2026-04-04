import { Suspense } from "react";
import HomeContent from "@/components/home-component";
import { HomePageSkeleton } from "@/components/ui/page-skeletons";

export default function Home() {
  return (
    <Suspense
      fallback={<HomePageSkeleton />}
    >
      <HomeContent />
    </Suspense>
  );
}
