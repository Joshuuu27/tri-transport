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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitCommendation, CommendationInput } from "@/lib/services/CommendationService";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import { Star, Loader } from "lucide-react";

interface CommendationDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommendationSubmitted?: () => void;
}

const commendationTypes = [
  "Professionalism",
  "Courtesy",
  "Safe Driving",
  "Cleanliness",
  "Helpfulness",
  "Other",
];

export function CommendationDialogComponent({
  userId,
  open,
  onOpenChange,
  onCommendationSubmitted,
}: CommendationDialogProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingPlate, setFetchingPlate] = useState(false);
  const [formData, setFormData] = useState({
    commendationType: "",
    comment: "",
    driverId: "",
    driverName: "",
    plateNumber: "",
    phoneNumber: "",
    rating: 5,
  });

  // Fetch plate number when driver ID is provided
  useEffect(() => {
    if (formData.driverId.trim()) {
      fetchPlateNumber();
    } else {
      setFormData((prev) => ({
        ...prev,
        plateNumber: "",
      }));
    }
  }, [formData.driverId]);

  const fetchPlateNumber = async () => {
    try {
      setFetchingPlate(true);
      const vehiclesData = await getDriverVehicles(formData.driverId);
      if (vehiclesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          plateNumber: vehiclesData[0].plateNumber,
        }));
      }
    } catch (error) {
      console.error("Error fetching vehicle plate number:", error);
      // Silent fail - user can still enter it manually
    } finally {
      setFetchingPlate(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.commendationType) {
      toast.error("Please select a commendation type");
      return;
    }
    if (!formData.driverId.trim()) {
      toast.error("Please provide a driver ID");
      return;
    }
    if (!formData.comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    try {
      setLoading(true);

      const commendationData: CommendationInput = {
        commuterId: userId,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "",
        phoneNumber: formData.phoneNumber,
        driverId: formData.driverId,
        driverName: formData.driverName,
        plateNumber: formData.plateNumber,
        rating: formData.rating,
        comment: formData.comment,
        commendationType: formData.commendationType,
      };

      await submitCommendation(commendationData);

      // Reset form
      setFormData({
        commendationType: "",
        comment: "",
        driverId: "",
        driverName: "",
        plateNumber: "",
        phoneNumber: "",
        rating: 5,
      });

      onOpenChange(false);
      onCommendationSubmitted?.();
    } catch (error) {
      console.error("Error submitting commendation:", error);
      toast.error("Failed to submit commendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commend a Driver</DialogTitle>
          <DialogDescription>
            Share your positive experience with a driver. Your feedback helps
            recognize great service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Commendation Type */}
          <div className="space-y-2">
            <Label htmlFor="commendationType">Commendation Type *</Label>
            <Select
              value={formData.commendationType}
              onValueChange={(value: string | undefined) =>
                handleInputChange("commendationType", value)
              }
            >
              <SelectTrigger id="commendationType">
                <SelectValue placeholder="Select commendation type" />
              </SelectTrigger>
              <SelectContent>
                {commendationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating: {formData.rating} / 5</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange("rating", star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment *</Label>
            <Textarea
              id="comment"
              placeholder="Share details about your positive experience..."
              value={formData.comment}
              onChange={(e) => handleInputChange("comment", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Driver ID */}
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID *</Label>
              <Input
                id="driverId"
                placeholder="Driver ID"
                value={formData.driverId}
                onChange={(e) => handleInputChange("driverId", e.target.value)}
              />
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name (Optional)</Label>
              <Input
                id="driverName"
                placeholder="Driver name"
                value={formData.driverName}
                onChange={(e) => handleInputChange("driverName", e.target.value)}
              />
            </div>

            {/* Plate Number */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number (Optional)</Label>
              <div className="relative">
                <Input
                  id="plateNumber"
                  placeholder="Auto-fetched from driver"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    handleInputChange("plateNumber", e.target.value)
                  }
                />
                {fetchingPlate && (
                  <Loader className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Your contact number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Commendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
