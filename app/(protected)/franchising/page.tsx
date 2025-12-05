"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/franchising/franchising-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { StatsCard } from "@/components/franchising/stats-card";
import {
  Building2,
  FileText,
  Gauge,
  Users,
  Truck,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";

const FranchisingPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [operatorCount, setOperatorCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);

      // Fetch all data to get counts
      const [operatorsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/operators"),
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);

      if (operatorsRes.ok) {
        const operators = await operatorsRes.json();
        setOperatorCount(operators.length);
      }

      if (vehiclesRes.ok) {
        const vehicles = await vehiclesRes.json();
        setVehicleCount(vehicles.length);
      }

      if (driversRes.ok) {
        const drivers = await driversRes.json();
        setDriverCount(drivers.length);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

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

          {/* Statistics Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Network Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Registered Operators"
                count={operatorCount}
                icon={Building2}
                isLoading={isLoadingStats}
                description="Active franchise operators"
                onClick={() => router.push("/franchising/operators")}
              />

              <StatsCard
                title="Registered Vehicles"
                count={vehicleCount}
                icon={Truck}
                isLoading={isLoadingStats}
                description="Total vehicles in fleet"
                onClick={() => router.push("/franchising/vehicles")}
              />

              <StatsCard
                title="Registered Drivers"
                count={driverCount}
                icon={UserCheck}
                isLoading={isLoadingStats}
                description="Active drivers on platform"
                onClick={() => router.push("/franchising/drivers")}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default FranchisingPage;
