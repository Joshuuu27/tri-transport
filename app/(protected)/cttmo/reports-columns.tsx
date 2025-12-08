"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Report {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  reportType: string;
  description: string;
  driverId?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  location?: string;
  incidentDate?: Date;
  createdAt: Date;
  status: "pending" | "resolved" | "investigating";
  imageUrls?: string[];
  // Vehicle details (fetched from vehicles collection)
  bodyNumber?: string;
  vehicleType?: string;
  operatorName?: string;
}

interface ReportColumnsProps {
  onViewDetails: (report: Report) => void;
}

export const createReportColumns = ({
  onViewDetails,
}: ReportColumnsProps): ColumnDef<Report>[] => [
  {
    accessorKey: "commuterName",
    header: "Commuter Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("commuterName")}</span>
    ),
  },
  {
    accessorKey: "reportType",
    header: "Report Type",
    cell: ({ row }) => (
      <span className="capitalize">{String(row.getValue("reportType"))}</span>
    ),
  },
  {
    accessorKey: "plateNumber",
    header: "Vehicle Plate",
    cell: ({ row }) => (
      <span className="font-semibold text-blue-600">
        {String(row.getValue("plateNumber") || "N/A")}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = String(row.getValue("description"));
      return (
        <span className="text-sm text-gray-700 line-clamp-2">{desc}</span>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm">{String(row.getValue("location") || "N/A")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      const statusConfig: Record<string, { bg: string; text: string }> = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
        investigating: { bg: "bg-blue-100", text: "text-blue-800" },
        resolved: { bg: "bg-green-100", text: "text-green-800" },
      };

      const config = statusConfig[status] || statusConfig.pending;
      return (
        <Badge className={`${config.bg} ${config.text} capitalize hover:opacity-80`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      if (!date) return "N/A";
      const createdDate = new Date(date as string);
      return createdDate.toLocaleDateString();
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onViewDetails(report)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
