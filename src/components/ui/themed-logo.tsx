"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import lightLogo from "@/assests/logo-extend.png";
import darkLogo from "@/assests/driftologoextend_white.png";
import { cn } from "@/lib/utils";

type ThemedLogoProps = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
  alt?: string;
};

export function ThemedLogo({
  alt = "Drifto logo",
  className,
  ...props
}: ThemedLogoProps) {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === "dark" ? darkLogo : lightLogo;

  return (
    <Image
      src={logo}
      alt={alt}
      className={cn("object-contain", className)}
      {...props}
    />
  );
}
