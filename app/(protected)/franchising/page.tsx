"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/franchising/franchising-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { StatsCard } from "@/components/franchising/stats-card";
import { PieChart } from "@/components/charts/PieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  FileText,
  Gauge,
  Users,
  Truck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

// Helper function to parse Firestore date in any format
const parseFirestoreDate = (dateValue: any): Date => {
  // If it's already a valid Date object
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  
  // If it has a toDate method (Firestore Timestamp from SDK)
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it has _seconds property (Firestore Timestamp with underscores - internal format)
  if (dateValue && typeof dateValue._seconds === 'number') {
    const milliseconds = dateValue._seconds * 1000;
    const nanoseconds = dateValue._nanoseconds || 0;
    const date = new Date(milliseconds + nanoseconds / 1000000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it has seconds property (Firestore Timestamp serialized as object)
  if (dateValue && typeof dateValue.seconds === 'number') {
    const milliseconds = dateValue.seconds * 1000;
    const nanoseconds = dateValue.nanoseconds || 0;
    const date = new Date(milliseconds + nanoseconds / 1000000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it's a string (ISO format or other)
  if (typeof dateValue === 'string' && dateValue.trim()) {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it's a number (timestamp in milliseconds or seconds)
  if (typeof dateValue === 'number' && dateValue !== 0) {
    // If it looks like seconds (less than 10^11), convert to milliseconds
    if (dateValue < 100000000000) {
      const date = new Date(dateValue * 1000);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } else {
      // Treat as milliseconds
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  throw new Error(`Cannot parse date: ${JSON.stringify(dateValue)}`);
};

const FranchisingPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [operatorCount, setOperatorCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [franchiseExpiredCount, setFranchiseExpiredCount] = useState(0);
  const [franchiseActiveCount, setFranchiseActiveCount] = useState(0);

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

        // Calculate franchise expiry status using renewalHistory
        let expiredCount = 0;
        let activeCount = 0;
        const now = new Date();

        vehicles.forEach((vehicle: any) => {
          try {
            let expiryDate: Date | null = null;

            // Use the franchiseExpirationDate directly from the vehicle
            if (vehicle.franchiseExpirationDate) {
              expiryDate = parseFirestoreDate(vehicle.franchiseExpirationDate);
              if (expiryDate && !isNaN(expiryDate.getTime())) {
                if (expiryDate < now) {
                  expiredCount++;
                } else {
                  activeCount++;
                }
              }
            }
          } catch (error) {
            console.error(`Error processing vehicle ${vehicle.plateNumber}:`, error);
          }
        });

        setFranchiseExpiredCount(expiredCount);
        setFranchiseActiveCount(activeCount);
        console.log("Franchise counts - Active:", activeCount, "Expired:", expiredCount);
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

          {/* Franchise Expiry Status Chart */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Franchise Status
              </h2>
              <Button
                onClick={() => router.push("/franchising/franchises")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View All Franchises
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Franchise Expiration Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <div className="w-full">
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Active: {franchiseActiveCount} | Expired: {franchiseExpiredCount}
                  </p>
                  {(franchiseActiveCount > 0 || franchiseExpiredCount > 0) ? (
                    <>
                      <div className="flex justify-center mb-8">
                        <PieChart
                          data={[
                            {
                              name: "Active",
                              value: franchiseActiveCount,
                              color: "#10b981",
                            },
                            {
                              name: "Expired",
                              value: franchiseExpiredCount,
                              color: "#ef4444",
                            },
                          ]}
                          width={400}
                          height={300}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-3xl font-bold text-green-600">
                            {franchiseActiveCount}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Active</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-3xl font-bold text-red-600">
                            {franchiseExpiredCount}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Expired</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No franchise data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default FranchisingPage;
