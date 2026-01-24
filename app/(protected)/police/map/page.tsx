"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, MapPin, Phone, Mail } from "lucide-react";
import { SOSAlert, updateSOSAlertStatus } from "@/lib/services/SOSService";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";
import { useSOSAlertContext } from "@/app/context/SOSAlertContext";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };

interface MapLike {
  setCenter(c: { lat: number; lng: number }): void;
  setZoom(z: number): void;
  fitBounds(b: { extend: (p: object) => void }, o?: object): void;
}
interface MarkerLike {
  setMap(m: null): void;
  addListener(e: string, f: () => void): void;
}
type CircleLike = {
  setMap(m: MapLike | null): void;
  setRadius(r: number): void;
  setOptions(opts: { fillOpacity: number; strokeOpacity: number }): void;
};
type GoogleMaps = {
  Map: new (el: HTMLElement, opts: object) => MapLike;
  Marker: new (opts: object) => MarkerLike;
  Circle: new (opts: object) => CircleLike;
  LatLngBounds: new () => { extend: (p: object) => void };
  SymbolPath: { CIRCLE: number };
};
type WindowWithGoogle = Window & { google?: { maps: GoogleMaps } };

function loadGoogleMapsScript(apiKey: string) {
  if (typeof window === "undefined" || document.getElementById("google-maps-script")) return;
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  document.body.appendChild(script);
}

function markerColorForStatus(status: string): string {
  if (status === "active") return "#dc2626";
  if (status === "resolved") return "#16a34a";
  return "#6b7280";
}

