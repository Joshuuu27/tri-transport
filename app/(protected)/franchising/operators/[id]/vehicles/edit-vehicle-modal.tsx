"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Vehicle } from "./operator-vehicles-table";
import { Loader2 } from "lucide-react";

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export default function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}: EditVehicleModalProps) {
  const [franchiseNumber, setFranchiseNumber] = useState(
    vehicle.franchiseNumber || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!franchiseNumber.trim()) {
      toast.error("Please enter a franchise number");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/vehicles/${vehicle.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            franchiseNumber: franchiseNumber.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      toast.success("Franchise number updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update franchise number");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update the franchise number for vehicle {vehicle.plateNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2">Plate Number</Label>
            <Input value={vehicle.plateNumber} disabled />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2">Vehicle Type</Label>
            <Input value={vehicle.vehicleType || "N/A"} disabled />
          </div>

          <div>
            <Label htmlFor="franchiseNumber" className="text-sm font-medium mb-2">
              Franchise Number
            </Label>
            <Input
              id="franchiseNumber"
              value={franchiseNumber}
              onChange={(e) => setFranchiseNumber(e.target.value)}
              placeholder="Enter franchise number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
