// /lib/server/getCurrentUser.ts
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) return null;

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    return user;
  } catch (err) {
    console.error("Error verifying session cookie:", err);
    return null;
  }
}
