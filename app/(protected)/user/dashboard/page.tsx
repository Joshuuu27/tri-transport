import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebase.admin";
import DashboardClient from "@/app/(protected)/user/dashboard/DashboardClient";
import { SESSION_COOKIE_NAME } from "@/constant";
import { getCurrentUser } from "@/lib/server/getCurrentUser";
export default async function DashboardPage() {
  const cookieStore = await cookies();
  // const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // let user = null;

  const user = await getCurrentUser();
  if (!user) {
    // redirect or show login
    console.log("No authenticated user found.");
  }

  return <DashboardClient />;
}
