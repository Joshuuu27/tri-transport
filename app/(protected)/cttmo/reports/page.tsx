"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/cttmo/cttmo-header";
import { DataTable } from "@/components/common/data-table/DataTable";
import { AlertTriangle } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import {
  createReportColumns,
  Report,
} from "../reports-columns";
import { ReportDetailsModal } from "../report-details-modal";

export default function CTTMOReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    // Update the report in the list
    setReports(prevReports =>
      prevReports.map(r =>
        r.id === reportId ? { ...r, status: newStatus as "pending" | "investigating" | "resolved" } : r
      )
    );
  };

  const columns = createReportColumns({
    onViewDetails: handleViewDetails,
  });

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all driver reports filed by commuters
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              All Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reports found</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={reports}
                showOrderNumbers={true}
                showColumnFilter={true}
                showColumnToggle={true}
                emptyMessage="No reports available"
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Report Details Modal */}
      <ReportDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
