"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Commendation, getCommuterCommendations } from "@/lib/services/CommendationService";
import { useAuthContext } from "@/app/context/AuthContext";
import { LoadingScreen } from "@/components/common/loading-component";
import { CommendationDialogComponent } from "@/components/commuter/commendation-dialog";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import Header from "@/components/commuter/trip-history-header";

interface CommendationWithPlateNumber extends Commendation {
  fetchedPlateNumber?: string;
}

const columns: ColumnDef<CommendationWithPlateNumber>[] = [
  {
    accessorKey: "commendationType",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue("commendationType")}</div>
    ),
  },
  {
    accessorKey: "driverId",
    header: "Driver ID",
    cell: ({ row }) => {
      const driverId = row.getValue("driverId") as string;
      if (!driverId) return "N/A";
      return `${driverId.substring(0, 6)}...${driverId.substring(driverId.length - 4)}`;
    },
  },
  {
    accessorKey: "driverName",
    header: "Driver Name",
    cell: ({ row }) => row.getValue("driverName") || "N/A",
  },
  {
    accessorKey: "fetchedPlateNumber",
    header: "Plate Number",
    cell: ({ row }) => row.getValue("fetchedPlateNumber") || "N/A",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center gap-1">
          <span className="font-semibold text-yellow-600">{rating}</span>
          <span className="text-gray-400">/5</span>
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-sm">{row.getValue("comment") as string}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Commended Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];

export default function CommendationPage() {
  const { user } = useAuthContext();
  const [commendations, setCommendations] = useState<CommendationWithPlateNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchCommendations();
    }
  }, [user?.uid]);

  const fetchCommendations = async () => {
    try {
      setLoading(true);
      const data = await getCommuterCommendations(user!.uid);
      
      // Fetch plate numbers from vehicles collection for each commendation
      const commendationsWithPlateNumbers = await Promise.all(
        data.map(async (commendation) => {
          let fetchedPlateNumber = "";
          if (commendation.driverId) {
            try {
              const vehicles = await getDriverVehicles(commendation.driverId);
              if (vehicles.length > 0) {
                fetchedPlateNumber = vehicles[0].plateNumber;
              }
            } catch (error) {
              console.error(`Error fetching vehicle for driver ${commendation.driverId}:`, error);
              // Use the plateNumber from commendation as fallback
              fetchedPlateNumber = commendation.plateNumber || "";
            }
          }
          return {
            ...commendation,
            fetchedPlateNumber,
          };
        })
      );
      
      setCommendations(commendationsWithPlateNumbers);
    } catch (error) {
      console.error("Error fetching commendations:", error);
      toast.error("Failed to load commendation history");
    } finally {
      setLoading(false);
    }
  };

  const handleCommendationSubmitted = () => {
    setOpenDialog(false);
    toast.success("Commendation submitted successfully!");
    fetchCommendations();
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
      <div className="max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commendation History</h1>
            <p className="text-gray-600 mt-2">
              View all drivers you've commended
            </p>
          </div>
        {/*   <Button
            onClick={() => setOpenDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Commendation
          </Button> */}
        </div>

        {openDialog && (
          <CommendationDialogComponent
            userId={user!.uid}
            open={openDialog}
            onOpenChange={setOpenDialog}
            onCommendationSubmitted={handleCommendationSubmitted}
          />
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            data={commendations}
            columns={columns}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={true}
            showColumnToggle={true}
            emptyMessage="No commendations yet. Start by commending a great driver!"
          />
        </div>
      </div>
    </>
  );
}
