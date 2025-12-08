"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, MapPin, Calendar, Mail, Phone, MapIcon, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Report } from "./reports-columns";

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onStatusChange?: (reportId: string, newStatus: string) => void;
}

export function ReportDetailsModal({
  isOpen,
  onClose,
  report,
  onStatusChange,
}: ReportDetailsModalProps) {
  const [newStatus, setNewStatus] = useState<string | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<{
    bodyNumber?: string;
    vehicleType?: string;
    operatorName?: string;
  } | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  // Fetch vehicle details when report or modal opens
  useEffect(() => {
    if (isOpen && report?.plateNumber) {
      fetchVehicleDetails();
    }
  }, [isOpen, report?.plateNumber]);

  const fetchVehicleDetails = async () => {
    try {
      setLoadingVehicle(true);
      const res = await fetch(`/api/vehicles?plateNumber=${encodeURIComponent(report?.plateNumber || "")}`);
      if (res.ok) {
        const vehicles = await res.json();
        if (vehicles.length > 0) {
          const vehicle = vehicles[0];
          setVehicleDetails({
            bodyNumber: vehicle.bodyNumber,
            vehicleType: vehicle.vehicleType,
            operatorName: vehicle.operatorName,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
    } finally {
      setLoadingVehicle(false);
    }
  };

  if (!report) return null;

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === report.status) {
      toast.warning("Please select a different status");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Status updated successfully");
      setNewStatus(undefined);
      onStatusChange?.(report.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      investigating: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
    };
    return colors[status] || colors.pending;
  };

  const handleMapClick = () => {
    if (report.location) {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(report.location)}`;
      window.open(mapsUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Report Details
          </DialogTitle>
          <DialogDescription>
            View and manage report information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {report.reportType && (
                      <span className="capitalize">{report.reportType}</span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Report ID: {report.id}
                  </p>
                </div>
                <Badge className={`${getStatusColor(report.status)} capitalize`}>
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {report.incidentDate && (
                  <div>
                    <p className="text-sm text-gray-600">Incident Date</p>
                    <p className="font-medium">
                      {new Date(report.incidentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Commuter Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Commuter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{report.commuterName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="font-medium text-sm break-all">
                      {report.commuterEmail}
                    </p>
                  </div>
                  {report.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone
                      </p>
                      <p className="font-medium">{report.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingVehicle ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Loading vehicle details...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {report.plateNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Plate Number</p>
                      <p className="font-semibold text-blue-600 text-lg">
                        {report.plateNumber}
                      </p>
                    </div>
                  )}
                  {report.vehicleNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="font-medium">{report.vehicleNumber}</p>
                    </div>
                  )}
                  {(vehicleDetails?.vehicleType || report.vehicleType) && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <p className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {vehicleDetails?.vehicleType || report.vehicleType}
                      </p>
                    </div>
                  )}
                  {(vehicleDetails?.bodyNumber || report.bodyNumber) && (
                    <div>
                      <p className="text-sm text-gray-600">Body Number</p>
                      <p className="font-medium">{vehicleDetails?.bodyNumber || report.bodyNumber}</p>
                    </div>
                  )}
                  {(vehicleDetails?.operatorName || report.operatorName) && (
                    <div>
                      <p className="text-sm text-gray-600">Operator Name</p>
                      <p className="font-medium capitalize">{vehicleDetails?.operatorName || report.operatorName}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">
                  {report.description}
                </p>
              </div>
              {report.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleMapClick}
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    {report.location}
                    <span className="ml-auto text-xs text-gray-500">
                      View on Map
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Change */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">New Status</p>
                <Select
                  value={newStatus || report.status}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating || !newStatus || newStatus === report.status}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
