"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { CheckCircle, AlertCircle, ClipboardList, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllActiveSOSAlerts, SOSAlert } from "@/lib/services/SOSService";

const CttmoPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loadingSos, setLoadingSos] = useState(true);

  useEffect(() => {
    const loadSos = async () => {
      try {
        setLoadingSos(true);
        const data = await getAllActiveSOSAlerts();
        setSosAlerts(data || []);
      } catch (e) {
        console.error("Failed to load SOS alerts:", e);
      } finally {
        setLoadingSos(false);
      }
    };

    loadSos();
  }, []);

  const activeSosCount = sosAlerts.filter(a => a.status === "active").length;

  return (
    <>
      <CttmoHeader />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
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

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Drivers Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/cttmo/drivers")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Driver Registry</CardTitle>
                      <CardDescription>View and manage registered drivers</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/cttmo/drivers");
                  }}
                >
                  View Drivers
                </Button>
              </CardContent>
            </Card>

            {/* SOS Alerts Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/cttmo/sos-alerts")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${activeSosCount > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <AlertTriangle className={`w-6 h-6 ${activeSosCount > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <CardTitle>SOS Alerts</CardTitle>
                      <CardDescription>
                        {loadingSos 
                          ? "Loading alerts..." 
                          : activeSosCount > 0 
                            ? `${activeSosCount} active emergency alert${activeSosCount > 1 ? 's' : ''}`
                            : "Monitor emergency alerts from commuters"
                        }
                      </CardDescription>
                    </div>
                  </div>
                  {activeSosCount > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full text-sm font-bold">
                      {activeSosCount}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant={activeSosCount > 0 ? "destructive" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/cttmo/sos-alerts");
                  }}
                >
                  {activeSosCount > 0 ? "View Active Alerts" : "View SOS Alerts"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default CttmoPage;


