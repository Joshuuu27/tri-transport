"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/police/police-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { AlertTriangle, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/common/loading-component";

const PolicePage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [sosAlertsToday, setSosAlertsToday] = useState(0);
  const [totalSosAlerts, setTotalSosAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch SOS alerts
      const sosResponse = await fetch("/api/police/sos-alerts");
      if (sosResponse.ok) {
        const sosData = await sosResponse.json();
        setTotalSosAlerts(sosData.length);

        // Count SOS alerts from today only
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaySosAlerts = sosData.filter((alert: any) => {
          const alertDate = new Date(alert.timestamp);
          return alertDate >= today && alertDate < tomorrow;
        });

        setSosAlertsToday(todaySosAlerts.length);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <DashboardIntro
            displayName={(user?.displayName as string | undefined) || undefined}
            email={(user?.email as string | undefined) || undefined}
            role={(role as string | undefined) || undefined}
            subtitle="Monitor SOS alerts and respond to emergencies"
            sosAlertsToday={sosAlertsToday}
            totalSosAlerts={totalSosAlerts}
            onSOSAlertClick={() => router.push("/police/sos-alerts")}
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
