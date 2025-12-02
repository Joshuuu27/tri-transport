
"use client";

import { useEffect, useRef, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASEFARE = parseFloat(process.env.NEXT_PUBLIC_BASEFARE || '15');
const PERKM = parseFloat(process.env.NEXT_PUBLIC_PERKM || '10');
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
  startCoords?: { lat: number; lng: number } | null;
  destCoords?: { lat: number; lng: number } | null;
  onFareChange?: (fare: number | null) => void;
  onMapClick?: (data: { lat: number; lng: number; address?: string }) => void;
  startTracking?: boolean;
}

export default function MapComponent({ startingPoint, destination, startCoords, destCoords, onFareChange, onMapClick, startTracking }: MapComponentProps) {
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
  const originalStartCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isTrackingRef = useRef(false);
  const originMarker = useRef<any>(null);
  const destinationMarker = useRef<any>(null);
  const originInfoWindow = useRef<any>(null);
  const destinationInfoWindow = useRef<any>(null);

  // Watch for startTracking prop to begin/stop GPS tracking
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    if (!mapInstance.current || !(window as any).google) return;

    if (startTracking) {
      if (trackingWatchId.current != null) return; // already tracking

      // Store original starting coordinates when tracking starts - don't overwrite if already set
      if (startCoords && !originalStartCoordsRef.current) {
        originalStartCoordsRef.current = { ...startCoords };
      }
      
      // Ensure destination coordinates are stored
      if (destCoords && !destLatLngRef.current) {
        destLatLngRef.current = destCoords;
      }
      
      isTrackingRef.current = true;

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

      // Ensure we have the destination coordinates stored
      if (!destLatLngRef.current && destination && destCoords) {
        destLatLngRef.current = destCoords;
      }

      // Calculate initial route from original starting point before starting GPS tracking
      if (originalStartCoordsRef.current && destLatLngRef.current) {
        const ds = new (window as any).google.maps.DirectionsService();
        ds.route(
          {
            origin: originalStartCoordsRef.current, // Use original starting point from fields
            destination: destLatLngRef.current,
            travelMode: (window as any).google.maps.TravelMode.DRIVING,
          },
          (result: any, status: string) => {
            if (status === "OK") {
              directionsRenderer.current.setDirections(result);
              try {
                currentRoutePath.current = result.routes[0].overview_path || null;
              } catch (e) {
                currentRoutePath.current = null;
              }
            }
          }
        );
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

          // Don't update the route during tracking - keep it from original starting point
          // The route should remain from the original starting point to destination
          // We only track the GPS position, but don't change the route origin
          // The route is calculated once when tracking starts and stays fixed
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
      // Reset tracking flag and original start coords
      isTrackingRef.current = false;
      originalStartCoordsRef.current = null;
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
        zoom: 17,
      });

      directionsRenderer.current = new (window as any).google.maps.DirectionsRenderer();
      directionsRenderer.current.setMap(mapInstance.current);

      // Try to center map on user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            mapInstance.current.setCenter(coords);
            mapInstance.current.setZoom(17);
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
                  scale: 10,
                  fillColor: "#ff0000",
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

      // Set up map click listener after map is initialized
      setupMapClickListener();
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

  // Helper function to get place name from geocoding
  const getPlaceNameFromCoordinates = useCallback((lat: number, lng: number, callback: (data: { lat: number; lng: number; address?: string }) => void) => {
    const geocoder = new (window as any).google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
      if (status === (window as any).google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        
        // First, try to get establishment/premise name from address_components
        let placeName = null;
        for (const component of result.address_components || []) {
          if (component.types.includes('establishment') || 
              component.types.includes('point_of_interest') ||
              component.types.includes('premise')) {
            placeName = component.long_name;
            break;
          }
        }
        
        // If we found a place name, use it
        if (placeName) {
          callback({ lat, lng, address: placeName });
          return;
        }
        
        // If we have a place_id, try to get place details for the name
        if (result.place_id && (window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
          const placesService = new (window as any).google.maps.places.PlacesService(mapInstance.current);
          const request = {
            placeId: result.place_id,
            fields: ['name', 'formatted_address']
          };
          
          placesService.getDetails(request, (place: any, placeStatus: string) => {
            if (placeStatus === (window as any).google.maps.places.PlacesServiceStatus.OK && place && place.name) {
              // Use the place name (e.g., "Agri Solution Beach Resort")
              callback({ lat, lng, address: place.name });
            } else {
              // Fallback: clean up formatted_address to remove Plus Codes
              const formatted = result.formatted_address || '';
              const plusCodeMatch = formatted.match(/^([A-Z0-9]+\+[A-Z0-9]+),?\s*/);
              let address = formatted;
              
              if (plusCodeMatch) {
                // Remove Plus Code and use the rest
                const withoutPlusCode = formatted.replace(/^[A-Z0-9]+\+[A-Z0-9]+,?\s*/, '').trim();
                if (withoutPlusCode) {
                  const parts = withoutPlusCode.split(',');
                  address = parts[0].trim() || formatted;
                }
              }
              callback({ lat, lng, address });
            }
          });
        } else {
          // No place_id, clean up the formatted_address
          const formatted = result.formatted_address || '';
          const plusCodeMatch = formatted.match(/^([A-Z0-9]+\+[A-Z0-9]+),?\s*/);
          let address = formatted;
          
          if (plusCodeMatch) {
            const withoutPlusCode = formatted.replace(/^[A-Z0-9]+\+[A-Z0-9]+,?\s*/, '').trim();
            if (withoutPlusCode) {
              const parts = withoutPlusCode.split(',');
              address = parts[0].trim() || formatted;
            }
          }
          callback({ lat, lng, address });
        }
      } else {
        console.warn("Reverse geocoding failed, using coordinates:", status);
        callback({ lat, lng });
      }
    });
  }, []);

  // Function to set up map click listener
  const setupMapClickListener = useCallback(() => {
    if (!mapInstance.current || !(window as any).google) {
      console.log("Map click listener: map not ready yet");
      return;
    }

    // Remove old listener
    if (mapClickListener.current) {
      (window as any).google.maps.event.removeListener(mapClickListener.current);
      mapClickListener.current = null;
    }

    // Add new listener with place name geocoding
    console.log("Setting up map click listener");
    mapClickListener.current = mapInstance.current.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log("Map clicked at:", lat, lng);
      
      // Use the ref to get the latest callback
      if (onMapClickRef.current) {
        getPlaceNameFromCoordinates(lat, lng, onMapClickRef.current);
      } else {
        console.warn("onMapClick callback is not available");
      }
    });
  }, [getPlaceNameFromCoordinates]);

  // Use a ref to store the latest onMapClick callback
  const onMapClickRef = useRef(onMapClick);
  
  // Keep the ref updated
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Re-setup map click listener when onMapClick callback changes (to ensure it's always available)
  useEffect(() => {
    // Only re-setup if map is already initialized
    if (mapInstance.current && (window as any).google && onMapClick) {
      setupMapClickListener();
    }
  }, [onMapClick, setupMapClickListener]);
  // Update route when startingPoint or destination changes
  // But don't update if we're tracking and the change is from GPS updates
  useEffect(() => {
    if (!(window as any).google || !mapInstance.current || !directionsRenderer.current) return;
    if (!startingPoint || !destination) {
      directionsRenderer.current.set("directions", null);
      if (onFareChange) onFareChange(null);
      return;
    }
    
    // If tracking is active, use original starting point coordinates instead of current ones
    const getCoordinates = (input: string, coords?: { lat: number; lng: number } | null): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve, reject) => {
        // If tracking is active and we have original starting coordinates, use those for origin
        if (isTrackingRef.current && originalStartCoordsRef.current && input === startingPoint) {
          resolve(originalStartCoordsRef.current);
          return;
        }
        
        // First, prefer stored coordinates for accuracy
        if (coords && coords.lat && coords.lng) {
          resolve(coords);
          return;
        }
        
        // Try to parse as coordinates
        const coordMatch = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (coordMatch) {
          resolve({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
          return;
        }
        
        // Fallback to geocoding the address/name
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

    Promise.all([getCoordinates(startingPoint, startCoords), getCoordinates(destination, destCoords)])
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
                  const fare = BASEFARE + distanceKm * PERKM;
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
  }, [startingPoint, destination, startCoords, destCoords, onFareChange]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" style={{ minHeight: 400 }} />
    </div>
  );
}
