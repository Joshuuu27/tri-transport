"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "react-toastify";

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

      const handleDelete = async () => {
        if (
          !confirm(
            `Are you sure you want to delete driver "${driver.name}"? This action cannot be undone.`
          )
        ) {
          return;
        }

        try {
          console.log("Sending DELETE request to /api/drivers/" + driver.id);
          const response = await fetch(`/api/drivers/${driver.id}`, {
            method: "DELETE",
          });

          console.log("Response status:", response.status);
          console.log("Response ok:", response.ok);
          
          let data: any = {};
          const contentType = response.headers.get("content-type");
          console.log("Content-Type:", contentType);
          
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            const text = await response.text();
            console.log("Response text:", text);
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.log("Could not parse response as JSON");
            }
          }
          
          console.log("Parsed response data:", data);
          
          if (!response.ok) {
            console.error("Delete failed with status:", response.status);
            toast.error(data.error || `Failed to delete driver (Status: ${response.status})`);
            return;
          }

          toast.success(`Driver "${driver.name}" deleted successfully`);
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error("Delete error:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to delete driver: ${errorMsg}`);
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
              onClick={() => (window.location.href = `/franchising/drivers/${driver.id}`)}
            >
              View
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => (window.location.href = `/franchising/drivers/${driver.id}/qr`)}
            >
              Generate QR
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => (window.location.href = `/drivers/${driver.id}/edit`)}
            >
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
