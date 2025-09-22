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

        // Find user by verification token
        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=error&message=invalid_token`
            );
        }

        // Log for debugging
        console.log(`Verification attempt for user: ${user.email}, token: ${token}`);

        // Check if user is already verified
        if (user.verified) {
            console.log(`User ${user.email} is already verified`);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=already_verified&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || "")}`
            );
        }

        // Check if token is expired
        if (!user.verificationTokenExpiresAt || new Date() > new Date(user.verificationTokenExpiresAt)) {
            console.log(`Verification token expired for user: ${user.email}`);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=expired&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || "")}`
            );
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

        console.log(`User ${user.email} successfully verified at ${new Date().toISOString()}`);

        // Redirect to success page
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=success&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.firstName || "")}`
        );
    } catch (error) {
        console.error("Email verification error:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified-success?status=error&message=server_error`
        );
    }
}