export default function MapPage() {
  const { setHasNewAlert: setContextHasNewAlert } = useSOSAlertContext();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "resolved" | "cancelled">("active");
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [, setIsBlinking] = useState(false);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousAlertsRef = useRef<SOSAlert[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLike | null>(null);
  const markersRef = useRef<MarkerLike[]>([]);
  const pulsingCirclesRef = useRef<CircleLike[]>([]);
  const pulseIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const onAlertSelectRef = useRef<(alert: SOSAlert) => void>(() => {});
  onAlertSelectRef.current = (alert: SOSAlert) => {
    setSelectedAlert(alert);
    setNewStatus(alert.status);
    setIsStatusDialogOpen(true);
  };

  // Load Google Maps and init map (after loading finishes so mapRef is mounted)
  useEffect(() => {
    if (loading || !GOOGLE_MAPS_API_KEY) return;
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
    const interval = setInterval(() => {
      const g = (window as WindowWithGoogle).google;
      if (g?.maps && mapRef.current) {
        clearInterval(interval);
        mapInstanceRef.current = new g.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 11,
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  // Update markers when alerts or map change
  useEffect(() => {
    const g = (window as WindowWithGoogle).google;
    if (!g?.maps || !mapInstanceRef.current) return;
    
    // Clean up previous markers and pulsing circles
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    pulsingCirclesRef.current.forEach((c) => c.setMap(null));
    pulsingCirclesRef.current = [];
    pulseIntervalsRef.current.forEach((interval) => clearInterval(interval));
    pulseIntervalsRef.current = [];
    
    const bounds = new g.maps.LatLngBounds();
    
    for (const alert of alerts) {
      const pos = { lat: alert.latitude, lng: alert.longitude };
      const color = markerColorForStatus(alert.status);
      const isActive = alert.status === "active";
      
      // Create pulsing circle overlay for visual effect
      const pulseCircle = new g.maps.Circle({
        center: pos,
        radius: isActive ? 50 : 30, // Larger radius for active alerts
        map: mapInstanceRef.current,
        fillColor: color,
        fillOpacity: isActive ? 0.3 : 0.2,
        strokeColor: color,
        strokeOpacity: isActive ? 0.6 : 0.4,
        strokeWeight: 2,
        zIndex: 1, // Behind the marker
      });
      
      pulsingCirclesRef.current.push(pulseCircle);
      
      // Animate the pulsing circle
      let pulseRadius = isActive ? 50 : 30;
      let pulseOpacity = isActive ? 0.3 : 0.2;
      const minRadius = isActive ? 30 : 20;
      const maxRadius = isActive ? 80 : 50;
      const minOpacity = isActive ? 0.1 : 0.05;
      const maxOpacity = isActive ? 0.4 : 0.25;
      let growing = true;
      const pulseSpeed = isActive ? 0.8 : 1.2; // Faster pulse for active alerts
      
      const pulseInterval = setInterval(() => {
        if (growing) {
          pulseRadius += pulseSpeed;
          pulseOpacity += 0.01;
          if (pulseRadius >= maxRadius) {
            growing = false;
          }
        } else {
          pulseRadius -= pulseSpeed;
          pulseOpacity -= 0.01;
          if (pulseRadius <= minRadius) {
            growing = true;
          }
        }
        
        // Clamp values
        pulseRadius = Math.max(minRadius, Math.min(maxRadius, pulseRadius));
        pulseOpacity = Math.max(minOpacity, Math.min(maxOpacity, pulseOpacity));
        
        pulseCircle.setRadius(pulseRadius);
        pulseCircle.setOptions({
          fillOpacity: pulseOpacity,
          strokeOpacity: pulseOpacity * 2,
        });
      }, 50); // Update every 50ms for smooth animation
      
      pulseIntervalsRef.current.push(pulseInterval);
      
      // Create the marker
      const marker = new g.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: `${alert.userName} – ${alert.status}`,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: isActive ? 12 : 10, // Slightly larger for active alerts
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: isActive ? 3 : 2, // Thicker border for active
          strokeColor: "#fff",
        },
        zIndex: 2, // Above the pulse circle
      });
      
      marker.addListener("click", () => onAlertSelectRef.current(alert));
      markersRef.current.push(marker);
      bounds.extend(pos);
    }
    
    if (alerts.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 80, right: 40, bottom: 40, left: 40 });
    } else {
      mapInstanceRef.current.setCenter(DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(11);
    }
    
    // Cleanup function
    return () => {
      pulseIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pulseIntervalsRef.current = [];
    };
  }, [alerts]);

  useEffect(() => {
    fetchAlerts();

    // Set up auto-refresh every 10 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAlerts();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      pulseIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pulseIntervalsRef.current = [];
    };
  }, [autoRefresh]);

  // Update page title with blinking effect and play sound for new alerts
  useEffect(() => {
    if (hasNewAlert) {
      // Update global context
      setContextHasNewAlert(true);

      // Start blinking
      let blink = true;
      blinkIntervalRef.current = setInterval(() => {
        blink = !blink;
        document.title = blink ? "🚨 NEW SOS ALERT! 🚨" : "SOS Alerts";
        setIsBlinking(blink);
      }, 500); // Blink every 500ms

      // Play immediate alarm sequence
      playAlarmSequence();

      // Play alarm sound repeatedly every 2 seconds
      const soundInterval = setInterval(() => {
        playAlarmSequence();
      }, 2000);

      // Auto-stop blinking after 60 seconds
      const stopBlinkTimeout = setTimeout(() => {
        if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
        clearInterval(soundInterval);
        setHasNewAlert(false);
        setContextHasNewAlert(false);
        setIsBlinking(false);
        document.title = "SOS Alerts";
      }, 60000);

      return () => {
        clearTimeout(stopBlinkTimeout);
        clearInterval(soundInterval);
        if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
        document.title = "SOS Alerts";
      };
    }
  }, [hasNewAlert, setContextHasNewAlert]);

  const fetchAlerts = async () => {
    try {
      // Fetch all SOS alerts from the API (regardless of status)
      const response = await fetch("/api/police/sos-alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      
      // Check for new alerts within 2 minutes
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      const newAlerts = (data as SOSAlert[]).filter((alert) => {
        const alertTime = new Date(alert.timestamp);
        return alertTime > twoMinutesAgo;
      });

      // Compare with previous alerts to detect new ones
      const previousAlertIds = new Set(previousAlertsRef.current.map((a) => a.id));
      const actualNewAlerts = newAlerts.filter((alert) => !previousAlertIds.has(alert.id));

      // Trigger notification if there are new alerts
      if (actualNewAlerts.length > 0) {
        setHasNewAlert(true);
        toast.error(
          `🚨 NEW SOS ALERT! ${actualNewAlerts.length} new emergency alert${actualNewAlerts.length > 1 ? "s" : ""}`
        );
      }

      setAlerts(data);
      previousAlertsRef.current = data;
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      toast.error("Failed to load SOS alerts");
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAlert) return;

    try {
      setIsUpdating(true);
      await updateSOSAlertStatus(selectedAlert.id, newStatus);
      toast.success("Alert status updated successfully!");
      setIsStatusDialogOpen(false);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update alert status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Play alarm sound using Web Audio API
  const playAlarmSound = () => {
    try {
      const Win = window as Window & { webkitAudioContext?: typeof AudioContext };
      const audioContext = new (window.AudioContext || Win.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create siren effect with frequency sweep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Web Audio API error:", error);
    }
  };

  // Play alarm multiple times for emphasis
  const playAlarmSequence = () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        playAlarmSound();
      }, i * 600);
    }
  };

  // Stop the alarm and blinking
  const stopAlarm = () => {
    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    setHasNewAlert(false);
    setContextHasNewAlert(false);
    setIsBlinking(false);
    document.title = "SOS Alerts";
  };

  const openMapLocation = (latitude: number, longitude: number) => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapUrl, "_blank");
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto overflow-hidden">
        <div className="flex flex-none justify-between items-center gap-4 px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">SOS Map</h1>
            <span className="text-gray-600 text-sm">
              {alerts.length} location{alerts.length !== 1 ? "s" : ""} on map
            </span>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {hasNewAlert && (
              <Button
                onClick={stopAlarm}
                variant="destructive"
                size="sm"
                className="animate-pulse"
              >
                Stop Alarm
              </Button>
            )}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button onClick={() => fetchAlerts()} size="sm">
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex-1 relative min-h-0 bg-gray-100">
          <div ref={mapRef} className="absolute inset-0 max-w-5xl mx-auto h-full" />
          {!GOOGLE_MAPS_API_KEY && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 text-gray-600">
              Google Maps API key not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
            </div>
          )}
          {alerts.length === 0 && !loading && GOOGLE_MAPS_API_KEY && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 rounded-lg shadow text-sm text-gray-600">
              No SOS alerts yet. Locations will appear here when reported.
            </div>
          )}
        </div>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              SOS Emergency Alert Details
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">User Name</p>
                  <p className="font-semibold">{selectedAlert.userName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-sm">{selectedAlert.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {selectedAlert.userPhone && (
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedAlert.userPhone}</p>
                  </div>
                </div>
              )}

              {/* Driver Information */}
              {selectedAlert.driverName && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Driver Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-gray-600">Driver Name</p>
                        <p className="font-semibold">{selectedAlert.driverName}</p>
                      </div>
                      {selectedAlert.licenseNumber && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">License Number</p>
                          <p className="font-semibold">{selectedAlert.licenseNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Vehicle Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAlert.vehicleType && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">Vehicle Type</p>
                          <p className="font-semibold">{selectedAlert.vehicleType}</p>
                        </div>
                      )}
                      {selectedAlert.plateNumber && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">Plate Number</p>
                          <p className="font-semibold">{selectedAlert.plateNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Location Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="grow">
                    <p className="text-sm font-medium text-blue-900">Location</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedAlert.address || "Coordinates detected"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Lat: {selectedAlert.latitude.toFixed(6)}, Lon:{" "}
                      {selectedAlert.longitude.toFixed(6)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        openMapLocation(selectedAlert.latitude, selectedAlert.longitude)
                      }
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600">Alert Time</p>
                <p className="font-semibold">
                  {new Date(selectedAlert.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })}
                </p>
              </div>

              {/* Status Update */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(value: "active" | "resolved" | "cancelled") => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Close
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
