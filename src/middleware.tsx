import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("authToken");

    const protectedRoutes = ["/dashboard", "/users"];

    if (!token && protectedRoutes.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [],
};
