"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/driver/driver-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { Zap, TrendingUp, Award } from "lucide-react";

const DriverPage = () => {
  const { user, role } = useAuthContext();

  return (
    <>
      <Header />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <DashboardIntro
            displayName={user?.displayName}
            email={user?.email}
            role={role}
            subtitle="Maximize your earnings and build your reputation"
            features={[
              {
                icon: Zap,
                title: "Active Rides",
                description: "View and accept ride requests in real-time",
              },
              {
                icon: TrendingUp,
                title: "Earnings",
                description: "Track your daily and monthly earnings",
              },
              {
                icon: Award,
                title: "Ratings",
                description: "Build your reputation with positive reviews",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default DriverPage;
