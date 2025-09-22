import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;
  const userEmail = req.headers.get('x-user-email');
  const userId = req.headers.get('x-user-id');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    // If middleware already verified the token, use the header info
    if (userEmail && userId) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { valid: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          userId: user.id.toString(),
          user: {
            id: user.id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // Fallback: Verify JWT manually
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const email = decoded.email;

    if (!email) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    // Query user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: user.id.toString(),
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}