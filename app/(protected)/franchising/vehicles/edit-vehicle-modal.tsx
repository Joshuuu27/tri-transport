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
import { OperatorVehicle } from "./vehicle-columns";

interface EditVehicleModalProps {
  vehicle: OperatorVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditVehicleModal({
  vehicle,
  open,
  onOpenChange,
  onUpdated,
}: EditVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: "",
    bodyNumber: "",
    vehicleType: "",
    color: "",
  });

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        plateNumber: vehicle.plateNumber || "",
        bodyNumber: vehicle.bodyNumber || "",
        vehicleType: vehicle.vehicleType || "",
        color: vehicle.color || "",
      });
    }
  }, [vehicle, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle) {
      toast.error("Vehicle not found");
      return;
    }

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

      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateNumber: formData.plateNumber,
          bodyNumber: formData.bodyNumber,
          vehicleType: formData.vehicleType,
          color: formData.color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vehicle");
      }

      toast.success("Vehicle updated successfully!");
      onOpenChange(false);
      onUpdated?.();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update vehicle"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update vehicle details for {vehicle?.plateNumber}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) =>
                handleInputChange("vehicleType", value)
              }
              disabled={loading}
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
              disabled={loading}
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
              {loading ? "Updating..." : "Update Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
