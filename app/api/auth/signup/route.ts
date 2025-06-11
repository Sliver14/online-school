import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const {
            firstName,
            lastName,
            email,
            password
        } = await req.json() as {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
        };

        if (!firstName || !email) {
            return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            if (existingUser.verified) {
                return NextResponse.json({ error: "User already verified" }, { status: 400 });
            } else {
                return NextResponse.json({ error: "User not verified. Check your email." }, { status: 400 });
            }
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = bcrypt.hashSync(verificationCode, 10);
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user
        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                verificationCode: hashedCode,
                verified: false,
            },
        });

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Verification Code",
            html: `
        <p>Hello ${firstName},</p>
        <p>Your verification code is: <b>${verificationCode}</b></p>
        <p>Please use this code within 15 minutes to verify your email address.</p>
        <p>Thanks,<br>Loveworld Foundation School Inc.</p>
      `,
        });

        return NextResponse.json({ message: "Check your email for verification code" }, { status: 201 });

    } catch (error: unknown) {
        console.error("Signup Error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
    }
}
