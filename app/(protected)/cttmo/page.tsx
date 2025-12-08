"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { DashboardIntro } from "@/components/common/dashboard-intro";
import { CheckCircle, AlertCircle, ClipboardList, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAllActiveSOSAlerts, SOSAlert } from "@/lib/services/SOSService";

interface Driver {
  id: string;
  displayName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

const CttmoPage = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loadingSos, setLoadingSos] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverDetails, setDriverDetails] = useState<Map<string, any>>(new Map());
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicateDrivers, setDuplicateDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const loadSos = async () => {
      try {
        setLoadingSos(true);
        const data = await getAllActiveSOSAlerts();
        setSosAlerts(data || []);
      } catch (e) {
        console.error("Failed to load SOS alerts:", e);
      } finally {
        setLoadingSos(false);
      }
    };

    loadSos();
  }, []);

  // Fetch drivers and detect duplicates
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setLoadingDrivers(true);
        const response = await fetch("/api/drivers");
        if (!response.ok) throw new Error("Failed to fetch drivers");
        const data = await response.json();
        setDrivers(data);

        // Fetch full profiles for duplicate detection
        const detailsMap = new Map();
        for (const driver of data) {
          try {
            const profileResponse = await fetch(`/api/drivers/${driver.id}/full-profile`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              detailsMap.set(driver.id, profileData);
            }
          } catch (e) {
            console.error(`Failed to fetch profile for driver ${driver.id}:`, e);
          }
        }
        setDriverDetails(detailsMap);
      } catch (e) {
        console.error("Failed to load drivers:", e);
      } finally {
        setLoadingDrivers(false);
      }
    };

    loadDrivers();
  }, []);

  const activeSosCount = sosAlerts.filter(a => a.status === "active").length;

  // Calculate duplicate licenses
  const duplicateLicenseMap = useMemo(() => {
    const licenseToDrivers = new Map<string, string[]>();
    const duplicateLicenses = new Set<string>();

    for (const [driverId, details] of driverDetails) {
      if (details?.license?.licenseNumber) {
        const licenseKey = details.license.licenseNumber;
        if (!licenseToDrivers.has(licenseKey)) {
          licenseToDrivers.set(licenseKey, []);
        }
        licenseToDrivers.get(licenseKey)?.push(driverId);
      }
    }

    // Mark licenses that appear more than once
    for (const [license, driverIds] of licenseToDrivers) {
      if (driverIds.length > 1) {
        duplicateLicenses.add(license);
      }
    }

    return { duplicateLicenses, licenseToDrivers };
  }, [driverDetails]);

  const handleShowDuplicates = () => {
    const driverIdsWithDuplicates = new Set<string>();
    for (const [, driverIds] of duplicateLicenseMap.licenseToDrivers) {
      if (driverIds.length > 1) {
        driverIds.forEach(id => driverIdsWithDuplicates.add(id));
      }
    }
    const filteredDrivers = drivers.filter(d => driverIdsWithDuplicates.has(d.id));
    setDuplicateDrivers(filteredDrivers);
    setShowDuplicatesModal(true);
  };

  return (
    <>
      <CttmoHeader />

      {/* Content */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
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

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Drivers Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/cttmo/drivers")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Driver Registry</CardTitle>
                      <CardDescription>View and manage registered drivers</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/cttmo/drivers");
                  }}
                >
                  View Drivers
                </Button>
              </CardContent>
            </Card>

            {/* SOS Alerts Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/cttmo/sos-alerts")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${activeSosCount > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <AlertTriangle className={`w-6 h-6 ${activeSosCount > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <CardTitle>SOS Alerts</CardTitle>
                      <CardDescription>
                        {loadingSos 
                          ? "Loading alerts..." 
                          : activeSosCount > 0 
                            ? `${activeSosCount} active emergency alert${activeSosCount > 1 ? 's' : ''}`
                            : "Monitor emergency alerts from commuters"
                        }
                      </CardDescription>
                    </div>
                  </div>
                  {activeSosCount > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full text-sm font-bold">
                      {activeSosCount}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant={activeSosCount > 0 ? "destructive" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/cttmo/sos-alerts");
                  }}
                >
                  {activeSosCount > 0 ? "View Active Alerts" : "View SOS Alerts"}
                </Button>
              </CardContent>
            </Card>

            {/* Duplicate Drivers License Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleShowDuplicates}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${duplicateLicenseMap.duplicateLicenses.size > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                      <AlertTriangle className={`w-6 h-6 ${duplicateLicenseMap.duplicateLicenses.size > 0 ? 'text-yellow-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <CardTitle>Duplicate Licenses</CardTitle>
                      <CardDescription>
                        {loadingDrivers 
                          ? "Loading drivers..." 
                          : duplicateLicenseMap.duplicateLicenses.size > 0 
                            ? `${duplicateLicenseMap.duplicateLicenses.size} duplicate license${duplicateLicenseMap.duplicateLicenses.size > 1 ? 's' : ''} found`
                            : "No duplicate licenses detected"
                        }
                      </CardDescription>
                    </div>
                  </div>
                  {duplicateLicenseMap.duplicateLicenses.size > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-600 text-white rounded-full text-sm font-bold">
                      {duplicateLicenseMap.duplicateLicenses.size}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant={duplicateLicenseMap.duplicateLicenses.size > 0 ? "outline" : "secondary"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDuplicates();
                  }}
                  disabled={loadingDrivers}
                >
                  {loadingDrivers ? "Loading..." : duplicateLicenseMap.duplicateLicenses.size > 0 ? "View Duplicates" : "No Issues"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Duplicate Drivers Modal */}
          <Dialog open={showDuplicatesModal} onOpenChange={setShowDuplicatesModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Drivers with Duplicate License Numbers</DialogTitle>
                <DialogDescription>
                  {duplicateDrivers.length} driver(s) have duplicate license numbers
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {duplicateDrivers.length > 0 ? (
                  <div className="space-y-2">
                    {duplicateDrivers.map((driver) => {
                      const details = driverDetails.get(driver.id);
                      const licenseNum = details?.license?.licenseNumber || "N/A";
                      const licenseExpiry = details?.license?.expiryDate 
                        ? new Date(details.license.expiryDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A";
                      const isExpired = details?.license?.expiryDate && new Date(details.license.expiryDate) < new Date();

                      return (
                        <div
                          key={driver.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{driver.displayName || "Unknown"}</p>
                              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">License Number</p>
                                  <p className="font-mono text-green-600">{licenseNum}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
                                  <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                                    {licenseExpiry}
                                    {isExpired && " (EXPIRED)"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowDuplicatesModal(false);
                                router.push(`/cttmo/drivers/${driver.id}`);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No duplicate drivers found.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
};

export default CttmoPage;


