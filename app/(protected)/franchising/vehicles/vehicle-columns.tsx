"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText, Award, Edit2, Trash2, History } from "lucide-react";

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
  onDelete: (vehicle: OperatorVehicle) => void;
  onViewRenewalHistory: (vehicle: OperatorVehicle) => void;
}

export const createVehicleColumns = ({
  onViewReports,
  onViewCommendations,
  onEdit,
  onDelete,
  onViewRenewalHistory,
}: VehicleColumnsProps): ColumnDef<OperatorVehicle>[] => [
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
    accessorKey: "operatorName",
    header: "Operator Name",
    cell: ({ row }) => {
      const operatorName = row.getValue("operatorName");
      return (
        <span className="capitalize">
          {String(operatorName || "N/A")}
        </span>
      );
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
          <DropdownMenuContent align="end" className="w-56">
            {/* <DropdownMenuItem
              onClick={() => onEdit(vehicle)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Vehicle Details
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => onViewRenewalHistory(vehicle)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Renewal History
            </DropdownMenuItem>
            {hasDriver ? (
              <>
                {/* <DropdownMenuItem
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
                </DropdownMenuItem> */}
              </>
            ) : (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                No driver assigned
              </div>
            )}
            {/* <DropdownMenuItem
              onClick={() => onDelete(vehicle)}
              className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Vehicle
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
