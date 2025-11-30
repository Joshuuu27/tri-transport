"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthContext } from "@/app/context/AuthContext";
import { createSOSAlert } from "@/lib/services/SOSService";
import { toast } from "react-toastify";

interface SOSButtonProps {
  className?: string;
}

export default function SOSButton({ className }: SOSButtonProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocation((prev) => ({
            ...prev!,
            address: data.address?.road || data.address?.town || "Location found",
          }));
        } catch (error) {
          console.error("Error fetching address:", error);
          // Continue without address
        }

        setFetchingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get your location. Please enable location services.";
        
        if (error.code === 1) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings.";
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please check your GPS or network connection.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again.";
        }
        
        console.error("Geolocation error code:", error.code, "Message:", error.message);
        setLocationError(errorMessage);
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSOSClick = async () => {
    if (!location) {
      await getCurrentLocation();
      setIsDialogOpen(true);
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setLoading(true);

      const sosData: any = {
        userId: user.uid,
        userName: user.displayName || "Unknown User",
        userEmail: user.email || "",
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      };

      // Only add userPhone if it exists
      if (user.phoneNumber) {
        sosData.userPhone = user.phoneNumber;
      }

      await createSOSAlert(sosData);

      toast.success("SOS alert sent to police! Help is on the way.");
      setIsDialogOpen(false);
      setLocation(null);

      // Reset after 2 seconds
      setTimeout(() => {
        setLocation(null);
      }, 2000);
    } catch (error) {
      console.error("Error sending SOS:", error);
      toast.error("Failed to send SOS alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsDialogOpen(true);
          getCurrentLocation();
        }}
        size="lg"
        variant="destructive"
        className={`w-full ${className}`}
        disabled={loading || fetchingLocation}
      >
        <AlertCircle className="w-5 h-5 mr-2" />
        {loading ? "Sending SOS..." : fetchingLocation ? "Getting Location..." : "SOS"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Emergency SOS Alert
            </DialogTitle>
            <DialogDescription>
              Confirm your location and send SOS alert to nearby police
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {fetchingLocation ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
                <p className="text-sm text-gray-600">Getting your location...</p>
              </div>
            ) : locationError ? (
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{locationError}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => getCurrentLocation()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            ) : location ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Location</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.address || "Location detected"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Sending this alert will notify nearby police of your emergency. Make sure you're in a safe location.
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date().toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {!locationError && (
              <Button
                onClick={handleSOSClick}
                disabled={loading || fetchingLocation || !location}
                variant="destructive"
              >
                {loading ? "Sending..." : "Confirm & Send SOS"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
