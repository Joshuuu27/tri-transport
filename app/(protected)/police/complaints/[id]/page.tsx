"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/police/police-header";
import { LoadingScreen } from "@/components/common/loading-component";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { ChevronLeft } from "lucide-react";
import { ReportCase, updateReportStatus, getAllReportCases } from "@/lib/services/ReportService";
import { ImageViewerModal } from "@/app/(protected)/user/scanner/result/_components/ImageViewerModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReportDetails extends ReportCase {
  fetchedPlateNumber?: string;
  driverName?: string;
}

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"pending" | "investigating" | "resolved">("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);

      // Fetch from the API endpoint which enriches with driver names
      const response = await fetch("/api/police/complaints");
      if (!response.ok) throw new Error("Failed to fetch complaints");
      
      const allReports = await response.json();
      const reportData = allReports.find((r: any) => r.id === reportId);

      if (!reportData) {
        toast.error("Report not found");
        router.push("/police/complaints");
        return;
      }

      setReport({
        ...reportData,
        fetchedPlateNumber: reportData.plateNumber || reportData.vehicleNumber || "",
      });

      setNewStatus(reportData.status);
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Failed to load report details");
      router.push("/police/complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!report) return;

    try {
      setIsUpdating(true);
      await updateReportStatus(report.id, newStatus);
      toast.success("Report status updated successfully!");
      setIsStatusDialogOpen(false);
      setReport({ ...report, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update report status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border border-yellow-200";
      case "investigating":
        return "text-blue-600 bg-blue-50 border border-blue-200";
      case "resolved":
        return "text-green-600 bg-green-50 border border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-red-600">Report not found</p>
          <Button onClick={() => router.push("/police/complaints")} className="mt-4">
            Back to Complaints
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8 w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/police/complaints")}
            className="flex items-center gap-2 -ml-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Complaints
          </Button>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">{report.reportType}</h1>
              <p className="text-gray-600">Report ID: {report.id}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold capitalize ${getStatusColor(report.status)}`}>
              {report.status}
            </div>
          </div>

          {/* Report Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Report Type</p>
              <p className="text-lg capitalize font-semibold">{report.reportType}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Date</p>
              <p className="text-lg font-semibold">
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Commuter Name</p>
              <p className="text-lg font-semibold">{report.commuterName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Commuter Email</p>
              <p className="text-lg font-semibold">{report.commuterEmail}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
              <p className="text-lg font-semibold">{report.phoneNumber || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Plate Number</p>
              <p className="text-lg font-semibold">{report.fetchedPlateNumber || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Driver Name</p>
              <p className="text-lg font-semibold">{report.driverName || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
              <p className="text-lg font-semibold">{report.location || "N/A"}</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
            <p className="text-base leading-relaxed bg-gray-50 p-4 rounded-lg">
              {report.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setIsStatusDialogOpen(true)}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Change Status
            </Button>

            {report.imageUrls && report.imageUrls.length > 0 && (
              <Button
                onClick={() => {
                  setImageViewerImages(report.imageUrls || []);
                  setImageViewerOpen(true);
                }}
                variant="outline"
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                View Evidence Images ({report.imageUrls.length})
              </Button>
            )}
          </div>
        </div>

        {/* Images Section */}
        {report.imageUrls && report.imageUrls.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Evidence Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {report.imageUrls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setImageViewerImages(report.imageUrls || []);
                    setImageViewerOpen(true);
                  }}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Report Status</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-semibold capitalize text-lg mt-1">{report.status}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Viewer Modal */}
        <ImageViewerModal
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          images={imageViewerImages}
          initialIndex={0}
        />
      </div>
    </>
  );
}
