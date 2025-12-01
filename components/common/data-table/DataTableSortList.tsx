// src/components/common/data-table/DataTableSortList.tsx
"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface DataTableSortListProps<TData> {
  table: Table<TData>;
}

export function DataTableSortList<TData>({ table }: DataTableSortListProps<TData>) {
  const sorting = table.getState().sorting;

  return (
    <div className="flex space-x-2">
      {table.getAllColumns().map((column) => (
        <Button
          key={column.id}
          size="sm"
          variant="outline"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.id}
          {column.getIsSorted() === "asc"
            ? " ↑"
            : column.getIsSorted() === "desc"
            ? " ↓"
            : ""}
        </Button>
      ))}
    </div>
  );
}
