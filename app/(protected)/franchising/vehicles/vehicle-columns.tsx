"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText, Award, Edit2 } from "lucide-react";

export interface OperatorVehicle {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  color?: string;
  franchiseNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverLicenseNumber?: string;
  operatorId?: string;
  operatorName?: string;
  createdAt?: any;
}

interface VehicleColumnsProps {
  onViewReports: (vehicle: OperatorVehicle) => void;
  onViewCommendations: (vehicle: OperatorVehicle) => void;
  onEdit: (vehicle: OperatorVehicle) => void;
}

export const createVehicleColumns = ({
  onViewReports,
  onViewCommendations,
  onEdit,
}: VehicleColumnsProps): ColumnDef<OperatorVehicle>[] => [
  {
    accessorKey: "plateNumber",
    header: "Plate Number",
    cell: ({ row }) => {
      const plate = row.getValue("plateNumber");
      return (
        <span className="font-semibold text-blue-600">
          {String(plate || "N/A")}
        </span>
      );
    },
  },
  {
    accessorKey: "bodyNumber",
    header: "Body Number",
    cell: ({ row }) => {
      const bodyNumber = row.getValue("bodyNumber");
      return <span>{String(bodyNumber || "N/A")}</span>;
    },
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle Type",
    cell: ({ row }) => {
      const vehicleType = row.getValue("vehicleType");
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {String(vehicleType || "N/A")}
        </span>
      );
    },
  },
  {
    accessorKey: "franchiseNumber",
    header: "Franchise Number",
    cell: ({ row }) => {
      const franchiseNumber = row.getValue("franchiseNumber");
      return franchiseNumber ? (
        <span className="font-semibold text-purple-600">
          {String(franchiseNumber)}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "assignedDriverName",
    header: "Driver Name",
    cell: ({ row }) => {
      const driverName = row.getValue("assignedDriverName");
      return (
        <span className="capitalize">
          {String(driverName || "No driver assigned")}
        </span>
      );
    },
  },
  {
    accessorKey: "driverLicenseNumber",
    header: "License Number",
    cell: ({ row }) => {
      const licenseNumber = row.getValue("driverLicenseNumber");
      return <span>{String(licenseNumber || "N/A")}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const vehicle = row.original;
      const hasDriver = !!vehicle.assignedDriverId;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onEdit(vehicle)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Vehicle Details
            </DropdownMenuItem>
            {hasDriver ? (
              <>
                <DropdownMenuItem
                  onClick={() => onViewReports(vehicle)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Driver Reports
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewCommendations(vehicle)}
                  className="flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  View Commendations
                </DropdownMenuItem>
              </>
            ) : (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                No driver assigned
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
