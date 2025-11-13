
import { useState } from "react";
import { Table, ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DataTableFilterProps<TData> {
  table: Table<TData>;
  columns: ColumnDef<TData>[];
}

// Helper function to get column identifier
const getColumnId = (column: ColumnDef<any>) => {
  if ('accessorKey' in column && column.accessorKey) {
    return column.accessorKey as string;
  }
  if (column.id) {
    return column.id;
  }
  return "";
};

// Helper function to get column header
const getColumnHeader = (column: ColumnDef<any>) => {
  if (typeof column.header === "string") {
    return column.header;
  }
  return getColumnId(column);
};

export function DataTableFilter<TData>({
  table,
  columns,
}: DataTableFilterProps<TData>) {
  // Filter out columns that shouldn't be filterable (like actions, checkboxes, etc.)
  const filteredColumns = columns.filter((column) => {
    const columnId = getColumnId(column);
    return columnId && columnId !== "actions" && columnId !== "select";
  });

  // Get the first filterable column as default
  const defaultColumn = filteredColumns[0];
  const defaultColumnId = getColumnId(defaultColumn);
  const defaultColumnHeader = getColumnHeader(defaultColumn);

  const [selectedColumn, setSelectedColumn] = useState({
    id: defaultColumnId,
    header: defaultColumnHeader,
  });

  const filterValue = table.getColumn(selectedColumn.id)?.getFilterValue() as string ?? "";

  const handleColumnSelect = (column: ColumnDef<TData>) => {
    const columnId = getColumnId(column);
    const columnHeader = getColumnHeader(column);

    // Clear current filter before switching
    table.getColumn(selectedColumn.id)?.setFilterValue("");
    
    setSelectedColumn({
      id: columnId,
      header: columnHeader,
    });
  };

  return (
    <div className="flex items-center space-x-0 relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-r-none cursor-pointer h-8" variant="default">
            Filter <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          {filteredColumns.map((column) => {
            const columnId = getColumnId(column);
            const columnHeader = getColumnHeader(column);
            
            return (
              <DropdownMenuItem
                key={columnId}
                className="cursor-pointer"
                onClick={() => handleColumnSelect(column)}
              >
                {columnHeader}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        placeholder={`Filter by ${selectedColumn.header}...`}
        value={filterValue}
        onChange={(event) =>
          table.getColumn(selectedColumn.id)?.setFilterValue(event.target.value)
        }
        className="max-w-sm h-8 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
