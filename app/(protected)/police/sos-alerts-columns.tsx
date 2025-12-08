"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export interface SOSAlert {
  id: string;
  commuterId: string;
  commuterName: string;
  phoneNumber: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  timestamp: Date;
  status: string;
}

export const createSOSAlertColumns = (
  onViewDetails?: (alert: SOSAlert) => void
): ColumnDef<SOSAlert>[] => [
  {
    accessorKey: "commuterName",
    header: "Commuter Name",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "timestamp",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = row.original.timestamp;
      return (
        <span>
          {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "pending";
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        responding: "bg-blue-100 text-blue-800",
        resolved: "bg-green-100 text-green-800",
      };
      return (
        <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const alert = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(alert)}>
                View Details
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
