"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import MapComponent from "@/components/commuter/map-component"
import NavigationPanel from "@/components/commuter/navigation-panel"
import { saveTrip, completeTrip } from "@/lib/firebase-trips"

export default function Home() {
  const [destination, setDestination] = useState("")
  const [startingPoint, setStartingPoint] = useState("")
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [fare, setFare] = useState<number | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [mapClickMode, setMapClickMode] = useState<"from" | "to">("from")
  const tripSavedRef = useRef(false)
  const currentTripIdRef = useRef<string | null>(null)
  const originalStartingPointRef = useRef<string>("")
  const originalStartCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const mapClickModeRef = useRef<"from" | "to">("from")
  
  // Keep mapClickModeRef in sync with mapClickMode
  useEffect(() => {
    mapClickModeRef.current = mapClickMode
  }, [mapClickMode])
  
  // Wrapper for setStartingPoint that prevents changes during tracking
  const setStartingPointSafe = useCallback((value: string) => {
    if (isTracking && originalStartingPointRef.current) {
      // If tracking is active, prevent changes and restore the original value
      console.log("Prevented starting point change during tracking");
      setStartingPoint(originalStartingPointRef.current);
      return;
    }
    setStartingPoint(value);
  }, [isTracking]);

  // Callback to receive fare from MapComponent
  const handleFareChange = useCallback((fareValue: number | null) => {
    setFare(fareValue)
  }, [])

  // Set starting point to user's current location
  const handleRequestCurrentLocation = useCallback(() => {
    // Don't allow changing starting point if tracking is active
    if (isTracking) {
      alert("Cannot change starting point while tracking is active.");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setStartCoords({ lat, lng });
          
          // Reverse geocode to get place name
          if (typeof window !== "undefined" && (window as any).google && (window as any).google.maps) {
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
                  setStartingPoint(placeName);
                  return;
                }
                
                // If we have a place_id, try to get place details for the name
                if (result.place_id && (window as any).google.maps.places) {
                  // Create a temporary map div for PlacesService
                  const mapDiv = document.createElement('div');
                  const placesService = new (window as any).google.maps.places.PlacesService(mapDiv);
                  const request = {
                    placeId: result.place_id,
                    fields: ['name', 'formatted_address']
                  };
                  
                  placesService.getDetails(request, (place: any, placeStatus: string) => {
                    if (placeStatus === (window as any).google.maps.places.PlacesServiceStatus.OK && place && place.name) {
                      setStartingPoint(place.name);
                    } else {
                      // Fallback: clean up formatted_address
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
                      setStartingPoint(address);
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
                  setStartingPoint(address);
                }
              } else {
                // Fallback to coordinates if geocoding fails
                setStartingPoint(`${lat},${lng}`);
              }
            });
          } else {
            // Fallback to coordinates if Google Maps is not loaded
            setStartingPoint(`${lat},${lng}`);
          }
        },
        (err) => {
          alert("Could not get your location.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }, [isTracking])

  // Set starting point or destination by clicking on the map
  const handleMapClick = useCallback((data: { lat: number; lng: number; address?: string }) => {
    const coordsOrAddress = data.address ? data.address : `${data.lat},${data.lng}`;
    const currentMode = mapClickModeRef.current; // Use ref to get latest value
    console.log("handleMapClick called with mode:", currentMode, "data:", data);
    
    if (currentMode === "from") {
      // Don't update starting point if tracking is active
      if (isTracking) {
        console.log("Tracking is active, not updating starting point");
        return;
      }
      console.log("Setting starting point:", coordsOrAddress);
      setStartingPoint(coordsOrAddress)
      setStartCoords({ lat: data.lat, lng: data.lng })
    } else {
      console.log("Setting destination:", coordsOrAddress);
      setDestination(coordsOrAddress)
      setDestCoords({ lat: data.lat, lng: data.lng })
    }
  }, [isTracking]) // Remove mapClickMode from dependencies, use ref instead

  const handleToggleTracking = useCallback(() => {
    setIsTracking((prev) => {
      const next = !prev;
      // When starting tracking, record a trip to Firestore
      if (!prev && next && !tripSavedRef.current) {
        // Store original starting point and coordinates to prevent them from changing
        originalStartingPointRef.current = startingPoint;
        originalStartCoordsRef.current = startCoords ? { ...startCoords } : null;
        
        tripSavedRef.current = true;
        saveTrip(
          startingPoint || '',
          startCoords,
          destination || '',
          destCoords,
          fare
        )
          .then((tripId) => {
            currentTripIdRef.current = tripId;
          })
          .catch((err) => {
            console.error('Failed to save trip:', err);
            tripSavedRef.current = false;
          });
      }

      // When stopping tracking, mark the trip as completed in Firestore
      if (prev && !next && currentTripIdRef.current) {
        const tripId = currentTripIdRef.current;
        currentTripIdRef.current = null;
        tripSavedRef.current = false;
        // Restore original starting point if it was changed during tracking
        if (originalStartingPointRef.current && startingPoint !== originalStartingPointRef.current) {
          setStartingPoint(originalStartingPointRef.current);
        }
        if (originalStartCoordsRef.current && startCoords !== originalStartCoordsRef.current) {
          setStartCoords(originalStartCoordsRef.current);
        }
        originalStartingPointRef.current = "";
        originalStartCoordsRef.current = null;
        completeTrip(tripId).catch((err) => {
          console.error('Failed to complete trip:', err);
        });
      }

      return next;
    });
  }, [startingPoint, destination, fare, startCoords, destCoords])

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Panel */}
      <NavigationPanel
        destination={destination}
        setDestination={setDestination}
        startingPoint={startingPoint}
        setStartingPoint={setStartingPointSafe}
        fare={fare}
        onRequestCurrentLocation={handleRequestCurrentLocation}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        mapClickMode={mapClickMode}
        onMapClickModeChange={setMapClickMode}
      />

      {/* Right Panel - Map */}
      <MapComponent
        startingPoint={startingPoint}
        destination={destination}
        startCoords={startCoords}
        destCoords={destCoords}
        onFareChange={handleFareChange}
        onMapClick={handleMapClick}
        startTracking={isTracking}
      />
    </div>
  )
}
