"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/driver/driver-header";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverSOSAlerts, SOSAlert } from "@/lib/services/SOSService";
import { AlertCircle, MapPin } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-component";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DriverSOSAlertsPage() {
  const { user } = useAuthContext();
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(5);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user?.uid) return;

    const fetchSOSAlerts = async () => {
      try {
        // Fetch SOS alerts against this driver
        const data = await getDriverSOSAlerts(user.uid);
        setSOSAlerts(data);
      } catch (error) {
        console.error("Error fetching SOS alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSAlerts();
  }, [user?.uid]);

  if (loading) return <LoadingScreen />;

  const displayedAlerts = sosAlerts.slice(0, displayedCount);
  const hasMore = displayedCount < sosAlerts.length;

  // Count by status
  const statusCounts = {
    active: sosAlerts.filter(a => a.status === "active").length,
    resolved: sosAlerts.filter(a => a.status === "resolved").length,
    cancelled: sosAlerts.filter(a => a.status === "cancelled").length,
  };

  const openMapLocation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">SOS Alerts Against Me</h1>

            {/* Status Summary */}
            {sosAlerts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.active}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.cancelled}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
                </div>
              </div>
            )}

            {sosAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No SOS alerts against you. Drive safely!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedAlerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-red-700">SOS Alert</span>
                            <span className="text-sm text-gray-500">
                              • {alert.userName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            Email: {alert.userEmail}
                          </p>
                          {alert.userPhone && (
                            <p className="text-sm text-gray-700 mb-2">
                              Phone: {alert.userPhone}
                            </p>
                          )}
                          <p className="text-gray-700 mb-2">
                            <strong>Location:</strong> {alert.address || "Coordinates recorded"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleDateString()} at{" "}
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" • "}
                            <span
                              className={`capitalize font-medium ${
                                alert.status === "active"
                                  ? "text-red-600"
                                  : alert.status === "cancelled"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {alert.status}
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {hasMore && (
                  <Button
                    onClick={() => setDisplayedCount(displayedCount + itemsPerPage)}
                    variant="outline"
                    className="w-full"
                  >
                    Load More SOS Alerts
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>SOS Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              {/* User Information */}
              <div className="border-b pb-3">
                <p className="font-semibold mb-2">User Information</p>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedAlert.userName}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {selectedAlert.userEmail}
                </p>
                {selectedAlert.userPhone && (
                  <p className="text-sm">
                    <strong>Phone:</strong> {selectedAlert.userPhone}
                  </p>
                )}
              </div>

              {/* Location Information */}
              <div className="border-b pb-3">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </p>
                <p className="text-sm mb-2">{selectedAlert.address || "Coordinates detected"}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Lat: {selectedAlert.latitude.toFixed(6)}, Lon:{" "}
                  {selectedAlert.longitude.toFixed(6)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openMapLocation(selectedAlert.latitude, selectedAlert.longitude)
                  }
                  className="w-full"
                >
                  Open in Google Maps
                </Button>
              </div>

              {/* Status */}
              <div>
                <p className="font-semibold mb-2">Status</p>
                <p
                  className={`text-sm capitalize font-medium ${
                    selectedAlert.status === "active"
                      ? "text-red-600"
                      : selectedAlert.status === "cancelled"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                  {selectedAlert.status}
                </p>
              </div>

              {/* Timestamp */}
              <div>
                <p className="font-semibold mb-2">Alert Time</p>
                <p className="text-sm">
                  {new Date(selectedAlert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
