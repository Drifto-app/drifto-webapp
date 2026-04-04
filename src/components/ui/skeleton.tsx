import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[inherit] bg-muted/70 dark:bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}
