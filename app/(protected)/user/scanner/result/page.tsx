"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AddCommendationModal from "./_components/AddCommendationModal";
import AddComplaintModal from "./_components/AddComplaintModal";
import { Button } from "@/components/ui/button";
import Header from "@/components/commuter/trip-history-header";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";
import { getDriverVehicles } from "@/lib/services/VehicleService";

interface DriverInfo {
  id: string;
  name: string;
  licenseNumber?: string;
  vehicleType?: string;
  plateNumber?: string;
}

export default function ScanResultPage() {
  const params = useSearchParams();
  const driverId = params.get("driverId");

  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const [showCommendation, setShowCommendation] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    const fetchDriver = async () => {
      try {
        // Fetch basic driver info
        const res = await fetch(`/api/drivers?id=${driverId}`);
        const data = await res.json();
        setDriver(data);

        // Fetch license number from driverLicenses collection
        const licenseData = await getDriverLicense(driverId);
        if (licenseData?.licenseNumber) {
          setLicenseNumber(licenseData.licenseNumber);
        }

        // Fetch vehicles from vehicles collection
        const vehiclesData = await getDriverVehicles(driverId);
        if (vehiclesData.length > 0) {
          // Get the first vehicle's details
          const firstVehicle = vehiclesData[0];
          setVehicleType(firstVehicle.vehicleType);
          setPlateNumber(firstVehicle.plateNumber);
        }
      } catch (error) {
        console.error("Error fetching driver details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverId]);

  if (loading) return <p className="p-8">Loading...</p>;

  if (!driver)
    return <p className="p-8 text-red-600">Driver not found.</p>;

  return (
    <>
     <Header />
    <main className="max-w-3xl mx-auto px-6 py-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Driver Information</h1>

          <div className="space-y-3">
            <p><strong>Name:</strong> {driver.name}</p>
            <p><strong>License #:</strong> {licenseNumber || "Not provided"}</p>
            <p><strong>Vehicle Type:</strong> {vehicleType || "Not provided"}</p>
            <p><strong>Plate #:</strong> {plateNumber || "Not provided"}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => setShowCommendation(true)}>
              Add Commendation
            </Button>

            <Button variant="destructive" onClick={() => setShowComplaint(true)}>
              File Complaint
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddCommendationModal
        open={showCommendation}
        onClose={() => setShowCommendation(false)}
        driverId={driverId || ""}
        driver={driver}
      />

      <AddComplaintModal
        open={showComplaint}
        onClose={() => setShowComplaint(false)}
        driverId={driverId || ""}
        driver={driver}
      />
    </main>
    </>
  );
}
