"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, UserCheck, Eye } from "lucide-react";

export interface OperatorVehicleData {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverLicenseNumber?: string;
  operatorId?: string;
  color?: string;
  createdAt?: any;
}

interface VehicleColumnsProps {
  onEdit: (vehicle: OperatorVehicleData) => void;
  onDelete: (vehicle: OperatorVehicleData) => void;
  onAssignDriver: (vehicle: OperatorVehicleData) => void;
  onViewDriverDetails: (vehicle: OperatorVehicleData) => void;
}

export const createOperatorVehicleColumns = ({
  onEdit,
  onDelete,
  onAssignDriver,
  onViewDriverDetails,
}: VehicleColumnsProps): ColumnDef<OperatorVehicleData>[] => [
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
    accessorKey: "assignedDriverName",
    header: "Driver Name",
    cell: ({ row }) => {
      const driverName = row.getValue("assignedDriverName");
      return (
        <span className="capitalize">
          {String(driverName || "Unassigned")}
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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {vehicle.assignedDriverId && (
              <>
                <DropdownMenuItem
                  onClick={() => onViewDriverDetails(vehicle)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Driver Details
                </DropdownMenuItem>
                <div className="my-1 border-t" />
              </>
            )}
            <DropdownMenuItem
              onClick={() => onAssignDriver(vehicle)}
              className="flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Assign Driver
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(vehicle)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(vehicle)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
