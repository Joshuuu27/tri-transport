// src/components/common/data-table/DataTableColumnHeader.tsx
"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DataTableColumnHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

export function DataTableColumnHeader<TData>({
  column,
  title,
}: DataTableColumnHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-3 w-3" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-3 w-3" />
      ) : null}
    </Button>
  );
}
