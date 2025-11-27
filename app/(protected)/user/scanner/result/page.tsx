"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AddCommendationModal from "./_components/AddCommendationModal";
import AddComplaintModal from "./_components/AddComplaintModal";
import { Button } from "@/components/ui/button";
import Header from "@/components/commuter/trip-history-header";

export default function ScanResultPage() {
  const params = useSearchParams();
  const driverId = params.get("driverId");

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCommendation, setShowCommendation] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    const fetchDriver = async () => {
      const res = await fetch(`/api/drivers?id=${driverId}`);
      const data = await res.json();
      setDriver(data);
      setLoading(false);
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

          <p><strong>Name:</strong> {driver.name}</p>
          <p><strong>License #:</strong> {driver.licenseNumber}</p>
          <p><strong>Vehicle:</strong> {driver.vehicleType}</p>
          <p><strong>Plate #:</strong> {driver.plateNumber}</p>

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
        driverId={driverId}
      />

      <AddComplaintModal
        open={showComplaint}
        onClose={() => setShowComplaint(false)}
        driverId={driverId}
      />
    </main>
    </>
  );
}
