import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Basic validation
        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: "Password is required." }, { status: 400 });
        }

        // Find the user by email using Prisma
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 400 });
        }

        if (!user.verified) {
            return NextResponse.json({ error: "User not verified" }, { status: 400 });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Wrong password combination" }, { status: 400 });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "30d" }
        );

        const response = NextResponse.json({ message: "Signin was Successful!", token });

        // Set cookie
        response.headers.set(
            "Set-Cookie",
            `authToken=${token}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=None; Max-Age=${30 * 24 * 60 * 60}`
        );

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
