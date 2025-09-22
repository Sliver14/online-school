import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: { resetToken: token },
        });

        if (!user || !user.resetTokenExpiresAt || new Date() > new Date(user.resetTokenExpiresAt)) {
            return NextResponse.json(
                { error: "Invalid or expired reset token." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiresAt: null,
            },
        });

        return NextResponse.json(
            { message: "Password reset successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}