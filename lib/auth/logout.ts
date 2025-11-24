import { getAuth, signOut } from "firebase/auth";

export async function handleLogout() {
  const auth = getAuth();

  // 1. Sign out Firebase client
  await signOut(auth);

  // 2. Clear Admin session cookie
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  // 3. Redirect
  window.location.href = "/";
}
