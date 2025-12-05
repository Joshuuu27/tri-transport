"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportCase } from "@/lib/services/ReportService";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";
import { MoreHorizontal, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportWithPlateNumber extends ReportCase {
  fetchedPlateNumber?: string;
}

export default function ComplaintsPage() {
  const [reports, setReports] = useState<ReportWithPlateNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const columns: ColumnDef<ReportWithPlateNumber>[] = [
    {
      accessorKey: "reportType",
      header: "Report Type",
      cell: ({ row }) => <div className="capitalize">{row.getValue("reportType")}</div>,
    },
    {
      accessorKey: "commuterName",
      header: "Commuter Name",
      cell: ({ row }) => row.getValue("commuterName") || "N/A",
    },
    {
      accessorKey: "driverId",
      header: "Driver",
      cell: ({ row }) => {
        const report = row.original;
        const driverName = report.driverName || "N/A";
        
        return <div className="text-sm font-medium">{driverName}</div>;
      },
    },
    {
      accessorKey: "fetchedPlateNumber",
      header: "Plate Number",
      cell: ({ row }) => row.getValue("fetchedPlateNumber") || "N/A",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/police/complaints/${report.id}`);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Use the API endpoint which enriches reports with driver names from users collection
      const response = await fetch("/api/police/complaints");
      if (!response.ok) throw new Error("Failed to fetch complaints");
      
      const data = await response.json();
      console.log("[Police Complaints] Fetched reports:", data);

      // Add fetchedPlateNumber from plateNumber field
      const reportsWithPlateNumbers = data.map((report: any) => {
        return {
          ...report,
          fetchedPlateNumber: report.plateNumber || report.vehicleNumber || "",
        };
      });

      setReports(reportsWithPlateNumbers);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load complaints");
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
      <div className="max-w-5xl mx-auto px-6 py-8 w-full">
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
    </>
  );
}
