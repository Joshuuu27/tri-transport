"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/app/context/AuthContext";
import { toast } from "react-toastify";
import { submitReportCase, ReportCaseInput } from "@/lib/services/ReportService";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { Loader } from "lucide-react";

interface DriverInfo {
  id: string;
  name: string;
  licenseNumber?: string;
  vehicleType?: string;
  plateNumber?: string;
}

interface AddComplaintModalProps {
  open: boolean;
  onClose: () => void;
  driverId: string;
  driver?: DriverInfo;
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

export default function AddComplaintModal({
  open,
  onClose,
  driverId,
  driver,
}: AddComplaintModalProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    location: "",
    phoneNumber: "",
  });

  // Fetch license and vehicle data when dialog opens
  useEffect(() => {
    if (open && driverId) {
      fetchDriverDetails();
    }
  }, [open, driverId]);

  const fetchDriverDetails = async () => {
    try {
      setFetchingDetails(true);

      // Fetch license information from driverLicenses collection
      const licenseData = await getDriverLicense(driverId);
      if (licenseData?.licenseNumber) {
        setLicenseNumber(licenseData.licenseNumber);
      }

      // Fetch vehicles from vehicles collection
      const vehiclesData = await getDriverVehicles(driverId);
      if (vehiclesData.length > 0) {
        // Get the first vehicle's details
        const firstVehicle = vehiclesData[0];
        setVehicleType(firstVehicle.vehicleType);
        setPlateNumber(firstVehicle.plateNumber);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      // Don't show error toast as this is supplementary data
    } finally {
      setFetchingDetails(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        reportType: "",
        description: "",
        location: "",
        phoneNumber: "",
      });
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async () => {
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
        commuterId: user!.uid,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "",
        phoneNumber: formData.phoneNumber || undefined,
        reportType: formData.reportType,
        description: formData.description,
        driverId: driverId,
        plateNumber: plateNumber || driver?.plateNumber,
        location: formData.location || undefined,
      };

      await submitReportCase(reportData);

      toast.success("Complaint submitted successfully!");
      setFormData({
        reportType: "",
        description: "",
        location: "",
        phoneNumber: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report Complaint</DialogTitle>
          <DialogDescription>
            Report an issue or complaint about this driver
          </DialogDescription>
        </DialogHeader>

        {/* Driver Information Display */}
        {driver && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
            <h3 className="font-semibold text-lg mb-3">{driver.name}</h3>
            {fetchingDetails ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Loading driver details...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">License Number</p>
                  <p className="font-semibold">{licenseNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vehicle Type</p>
                  <p className="font-semibold">{vehicleType || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Plate Number</p>
                  <p className="font-semibold">{plateNumber || "Not provided"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type *</Label>
          <Select
            value={formData.reportType}
            onValueChange={(value: string | undefined) =>
              handleInputChange("reportType", value)
            }
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
            className="mt-2"
            placeholder="Describe your complaint in detail..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
