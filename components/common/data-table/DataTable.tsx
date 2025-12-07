"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  VisibilityState,
  Table as TanStackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown, Columns2 } from "lucide-react";
import { DataTableFilter } from "./DataTableFilter";

interface DataTableProps<TData> {
  data?: TData[];
  columns?: ColumnDef<TData>[];
  table?: TanStackTable<TData>;
  className?: string;
  showOrderNumbers?: boolean;
  rowsPerPage?: number;
  onRowClick?: (row: TData) => void;
  showPagination?: boolean;
  showColumnFilter?: boolean;
  showColumnToggle?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData>({
  data,
  columns,
  table: externalTable,
  className = "",
  showOrderNumbers = true,
  rowsPerPage = 10,
  onRowClick,
  showPagination = true,
  showColumnFilter = true,
  showColumnToggle = true,
  emptyMessage = "No data was found.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: rowsPerPage,
  });

  // If external table is provided, use it; otherwise create internal table
  let table: TanStackTable<TData>;
  let numberedColumns: ColumnDef<TData>[];
  let filterColumns: ColumnDef<TData>[];

  if (externalTable) {
    // Use external table from useDataTable hook
    table = externalTable;
    // Extract column definitions from the table
    numberedColumns = table.getAllColumns().map(col => col.columnDef) as ColumnDef<TData>[];
    filterColumns = numberedColumns;
  } else {
    // Create internal table with data and columns
    if (!data || !columns) {
      throw new Error("Either 'table' prop or both 'data' and 'columns' props must be provided");
    }

    /**
     * AUTO-INJECT ROW NUMBER COLUMN
     */
    numberedColumns = showOrderNumbers
      ? [
          {
            id: "__rowNumber",
            header: "#",
            cell: ({ row }) =>
              row.index + 1 + pagination.pageIndex * pagination.pageSize,
            enableSorting: false,
            enableHiding: false,
            size: 50,
          },
          ...columns,
        ]
      : columns;

    filterColumns = columns;

    table = useReactTable({
      data,
      columns: numberedColumns,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });
  }

  return (
    <>
      {/* Table Controls */}
      {(showColumnFilter || showColumnToggle) && (
        <div className="flex items-center pb-2">
          {showColumnFilter && (
            <DataTableFilter table={table} columns={filterColumns} />
          )}

          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 ml-auto text-sm"
                >
                  <Columns2 className="mr-2 h-4 w-4" />
                  Customize Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <div className={`rounded-md border ${className}`}>
        <Table>
          <TableHeader className="bg-slate-50 my-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-neutral-500 font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-gray-100" : ""
                  }
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={numberedColumns.length}
                  className="text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
