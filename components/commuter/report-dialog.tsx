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
import { submitReportCase, ReportCaseInput } from "@/lib/services/ReportService";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

interface ReportDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportSubmitted?: () => void;
}

const reportTypes = [
  "Safety Concern",
  "Rude Behavior",
  "Dangerous Driving",
  "Vehicle Condition",
  "Price Dispute",
  "Lost Item",
  "Other",
];

export function ReportDialogComponent({
  userId,
  open,
  onOpenChange,
  onReportSubmitted,
}: ReportDialogProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingPlate, setFetchingPlate] = useState(false);
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    driverId: "",
    plateNumber: "",
    location: "",
    phoneNumber: "",
    incidentDate: "",
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
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    try {
      setLoading(true);

      const reportData: ReportCaseInput = {
        commuterId: userId,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "", 
        phoneNumber: formData.phoneNumber,
        reportType: formData.reportType,
        description: formData.description,
        driverId: formData.driverId ,
        plateNumber: formData.plateNumber ,
        location: formData.location ,
        incidentDate: formData.incidentDate
          ? new Date(formData.incidentDate)
          : undefined,
      };

      await submitReportCase(reportData);

      // Reset form
      setFormData({
        reportType: "",
        description: "",
        driverId: "",
        plateNumber: "",
        location: "",
        phoneNumber: "",
        incidentDate: "",
      });

      onOpenChange(false);
      onReportSubmitted?.();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>File a Report</DialogTitle>
          <DialogDescription>
            Provide details about your incident or concern. All information will
            be securely recorded.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select
              value={formData.reportType}
              onValueChange={(value) => handleInputChange("reportType", value)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Driver ID */}
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID (Optional)</Label>
              <Input
                id="driverId"
                placeholder="Driver ID if known"
                value={formData.driverId}
                onChange={(e) => handleInputChange("driverId", e.target.value)}
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

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Where did it happen?"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            {/* Incident Date */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="incidentDate">Incident Date (Optional)</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                value={formData.incidentDate}
                onChange={(e) =>
                  handleInputChange("incidentDate", e.target.value)
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
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
