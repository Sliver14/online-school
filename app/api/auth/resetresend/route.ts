import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Make sure this points to your Prisma client
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

interface RequestBody {
  email: string;
}

// resend-code
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as RequestBody;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Optionally block re-verification if already verified
    // if (user.verified) {
    //   return NextResponse.json({ message: "User already verified" }, { status: 200 });
    // }

    // Generate a new 6-digit verification code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(newCode, 10);

    // Send the code via email
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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .code {
              font-size: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <p class="code">${newCode}</p>
          <p>Please use this code within 15 minutes to verify your email address.</p>
          <p>Thanks,<br>Loveworld Foundation School Inc.</p>
        </body>
        </html>
      `,
    });

    // Update user record with new verification code
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: hashedCode,
      },
    });

    return NextResponse.json(
        { message: "Check your email for verification code" },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error during code verification:", error);
    return NextResponse.json(
        { error: "An error occurred during verification" },
        { status: 500 }
    );
  }
}
