"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Eye, Edit, Users } from "lucide-react";
import { toast } from "react-toastify";

export type Operator = {
  id: string;
  name: string;
  email: string;
  role: string;
  franchiseNumber?: string;
  createdAt?: any;
};

export const columns: ColumnDef<Operator>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "franchiseNumber",
    header: "Franchise Number",
    cell: ({ row }) => {
      const franchiseNumber = row.getValue("franchiseNumber");
      return franchiseNumber ? String(franchiseNumber) : "N/A";
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role");
      return (
        <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {String(role)}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      if (!date) return "N/A";
      const createdDate = new Date(date);
      return createdDate.toLocaleDateString();
    },
  },
  // ⭐ ACTIONS COLUMN ⭐
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const operator = row.original;

      const handleDelete = async () => {
        if (!confirm(`Delete operator ${operator.name}?`)) return;

        try {
          const response = await fetch(`/api/operators/${operator.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete operator");
          }

          toast.success("Operator deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete operator");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/franchising/operators/${operator.id}`;
              }}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/franchising/operators/${operator.id}/edit`;
              }}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600 flex items-center gap-2"
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
