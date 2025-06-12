import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=error&message=missing_token`
            );
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=error&message=invalid_token`
            );
        }

        console.log(user.firstName)
        console.log("Token from URL:", token);

        // Check if user is already verified
        if (user.verified) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=already_verified&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || '')}`
            );
        }

        // Check if token is expired (24 hours expiry)
        if (user.verificationTokenExpiresAt) {
            const now = new Date();
            const expiresAt = new Date(user.verificationTokenExpiresAt);
            
            if (now > expiresAt) {
                return NextResponse.redirect(
                    `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=expired&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || '')}`
                );
            }
        }

        // Update user verification status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
                verifiedAt: new Date(),
            },
        });

        console.log(`User ${user.email} successfully verified their email at ${new Date().toISOString()}`);

        // Redirect to success page with user info
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=success&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || '')}`
        );

    } catch (error) {
        console.error("Email verification error:", error);
        
        // Log more details for debugging
        console.error("Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=error&message=server_error`
        );
    }
}