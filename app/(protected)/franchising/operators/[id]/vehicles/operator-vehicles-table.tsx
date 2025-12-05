"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Users, RotateCcw, History } from "lucide-react";
import { toast } from "react-toastify";
import EditVehicleModal from "./edit-vehicle-modal.tsx";
import AssignDriverModal from "./assign-driver-modal.tsx";
import RenewFranchiseModal from "./renew-franchise-modal.tsx";
import RenewalHistoryModal from "./renewal-history-modal.tsx";

export interface RenewalEntry {
  renewalDate: string;
  expirationDate: string;
  type: "initial_registration" | "renewal";
  remarks: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType?: string;
  franchiseNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  operatorId: string;
  createdAt?: any;
  dateAdded?: any;
  franchiseExpirationDate?: any;
  renewalHistory?: RenewalEntry[];
}

interface OperatorVehiclesTableProps {
  vehicles: Vehicle[];
  operatorId: string;
  onVehiclesUpdated?: () => void;
}

export default function OperatorVehiclesTable({
  vehicles,
  operatorId,
  onVehiclesUpdated,
}: OperatorVehiclesTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {row.getValue("plateNumber")}
        </span>
      ),
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("vehicleType") || "N/A"}</span>
      ),
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
          <span className="text-gray-400">Not Set</span>
        );
      },
    },
    {
      accessorKey: "assignedDriverName",
      header: "Assigned Driver",
      cell: ({ row }) => {
        const driverName = row.getValue("assignedDriverName");
        return driverName ? (
          <span className="text-green-600 font-semibold">{String(driverName)}</span>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
      enableHiding: false,
      cell: ({ row }) => {
        const dateString = row.getValue("dateAdded");
        if (!dateString) return "N/A";
        try {
          const dateObj = new Date(String(dateString));
          if (isNaN(dateObj.getTime())) return "N/A";
          return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return "N/A";
        }
      },
    },
    {
      accessorKey: "franchiseExpirationDate",
      header: "Franchise Expiration",
      enableHiding: false,
      cell: ({ row }) => {
        const dateString = row.getValue("franchiseExpirationDate");
        if (!dateString) return "Not Set";
        try {
          const dateObj = new Date(String(dateString));
          if (isNaN(dateObj.getTime())) return "Not Set";
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateObj.setHours(0, 0, 0, 0);
          const isExpired = dateObj < today;
          return (
            <span className={isExpired ? "text-red-600 font-semibold" : "text-green-600"}>
              {dateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {isExpired && <span className="text-red-600"> (Expired)</span>}
            </span>
          );
        } catch {
          return "Not Set";
        }
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

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Franchise Number
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsAssignDriverOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Assign Driver
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsRenewOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Renew Franchise
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsHistoryOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={vehicles} />

      {selectedVehicle && (
        <>
          <EditVehicleModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            onSuccess={() => {
              setIsEditOpen(false);
              setSelectedVehicle(null);
              onVehiclesUpdated?.();
            }}
          />

          <AssignDriverModal
            isOpen={isAssignDriverOpen}
            onClose={() => {
              setIsAssignDriverOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            operatorId={operatorId}
            onSuccess={() => {
              setIsAssignDriverOpen(false);
              setSelectedVehicle(null);
              onVehiclesUpdated?.();
            }}
          />

          <RenewFranchiseModal
            isOpen={isRenewOpen}
            onClose={() => {
              setIsRenewOpen(false);
              setSelectedVehicle(null);
            }}
            vehicle={selectedVehicle}
            onSuccess={() => {
              setIsRenewOpen(false);
              setSelectedVehicle(null);
              onVehiclesUpdated?.();
            }}
          />

          <RenewalHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => {
              setIsHistoryOpen(false);
              setSelectedVehicle(null);
            }}
            vehiclePlateNumber={selectedVehicle.plateNumber}
            renewalHistory={selectedVehicle.renewalHistory || []}
          />
        </>
      )}
    </>
  );
}
