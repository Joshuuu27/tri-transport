"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, MapPin, Phone, Mail, Trash2 } from "lucide-react";
import { SOSAlert, getUserSOSAlerts, updateSOSAlertStatus } from "@/lib/services/SOSService";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/commuter/trip-history-header";
import { useAuthContext } from "@/app/context/AuthContext";
import { db } from "@/lib/firebase.browser";
import { collection, deleteDoc, doc } from "firebase/firestore";

interface SOSAlertWithDriver extends SOSAlert {
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
}

export default function UserSOSAlertsPage() {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState<SOSAlertWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlertWithDriver | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: ColumnDef<SOSAlertWithDriver>[] = [
    {
      accessorKey: "driverName",
      header: "Driver Name",
      cell: ({ row }) => row.getValue("driverName") || "Unknown",
    },
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      cell: ({ row }) => row.getValue("plateNumber") || "N/A",
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      cell: ({ row }) => row.getValue("vehicleType") || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let statusColor = "";
        if (status === "active") statusColor = "text-red-600";
        else if (status === "resolved") statusColor = "text-green-600";
        else if (status === "cancelled") statusColor = "text-gray-600";

        return <span className={`capitalize font-medium ${statusColor}`}>{status}</span>;
      },
    },
    {
      accessorKey: "timestamp",
      header: "Alert Time",
      cell: ({ row }) => {
        const date = row.getValue("timestamp") as Date;
        return new Date(date).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const alert = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAlert(alert);
              setIsDetailsDialogOpen(true);
            }}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const data = await getUserSOSAlerts(user.uid);
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      toast.error("Failed to load SOS alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!selectedAlert) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "sos_alerts", selectedAlert.id));
      
      toast.success("SOS alert deleted successfully");
      setIsDetailsDialogOpen(false);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete SOS alert");
    } finally {
      setIsDeleting(false);
    }
  };

  const openMapLocation = (latitude: number, longitude: number) => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapUrl, "_blank");
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My SOS Alerts</h1>
            <p className="text-gray-600 mt-2">
              Manage your emergency SOS alerts ({alerts.length} total)
            </p>
          </div>
          <Button onClick={() => fetchAlerts()} size="sm">
            Refresh
          </Button>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">
                {activeAlerts.length} active emergency alert{activeAlerts.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            data={alerts}
            columns={columns}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={true}
            showColumnToggle={true}
            emptyMessage="No SOS alerts found."
          />
        </div>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              SOS Emergency Alert Details
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* Driver Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">Driver Name</p>
                  <p className="font-semibold">{selectedAlert.driverName || "Unknown"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="font-semibold">{selectedAlert.vehicleType || "N/A"}</p>
                </div>
              </div>

              {/* Plate and License Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">Plate Number</p>
                  <p className="font-semibold">{selectedAlert.plateNumber || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">License Number</p>
                  <p className="font-semibold">{selectedAlert.licenseNumber || "N/A"}</p>
                </div>
              </div>

              {/* Location Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-blue-900">Location</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedAlert.address || "Coordinates detected"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Lat: {selectedAlert.latitude.toFixed(6)}, Lon:{" "}
                      {selectedAlert.longitude.toFixed(6)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        openMapLocation(selectedAlert.latitude, selectedAlert.longitude)
                      }
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600">Alert Time</p>
                <p className="font-semibold">
                  {new Date(selectedAlert.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })}
                </p>
              </div>

              {/* Status Information */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${
                  selectedAlert.status === "active"
                    ? "text-red-600"
                    : selectedAlert.status === "resolved"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}>
                  {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAlert}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Alert"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
              disabled={isDeleting}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
