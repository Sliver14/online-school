import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Return generic message to prevent email enumeration
            return NextResponse.json(
                { message: "If an account exists, a reset link has been sent." },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = uuidv4();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with reset token
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiresAt: expires,
            },
        });

        // Send reset email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
        await sendEmail(user.email, user.firstName, resetLink, "reset");

        return NextResponse.json(
            { message: "If an account exists, a reset link has been sent." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}