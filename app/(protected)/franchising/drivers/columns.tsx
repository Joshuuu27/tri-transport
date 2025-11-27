"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const columns: ColumnDef<Drivers>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  // ⭐ ACTIONS COLUMN ⭐
  {
    id: "actions",
    cell: ({ row }) => {
      const driver = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => window.location.href = `/drivers/${driver.id}`}
            >
              View
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => window.location.href = `/franchising/drivers/${driver.id}/qr`}
            >
              Generate QR
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => window.location.href = `/drivers/${driver.id}/edit`}
            >
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                if (confirm(`Delete driver ${driver.name}?`)) {
                  fetch(`/api/drivers/${driver.id}`, {
                    method: "DELETE",
                  }).then(() => window.location.reload());
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
