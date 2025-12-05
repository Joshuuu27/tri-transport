"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/franchising/franchising-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { Building2, FileText, Gauge } from "lucide-react";

const FranchisingPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();

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
            subtitle="Oversee all franchise operations and compliance"
            features={[
              {
                icon: Building2,
                title: "Franchise Network",
                description: "Monitor all franchised operations",
              },
              {
                icon: FileText,
                title: "Documentation",
                description: "Manage licenses and compliance records",
              },
              {
                icon: Gauge,
                title: "Performance",
                description: "Track quality and service standards",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default FranchisingPage;
