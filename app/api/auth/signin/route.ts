import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/utils/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Create your account' }, { status: 400 });
    }

    if (!user.verified) {
      // Generate and update verification token
      const verificationToken = uuidv4();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.user.update({
        where: { email },
        data: {
          verificationToken,
          verificationTokenExpiresAt: expires,
        },
      });

      // Send verification email
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup/verify?token=${verificationToken}`;
      await sendEmail(user.email, user.firstName || 'User', verificationLink, 'resend');

      return NextResponse.json(
        { error: 'User not verified. A verification link has been sent to your email.' },
        { status: 400 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      return NextResponse.json({ error: 'Account setup incomplete.' }, { status: 400 });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    const response = NextResponse.json({ message: 'Signin was Successful!', token });

    // Set cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signin Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}