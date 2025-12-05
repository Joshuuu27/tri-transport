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
import { Loader, Camera, Upload, X } from "lucide-react";
import { useRef } from "react";

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
  const [step, setStep] = useState<"form" | "images">("form");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    location: "",
    phoneNumber: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      setStep("form");
      setFormData({
        reportType: "",
        description: "",
        location: "",
        phoneNumber: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const proceedToImageUpload = () => {
    // Validation
    if (!formData.reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setStep("images");
  };

  const goBackToForm = () => {
    setStep("form");
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (imageFiles.length + newFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    try {
      setLoading(true);

      // Validate form data
      if (!formData.reportType) {
        toast.error("Please select a report type");
        setLoading(false);
        return;
      }

      if (!formData.description) {
        toast.error("Please enter a description");
        setLoading(false);
        return;
      }

      console.log("Starting complaint submission...");
      console.log("Image files to upload:", imageFiles.length);

      // Upload images to Firebase Storage if any
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        try {
          console.log(`Uploading image: ${file.name} (${file.size} bytes)`);
          const formDataObj = new FormData();
          formDataObj.append("file", file);
          formDataObj.append("type", "report");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formDataObj,
          });

          console.log(`Upload response status: ${uploadRes.status}`);

          if (!uploadRes.ok) {
            let errorData: any = {};
            let rawText = "";
            
            try {
              rawText = await uploadRes.text();
              console.log("Raw response text:", rawText, "Length:", rawText.length);
              
              if (rawText) {
                try {
                  errorData = JSON.parse(rawText);
                } catch (jsonError) {
                  console.error("Could not parse as JSON");
                  errorData = { error: `HTTP ${uploadRes.status}: ${rawText}` };
                }
              } else {
                errorData = { error: `HTTP ${uploadRes.status}: Empty response` };
              }
            } catch (e) {
              console.error("Error reading response:", e);
              errorData = { error: `HTTP ${uploadRes.status}: Could not read response` };
            }
            
            console.error("Upload error response:", errorData, "Status:", uploadRes.status);
            toast.warning(`Failed to upload ${file.name}: ${errorData.error || errorData.message || `HTTP ${uploadRes.status}`}`);
            continue;
          }

          const uploadData = await uploadRes.json();
          console.log("Image uploaded successfully:", uploadData);
          if (uploadData.url) {
            imageUrls.push(uploadData.url);
          } else {
            console.warn("No URL in upload response:", uploadData);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.warning(`Error uploading ${file.name}: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
        }
      }

      console.log("Total images uploaded successfully:", imageUrls.length, imageUrls);

      const reportData: ReportCaseInput & { imageUrls?: string[] } = {
        commuterId: user!.uid,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "",
        phoneNumber: formData.phoneNumber || undefined,
        reportType: formData.reportType,
        description: formData.description,
        driverId: driverId,
        plateNumber: plateNumber || driver?.plateNumber,
        location: formData.location || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      console.log("Report data being submitted:", reportData);

      await submitReportCase(reportData);

      toast.success("Complaint submitted successfully!");
      setFormData({
        reportType: "",
        description: "",
        location: "",
        phoneNumber: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
      setStep("form");
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

        {/* STEP 1: COMPLAINT FORM */}
        {step === "form" && (
          <>
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
                disabled={loading}
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
                onClick={proceedToImageUpload}
                disabled={loading}
              >
                Next: Add Evidence Photos
              </Button>
            </DialogFooter>
          </>
        )}

        {/* STEP 2: IMAGE UPLOAD */}
        {step === "images" && (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Report Type:</span> {formData.reportType}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-semibold">Description:</span> {formData.description.substring(0, 80)}{formData.description.length > 80 ? "..." : ""}
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Evidence Photos (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={loading || imageFiles.length >= 5}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || imageFiles.length >= 5}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                {imageFiles.length}/5 images selected (Max 5MB per image)
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={goBackToForm}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={submit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
