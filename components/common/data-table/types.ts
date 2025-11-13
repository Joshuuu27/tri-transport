import { ColumnDef, Table } from "@tanstack/react-table";

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  className?: string;
  showOrderNumbers?: boolean;
  rowsPerPage?: number;
  onRowClick?: (row: TData) => void;
  showPagination?: boolean;
  showColumnFilter?: boolean;
  showColumnToggle?: boolean;
  emptyMessage?: string;
}

export interface DataTableFilterProps<TData> {
  table: Table<TData>;
  columns: ColumnDef<TData>[];
}
