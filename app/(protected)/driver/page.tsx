"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/driver/driver-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { PieChart } from "@/components/charts/PieChart";
import { LineChart } from "@/components/charts/LineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Award } from "lucide-react";
import { getDriverCommendations } from "@/lib/services/CommendationService";
import { getDriverReports } from "@/lib/services/ReportService";

interface RatingData {
  label: string;
  value: number;
}

const DriverPage = () => {
  const { user, role } = useAuthContext();
  const [commendationCount, setCommendationCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [ratingData, setRatingData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        // Fetch commendations
        const commendations = await getDriverCommendations(user.uid);
        setCommendationCount(commendations.length);

        // Fetch reports
        const reports = await getDriverReports(user.uid);
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

          {/* Charts Section */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Pie Chart - Commendations vs Reports */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
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
                  <CardTitle>7-Day Rating Trend</CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <LineChart
                    data={ratingData}
                    width={500}
                    height={300}
                    lineColor="#3b82f6"
                    showGrid={true}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {loading && (
            <div className="mt-8 text-center text-gray-500">
              Loading dashboard data...
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DriverPage;
