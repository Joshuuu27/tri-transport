"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { OperatorVehicleData } from "./vehicle-columns";
import { AlertCircle } from "lucide-react";

interface DeleteVehicleModalProps {
  vehicle: OperatorVehicleData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteVehicleModal({
  vehicle,
  open,
  onOpenChange,
  onDeleted,
}: DeleteVehicleModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!vehicle) {
      toast.error("Vehicle not found");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete vehicle");
      }

      toast.success("Vehicle deleted successfully!");
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete vehicle"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vehicle?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Plate: {vehicle?.plateNumber}</p>
              <p className="text-xs mt-1">
                This action cannot be undone. The vehicle will be permanently
                removed from the system.
              </p>
            </div>
          </div>
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
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
