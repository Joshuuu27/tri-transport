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
import { Users, Mail, Calendar, Badge } from "lucide-react";
import { toast } from "react-toastify";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: any;
  status?: string;
  licenseNumber?: string;
}

interface DriversModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriversModal: React.FC<DriversModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drivers");
      if (!response.ok) throw new Error("Failed to fetch drivers");
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Inactive
          </span>
        );
      case "suspended":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: "Driver Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-600">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <a
            href={`mailto:${row.original.email}`}
            className="hover:text-blue-600 underline"
          >
            {row.original.email}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.phone || "N/A"}</span>
      ),
    },
    {
      accessorKey: "licenseNumber",
      header: "License Number",
      cell: ({ row }) => (
        <span className="text-sm font-mono text-gray-600">
          {row.original.licenseNumber || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) => {
        const date = row.original.createdAt;
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Registered Drivers ({drivers.length})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable<Driver>
            data={drivers}
            columns={columns}
            emptyMessage="No drivers registered yet"
            showPagination={true}
            rowsPerPage={10}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
