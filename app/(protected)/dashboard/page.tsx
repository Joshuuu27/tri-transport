"use client";

import Header from "@/components/commuter/trip-history-header";
import authService from "@/lib/services/AuthService";

export default function Dashboard() {
  const handleLogout = async () => {
    try {
      const res = await authService.logout();

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Search Section */}
        <section className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative">
              
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
         
        </section>
      </main>
    </div>
  );
}
