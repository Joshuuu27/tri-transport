"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Operator } from "./operators-table";
import { Loader2 } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType?: string;
}

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: Operator;
  onSuccess: () => void;
}

export default function AddDriverModal({
  isOpen,
  onClose,
  operator,
  onSuccess,
}: AddDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch drivers and operator's vehicles
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch drivers with role="driver"
        const driversRes = await fetch(
          "/api/drivers?role=driver"
        );
        if (!driversRes.ok) throw new Error("Failed to fetch drivers");
        const driversData = await driversRes.json();
        setDrivers(driversData);

        // Fetch operator's vehicles
        const vehiclesRes = await fetch(
          `/api/operators/${operator.id}/vehicles`
        );
        if (!vehiclesRes.ok) throw new Error("Failed to fetch vehicles");
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load drivers or vehicles");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, operator.id]);

  const handleAssign = async () => {
    if (!selectedDriver || !selectedVehicle) {
      toast.error("Please select both driver and vehicle");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/operators/${operator.id}/assign-driver`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: selectedDriver,
            vehicleId: selectedVehicle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign driver");
      }

      toast.success("Driver assigned successfully");
      setSelectedDriver("");
      setSelectedVehicle("");
      onSuccess();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign driver");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver to {operator.name}</DialogTitle>
          <DialogDescription>
            Select a driver and vehicle to assign to this operator
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Driver Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Driver
              </label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-drivers" disabled>
                      No drivers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Vehicle
              </label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} (
                        {vehicle.vehicleType || "Unknown type"})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-vehicles" disabled>
                      No vehicles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={isLoading || !selectedDriver || !selectedVehicle}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Driver"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
