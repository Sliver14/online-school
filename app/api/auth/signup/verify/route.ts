import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        // Find the user by email using Prisma
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        // Compare verification code
        const isMatch = bcrypt.compareSync(code.toString(), user.verificationCode);

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        // Update user record
        await prisma.user.update({
            where: { email },
            data: {
                verificationCode: "",
                verified: true,
            },
        });

        return NextResponse.json({ message: "Signup was successful!" }, { status: 200 });
    } catch (error) {
        console.error("Error during code verification:", error);
        return NextResponse.json({ error: "An error occurred during verification" }, { status: 500 });
    }
}
