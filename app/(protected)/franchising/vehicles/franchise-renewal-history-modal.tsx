"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { OperatorVehicle } from "./vehicle-columns";

interface RenewalRecord {
  id: string;
  date: Date;
  renewalDate: Date;
  notes?: string;
}

interface FranchiseRenewalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: OperatorVehicle | null;
}

export const FranchiseRenewalHistoryModal: React.FC<
  FranchiseRenewalHistoryModalProps
> = ({ isOpen, onClose, vehicle }) => {
  const [renewalHistory, setRenewalHistory] = useState<RenewalRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRenewalDate, setNewRenewalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle?.id) {
      fetchRenewalHistory();
    }
  }, [isOpen, vehicle?.id]);

  const fetchRenewalHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/vehicles/${vehicle?.id}/renewal-history`
      );
      if (response.ok) {
        const data = await response.json();
        setRenewalHistory(
          data.map((record: any) => ({
            ...record,
            date: new Date(record.date),
            renewalDate: new Date(record.renewalDate),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching renewal history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRenewal = async () => {
    if (!newRenewalDate) {
      toast.error("Please select a renewal date");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/vehicles/${vehicle?.id}/renewal-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            renewalDate: new Date(newRenewalDate),
            notes: notes || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add renewal record");
      }

      toast.success("Renewal record added successfully");
      setNewRenewalDate("");
      setNotes("");
      setIsAdding(false);
      fetchRenewalHistory();
    } catch (error: any) {
      console.error("Error adding renewal record:", error);
      toast.error(error.message || "Failed to add renewal record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Franchise Renewal History</DialogTitle>
          <DialogDescription>
            {vehicle?.plateNumber} - {vehicle?.franchiseNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {renewalHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No renewal records yet</p>
            </div>
          ) : (
            renewalHistory.map((record) => (
              <Card key={record.id} className="p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">
                        {record.renewalDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Recorded on{" "}
                      {record.date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  )}
                </div>
              </Card>
            ))
          )}

          {isAdding && (
            <Card className="p-4 border-2 border-blue-200 bg-blue-50">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="renewalDate" className="text-sm font-medium">
                    Renewal Date *
                  </Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={newRenewalDate}
                    onChange={(e) => setNewRenewalDate(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Add any notes about this renewal"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewRenewalDate("");
                      setNotes("");
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddRenewal}
                    disabled={isLoading || !newRenewalDate}
                  >
                    Save Record
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          {!isAdding && (
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Renewal Record
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
