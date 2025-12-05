"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Truck, Calendar, Badge, MapPin } from "lucide-react";
import { toast } from "react-toastify";

interface Vehicle {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  color?: string;
  franchiseNumber?: string;
  operatorId: string;
  operatorName?: string;
  assignedDriverName?: string;
  dateAdded?: any;
  franchiseExpirationDate?: any;
  status?: string;
}

interface VehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehiclesModal: React.FC<VehiclesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-600 uppercase">
            {row.original.plateNumber}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.vehicleType || "N/A"}</span>
      ),
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{
              backgroundColor: row.original.color || "transparent",
            }}
          />
          <span className="text-sm capitalize">
            {row.original.color || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "assignedDriverName",
      header: "Assigned Driver",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.assignedDriverName || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
      cell: ({ row }) => {
        const date = row.original.dateAdded;
        const formattedDate =
          date && date.toDate
            ? date.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : date
              ? new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
        );
      },
    },
    {
      accessorKey: "franchiseExpirationDate",
      header: "Franchise Expires",
      cell: ({ row }) => {
        const date = row.original.franchiseExpirationDate;
        const formattedDate =
          date && date.toDate
            ? date.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : date
              ? new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";
        const isExpiring =
          date &&
          new Date(date.toDate ? date.toDate() : date) < new Date();
        return (
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              isExpiring ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {formattedDate}
          </span>
        );
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Registered Vehicles ({vehicles.length})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable<Vehicle>
            data={vehicles}
            columns={columns}
            emptyMessage="No vehicles registered yet"
            showPagination={true}
            rowsPerPage={10}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
