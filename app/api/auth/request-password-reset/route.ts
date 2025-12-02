// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "@/lib/auth";
const prisma = new PrismaClient()
export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "If email exists, reset link sent." });
  }

  const resetToken = generateToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken },
  });

  // TODO: send reset email here using Nodemailer

  return NextResponse.json({ message: "Reset email sent" });
}
