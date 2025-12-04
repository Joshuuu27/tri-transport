"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { OperatorVehicleData } from "./vehicle-columns";
import { Spinner } from "@/components/ui/spinner";

interface Driver {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignDriverModalProps {
  vehicle: OperatorVehicleData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
}

export function AssignDriverModal({
  vehicle,
  open,
  onOpenChange,
  onAssigned,
}: AssignDriverModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDrivers();
    }
  }, [open]);

  const fetchDrivers = async () => {
    try {
      setFetchingDrivers(true);
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const driversData = await res.json();
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleSubmit = async () => {
    if (!vehicle || !selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setLoading(true);

      const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
      if (!selectedDriver) {
        toast.error("Driver not found");
        return;
      }

      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedDriverId: selectedDriverId,
          assignedDriverName: selectedDriver.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign driver");
      }

      toast.success("Driver assigned successfully!");
      setSelectedDriverId("");
      onOpenChange(false);
      onAssigned?.();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign driver"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Driver to Vehicle</DialogTitle>
          <DialogDescription>
            Assign a driver to vehicle {vehicle?.plateNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetchingDrivers ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Driver</label>
                <Select
                  value={selectedDriverId}
                  onValueChange={setSelectedDriverId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDriverId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Selected Driver:{" "}
                    <strong>
                      {drivers.find((d) => d.id === selectedDriverId)?.name}
                    </strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedDriverId || fetchingDrivers}
          >
            {loading ? "Assigning..." : "Assign Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
