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
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
  // Step 1: Vehicle Details
  const [plateNumber, setPlateNumber] = useState("");
  const [bodyNumber, setBodyNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [color, setColor] = useState("");

  // Step 2: Franchise Details
  const [franchiseNumber, setFranchiseNumber] = useState("");
  const [franchiseExpirationDate, setFranchiseExpirationDate] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate default franchise expiration date (1 year from today)
  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format for input
  };

  // Initialize default expiration date when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open && !franchiseExpirationDate) {
      setFranchiseExpirationDate(getDefaultExpirationDate());
    }
    if (!open) {
      onClose();
    }
  };

  const validateStep1 = () => {
    if (!plateNumber.trim()) {
      toast.error("Please enter a plate number");
      return false;
    }
    if (!bodyNumber.trim()) {
      toast.error("Please enter a body number");
      return false;
    }
    if (!vehicleType.trim()) {
      toast.error("Please select a vehicle type");
      return false;
    }
    if (!color.trim()) {
      toast.error("Please enter a color");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!franchiseExpirationDate) {
      toast.error("Please select a franchise expiration date");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleAddVehicle = async () => {
    if (!validateStep2()) {
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
          franchiseExpirationDate: franchiseExpirationDate,
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
      setFranchiseExpirationDate("");
      setCurrentStep(1);
      onSuccess();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 2 - {currentStep === 1 ? "Vehicle Details" : "Franchise Details"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              currentStep >= 1 ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        </div>

        {/* Step 1: Vehicle Details */}
        {currentStep === 1 && (
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

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
              <p className="text-sm font-medium text-gray-700">
                ℹ️ Date Added: {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Franchise Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
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

            <div>
              <Label htmlFor="franchiseExpirationDate" className="text-sm font-medium mb-2">
                Franchise Expiration Date *
              </Label>
              <Input
                id="franchiseExpirationDate"
                type="date"
                value={franchiseExpirationDate}
                onChange={(e) => setFranchiseExpirationDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Default is 1 year from today: {new Date(getDefaultExpirationDate()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Summary</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Plate:</span> {plateNumber}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {vehicleType}
                </p>
                <p>
                  <span className="font-medium">Registration Date:</span> {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Expiration Date:</span> {franchiseExpirationDate ? new Date(franchiseExpirationDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-3">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
