import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure this points to your Prisma client
import bcrypt from "bcryptjs";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as RequestBody;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
        { message: "Password updated successfully" },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
        { error: "An error occurred during password update" },
        { status: 500 }
    );
  }
}
