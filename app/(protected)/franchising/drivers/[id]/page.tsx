"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Vehicle, getDriverVehicles, deleteVehicle } from "@/lib/services/VehicleService";
import { getDriverLicense, setDriverLicense } from "@/lib/services/DriverLicenseService";
import { AddVehicleDialog } from "@/components/franchising/add-vehicle-dialog";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/franchising/franchising-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DriverDetails {
  id: string;
  name: string;
  email: string;
  companyName?: string;
}

const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "plateNumber",
    header: "Plate Number",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("plateNumber")}</span>
    ),
  },
  {
    accessorKey: "bodyNumber",
    header: "Body Number",
    cell: ({ row }) => row.getValue("bodyNumber"),
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("vehicleType")}</span>
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: row.getValue("color") as string }}
        />
        <span className="capitalize">{row.getValue("color")}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicle = row.original;
      const [deleting, setDeleting] = useState(false);

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this vehicle?")) {
          return;
        }

        try {
          setDeleting(true);
          await deleteVehicle(vehicle.id);
          toast.success("Vehicle deleted successfully!");
          window.location.reload();
        } catch (error) {
          toast.error("Failed to delete vehicle");
        } finally {
          setDeleting(false);
        }
      };

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      );
    },
  },
];

export default function DriverDetailsPage() {
  const params = useParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [editingLicense, setEditingLicense] = useState(false);
  const [savingLicense, setSavingLicense] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);

        // Fetch driver details
        const driverRes = await fetch(`/api/drivers?id=${driverId}`);
        const driverData = await driverRes.json();
        setDriver(driverData);

        // Fetch vehicles
        const vehiclesData = await getDriverVehicles(driverId);
        setVehicles(vehiclesData);

        // Fetch license number from Firestore
        const licenseData = await getDriverLicense(driverId);
        if (licenseData?.licenseNumber) {
          setLicenseNumber(licenseData.licenseNumber);
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
        toast.error("Failed to load driver details");
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const handleVehicleAdded = async () => {
    try {
      const vehiclesData = await getDriverVehicles(driverId);
      setVehicles(vehiclesData);
    } catch (error) {
      toast.error("Failed to refresh vehicles");
    }
  };

  const handleSaveLicense = async () => {
    if (!licenseNumber.trim()) {
      toast.error("Please enter a license number");
      return;
    }

    try {
      setSavingLicense(true);
      await setDriverLicense({
        driverId,
        licenseNumber,
      });
      toast.success("License number saved successfully!");
      setEditingLicense(false);
    } catch (error) {
      console.error("Error saving license:", error);
      toast.error("Failed to save license number");
    } finally {
      setSavingLicense(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  if (!driver) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-red-600 text-lg">Driver not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Driver Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold">{driver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold">{driver.email}</p>
              </div>
              {driver.companyName && (
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-lg font-semibold">{driver.companyName}</p>
                </div>
              )}
            </div>

            {/* License Number Section */}
            <div className="border-t pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="licenseNumber" className="text-sm text-gray-600">
                    Driver License Number
                  </Label>
                  {editingLicense ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="Enter license number"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveLicense}
                        disabled={savingLicense}
                      >
                        {savingLicense ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingLicense(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-lg font-semibold">
                        {licenseNumber || "Not provided"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingLicense(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vehicles</CardTitle>
            <Button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vehicles}
              columns={vehicleColumns}
              showOrderNumbers={true}
              rowsPerPage={10}
              showPagination={true}
              showColumnFilter={true}
              showColumnToggle={true}
              emptyMessage="No vehicles added yet. Click 'Add Vehicle' to get started."
            />
          </CardContent>
        </Card>

        {/* Add Vehicle Dialog */}
        <AddVehicleDialog
          driverId={driverId}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onVehicleAdded={handleVehicleAdded}
        />
      </div>
    </>
  );
}
