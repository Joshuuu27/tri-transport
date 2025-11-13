// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  const user = await getUserFromToken(token);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: user });
}
