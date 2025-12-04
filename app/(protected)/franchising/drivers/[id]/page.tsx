"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDriverLicense, setDriverLicense } from "@/lib/services/DriverLicenseService";
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
  assignedVehicleId?: string;
}

interface AssignedVehicle {
  id: string;
  plateNumber: string;
  vehicleType?: string;
  bodyNumber?: string;
  franchiseNumber?: string;
  operatorId?: string;
}

export default function DriverDetailsPage() {
  const params = useParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicle | null>(null);
  const [loading, setLoading] = useState(true);
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

        // Fetch assigned vehicle if driver has one
        if (driverData.assignedVehicleId) {
          const vehicleRes = await fetch(`/api/vehicles/${driverData.assignedVehicleId}`);
          if (vehicleRes.ok) {
            const vehicleData = await vehicleRes.json();
            setAssignedVehicle(vehicleData);
          }
        }

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

        {/* Assigned Vehicle Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {assignedVehicle.plateNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {assignedVehicle.vehicleType || "N/A"}
                    </p>
                  </div>
                  {assignedVehicle.franchiseNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Franchise Number</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {assignedVehicle.franchiseNumber}
                      </p>
                    </div>
                  )}
                  <div>
                      <p className="text-sm text-gray-600">Body Number</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {assignedVehicle.bodyNumber}
                      </p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No vehicle assigned to this driver yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
