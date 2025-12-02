// components/DriversTable.tsx
"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DriversContextMenu } from "./DriversContextMenu";

export function DriversTable({ data }) {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField]?.toString().toLowerCase();
    const bVal = b[sortField]?.toString().toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* NAME */}
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("name")}
                className="flex items-center gap-1"
              >
                Name
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>

            {/* CONTACT */}
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("contact")}
                className="flex items-center gap-1"
              >
                Contact
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>

            {/* VEHICLE */}
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("vehicle")}
                className="flex items-center gap-1"
              >
                Vehicle
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.contact}</TableCell>
              <TableCell>{driver.vehicle}</TableCell>

              <TableCell className="text-right">
                <DriversContextMenu driver={driver} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
