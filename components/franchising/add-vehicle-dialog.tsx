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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addVehicle, VehicleInput } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";

interface AddVehicleDialogProps {
  driverId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleAdded?: () => void;
}

export function AddVehicleDialog({
  driverId,
  open,
  onOpenChange,
  onVehicleAdded,
}: AddVehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: "",
    bodyNumber: "",
    vehicleType: "",
    color: "",
  });

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.plateNumber.trim()) {
      toast.error("Please provide a plate number");
      return;
    }
    if (!formData.bodyNumber.trim()) {
      toast.error("Please provide a body number");
      return;
    }
    if (!formData.vehicleType) {
      toast.error("Please select a vehicle type");
      return;
    }
    if (!formData.color.trim()) {
      toast.error("Please provide a color");
      return;
    }

    try {
      setLoading(true);

      const vehicleData: VehicleInput = {
        driverId,
        plateNumber: formData.plateNumber,
        bodyNumber: formData.bodyNumber,
        vehicleType: formData.vehicleType as "Baobao" | "Tricycle" | "Other",
        color: formData.color,
      };

      await addVehicle(vehicleData);

      // Reset form
      setFormData({
        plateNumber: "",
        bodyNumber: "",
        vehicleType: "",
        color: "",
      });

      toast.success("Vehicle added successfully!");
      onOpenChange(false);
      onVehicleAdded?.();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle for this driver
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plate Number */}
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number *</Label>
            <Input
              id="plateNumber"
              placeholder="e.g., ABC-1234"
              value={formData.plateNumber}
              onChange={(e) =>
                handleInputChange("plateNumber", e.target.value)
              }
            />
          </div>

          {/* Body Number */}
          <div className="space-y-2">
            <Label htmlFor="bodyNumber">Body Number *</Label>
            <Input
              id="bodyNumber"
              placeholder="e.g., BN-123456"
              value={formData.bodyNumber}
              onChange={(e) =>
                handleInputChange("bodyNumber", e.target.value)
              }
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value: string | undefined) =>
                handleInputChange("vehicleType", value)
              }
            >
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baobao">Baobao</SelectItem>
                <SelectItem value="Tricycle">Tricycle</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Input
              id="color"
              placeholder="e.g., Red"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
            />
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
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
