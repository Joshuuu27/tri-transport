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
import { submitCommendation, CommendationInput } from "@/lib/services/CommendationService";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { Star, Loader } from "lucide-react";

interface DriverInfo {
  id: string;
  name: string;
  licenseNumber?: string;
  vehicleType?: string;
  plateNumber?: string;
}

interface AddCommendationModalProps {
  open: boolean;
  onClose: () => void;
  driverId: string;
  driver?: DriverInfo;
}

const commendationTypes = [
  "Professionalism",
  "Courtesy",
  "Safe Driving",
  "Cleanliness",
  "Helpfulness",
  "Other",
];

export default function AddCommendationModal({
  open,
  onClose,
  driverId,
  driver,
}: AddCommendationModalProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [formData, setFormData] = useState({
    commendationType: "",
    comment: "",
    phoneNumber: "",
    rating: 5,
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
        commendationType: "",
        comment: "",
        phoneNumber: "",
        rating: 5,
      });
    }
  }, [open]);

  const handleInputChange = (
    field: string,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async () => {
    // Validation
    if (!formData.commendationType) {
      toast.error("Please select a commendation type");
      return;
    }
    if (!formData.comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    try {
      setLoading(true);

      const commendationData: CommendationInput = {
        commuterId: user!.uid,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "",
        phoneNumber: formData.phoneNumber || undefined,
        driverId: driverId,
        driverName: driver?.name,
        plateNumber: plateNumber || driver?.plateNumber,
        rating: formData.rating,
        comment: formData.comment,
        commendationType: formData.commendationType,
      };

      await submitCommendation(commendationData);

      toast.success("Driver commendation has been saved.");
      setFormData({
        commendationType: "",
        comment: "",
        phoneNumber: "",
        rating: 5,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting commendation:", error);
      toast.error("Failed to submit commendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Commendation</DialogTitle>
          <DialogDescription>
            Share your positive experience with this driver.
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
          <Label>Rating: {formData.rating} / 5</Label>
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
            className="mt-2"
            placeholder="Write your commendation..."
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            rows={4}
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
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
