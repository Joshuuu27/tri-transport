"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CttmoHeader from "@/components/cttmo/cttmo-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Truck, Building2, FileText } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/common/loading-component";

interface DriverLicense {
  licenseNumber: string;
  issueDate?: any;
  expiryDate?: any;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  bodyNumber?: string;
  vehicleType?: string;
  color?: string;
  franchiseNumber?: string;
  franchiseExpirationDate?: any;
  dateAdded?: any;
  renewalHistory?: any[];
}

interface Operator {
  id: string;
  name?: string;
  email?: string;
  franchiseNumber?: string;
  companyName?: string;
  phone?: string;
}

interface DriverDetails {
  id: string;
  name?: string;
  email?: string;
  displayName?: string;
  phone?: string;
  phoneNumber?: string;
  companyName?: string;
  licenseNumber?: string;
  license?: any;
  vehicle?: Vehicle;
  operatorName?: string;
  [key: string]: any;
}

const CttmoDriverDetailsPage = () => {
  const params = useParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [license, setLicense] = useState<DriverLicense | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch full driver profile
        const profileRes = await fetch(`/api/drivers/${driverId}/full-profile`);
        if (!profileRes.ok) throw new Error("Failed to fetch driver");
        const profileData = await profileRes.json();
        setDriver(profileData);

        // Extract license from profile
        if (profileData.license) {
          setLicense(profileData.license);
        }

        // Extract vehicle from profile
        if (profileData.vehicle) {
          setVehicle(profileData.vehicle);
        }

        // Extract operator from profile
        if (profileData.operator) {
          setOperator(profileData.operator);
        }
      } catch (error) {
        console.error("Error fetching driver details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchDriverDetails();
    }
  }, [driverId]);

  const formatDate = (date: any) => {
    if (!date) return "—";
    try {
      const d =
        typeof date === "string"
          ? new Date(date)
          : date.toDate?.()
          ? date.toDate()
          : new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const isLicenseExpired = (expiryDate: any) => {
    if (!expiryDate) return false;
    try {
      const d =
        typeof expiryDate === "string"
          ? new Date(expiryDate)
          : expiryDate.toDate?.()
          ? expiryDate.toDate()
          : new Date(expiryDate);
      return d < new Date();
    } catch {
      return false;
    }
  };

  const isFranchiseExpired = (expiryDate: any) => {
    if (!expiryDate) return false;
    try {
      const d =
        typeof expiryDate === "string"
          ? new Date(expiryDate)
          : expiryDate.toDate?.()
          ? expiryDate.toDate()
          : new Date(expiryDate);
      return d < new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <>
        <CttmoHeader />
        <LoadingScreen />
      </>
    );
  }

  if (!driver) {
    return (
      <>
        <CttmoHeader />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/cttmo/drivers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <p className="text-red-600">Driver not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <CttmoHeader />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          <Link href="/cttmo/drivers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drivers
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {driver.displayName || driver.name || "Driver"}
            </h1>
            <p className="text-gray-600 mt-1">{driver.email || "No email"}</p>
          </div>
        </div>

        {/* Driver Details Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-medium">
                  {driver.displayName || driver.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium">{driver.email || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium">
                  {driver.phoneNumber || driver.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Company</p>
                <p className="font-medium">{driver.companyName || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Details Card */}
        {license || driver?.license ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <CardTitle>Driver License Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">License Number</p>
                  <p className="font-medium">{license?.licenseNumber || driver?.license?.licenseNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Issue Date</p>
                  <p className="font-medium">
                    {formatDate(license?.issueDate || driver?.license?.issueDate) || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {formatDate(license?.expiryDate || driver?.license?.expiryDate) || "—"}
                    </p>
                    {(license?.expiryDate || driver?.license?.expiryDate) && isLicenseExpired(license?.expiryDate || driver?.license?.expiryDate) && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Vehicle Details Card */}
        {vehicle ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plate Number</p>
                  <p className="font-semibold text-blue-600">
                    {vehicle.plateNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                  <p className="font-medium">{vehicle.vehicleType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Body Number</p>
                  <p className="font-medium">{vehicle.bodyNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <p className="font-medium">{vehicle.color || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Franchise Number</p>
                  <p className="font-medium">{vehicle.franchiseNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Franchise Expiration Date
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {formatDate(vehicle.franchiseExpirationDate) || "—"}
                    </p>
                    {vehicle.franchiseExpirationDate &&
                      isFranchiseExpired(vehicle.franchiseExpirationDate) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date Added</p>
                  <p className="font-medium">
                    {formatDate(vehicle.dateAdded) || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Operator Details Card */}
        {operator || driver?.operator ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <CardTitle>Operator Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operator Name</p>
                  <p className="font-medium">{operator?.name || driver?.operator?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{operator?.email || driver?.operator?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Franchise Number</p>
                  <p className="font-medium">{operator?.franchiseNumber || driver?.operator?.franchiseNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company Name</p>
                  <p className="font-medium">{operator?.companyName || driver?.operator?.companyName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium">{operator?.phone || driver?.operator?.phone || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Renewal History */}
        {vehicle?.renewalHistory && vehicle.renewalHistory.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <CardTitle>Franchise Renewal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicle.renewalHistory.map((record: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-md bg-gray-50 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.renewalDate
                          ? formatDate(record.renewalDate)
                          : "—"}
                      </p>
                      {record.remarks && (
                        <p className="text-xs text-gray-600 mt-1">
                          {record.remarks}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Recorded: {formatDate(record.date || record.recordedDate)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (driver?.vehicle?.renewalHistory && driver.vehicle.renewalHistory.length > 0) ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <CardTitle>Franchise Renewal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {driver.vehicle.renewalHistory.map((record: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-md bg-gray-50 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.renewalDate
                          ? formatDate(record.renewalDate)
                          : "—"}
                      </p>
                      {record.remarks && (
                        <p className="text-xs text-gray-600 mt-1">
                          {record.remarks}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Recorded: {formatDate(record.date || record.recordedDate)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </>
  );
};

export default CttmoDriverDetailsPage;
