// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword, resetToken: null },
  });

  return NextResponse.json({ data: user });
}
