"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/operator/operator-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { PieChart } from "@/components/charts/PieChart";
import { LineChart } from "@/components/charts/LineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getDriverCommendations } from "@/lib/services/CommendationService";
import { getDriverReports } from "@/lib/services/ReportService";

interface RatingData {
  label: string;
  value: number;
}

const OperatorPage = () => {
  const { user, role } = useAuthContext();
  const [commendationCount, setCommendationCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [ratingData, setRatingData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [operatorName, setOperatorName] = useState<string>(user?.displayName || "Operator");

  useEffect(() => {
    const fetchOperatorName = async () => {
      if (!user?.uid) return;

      try {
        // Fetch operator profile to get the correct name
        const operatorRes = await fetch(`/api/operators/${user.uid}`);
        if (operatorRes.ok) {
          const operatorData = await operatorRes.json();
          const name = operatorData.name || operatorData.displayName || user?.displayName || "Operator";
          setOperatorName(name);
        }
      } catch (error) {
        console.error("Error fetching operator name:", error);
      }
    };

    fetchOperatorName();
  }, [user?.uid, user?.displayName]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        // Fetch operator's vehicles to get the first assigned driver
        const vehiclesRes = await fetch(`/api/vehicles?operatorId=${user.uid}`);
        if (!vehiclesRes.ok) throw new Error("Failed to fetch vehicles");

        const vehicles = await vehiclesRes.json();
        
        // Get the first assigned driver from the vehicles
        const firstDriverVehicle = vehicles.find((v: any) => v.assignedDriverId);
        
        if (!firstDriverVehicle?.assignedDriverId) {
          setLoading(false);
          return;
        }

        const driverId = firstDriverVehicle.assignedDriverId;
        setAssignedDriverId(driverId);

        // Fetch driver details to get the name
        const driverRes = await fetch(`/api/drivers/${driverId}/full-profile`);
        let fetchedDriverName = "Driver";
        if (driverRes.ok) {
          const driverData = await driverRes.json();
          fetchedDriverName = driverData.name || driverData.displayName || "Driver";
          setDriverName(fetchedDriverName);
        }

        // Fetch commendations for this driver
        const commendations = await getDriverCommendations(driverId);
        setCommendationCount(commendations.length);

        // Fetch reports for this driver
        const reports = await getDriverReports(driverId);
        setReportCount(reports.length);

        // Generate last 7 days rating data
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });

          // Calculate average rating for this day
          const dayCommendations = commendations.filter((c) => {
            const commendationDate = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
            return (
              commendationDate.toDateString() === date.toDateString()
            );
          });

          const avgRating =
            dayCommendations.length > 0
              ? dayCommendations.reduce((sum, c) => sum + Number(c.rating || 0), 0) /
                dayCommendations.length
              : 0;

          last7Days.push({
            label: dayName,
            value: Math.round(avgRating * 10) / 10,
          });
        }

        setRatingData(last7Days);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  return (
    <>
      <Header />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <DashboardIntro
            displayName={operatorName}
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

          {/* Charts Section */}
          {!loading && assignedDriverId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Pie Chart - Commendations vs Reports */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{driverName} - Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <PieChart
                    data={[
                      {
                        name: "Commendations",
                        value: commendationCount,
                        color: "#10b981",
                      },
                      {
                        name: "Reports",
                        value: reportCount,
                        color: "#ef4444",
                      },
                    ]}
                    width={350}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Line Chart - 7 Day Ratings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{driverName} - 7-Day Rating Trend</CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <LineChart
                    data={ratingData}
                    width={500}
                    height={300}
                    lineColor="#3b82f6"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default OperatorPage;
