"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Report {
  id: string;
  reportType: string;
  description: string;
  date: string;
  status?: string;
  location?: string;
}

interface ViewReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId?: string;
  driverName?: string;
}

export function ViewReportsModal({
  isOpen,
  onClose,
  driverId,
  driverName,
}: ViewReportsModalProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driverId) {
      fetchReports();
    }
  }, [isOpen, driverId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?driverId=${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Reports - {driverName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{report.reportType}</p>
                      {report.status && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                          {report.status}
                        </span>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-sm text-gray-700">{report.description}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      {report.date && <span>{new Date(report.date).toLocaleDateString()}</span>}
                      {report.location && <span>{report.location}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No reports found for this driver</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface Commendation {
  id: string;
  title: string;
  description: string;
  date: string;
  commendationType?: string;
  rating?: number;
}

interface ViewCommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId?: string;
  driverName?: string;
}

export function ViewCommendationsModal({
  isOpen,
  onClose,
  driverId,
  driverName,
}: ViewCommendationsModalProps) {
  const [commendations, setCommendations] = useState<Commendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driverId) {
      fetchCommendations();
    }
  }, [isOpen, driverId]);

  const fetchCommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/commendations?driverId=${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setCommendations(Array.isArray(data) ? data : []);
      } else {
        setCommendations([]);
      }
    } catch (error) {
      console.error("Error fetching commendations:", error);
      toast.error("Failed to load commendations");
      setCommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Commendations - {driverName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : commendations.length > 0 ? (
          <div className="space-y-3">
            {commendations.map((commendation) => (
              <Card key={commendation.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{commendation.title}</p>
                      {commendation.rating && (
                        <span className="text-sm font-bold text-yellow-600">
                          ★ {commendation.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {commendation.description && (
                      <p className="text-sm text-gray-700">{commendation.description}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      {commendation.date && (
                        <span>{new Date(commendation.date).toLocaleDateString()}</span>
                      )}
                      {commendation.commendationType && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {commendation.commendationType}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No commendations found for this driver</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
