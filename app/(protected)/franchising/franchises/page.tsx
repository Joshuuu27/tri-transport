"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/franchising/franchising-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

interface FranchiseData {
  id: string;
  plateNumber: string;
  bodyNumber: string;
  franchiseNumber: string;
  operatorName: string;
  franchiseExpiryDate: string;
  status: "active" | "expired";
}

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

const FranchisesPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [franchises, setFranchises] = useState<FranchiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    try {
      setLoading(true);
      setError(null);

      const vehiclesRes = await fetch("/api/vehicles");
      if (!vehiclesRes.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const vehicles = await vehiclesRes.json();
      const now = new Date();
      const franchisesList: FranchiseData[] = [];

      // Process each vehicle
      for (const vehicle of vehicles) {
        let expiryDate: Date | null = null;
        let status: "active" | "expired" = "active";

        console.log(`\n=== Vehicle: ${vehicle.plateNumber} ===`);
        console.log("Full vehicle object:", vehicle);

        // Try to use franchiseExpirationDate directly from vehicle
        if (vehicle.franchiseExpirationDate) {
          try {
            const expDate = parseFirestoreDate(vehicle.franchiseExpirationDate);
            if (!isNaN(expDate.getTime())) {
              expiryDate = expDate;
              console.log(`✓ Using franchiseExpirationDate: ${expiryDate.toISOString()}`);
            }
          } catch (e) {
            console.error("Error parsing franchiseExpirationDate:", e);
          }
        }

        // If we have a valid date, use it
        if (expiryDate && !isNaN(expiryDate.getTime())) {
          status = expiryDate < now ? "expired" : "active";
          console.log(`Status: ${status}`);
        } else {
          // Fallback: skip vehicles without valid expiry dates
          console.warn(`⚠ No valid expiry date for ${vehicle.plateNumber}`);
          continue;
        }

        // Fetch operator name if operatorId exists
        let operatorName = "Unknown";
        if (vehicle.operatorId) {
          try {
            const operatorRes = await fetch(`/api/operators/${vehicle.operatorId}`);
            if (operatorRes.ok) {
              const operatorData = await operatorRes.json();
              operatorName = operatorData.displayName || operatorData.name || "Unknown";
            }
          } catch (err) {
            console.error(`Failed to fetch operator ${vehicle.operatorId}:`, err);
          }
        }

        const formattedDate = expiryDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        console.log(`Final: ${vehicle.plateNumber} → ${formattedDate} (${status})\n`);

        franchisesList.push({
          id: vehicle.id,
          plateNumber: vehicle.plateNumber || "—",
          bodyNumber: vehicle.bodyNumber || "—",
          franchiseNumber: vehicle.franchiseNumber || "—",
          operatorName,
          franchiseExpiryDate: formattedDate,
          status,
        });
      }

      setFranchises(franchisesList);
    } catch (err) {
      console.error("Error fetching franchises:", err);
      setError("Failed to load franchises data");
      toast.error("Failed to load franchises");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<FranchiseData>[] = [
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      size: 140,
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {row.getValue("plateNumber")}
        </span>
      ),
    },
    {
      accessorKey: "bodyNumber",
      header: "Body Number",
      size: 140,
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("bodyNumber")}</span>
      ),
    },
    {
      accessorKey: "franchiseNumber",
      header: "Franchise Number",
      size: 160,
      cell: ({ row }) => (
        <span className="font-semibold text-purple-600">
          {row.getValue("franchiseNumber")}
        </span>
      ),
    },
    {
      accessorKey: "operatorName",
      header: "Operator",
      size: 180,
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("operatorName")}</span>
      ),
    },
    {
      accessorKey: "franchiseExpiryDate",
      header: "Expiry Date",
      size: 140,
      cell: ({ row }) => {
        const date = row.getValue("franchiseExpiryDate") as string;
        return <span className="text-gray-700">{date}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const status = row.getValue("status") as "active" | "expired";
        return (
          <Badge
            className={`${
              status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status === "active" ? "Active" : "Expired"}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <Header />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Franchise Management
            </h1>
            <p className="text-gray-600">
              View all active and expired franchises
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Franchises</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-sm text-red-600 font-medium mb-4">{error}</p>
              )}

              {!loading && franchises.length === 0 && !error && (
                <p className="text-sm text-gray-600">
                  No franchises found.
                </p>
              )}

              {franchises.length > 0 && (
                <div className="overflow-x-auto">
                  <DataTable
                    data={franchises}
                    columns={columns}
                    showOrderNumbers={true}
                    rowsPerPage={10}
                    showPagination={true}
                    showColumnFilter={true}
                    showColumnToggle={true}
                    emptyMessage="No franchises found."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default FranchisesPage;
