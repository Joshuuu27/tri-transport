"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/franchising/franchising-header";
import { DataTable } from "@/components/common/data-table";
import { toast } from "react-toastify";
import {
  createVehicleColumns,
  OperatorVehicle,
} from "./vehicle-columns";
import {
  ViewReportsModal,
  ViewCommendationsModal,
} from "./view-driver-details-modals";
import { EditVehicleModal } from "./edit-vehicle-modal";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<OperatorVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isCommendationsOpen, setIsCommendationsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<OperatorVehicle | null>(
    null
  );
  const hasFetched = useRef(false);

  const fetchAllVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");

      let vehiclesData = await res.json();

      // Fetch license numbers for each driver
      const vehiclesWithLicenses = await Promise.all(
        vehiclesData.map(async (vehicle: OperatorVehicle) => {
          if (vehicle.assignedDriverId) {
            try {
              const license = await getDriverLicense(vehicle.assignedDriverId);
              return {
                ...vehicle,
                driverLicenseNumber: license?.licenseNumber || "N/A",
              };
            } catch (error) {
              console.error("Error fetching license:", error);
              return {
                ...vehicle,
                driverLicenseNumber: "N/A",
              };
            }
          }
          return {
            ...vehicle,
            driverLicenseNumber: "N/A",
          };
        })
      );

      setVehicles(vehiclesWithLicenses);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAllVehicles();
    }
  }, [fetchAllVehicles]);

  const handleViewReports = (vehicle: OperatorVehicle) => {
    setSelectedVehicle(vehicle);
    setIsReportsOpen(true);
  };

  const handleViewCommendations = (vehicle: OperatorVehicle) => {
    setSelectedVehicle(vehicle);
    setIsCommendationsOpen(true);
  };

  const handleEdit = (vehicle: OperatorVehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditOpen(true);
  };

  const columns = createVehicleColumns({
    onViewReports: handleViewReports,
    onViewCommendations: handleViewCommendations,
    onEdit: handleEdit,
  });

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Vehicles Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Assigned Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="inline-block">
                    <div className="animate-spin">
                      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-500">Loading vehicles...</p>
                </div>
              </div>
            ) : vehicles.length > 0 ? (
              <DataTable
                columns={columns}
                data={vehicles}
                showOrderNumbers={true}
                rowsPerPage={10}
                showPagination={true}
                showColumnFilter={true}
                showColumnToggle={true}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No vehicles assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* View Reports Modal */}
      <ViewReportsModal
        isOpen={isReportsOpen}
        onClose={() => {
          setIsReportsOpen(false);
          setSelectedVehicle(null);
        }}
        driverId={selectedVehicle?.assignedDriverId}
        driverName={selectedVehicle?.assignedDriverName}
      />

      {/* View Commendations Modal */}
      <ViewCommendationsModal
        isOpen={isCommendationsOpen}
        onClose={() => {
          setIsCommendationsOpen(false);
          setSelectedVehicle(null);
        }}
        driverId={selectedVehicle?.assignedDriverId}
        driverName={selectedVehicle?.assignedDriverName}
      />

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        vehicle={selectedVehicle}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdated={fetchAllVehicles}
      />
    </>
  );
};

export default VehiclesPage;
