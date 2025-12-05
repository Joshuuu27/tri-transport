"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon } from "lucide-react";
import { ReportCase, getCommuterReportHistory } from "@/lib/services/ReportService";
import { useAuthContext } from "@/app/context/AuthContext";
import { LoadingScreen } from "@/components/common/loading-component";
import { ReportDialogComponent } from "@/components/commuter/report-dialog";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import Header from "@/components/commuter/trip-history-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportWithPlateNumber extends ReportCase {
  fetchedPlateNumber?: string;
}

const createColumns = (onViewImages: (imageUrls: string[]) => void): ColumnDef<ReportWithPlateNumber>[] => [
  {
    accessorKey: "reportType",
    header: "Report Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("reportType")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.getValue("description") as string}</div>
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
    accessorKey: "fetchedPlateNumber",
    header: "Plate Number",
    cell: ({ row }) => row.getValue("fetchedPlateNumber") || "N/A",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.getValue("location") || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let statusColor = "";
      if (status === "pending") statusColor = "text-yellow-600";
      else if (status === "investigating") statusColor = "text-blue-600";
      else if (status === "resolved") statusColor = "text-green-600";

      return (
        <span className={`capitalize font-medium ${statusColor}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const report = row.original;
      const hasImages = report.imageUrls && report.imageUrls.length > 0;
      return (
        <Button
          onClick={() => {
            if (hasImages) {
              onViewImages(report.imageUrls!);
            }
          }}
          disabled={!hasImages}
          variant={hasImages ? "default" : "ghost"}
          size="sm"
          className="flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          {hasImages ? `View (${report.imageUrls!.length})` : "No Images"}
        </Button>
      );
    },
  },
];

export default function ReportPage() {
  const { user } = useAuthContext();
  const [reports, setReports] = useState<ReportWithPlateNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    if (user?.uid) {
      fetchReports();
    }
  }, [user?.uid]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getCommuterReportHistory(user!.uid);
      
      // Fetch plate numbers from vehicles collection for each report
      const reportsWithPlateNumbers = await Promise.all(
        data.map(async (report) => {
          let fetchedPlateNumber = "";
          if (report.driverId) {
            try {
              const vehicles = await getDriverVehicles(report.driverId);
              if (vehicles.length > 0) {
                fetchedPlateNumber = vehicles[0].plateNumber;
              } else {
                // If no vehicles found, use stored plateNumber or vehicleNumber as fallback
                fetchedPlateNumber = report.plateNumber || report.vehicleNumber || "";
              }
            } catch (error) {
              console.error(`Error fetching vehicle for driver ${report.driverId}:`, error);
              // Use the plateNumber from report as fallback, or vehicleNumber if plateNumber is not available
              fetchedPlateNumber = report.plateNumber || report.vehicleNumber || "";
            }
          }
          return {
            ...report,
            fetchedPlateNumber,
          };
        })
      );
      
      setReports(reportsWithPlateNumbers);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load report history");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmitted = () => {
    setOpenDialog(false);
    toast.success("Report submitted successfully!");
    fetchReports();
  };

  const handleViewImages = (imageUrls: string[]) => {
    setSelectedImages(imageUrls);
    setImageModalOpen(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Report History</h1>
            <p className="text-gray-600 mt-2">
              View and manage your reported cases
            </p>
          </div>
          <Button
            onClick={() => setOpenDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>

        {openDialog && (
          <ReportDialogComponent
            userId={user!.uid}
            open={openDialog}
            onOpenChange={setOpenDialog}
            onReportSubmitted={handleReportSubmitted}
          />
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            data={reports}
            columns={createColumns(handleViewImages)}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={true}
            showColumnToggle={true}
            emptyMessage="No reports found. Start by creating a new report."
          />
        </div>

        {/* Image Viewer Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Report Images</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4 max-h-96 overflow-y-auto">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="flex flex-col">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <img
                      src={imageUrl}
                      alt={`Report evidence ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-gray-400 transition-all hover:shadow-md"
                    />
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Image {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
