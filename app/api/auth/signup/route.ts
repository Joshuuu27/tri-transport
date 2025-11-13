import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Optionally save the token in DB (if you want to track sessions)
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token }, // you can use a separate field like `currentToken` instead
    });

    return NextResponse.json({ data: { user, token } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
