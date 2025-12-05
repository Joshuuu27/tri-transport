"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";

const CttmoPage = () => {
  const { user, role } = useAuthContext();

  return (
    <>
      <CttmoHeader />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <DashboardIntro
            displayName={user?.displayName}
            email={user?.email}
            role={role}
            subtitle="Manage transport regulations and compliance for the city"
            features={[
              {
                icon: CheckCircle,
                title: "Inspections",
                description: "Monitor vehicle and driver inspections",
              },
              {
                icon: AlertCircle,
                title: "Violations",
                description: "Track and manage traffic violations",
              },
              {
                icon: ClipboardList,
                title: "Regulations",
                description: "Enforce city transport regulations",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default CttmoPage;
