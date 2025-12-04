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
import { Vehicle } from "./operator-vehicles-table";
import { Loader2 } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  operatorId: string;
  onSuccess: () => void;
}

export default function AssignDriverModal({
  isOpen,
  onClose,
  vehicle,
  operatorId,
  onSuccess,
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState(
    vehicle.assignedDriverId || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDrivers = async () => {
      try {
        setIsLoadingDrivers(true);
        const res = await fetch("/api/drivers?role=driver");
        if (!res.ok) throw new Error("Failed to fetch drivers");
        const data = await res.json();
        setDrivers(data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        toast.error("Failed to load drivers");
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/vehicles/${vehicle.id}/assign-driver`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: selectedDriver,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign driver");
      }

      toast.success("Driver assigned successfully");
      onSuccess();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign driver");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDriverName = drivers.find(
    (d) => d.id === selectedDriver
  )?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to vehicle {vehicle.plateNumber}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDrivers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vehicle Details
              </label>
              <div className="space-y-2 p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <span className="text-gray-600">Plate:</span>{" "}
                  <span className="font-semibold">{vehicle.plateNumber}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Type:</span>{" "}
                  <span className="font-semibold">
                    {vehicle.vehicleType || "N/A"}
                  </span>
                </p>
                {vehicle.franchiseNumber && (
                  <p className="text-sm">
                    <span className="text-gray-600">Franchise:</span>{" "}
                    <span className="font-semibold">
                      {vehicle.franchiseNumber}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Driver
              </label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span className="text-gray-500">No driver (Unassign)</span>
                  </SelectItem>
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

            {selectedDriverName && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Current Selection:</span>{" "}
                  {selectedDriverName}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
