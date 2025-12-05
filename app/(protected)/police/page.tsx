"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/police/police-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { AlertTriangle, MapPin, Users } from "lucide-react";

const PolicePage = () => {
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
            subtitle="Monitor SOS alerts and respond to emergencies"
            features={[
              {
                icon: AlertTriangle,
                title: "SOS Alerts",
                description: "Real-time emergency SOS alerts from commuters",
              },
              {
                icon: MapPin,
                title: "Location Tracking",
                description: "Track incident locations and dispatch units",
              },
              {
                icon: Users,
                title: "Incident Reports",
                description: "View and manage incident reports and complaints",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default PolicePage;
