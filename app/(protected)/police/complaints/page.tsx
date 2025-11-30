"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReportCase, getAllReportCases, updateReportStatus } from "@/lib/services/ReportService";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";

interface ReportWithPlateNumber extends ReportCase {
  fetchedPlateNumber?: string;
}

export default function ComplaintsPage() {
  const [reports, setReports] = useState<ReportWithPlateNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithPlateNumber | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"pending" | "investigating" | "resolved">("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  const columns: ColumnDef<ReportWithPlateNumber>[] = [
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
      accessorKey: "commuterName",
      header: "Commuter Name",
      cell: ({ row }) => row.getValue("commuterName") || "N/A",
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
        const report = row.original;
        let statusColor = "";
        if (status === "pending") statusColor = "text-yellow-600";
        else if (status === "investigating") statusColor = "text-blue-600";
        else if (status === "resolved") statusColor = "text-green-600";

        return (
          <div className="flex items-center gap-2">
            <span className={`capitalize font-medium ${statusColor}`}>
              {status}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReport(report);
                setNewStatus(status as "pending" | "investigating" | "resolved");
                setIsStatusDialogOpen(true);
              }}
            >
              Change
            </Button>
          </div>
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
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAllReportCases();

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
                fetchedPlateNumber = report.plateNumber || report.vehicleNumber || "";
              }
            } catch (error) {
              console.error(`Error fetching vehicle for driver ${report.driverId}:`, error);
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
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;

    try {
      setIsUpdating(true);
      await updateReportStatus(selectedReport.id, newStatus);
      toast.success("Complaint status updated successfully!");
      setIsStatusDialogOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update complaint status");
    } finally {
      setIsUpdating(false);
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
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600 mt-2">
            View and manage reported complaints from commuters
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            data={reports}
            columns={columns}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={true}
            showColumnToggle={true}
            emptyMessage="No complaints found."
          />
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Report Type</p>
                <p className="font-semibold capitalize">{selectedReport.reportType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-semibold capitalize">{selectedReport.status}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(value: any) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
