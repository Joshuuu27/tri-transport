"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { AlertCircle, Loader2 } from "lucide-react";

interface DeleteOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: { id: string; name: string } | null;
  onSuccess: () => void;
}

export default function DeleteOperatorModal({
  isOpen,
  onClose,
  operator,
  onSuccess,
}: DeleteOperatorModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [checkingVehicles, setCheckingVehicles] = useState(false);

  useEffect(() => {
    if (isOpen && operator) {
      checkVehicles();
    }
  }, [isOpen, operator]);

  const checkVehicles = async () => {
    if (!operator) return;

    try {
      setCheckingVehicles(true);
      const res = await fetch(
        `/api/operators/${operator.id}/vehicles`
      );
      if (res.ok) {
        const data = await res.json();
        setVehicleCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error checking vehicles:", error);
    } finally {
      setCheckingVehicles(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (vehicleCount > 0) {
      toast.error(
        `Cannot delete operator with assigned vehicles. Please unassign or delete all ${vehicleCount} vehicle(s) first.`
      );
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/operators/${operator?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete operator");
      }

      toast.success("Operator deleted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error deleting operator:", error);
      toast.error(error.message || "Failed to delete operator");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const canDelete = vehicleCount === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Operator</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete operator "{operator?.name}"?
          </DialogDescription>
        </DialogHeader>

        {vehicleCount > 0 ? (
          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Cannot Delete Operator</p>
                <p>
                  This operator has {vehicleCount} vehicle(s) assigned. You must delete or reassign all vehicles before deleting this operator.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">This action cannot be undone.</p>
                <p className="mt-1">
                  The operator account and all related data will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Enter your password to confirm deletion
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading || !password.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
