"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SOSAlert,
  getAllActiveSOSAlerts,
} from "@/lib/services/SOSService";
import { AlertTriangle } from "lucide-react";

type Driver = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  license_no?: string;
  [key: string]: any;
};

const CttmoPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loadingSos, setLoadingSos] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/drivers");
        if (!res.ok) {
          throw new Error("Failed to load drivers");
        }
        const data = await res.json();
        setDrivers(data || []);
      } catch (e) {
        console.error(e);
        setError("Unable to load drivers at the moment.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadSos = async () => {
      try {
        setLoadingSos(true);
        const data = await getAllActiveSOSAlerts();
        setSosAlerts(data || []);
      } catch (e) {
        console.error("Failed to load SOS alerts for CTTMO page:", e);
      } finally {
        setLoadingSos(false);
      }
    };

    loadSos();
  }, []);

  const duplicateLicenseSet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of drivers) {
      const raw =
        d.licenseNumber ||
        (d as any).license ||
        d.license_no ||
        (d as any).license_no;
      if (!raw) continue;
      const key = String(raw).trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const dupes = new Set<string>();
    counts.forEach((count, key) => {
      if (count > 1) dupes.add(key);
    });
    return dupes;
  }, [drivers]);

  const handleRemoveDriver = async (driver: Driver) => {
    if (!driver.id) return;
    const confirmed = window.confirm(
      `Remove driver "${driver.name || driver.email || driver.id}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to remove driver");
      }
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    } catch (e) {
      console.error(e);
      alert("Failed to remove driver. Please try again.");
    }
  };

  return (
    <>
      {/* Simple header */}
      <header className="w-full border-b bg-background">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">CTTMO – Driver Registry</h1>
            {user && (
              <p className="text-xs text-muted-foreground">
                Logged in as <strong>{user.email}</strong> ({role})
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cttmo/sos-alerts")}
            >
              View SOS Alerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Compact SOS alerts summary */}
        {!loadingSos && sosAlerts.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-md flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">
                  {sosAlerts.length} active SOS alert
                  {sosAlerts.length > 1 ? "s" : ""}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-700 hover:bg-red-100"
                onClick={() => router.push("/cttmo/sos-alerts")}
              >
                View all
              </Button>
            </div>
            <ul className="mt-1 space-y-1 text-xs text-red-800 max-h-32 overflow-y-auto">
              {sosAlerts.slice(0, 5).map((alert) => (
                <li key={alert.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {alert.userName || "Unknown user"} –{" "}
                    {alert.address || "Coordinates only"}
                  </span>
                  <span className="shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Registered Drivers ({drivers.length})
              </h2>
              {loading && (
                <span className="text-xs text-muted-foreground">
                  Loading drivers…
                </span>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {!loading && drivers.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                No drivers found.
              </p>
            )}

            {drivers.length > 0 && (
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/70">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Phone</th>
                      <th className="px-3 py-2 text-left font-medium">
                        License #
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => {
                      const phone =
                        driver.phoneNumber || driver.phone || "" || undefined;
                      const licenseRaw =
                        driver.licenseNumber ||
                        (driver as any).license ||
                        driver.license_no ||
                        (driver as any).license_no ||
                        "";
                      const licenseKey = String(licenseRaw)
                        .trim()
                        .toLowerCase();
                      const isDuplicate =
                        licenseKey && duplicateLicenseSet.has(licenseKey);

                      return (
                        <tr
                          key={driver.id}
                          className="border-t hover:bg-muted/40"
                        >
                          <td className="px-3 py-2">
                            {driver.name || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {driver.email || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {phone || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={
                                isDuplicate
                                  ? "text-red-600 font-semibold"
                                  : ""
                              }
                            >
                              {licenseRaw || "—"}
                            </span>
                            {isDuplicate && (
                              <span className="ml-2 text-xs text-red-600">
                                (duplicate)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDriver(driver)}
                              >
                                Details
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveDriver(driver)}
                              >
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedDriver && (
              <div className="mt-6 border rounded-md p-4 bg-muted/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">
                    Driver details –{" "}
                    {selectedDriver.name ||
                      selectedDriver.email ||
                      selectedDriver.id}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedDriver(null)}
                  >
                    Close
                  </Button>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {Object.entries(selectedDriver)
                    .filter(([key]) => key !== "id")
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <dt className="font-medium text-muted-foreground">
                          {key}
                        </dt>
                        <dd className="break-all">
                          {value === null || value === undefined
                            ? "—"
                            : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
import { useAuthContext } from "@/app/context/AuthContext";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";

const CttmoPage = () => {
  const { user, role } = useAuthContext();

  return (
    <>
      <CttmoHeader />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <DashboardIntro
            displayName={user?.displayName}
            email={user?.email}
            role={role}
            subtitle="Manage transport regulations and compliance for the city"
            features={[
              {
                icon: CheckCircle,
                title: "Inspections",
                description: "Monitor vehicle and driver inspections",
              },
              {
                icon: AlertCircle,
                title: "Violations",
                description: "Track and manage traffic violations",
              },
              {
                icon: ClipboardList,
                title: "Regulations",
                description: "Enforce city transport regulations",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default CttmoPage;


