
"use client";

import { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGoogleMapsScript(apiKey: string) {
  if (typeof window === "undefined" || document.getElementById("google-maps-script")) return;
  const script = document.createElement("script");
  script.id = "google-maps-script";
  // include geometry library for distance calculations
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
  script.async = true;
  document.body.appendChild(script);
}

interface MapComponentProps {
  startingPoint: string;
  destination: string;
  onFareChange?: (fare: number | null) => void;
  onMapClick?: (data: { lat: number; lng: number; address?: string }) => void;
  startTracking?: boolean;
}

export default function MapComponent({ startingPoint, destination, onFareChange, onMapClick, startTracking }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const mapClickListener = useRef<any>(null);
  const currentLocationMarker = useRef<any>(null);
  const trackingWatchId = useRef<number | null>(null);
  const trackingMarker = useRef<any>(null);
  const trackingPath = useRef<any>(null);
  const currentRoutePath = useRef<any>(null);
  const destLatLngRef = useRef<any>(null);

  // Watch for startTracking prop to begin/stop GPS tracking
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    if (!mapInstance.current || !(window as any).google) return;

    if (startTracking) {
      if (trackingWatchId.current != null) return; // already tracking

      if (!trackingPath.current) {
        trackingPath.current = new (window as any).google.maps.Polyline({
          map: mapInstance.current,
          path: [],
          strokeColor: "#4285F4",
          strokeWeight: 4,
        });
      }

      if (!trackingMarker.current) {
        trackingMarker.current = new (window as any).google.maps.Marker({
          map: mapInstance.current,
          title: "Tracking",
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#FF5722",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });
      }

      trackingWatchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (trackingMarker.current) trackingMarker.current.setPosition(coords);
          if (trackingPath.current) {
            const path = trackingPath.current.getPath();
            path.push(new (window as any).google.maps.LatLng(coords.lat, coords.lng));
          }
          if (mapInstance.current) mapInstance.current.panTo(coords);

          // If we have a current route path, detect deviation and reroute
          try {
            if (
              currentRoutePath.current &&
              (window as any).google &&
              (window as any).google.maps &&
              (window as any).google.maps.geometry
            ) {
              const posLatLng = new (window as any).google.maps.LatLng(coords.lat, coords.lng);
              let minDist = Infinity;
                for (let i = 0; i < currentRoutePath.current.length; i++) {
                const p = currentRoutePath.current[i];
                const d = (window as any).google.maps.geometry.spherical.computeDistanceBetween(posLatLng, p);
                if (d < minDist) minDist = d;
              }
              const deviationThreshold = 50; // meters
              if (minDist > deviationThreshold) {
                // reroute from current position to the stored destination lat/lng
                if (destLatLngRef.current) {
                  const ds = new (window as any).google.maps.DirectionsService();
                  ds.route(
                    {
                      origin: coords,
                      destination: destLatLngRef.current,
                      travelMode: (window as any).google.maps.TravelMode.DRIVING,
                    },
                    (result: any, status: string) => {
                      if (status === "OK") {
                        directionsRenderer.current.setDirections(result);
                        currentRoutePath.current = result.routes[0].overview_path || null;
                        const route = result.routes[0];
                        const leg = route.legs[0];
                        const distanceKm = leg.distance.value / 1000;
                        const fare = 15 + distanceKm * 10;
                        if (onFareChange) onFareChange(Math.round(fare));
                      } else {
                        console.warn("Reroute failed: ", status);
                      }
                    }
                  );
                }
              }
            }
          } catch (e) {
            // ignore
          }
        },
        (err) => {
          console.warn("watchPosition error", err);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    } else {
      // stop tracking
      if (trackingWatchId.current != null) {
        navigator.geolocation.clearWatch(trackingWatchId.current);
        trackingWatchId.current = null;
      }
      if (trackingMarker.current) {
        trackingMarker.current.setMap(null);
        trackingMarker.current = null;
      }
      if (trackingPath.current) {
        trackingPath.current.setMap(null);
        trackingPath.current = null;
      }
    }

    return () => {
      if (trackingWatchId.current != null) {
        navigator.geolocation.clearWatch(trackingWatchId.current);
        trackingWatchId.current = null;
      }
    };
  }, [startTracking]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);

    function initMap() {
      if (!((window as any).google && mapRef.current)) return;

      const defaultCenter = { lat: 14.5995, lng: 120.9842 };

      mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
      });

      directionsRenderer.current = new (window as any).google.maps.DirectionsRenderer();
      directionsRenderer.current.setMap(mapInstance.current);

      // Try to center map on user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            mapInstance.current.setCenter(coords);
            mapInstance.current.setZoom(14);
            // Place a marker for current location
            if (currentLocationMarker.current) {
              currentLocationMarker.current.setPosition(coords);
            } else {
              currentLocationMarker.current = new (window as any).google.maps.Marker({
                position: coords,
                map: mapInstance.current,
                title: "You are here",
                icon: {
                  path: (window as any).google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: "#2b8bf2",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#ffffff",
                },
              });
            }
          },
          () => {
            // permission denied or unavailable — leave default center
            return;
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }

      // Add map click listener
      if (onMapClick) {
        mapClickListener.current = mapInstance.current.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          // Try reverse geocoding to get a human-readable address
          try {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
              if (status === (window as any).google.maps.GeocoderStatus.OK && results && results[0]) {
                const address = results[0].formatted_address;
                onMapClick({ lat, lng, address });
              } else {
                onMapClick({ lat, lng });
              }
            });
          } catch (err) {
            onMapClick({ lat, lng });
          }
        });
      }
    }

    // Wait for script to load
    const interval = setInterval(() => {
      if ((window as any).google && (window as any).google.maps && mapRef.current) {
        clearInterval(interval);
        initMap();
      }
    }, 200);
    return () => {
      clearInterval(interval);
      if (mapClickListener.current) {
        (window as any).google.maps.event.removeListener(mapClickListener.current);
      }
    };
  }, []);

    // Update map click listener when onMapClick callback changes (e.g., when mapClickMode changes)
    useEffect(() => {
      if (!mapInstance.current || !(window as any).google) return;

      // Remove old listener
      if (mapClickListener.current) {
        (window as any).google.maps.event.removeListener(mapClickListener.current);
        mapClickListener.current = null;
      }

      // Add new listener with updated callback
      if (onMapClick) {
        mapClickListener.current = mapInstance.current.addListener("click", (e: any) => {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      }
    }, [onMapClick]);
    // Update map click listener when onMapClick callback changes (e.g., when mapClickMode changes)
    useEffect(() => {
      if (!mapInstance.current || !(window as any).google) return;

      // Remove old listener
      if (mapClickListener.current) {
        (window as any).google.maps.event.removeListener(mapClickListener.current);
        mapClickListener.current = null;
      }

      // Add new listener with updated callback
      if (onMapClick) {
        mapClickListener.current = mapInstance.current.addListener("click", (e: any) => {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      }
    }, [onMapClick]);
  // Update route when startingPoint or destination changes
  useEffect(() => {
    if (!(window as any).google || !mapInstance.current || !directionsRenderer.current) return;
    if (!startingPoint || !destination) {
      directionsRenderer.current.set("directions", null);
      if (onFareChange) onFareChange(null);
      return;
    }

    // Helper: parse lat,lng pair or geocode an address to LatLngLiteral
    const parseOrGeocode = (input: string): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve, reject) => {
        const coordMatch = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (coordMatch) {
          resolve({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
          return;
        }
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: input }, (results: any, status: string) => {
          if (status === (window as any).google.maps.GeocoderStatus.OK && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            reject(status);
          }
        });
      });
    };

    const directionsService = new (window as any).google.maps.DirectionsService();

    Promise.all([parseOrGeocode(startingPoint), parseOrGeocode(destination)])
      .then(([originLatLng, destLatLng]) => {
        directionsService.route(
          {
            origin: originLatLng,
            destination: destLatLng,
            travelMode: (window as any).google.maps.TravelMode.DRIVING,
          },
          (result: any, status: string) => {
            if (status === "OK") {
                  directionsRenderer.current.setDirections(result);
                  // store destination latlng so we can reroute later
                  try {
                    destLatLngRef.current = destLatLng;
                  } catch (e) {
                    destLatLngRef.current = null;
                  }
                  // store overview path for deviation detection
                  try {
                    currentRoutePath.current = result.routes[0].overview_path || null;
                  } catch (e) {
                    currentRoutePath.current = null;
                  }
                  // Calculate fare based on distance (e.g., 15 PHP base + 10 PHP per km)
                  const route = result.routes[0];
                  const leg = route.legs[0];
                  const distanceKm = leg.distance.value / 1000;
                  const fare = 15 + distanceKm * 10;
                  if (onFareChange) onFareChange(Math.round(fare));
            } else {
              directionsRenderer.current.set("directions", null);
              // Provide clearer logging for common statuses
              console.warn("DirectionsService failed: ", status);
              if (onFareChange) onFareChange(null);
              if (status === "ZERO_RESULTS" || status === "NOT_FOUND") {
                // Informative console message; UI can be improved to show toasts
                console.info("Directions request returned no results or locations not found.");
              }
            }
          }
        );
      })
      .catch((errStatus) => {
        console.warn("Geocoding failed for origin/destination:", errStatus);
        directionsRenderer.current.set("directions", null);
        if (onFareChange) onFareChange(null);
      });
  }, [startingPoint, destination, onFareChange]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" style={{ minHeight: 400 }} />
    </div>
  );
}
