"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/driver/driver-header";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverReports, ReportCase } from "@/lib/services/ReportService";
import { AlertTriangle } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-component";

export default function DriverReportsPage() {
  const { user } = useAuthContext();
  const [reports, setReports] = useState<ReportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(5);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user?.uid) return;

    const fetchReports = async () => {
      try {
        // Fetch reports against this driver
        const data = await getDriverReports(user.uid);
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user?.uid]);

  if (loading) return <LoadingScreen />;

  const displayedReports = reports.slice(0, displayedCount);
  const hasMore = displayedCount < reports.length;

  // Count by status
  const statusCounts = {
    pending: reports.filter(r => r.status === "pending").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Complaints Against Me</h1>

            {/* Status Summary */}
            {reports.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Investigating</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.investigating}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
                </div>
              </div>
            )}

            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No complaints filed against you. Keep providing excellent service!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-red-700">Complaint</span>
                            <span className="text-sm text-gray-500">
                              • {report.commuterName}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Type: <span className="capitalize">{report.reportType}</span>
                          </p>
                          <p className="text-gray-700">{report.description}</p>
                          {report.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              Location: {report.location}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(report.createdAt).toLocaleDateString()} at{" "}
                            {new Date(report.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" • "}
                            <span
                              className={`capitalize font-medium ${
                                report.status === "pending"
                                  ? "text-yellow-600"
                                  : report.status === "investigating"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {report.status}
                            </span>
                          </p>
                        </div>
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
                    Load More Complaints
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
