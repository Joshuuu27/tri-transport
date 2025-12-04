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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorId: string;
  onSuccess: () => void;
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  operatorId,
  onSuccess,
}: AddVehicleModalProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [bodyNumber, setBodyNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [color, setColor] = useState("");
  const [franchiseNumber, setFranchiseNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddVehicle = async () => {
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

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: plateNumber.trim(),
          bodyNumber: bodyNumber.trim(),
          vehicleType: vehicleType.trim(),
          color: color.trim(),
          franchiseNumber: franchiseNumber.trim() || null,
          operatorId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add vehicle");
      }

      toast.success("Vehicle added successfully");
      setPlateNumber("");
      setBodyNumber("");
      setVehicleType("");
      setColor("");
      setFranchiseNumber("");
      onSuccess();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle to this operator
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
            />
          </div>

          <div>
            <Label htmlFor="vehicleType" className="text-sm font-medium mb-2">
              Vehicle Type *
            </Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
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
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddVehicle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
