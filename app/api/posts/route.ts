export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET() {
  const snapshot = await db.collection("posts").get();

  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(posts);
}
