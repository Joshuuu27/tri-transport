"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AddCommendationModal from "./_components/AddCommendationModal";
import AddComplaintModal from "./_components/AddComplaintModal";
import { ImageViewerModal } from "./_components/ImageViewerModal";
import { Button } from "@/components/ui/button";
import Header from "@/components/commuter/trip-history-header";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { useAuthContext } from "@/app/context/AuthContext";
import { createSOSAlert } from "@/lib/services/SOSService";
import { getDriverCommendations, Commendation } from "@/lib/services/CommendationService";
import { getDriverReports, ReportCase } from "@/lib/services/ReportService";
import { AlertCircle, Star, AlertTriangle, ThumbsUp } from "lucide-react";
import { toast } from "react-toastify";

interface DriverInfo {
  id: string;
  name: string;
  licenseNumber?: string;
  vehicleType?: string;
  plateNumber?: string;
}

export default function ScanResultPage() {
  const params = useSearchParams();
  const driverId = params.get("driverId");
  const { user } = useAuthContext();

  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [allCommendations, setAllCommendations] = useState<Commendation[]>([]);
  const [allReports, setAllReports] = useState<ReportCase[]>([]);
  const [displayedCommendations, setDisplayedCommendations] = useState<Commendation[]>([]);
  const [displayedReports, setDisplayedReports] = useState<ReportCase[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [commendationPage, setCommendationPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const itemsPerPage = 5;

  const [showCommendation, setShowCommendation] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [creatingSOSAlert, setCreatingSOSAlert] = useState(false);
  
  // Image viewer modal state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerInitialIndex, setImageViewerInitialIndex] = useState(0);

  useEffect(() => {
    if (!driverId) return;

    const fetchDriver = async () => {
      try {
        // Fetch basic driver info
        const res = await fetch(`/api/drivers?id=${driverId}`);
        const data = await res.json();
        setDriver(data);

        // Fetch license number from driverLicenses collection
        const licenseData = await getDriverLicense(driverId);
        if (licenseData?.licenseNumber) {
          setLicenseNumber(licenseData.licenseNumber);
        }

        // Fetch vehicles from vehicles collection
        const vehiclesData = await getDriverVehicles(driverId);
        if (vehiclesData.length > 0) {
          // Get the first vehicle's details
          const firstVehicle = vehiclesData[0];
          setVehicleType(firstVehicle.vehicleType);
          setPlateNumber(firstVehicle.plateNumber);
        }

        // Fetch ALL commendations for this driver to calculate average
        const commendationsData = await getDriverCommendations(driverId);
        setAllCommendations(commendationsData);
        
        // Set initial displayed commendations (first 5)
        setDisplayedCommendations(commendationsData.slice(0, itemsPerPage));
        setCommendationPage(1);

        // Fetch ALL reports for this driver
        const reportsData = await getDriverReports(driverId);
        setAllReports(reportsData);
        
        // Set initial displayed reports (first 5)
        setDisplayedReports(reportsData.slice(0, itemsPerPage));
        setReportPage(1);

        // Calculate average rating from ALL commendations
        if (commendationsData.length > 0) {
          console.log("Commendations data:", commendationsData);
          const validRatings = commendationsData
            .map(c => {
              console.log("Rating value:", c.rating, "Type:", typeof c.rating);
              return Number(c.rating);
            })
            .filter(r => !isNaN(r) && r > 0);
          
          if (validRatings.length > 0) {
            const totalRating = validRatings.reduce((sum, r) => sum + r, 0);
            const avgRating = totalRating / validRatings.length;
            console.log("Valid ratings:", validRatings, "Average:", avgRating);
            setAverageRating(Math.round(avgRating * 10) / 10);
          } else {
            setAverageRating(0);
          }
        }
      } catch (error) {
        console.error("Error fetching driver details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverId]);

  // Handle pagination for commendations
  const handleLoadMoreCommendations = () => {
    const nextPage = commendationPage + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const moreCommendations = allCommendations.slice(0, endIndex);
    setDisplayedCommendations(moreCommendations);
    setCommendationPage(nextPage);
  };

  // Handle pagination for reports
  const handleLoadMoreReports = () => {
    const nextPage = reportPage + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const moreReports = allReports.slice(0, endIndex);
    setDisplayedReports(moreReports);
    setReportPage(nextPage);
  };

  const handleSOSAlert = async () => {
    if (!user || !driverId) {
      toast.error("Unable to send SOS alert. Please try again.");
      return;
    }

    try {
      setCreatingSOSAlert(true);

      // Get current location
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setCreatingSOSAlert(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let address = "Location detected";

          // Try to get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            address = data.address?.road || data.address?.town || "Location found";
          } catch (error) {
            console.log("Could not fetch address");
          }

          try {
            const sosData = {
              userId: user.uid,
              userName: user.displayName || "Unknown User",
              userEmail: user.email || "",
              latitude,
              longitude,
              address,
              driverId: driverId,
              driverName: driver?.name,
              vehicleType: vehicleType,
              plateNumber: plateNumber,
              licenseNumber: licenseNumber,
            };

            if (user.phoneNumber) {
              (sosData as any).userPhone = user.phoneNumber;
            }

            await createSOSAlert(sosData);

            toast.success("SOS alert sent to police! Help is on the way.");
            setTimeout(() => {
              window.location.href = "/user/sos-alerts";
            }, 1500);
          } catch (error) {
            console.error("Error sending SOS:", error);
            toast.error("Failed to send SOS alert. Please try again.");
            setCreatingSOSAlert(false);
          }
        },
        (error) => {
          let errorMessage = "Unable to get your location. Please enable location services.";
          if (error.code === 1) {
            errorMessage = "Location permission denied. Please enable location access.";
          } else if (error.code === 2) {
            errorMessage = "Location unavailable. Please check your GPS or network.";
          } else if (error.code === 3) {
            errorMessage = "Location request timed out. Please try again.";
          }
          console.error("Geolocation error:", error);
          toast.error(errorMessage);
          setCreatingSOSAlert(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process SOS alert.");
      setCreatingSOSAlert(false);
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  if (!driver)
    return <p className="p-8 text-red-600">Driver not found.</p>;

  return (
    <>
     <Header />
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Driver Information</h1>

          <div className="space-y-3">
            <p><strong>Name:</strong> {driver.name}</p>
            <p><strong>License #:</strong> {licenseNumber || "Not provided"}</p>
            <p><strong>Vehicle Type:</strong> {vehicleType || "Not provided"}</p>
            <p><strong>Plate #:</strong> {plateNumber || "Not provided"}</p>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Driver Rating</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Based on {allCommendations.length} {allCommendations.length === 1 ? 'commendation' : 'commendations'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <Button onClick={() => setShowCommendation(true)}>
                Add Commendation
              </Button>

              <Button variant="destructive" onClick={() => setShowComplaint(true)}>
                File Complaint
              </Button>
            </div>

            {/* SOS Button */}
            <Button
              onClick={handleSOSAlert}
              disabled={creatingSOSAlert}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {creatingSOSAlert ? "Sending SOS..." : "Emergency SOS Alert"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Driver Reviews & Reports</h2>
        
        {allCommendations.length === 0 && allReports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p>No reviews or reports for this driver yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Commendations */}
            {displayedCommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">Commendations ({allCommendations.length})</h3>
                {displayedCommendations.map((commendation) => (
                  <Card key={commendation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">Commendation</span>
                            <span className="text-sm text-gray-500">• {commendation.commuterName}</span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Number(commendation.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{commendation.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(commendation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {displayedCommendations.length < allCommendations.length && (
                  <Button
                    onClick={handleLoadMoreCommendations}
                    variant="outline"
                    className="w-full"
                  >
                    View More Commendations
                  </Button>
                )}
              </div>
            )}

            {/* Reports */}
            {displayedReports.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-red-700">Complaints ({allReports.length})</h3>
                {displayedReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-red-700">Complaint</span>
                            <span className="text-sm text-gray-500">• {report.commuterName}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Type: <span className="capitalize">{report.reportType}</span>
                          </p>
                          <p className="text-gray-700">{report.description}</p>
                          
                          {/* Display Images if they exist */}
                          {report.imageUrls && report.imageUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {report.imageUrls.map((imageUrl, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setImageViewerImages(report.imageUrls || []);
                                    setImageViewerInitialIndex(index);
                                    setImageViewerOpen(true);
                                  }}
                                  className="relative group cursor-pointer focus:outline-none"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Evidence ${index + 1}`}
                                    className="w-full h-20 object-cover rounded border border-gray-200 hover:border-gray-400 transition-all group-hover:opacity-80"
                                  />
                                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded transition-opacity" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                                      View
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(report.createdAt).toLocaleDateString()} • Status:{" "}
                            <span className={`capitalize font-medium ${
                              report.status === "pending" ? "text-yellow-600" :
                              report.status === "investigating" ? "text-blue-600" :
                              "text-green-600"
                            }`}>
                              {report.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {displayedReports.length < allReports.length && (
                  <Button
                    onClick={handleLoadMoreReports}
                    variant="outline"
                    className="w-full"
                  >
                    View More Complaints
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddCommendationModal
        open={showCommendation}
        onClose={() => setShowCommendation(false)}
        driverId={driverId || ""}
        driver={driver}
      />

      <AddComplaintModal
        open={showComplaint}
        onClose={() => setShowComplaint(false)}
        driverId={driverId || ""}
        driver={driver}
      />

      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        images={imageViewerImages}
        initialIndex={imageViewerInitialIndex}
      />
    </main>
    </>
  );
}