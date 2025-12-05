"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import type { Vehicle } from "./operator-vehicles-table";

interface RenewFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess?: () => void;
}

export default function RenewFranchiseModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}: RenewFranchiseModalProps) {
  const [expirationDate, setExpirationDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      // Set default date to 1 year from today
      const tomorrow = new Date();
      tomorrow.setFullYear(tomorrow.getFullYear() + 1);
      const formattedDate = tomorrow.toISOString().split("T")[0];
      setExpirationDate(formattedDate);
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle || !expirationDate) {
      toast.error("Please select an expiration date");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/vehicles/${vehicle.id}/renew-franchise`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          franchiseExpirationDate: new Date(expirationDate),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to renew franchise");
      }

      toast.success("Franchise renewed successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error renewing franchise:", error);
      toast.error("Failed to renew franchise");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renew Franchise</DialogTitle>
        </DialogHeader>

        {vehicle && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">Vehicle Plate Number</Label>
              <p className="text-blue-600 font-bold text-lg">{vehicle.plateNumber}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="font-semibold">
                New Franchise Expiration Date
              </Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">
                Default is set to 1 year from today
              </p>
            </div>

            {vehicle.franchiseExpirationDate && (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current Expiration:</span>
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(
                    vehicle.franchiseExpirationDate?.toDate
                      ? vehicle.franchiseExpirationDate.toDate()
                      : vehicle.franchiseExpirationDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Renewing..." : "Renew Franchise"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
