import * as React from "react";
import {NavMenu} from "@/components/navbar/nav-menu";
import ProfileMenu from "@/components/dropdown-menu/profile-menu";
import { ThemedLogo } from "@/components/ui/themed-logo";
import { cn } from "@/lib/utils";

type NavbarProps = React.ComponentProps<"nav">;

export const Navbar = ({
    className,
    ...props
}: NavbarProps) => {

    return (
        <nav className={cn("h-16 bg-neutral-200 border-b overflow-y-hidden hidden md:block", className)} {...props}>
            <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-2">
                <div className="relative w-25 h-25">
                    <ThemedLogo
                        fill
                        alt="Logo Extend"
                    />
                </div>

                {/* Desktop Menu */}
                <NavMenu className="hidden md:block" />

                <div className="flex items-center gap-3">
                    <ProfileMenu username="Reuben" profilePicture="https://res.cloudinary.com/dfn3ix1db/image/upload/c_fill,f_auto,q_auto,w_512/v1/drifto/2025-07-19T12:57:32.572450345Z_9bf38f8a-0ca0-4d2b-8ce2-9176a549bb98?_a=DAGAACAWZAA0" />
                </div>
            </div>
        </nav>
    )
}
