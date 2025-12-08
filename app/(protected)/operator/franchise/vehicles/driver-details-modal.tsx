"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ThumbsUp, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

interface DriverDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId?: string;
  driverName?: string;
  vehicleColor?: string;
  operatorName?: string;
}

interface Commendation {
  id: string;
  driverId: string;
  userId: string;
  comment: string;
  rating?: number; // 1-5 stars
  createdAt: any;
}

interface Report {
  id: string;
  driverId: string;
  userId: string;
  description: string;
  createdAt: any;
}

interface SOSAlert {
  id: string;
  driverId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
  createdAt: any;
}

export default function DriverDetailsModal({
  isOpen,
  onClose,
  driverId,
  driverName,
  vehicleColor,
  operatorName,
}: DriverDetailsModalProps) {
  const [commendations, setCommendations] = useState<Commendation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driverId) {
      loadDriverAlerts();
    }
  }, [isOpen, driverId]);

  const loadDriverAlerts = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/drivers/${driverId}/alerts`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch alerts: ${res.status}`);
      }

      const data = await res.json();
      setCommendations(data.commendations || []);
      setReports(data.reports || []);
      setSosAlerts(data.sosAlerts || []);
    } catch (error) {
      console.error("Error loading driver alerts:", error);
      toast.error("Failed to load driver information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAverageRating = (): number => {
    if (commendations.length === 0) return 0;
    const totalRating = commendations.reduce((sum, c) => sum + (c.rating || 0), 0);
    return totalRating / commendations.length;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return "No rating";
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array(fullStars)
            .fill(0)
            .map((_, i) => (
              <span key={`full-${i}`} className="text-yellow-400">★</span>
            ))}
          {hasHalfStar && <span className="text-yellow-400">✢</span>}
          {Array(emptyStars)
            .fill(0)
            .map((_, i) => (
              <span key={`empty-${i}`} className="text-gray-300">★</span>
            ))}
        </div>
        <span className="text-sm text-gray-600">({rating.toFixed(1)}/5)</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Driver Information</DialogTitle>
          <DialogDescription>
            {driverName || "Driver"} - Records & Alerts
          </DialogDescription>
        </DialogHeader>

        {/* Vehicle Information Section */}
        {(vehicleColor || operatorName) && (
          <div className="px-6 py-3 bg-slate-50 border-b">
            <div className="grid grid-cols-2 gap-4">
              {vehicleColor && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Vehicle Color</p>
                  <p className="text-sm text-gray-800 capitalize">{vehicleColor}</p>
                </div>
              )}
              {operatorName && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Operator Name</p>
                  <p className="text-sm text-gray-800">{operatorName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="commendations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-white z-10">
                <TabsTrigger value="commendations" className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Commendations</span>
                  <Badge variant="outline" className="ml-2">
                    {commendations.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <Badge variant="outline" className="ml-2">
                    {reports.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sosalerts" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">SOS Alerts</span>
                  <Badge variant="outline" className="ml-2">
                    {sosAlerts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Commendations Tab */}
              <TabsContent value="commendations" className="space-y-4 px-1">
                {commendations.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <ThumbsUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No commendations yet</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Average Rating Card */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                            {renderStars(calculateAverageRating())}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {calculateAverageRating().toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">{commendations.length} ratings</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Individual Commendations */}
                    {commendations.map((commendation) => (
                      <Card key={commendation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Commendation
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(commendation.createdAt)}
                              </span>
                            </div>
                            {commendation.rating && (
                              <div className="mb-2">
                                {renderStars(commendation.rating)}
                              </div>
                            )}
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {commendation.comment}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-4 px-1">
                {reports.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No reports yet</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card key={report.id} className="border-red-200 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              Report
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {report.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* SOS Alerts Tab */}
              <TabsContent value="sosalerts" className="space-y-4 px-1">
                {sosAlerts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No SOS alerts triggered</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  sosAlerts.map((alert) => (
                    <Card key={alert.id} className="border-orange-200 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                              SOS Alert
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(alert.createdAt)}
                            </span>
                          </div>
                          {alert.userName && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">User:</span> {alert.userName}
                            </p>
                          )}
                          {alert.address && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Location:</span> {alert.address}
                            </p>
                          )}
                          {alert.plateNumber && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Vehicle:</span> {alert.plateNumber}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
