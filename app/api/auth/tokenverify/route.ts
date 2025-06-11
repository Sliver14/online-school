import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma"; // Adjust the import path if needed

export async function GET(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value;

    if (!token) {
        return NextResponse.json(
            { valid: false, error: "Token is required" },
            { status: 400 }
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        const email = decoded.email;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            {
                valid: true,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during token verification:", error);
        return NextResponse.json(
            { valid: false, error: "Invalid or expired token" },
            { status: 403 }
        );
    }
}
