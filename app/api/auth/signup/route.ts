import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            zone,
            kcUsername,
            phoneNumber,
            city,
            country,
        } = await req.json();

        if (!firstName || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_APP_URL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const hashedPassword = bcrypt.hashSync(password, 10);
        const verificationToken = uuidv4();

        if (existingUser) {
            if (existingUser.verified) {
                return NextResponse.json({ error: "User already verified" }, { status: 400 });
            } else {
                // Update existing unverified user
                await prisma.user.update({
                    where: { email },
                    data: {
                        firstName,
                        lastName,
                        password: hashedPassword,
                        verificationToken,
                        zone,
                        phoneNumber,
                        city,
                        country,
                        kcUsername,
                        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                });
            }
        } else {
            // Create new user
            await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    zone,
                    phoneNumber,
                    city,
                    country,
                    kcUsername,
                    verificationToken,
                    verified: false,
                    verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });
        }

        // Send verification email
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup/verify?token=${verificationToken}`;
        try {
            await sendEmail(email, firstName, verificationLink, "signup");
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return NextResponse.json(
                { message: "User created but email sending failed. Please contact support." },
                { status: 201 }
            );
        }

        return NextResponse.json({ message: "Verification link sent to your email." }, { status: 201 });
    } catch (error) {
        console.error("Signup Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}