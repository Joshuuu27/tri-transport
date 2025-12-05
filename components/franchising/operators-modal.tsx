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
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Calendar } from "lucide-react";
import { toast } from "react-toastify";

interface Operator {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  createdAt?: any;
  phone?: string;
  role: string;
}

interface OperatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorsModal: React.FC<OperatorsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
    }
  }, [isOpen]);

  const fetchOperators = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/operators");
      if (!response.ok) throw new Error("Failed to fetch operators");
      const data = await response.json();
      setOperators(data);
    } catch (error) {
      console.error("Error fetching operators:", error);
      toast.error("Failed to load operators");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Operator>[] = [
    {
      accessorKey: "name",
      header: "Operator Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
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
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{row.original.companyName || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Registered Date",
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
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Registered Operators ({operators.length})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable<Operator>
            data={operators}
            columns={columns}
            emptyMessage="No operators registered yet"
            showPagination={true}
            rowsPerPage={10}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
