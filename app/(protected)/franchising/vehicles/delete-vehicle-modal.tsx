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
import { AlertTriangle, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { OperatorVehicle } from "./vehicle-columns";

interface DeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: OperatorVehicle | null;
  onDeleted: () => void;
}

export const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onDeleted,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (!vehicle?.id) {
      toast.error("Vehicle information missing");
      return;
    }

    try {
      setIsLoading(true);

      // Call API to delete vehicle with password verification
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete vehicle");
      }

      toast.success("Vehicle deleted successfully");
      setPassword("");
      onClose();
      onDeleted();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(error.message || "Failed to delete vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
      setShowPassword(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <DialogTitle>Delete Vehicle</DialogTitle>
          </div>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the vehicle
            from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Vehicle to Delete:</p>
            <p className="text-lg font-bold text-red-600">{vehicle?.plateNumber}</p>
            {vehicle?.bodyNumber && (
              <p className="text-sm text-gray-600">
                Body Number: {vehicle.bodyNumber}
              </p>
            )}
            {vehicle?.vehicleType && (
              <p className="text-sm text-gray-600">
                Type: {vehicle.vehicleType}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Enter your password to confirm *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleDelete();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              You need to enter your password to delete this vehicle.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Deleting this vehicle cannot be reversed.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !password.trim()}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Vehicle"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
