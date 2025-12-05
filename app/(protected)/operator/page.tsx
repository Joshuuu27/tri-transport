"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/operator/operator-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { Briefcase, Users, BarChart3 } from "lucide-react";

const OperatorPage = () => {
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
            subtitle="Start managing your vehicle franchises"
            features={[
              {
                icon: Briefcase,
                title: "Franchise Management",
                description: "Manage all your vehicle franchises efficiently",
              },
              {
                icon: Users,
                title: "Driver Management",
                description: "Oversee and manage your driver fleet",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Track performance and revenue metrics",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default OperatorPage;
