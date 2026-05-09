import {NextRequest, NextResponse} from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if ((pathname === "/events" || pathname.startsWith("/events/")) && !pathname.startsWith("/m/events")) {
        return NextResponse.redirect(new URL(`/m${pathname}`, request.url));
    }

    if ((pathname === "/user" || pathname.startsWith("/user/")) && !pathname.startsWith("/m/user")) {
        return NextResponse.redirect(new URL(`/m${pathname}`, request.url));
    }

    if ((pathname === "/post" || pathname.startsWith("/post/")) && !pathname.startsWith("/m/post")) {
        return NextResponse.redirect(new URL(`/m${pathname}`, request.url));
    }

    return NextResponse.next();
}