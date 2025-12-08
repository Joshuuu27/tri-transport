"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/common/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Driver = {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  license_no?: string;
  license?: string;
  assignedVehicleId?: string;
  [key: string]: any;
};

const CttmoDriversPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverDetails, setDriverDetails] = useState<Map<string, any>>(
    new Map()
  );
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicateDrivers, setDuplicateDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/drivers");
        if (!res.ok) {
          throw new Error("Failed to load drivers");
        }
        const data = await res.json();
        setDrivers(data || []);

        // Fetch additional details for each driver (license expiry, vehicle franchise expiry)
        const detailsMap = new Map<string, any>();
        for (const driver of data || []) {
          try {
            const profileRes = await fetch(`/api/drivers/${driver.id}/full-profile`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              detailsMap.set(driver.id, profileData);
            }
          } catch (err) {
            console.error(`Error fetching details for driver ${driver.id}:`, err);
          }
        }
        setDriverDetails(detailsMap);
      } catch (e) {
        console.error(e);
        setError("Unable to load drivers at the moment.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const duplicateLicenseMap = useMemo(() => {
    const counts = new Map<string, number>();
    const licenseTodrivers = new Map<string, string[]>(); // license -> driver ids
    
    // Count license numbers from driverDetails (which has the actual license data)
    for (const [driverId, profileData] of driverDetails.entries()) {
      const licenseNum = profileData?.license?.licenseNumber;
      if (!licenseNum) continue;
      const key = String(licenseNum).trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
      
      if (!licenseTodrivers.has(key)) {
        licenseTodrivers.set(key, []);
      }
      licenseTodrivers.get(key)!.push(driverId);
    }

    return {
      duplicateLicenses: new Set(
        Array.from(counts.entries())
          .filter(([_, count]) => count > 1)
          .map(([key]) => key)
      ),
      licenseToDrivers: licenseTodrivers,
    };
  }, [driverDetails]);

  const handleShowDuplicates = () => {
    const dupeDriverIds = new Set<string>();
    for (const driverIds of duplicateLicenseMap.licenseToDrivers.values()) {
      if (driverIds.length > 1) {
        driverIds.forEach(id => dupeDriverIds.add(id));
      }
    }
    
    const dupeDriverList = drivers.filter(d => dupeDriverIds.has(d.id));
    setDuplicateDrivers(dupeDriverList);
    setShowDuplicatesModal(true);
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    try {
      const d =
        typeof date === "string"
          ? new Date(date)
          : date.toDate?.()
          ? date.toDate()
          : new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const isDateExpired = (date: any) => {
    if (!date) return false;
    try {
      const d =
        typeof date === "string"
          ? new Date(date)
          : date.toDate?.()
          ? date.toDate()
          : new Date(date);
      return d < new Date();
    } catch {
      return false;
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: "Driver Name",
      size: 180,
      cell: ({ row }) => {
        const driver = row.original;
        const profileData = driverDetails.get(driver.id);
        const licenseNum = profileData?.license?.licenseNumber;
        const licenseKey = licenseNum ? String(licenseNum).trim().toLowerCase() : "";
        const isDuplicate = licenseKey && duplicateLicenseMap.duplicateLicenses.has(licenseKey);

        return (
          <div className="space-y-1">
            <span className="font-medium">
              {driver.displayName || driver.name || "—"}
            </span>
            {isDuplicate && (
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                <span className="text-xs font-semibold text-red-600">
                  Duplicate License
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "licenseNumber",
      header: "License Number & Expiry Date",
      size: 220,
      cell: ({ row }) => {
        const driver = row.original;
        const profileData = driverDetails.get(driver.id);
        const licenseInfo = profileData?.license;
        const licenseNum = licenseInfo?.licenseNumber || "—";
        const expiryDate = licenseInfo?.expiryDate;
        const isExpired = isDateExpired(expiryDate);

        return (
          <div className="space-y-1">
            <span className="font-semibold text-green-700">
              {licenseNum}
            </span>
            <div className="text-xs text-gray-600">
              Expires: {formatDate(expiryDate)}
              {isExpired && (
                <span className="ml-2 text-red-600 font-semibold">
                  (Expired)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      size: 140,
      cell: ({ row }) => {
        const driver = row.original;
        const profileData = driverDetails.get(driver.id);
        const vehicle = profileData?.vehicle;
        const plateNumber = vehicle?.plateNumber;

        return (
          <div>
            <span className="font-semibold text-blue-600">
              {plateNumber || "—"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "franchiseNumber",
      header: "Franchise Number & Expiry",
      size: 220,
      cell: ({ row }) => {
        const driver = row.original;
        const profileData = driverDetails.get(driver.id);
        const vehicle = profileData?.vehicle;
        const franchiseNumber = vehicle?.franchiseNumber;
        const franchiseExpiry = vehicle?.franchiseExpirationDate;
        const isExpired = isDateExpired(franchiseExpiry);

        return (
          <div className="space-y-1">
            <span className="font-semibold text-purple-700">
              {franchiseNumber || "—"}
            </span>
            <div className="text-xs text-gray-600">
              Expires: {formatDate(franchiseExpiry)}
              {isExpired && (
                <span className="ml-2 text-red-600 font-semibold">
                  (Expired)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      cell: ({ row }) => {
        const driver = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/cttmo/drivers/${driver.id}`)}
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <CttmoHeader />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        {/* <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Driver Registry</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all registered drivers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
          </div>
        </div> */}

        {/* Duplicate Licenses Alert */}
        {duplicateLicenseMap.duplicateLicenses.size > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <span className="text-sm font-semibold text-yellow-800">
                  {duplicateLicenseMap.duplicateLicenses.size} Duplicate Driver License
                  {duplicateLicenseMap.duplicateLicenses.size > 1 ? "s" : ""} Found
                </span>
                <p className="text-xs text-yellow-700 mt-1">
                  Click below to view all drivers with duplicate licenses
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleShowDuplicates}
            >
              View Duplicates
            </Button>
          </div>
        )}

        {/* Page Header */}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Registered Drivers ({drivers.length})
              </h2>
              {loading && (
                <span className="text-xs text-muted-foreground">
                  Loading drivers…
                </span>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {!loading && drivers.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                No drivers found.
              </p>
            )}

            {drivers.length > 0 && (
              <div className="overflow-x-auto">
                <DataTable
                  data={drivers}
                  columns={columns}
                  showOrderNumbers={true}
                  rowsPerPage={10}
                  showPagination={true}
                  showColumnFilter={true}
                  showColumnToggle={true}
                  emptyMessage="No drivers found."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Duplicate Drivers Modal */}
      <Dialog open={showDuplicatesModal} onOpenChange={setShowDuplicatesModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Drivers with Duplicate License Numbers</DialogTitle>
            <DialogDescription>
              {duplicateDrivers.length} driver(s) have duplicate license numbers
            </DialogDescription>
          </DialogHeader>

          {duplicateDrivers.length > 0 && (
            <div className="overflow-x-auto">
              <DataTable
                data={duplicateDrivers}
                columns={columns}
                showOrderNumbers={true}
                rowsPerPage={10}
                showPagination={true}
                showColumnFilter={true}
                showColumnToggle={true}
                emptyMessage="No duplicate drivers found."
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CttmoDriversPage;

