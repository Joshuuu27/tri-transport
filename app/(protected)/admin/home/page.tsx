"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ use "next/navigation" for router in app dir
import { useAuth } from "@/app/context/AuthContext";

const LoggedIn = () => {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !authUser) {
      router.push("/"); // Redirect to login/root
    }
  }, [authUser, loading, router]);

  // Placeholder sign out handler
  const handleSignOut = () => {
    // Example: remove session cookie or call Firebase signOut
    console.log("Sign out clicked");
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>Welcome, {authUser?.email}</h1>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      )}
    </div>
  );
};

export default LoggedIn;
