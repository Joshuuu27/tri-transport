"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  CheckCircle2,
  DollarSign,
  MoreHorizontal,
  Plus,
  Text,
  XCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DataTable, DataTableSortList } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table";
import { DataTableToolbar } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { useRouter } from "next/navigation";
// import customerService from "@/lib/services/CustomerService";

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
}

export default function Drivers() {
  const [firstname] = useQueryState("firstname", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const router = useRouter();
  const [data, setData] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  // fetch from your service
  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const customers: Customer[] = await customerService.getCustomers();
  //       setData(customers);
  //       console.log(customers);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // Ideally we would filter the data server-side, but for the sake of this example, we'll filter the data client-side
  const filteredData = React.useMemo(() => {
    return data.filter((customer) => {
      const matchesTitle =
        firstname === "" ||
        customer.firstname.toLowerCase().includes(firstname.toLowerCase());
      return matchesTitle;
    });
  }, [firstname, data]);

  const columns = React.useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "firstname",
        accessorKey: "firstname",
        header: ({ column }: { column: Column<Customer, unknown> }) => (
          <DataTableColumnHeader column={column} title="First Name" />
        ),
        cell: ({ cell }) => <div>{cell.getValue<Customer["firstname"]>()}</div>,
        meta: {
          label: "First Name",
          placeholder: "Search firstname...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: "lastname",
        accessorKey: "lastname",
        header: ({ column }: { column: Column<Customer, unknown> }) => (
          <DataTableColumnHeader column={column} title="Last Name" />
        ),
        enableColumnFilter: true,
      },
      {
        id: "email",
        accessorKey: "email",
        header: ({ column }: { column: Column<Customer, unknown> }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ cell }) => {
          const email = cell.getValue<Customer["email"]>();

          return (
            <div className="flex items-center gap-1">
              {/* <DollarSign className="size-4" /> */}
              {email.toLocaleString()}
            </div>
          );
        },
        enableColumnFilter: true,
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: ({ column }: { column: Column<Customer, unknown> }) => (
          <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: ({ cell }) => {
          const phone = cell.getValue<Customer["phone"]>();

          return (
            <div className="flex items-center gap-1">
              {/* <DollarSign className="size-4" /> */}
              {phone.toLocaleString()}
            </div>
          );
        },
        enableColumnFilter: true,
      },
      {
        id: "actions",
        cell: function Cell() {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "firstname", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => String(row.id),
  });

  return (
    <>
      <div className="flex space-x-8">
        <h1 className="text-2xl font-bold mb-2">Customers</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => router.push("/sales/customers/new")}
        >
          <Plus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>
      <div className="data-table-container">
        <DataTable table={table}>
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableToolbar>
        </DataTable>
      </div>
    </>
  );
}
