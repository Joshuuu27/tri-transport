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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface Vehicle {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  color?: string;
  franchiseNumber?: string;
  operatorId: string;
}

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
  const [plateNumber, setPlateNumber] = useState("");
  const [bodyNumber, setBodyNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [color, setColor] = useState("");
  const [franchiseNumber, setFranchiseNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vehicle && isOpen) {
      setPlateNumber(vehicle.plateNumber || "");
      setBodyNumber(vehicle.bodyNumber || "");
      setVehicleType(vehicle.vehicleType || "");
      setColor(vehicle.color || "");
      setFranchiseNumber(vehicle.franchiseNumber || "");
    }
  }, [vehicle, isOpen]);

  const handleSave = async () => {
    if (!plateNumber.trim()) {
      toast.error("Please enter a plate number");
      return;
    }

    if (!bodyNumber.trim()) {
      toast.error("Please enter a body number");
      return;
    }

    if (!vehicleType.trim()) {
      toast.error("Please select a vehicle type");
      return;
    }

    if (!color.trim()) {
      toast.error("Please enter a color");
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
            plateNumber: plateNumber.trim(),
            bodyNumber: bodyNumber.trim(),
            vehicleType: vehicleType.trim(),
            color: color.trim(),
            franchiseNumber: franchiseNumber.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      toast.success("Vehicle details updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
          <DialogDescription>
            Update details for vehicle {vehicle.plateNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="plateNumber" className="text-sm font-medium mb-2">
              Plate Number *
            </Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g., ABC-1234"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="bodyNumber" className="text-sm font-medium mb-2">
              Body Number *
            </Label>
            <Input
              id="bodyNumber"
              value={bodyNumber}
              onChange={(e) => setBodyNumber(e.target.value)}
              placeholder="e.g., BN-123456"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="vehicleType" className="text-sm font-medium mb-2">
              Vehicle Type *
            </Label>
            <Select value={vehicleType} onValueChange={setVehicleType} disabled={isLoading}>
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baobao">Baobao</SelectItem>
                <SelectItem value="Tricycle">Tricycle</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color" className="text-sm font-medium mb-2">
              Color *
            </Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Red"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="franchiseNumber" className="text-sm font-medium mb-2">
              Franchise Number (Optional)
            </Label>
            <Input
              id="franchiseNumber"
              value={franchiseNumber}
              onChange={(e) => setFranchiseNumber(e.target.value)}
              placeholder="Enter franchise number"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
