import { NextRequest, NextResponse } from "next/server";
// import Cookies from "js-cookie";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value; // Get token from cookies
    // console.log(token)
    if (!token) {
        // If no token, redirect to signin page
        return NextResponse.redirect(new URL("/welcome", req.url));
    }

    return NextResponse.next(); // Allow access if token exists
}

// // Apply middleware to these pages
export const config = {
    matcher: [ "/"],
};
