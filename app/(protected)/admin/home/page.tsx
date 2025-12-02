"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ use "next/navigation" for router in app dir
import { useAuthContext } from "@/app/context/AuthContext";

const LoggedIn = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/"); // Redirect to login/root
    }
  }, [user, router]);

  // Placeholder sign out handler
  const handleSignOut = () => {
    // Example: remove session cookie or call Firebase signOut
    console.log("Sign out clicked");
  };

  return (
    <div>
      <>
        <h1>Welcome, {user?.email}</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </>
    </div>
  );
};

export default LoggedIn;
