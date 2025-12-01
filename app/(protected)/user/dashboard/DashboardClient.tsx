"use client";

import Header from "@/components/commuter/trip-history-header";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function DashboardClient() {
  const { user } = useAuthContext();
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  useEffect(() => {
    if (user === undefined) {
      router.push("/login");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <section className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* user info example */}
              {user && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Logged in as <strong>{user.email}</strong>
                  </p>
                  <div>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* dashboard content */}
        </section>
      </main>
    </div>
  );
}
