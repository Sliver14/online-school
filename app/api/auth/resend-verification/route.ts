import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import sendVerificationEmail from "@/lib/mailer"; // <-- You'll create this

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new token and expiry
    const newToken = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Update user with new token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken: newToken,
            verificationTokenExpiresAt: expiresAt,
        },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${newToken}`;

    // Send email
    await sendVerificationEmail(user.email, user.firstName || "", verifyUrl);

    return NextResponse.json({ success: true, message: "Verification email sent." });
}
