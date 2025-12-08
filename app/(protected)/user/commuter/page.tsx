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
  const [isCalculatingFare, setIsCalculatingFare] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [mapClickMode, setMapClickMode] = useState<"from" | "to">("from")
  const tripSavedRef = useRef(false)
  const currentTripIdRef = useRef<string | null>(null)
  const originalStartingPointRef = useRef<string>("")
  const originalStartCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const mapClickModeRef = useRef<"from" | "to">("from")
  /**
   * Helper: get the user's current location plus a human‑readable label
   * (place name / cleaned address or raw coordinates).
   */
  const getCurrentLocationWithLabel = useCallback((): Promise<{
    lat: number
    lng: number
    label: string
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude

          // If Google Maps is not loaded, just fall back to raw coordinates
          if (
            typeof window === "undefined" ||
            !(window as any).google ||
            !(window as any).google.maps
          ) {
            resolve({ lat, lng, label: `${lat},${lng}` })
            return
          }

          const geocoder = new (window as any).google.maps.Geocoder()
          geocoder.geocode(
            { location: { lat, lng } },
            (results: any, status: string) => {
              if (
                status ===
                  (window as any).google.maps.GeocoderStatus.OK &&
                results &&
                results[0]
              ) {
                const result = results[0]

                // Helper function to clean Plus Code from address
                const cleanPlusCode = (address: string): string => {
                  // Remove Plus Code pattern (e.g., "V2R5+375" or "V2R5+375,")
                  const plusCodeMatch = address.match(/^([A-Z0-9]{2,}\+[A-Z0-9]{2,}),?\s*/i)
                  if (plusCodeMatch) {
                    const cleaned = address
                      .replace(/^[A-Z0-9]{2,}\+[A-Z0-9]{2,},?\s*/i, "")
                      .trim()
                    return cleaned || address
                  }
                  return address
                }

                // Helper function to extract meaningful address parts
                const extractAddress = (components: any[]): string | null => {
                  // Priority order: street_number + route, then route, then neighborhood, then locality
                  let streetNumber = ""
                  let route = ""
                  let neighborhood = ""
                  let locality = ""

                  for (const component of components || []) {
                    if (component.types.includes("street_number")) {
                      streetNumber = component.long_name
                    } else if (component.types.includes("route")) {
                      route = component.long_name
                    } else if (component.types.includes("neighborhood") || component.types.includes("sublocality")) {
                      neighborhood = component.long_name
                    } else if (component.types.includes("locality")) {
                      locality = component.long_name
                    }
                  }

                  // Build address from parts
                  if (streetNumber && route) {
                    return `${streetNumber} ${route}`
                  } else if (route) {
                    return route
                  } else if (neighborhood) {
                    return neighborhood
                  } else if (locality) {
                    return locality
                  }

                  return null
                }

                // Prefer establishment / POI / premise name
                let placeName: string | null = null
                for (const component of result.address_components || []) {
                  if (
                    component.types.includes("establishment") ||
                    component.types.includes("point_of_interest") ||
                    component.types.includes("premise")
                  ) {
                    placeName = component.long_name
                    break
                  }
                }

                if (placeName) {
                  resolve({ lat, lng, label: placeName })
                  return
                }

                // Try to extract meaningful address from components
                const extractedAddress = extractAddress(result.address_components || [])
                if (extractedAddress) {
                  resolve({ lat, lng, label: extractedAddress })
                  return
                }

                // If there is a place_id, try PlacesService for a nicer name
                if (
                  result.place_id &&
                  (window as any).google.maps.places
                ) {
                  const mapDiv = document.createElement("div")
                  const placesService = new (window as any).google.maps
                    .places.PlacesService(mapDiv)
                  const request = {
                    placeId: result.place_id,
                    fields: ["name", "formatted_address", "address_components"],
                  }

                  placesService.getDetails(
                    request,
                    (place: any, placeStatus: string) => {
                      if (
                        placeStatus ===
                          (window as any).google.maps.places
                            .PlacesServiceStatus.OK &&
                        place
                      ) {
                        // Prefer place name
                        if (place.name && !place.name.match(/^[A-Z0-9]{2,}\+[A-Z0-9]{2,}/i)) {
                          resolve({ lat, lng, label: place.name })
                          return
                        }

                        // Try to extract from address components
                        const extracted = extractAddress(place.address_components || [])
                        if (extracted) {
                          resolve({ lat, lng, label: extracted })
                          return
                        }

                        // Clean formatted address
                        const formatted = place.formatted_address || result.formatted_address || ""
                        const cleaned = cleanPlusCode(formatted)
                        
                        if (cleaned && !cleaned.match(/^[A-Z0-9]{2,}\+[A-Z0-9]{2,}/i)) {
                          // Take first meaningful part (before first comma)
                          const parts = cleaned.split(",")
                          const firstPart = parts[0]?.trim()
                          if (firstPart && firstPart.length > 3) {
                            resolve({ lat, lng, label: firstPart })
                            return
                          }
                        }
                      }

                      // Fallback: clean the original formatted address
                      const formatted = result.formatted_address || ""
                      const cleaned = cleanPlusCode(formatted)
                      
                      if (cleaned && !cleaned.match(/^[A-Z0-9]{2,}\+[A-Z0-9]{2,}/i)) {
                        const parts = cleaned.split(",")
                        const firstPart = parts[0]?.trim()
                        if (firstPart && firstPart.length > 3) {
                          resolve({ lat, lng, label: firstPart })
                          return
                        }
                      }

                      // Last resort: use coordinates if we can't get a good name
                      resolve({ lat, lng, label: `${lat.toFixed(6)},${lng.toFixed(6)}` })
                    }
                  )
                } else {
                  // No place_id – clean up formatted_address / plus code
                  const formatted = result.formatted_address || ""
                  const cleaned = cleanPlusCode(formatted)
                  
                  if (cleaned && !cleaned.match(/^[A-Z0-9]{2,}\+[A-Z0-9]{2,}/i)) {
                    const parts = cleaned.split(",")
                    const firstPart = parts[0]?.trim()
                    if (firstPart && firstPart.length > 3) {
                      resolve({ lat, lng, label: firstPart })
                      return
                    }
                  }

                  // Try to extract from address components
                  const extracted = extractAddress(result.address_components || [])
                  if (extracted) {
                    resolve({ lat, lng, label: extracted })
                    return
                  }

                  // Last resort: use coordinates
                  resolve({ lat, lng, label: `${lat.toFixed(6)},${lng.toFixed(6)}` })
                }
              } else {
                // Reverse geocoding failed – fall back to coordinates
                resolve({ lat, lng, label: `${lat.toFixed(6)},${lng.toFixed(6)}` })
              }
            }
          )
        },
        (err) => {
          reject(err)
        }
      )
    })
  }, [])
  
  // Keep mapClickModeRef in sync with mapClickMode
  useEffect(() => {
    mapClickModeRef.current = mapClickMode
  }, [mapClickMode])

  // Automatically get user's current location on page load
  useEffect(() => {
    // Only get location if starting point is not already set
    if (!startingPoint && !isTracking) {
      getCurrentLocationWithLabel()
        .then(({ lat, lng, label }) => {
          setStartCoords({ lat, lng })
          setStartingPoint(label)
        })
        .catch((error) => {
          console.warn("Could not get user location on page load:", error)
          // Don't show alert on page load, just log it
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
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

  // Callback to receive fare calculating state from MapComponent
  const handleFareCalculating = useCallback((calculating: boolean) => {
    setIsCalculatingFare(calculating)
  }, [])

  // Set starting point to user's current location
  const handleRequestCurrentLocation = useCallback(() => {
    // Don't allow changing starting point if tracking is active
    if (isTracking) {
      alert("Cannot change starting point while tracking is active.");
      return;
    }
    getCurrentLocationWithLabel()
      .then(({ lat, lng, label }) => {
        setStartCoords({ lat, lng })
        setStartingPoint(label)
      })
      .catch(() => {
        alert("Could not get your location.")
      })
  }, [isTracking, getCurrentLocationWithLabel])

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
    // If we are currently tracking, stop and complete the trip
    if (isTracking) {
      setIsTracking(false)

      if (currentTripIdRef.current) {
        const tripId = currentTripIdRef.current
        currentTripIdRef.current = null
        tripSavedRef.current = false

        // Restore original starting point/coords if they were changed
        if (
          originalStartingPointRef.current &&
          startingPoint !== originalStartingPointRef.current
        ) {
          setStartingPoint(originalStartingPointRef.current)
        }
        if (
          originalStartCoordsRef.current &&
          startCoords !== originalStartCoordsRef.current
        ) {
          setStartCoords(originalStartCoordsRef.current)
        }
        originalStartingPointRef.current = ""
        originalStartCoordsRef.current = null

        completeTrip(tripId).catch((err) => {
          console.error("Failed to complete trip:", err)
        })
      }

      return
    }

    // Starting tracking:
    // 1) Get the user's live location
    // 2) Use that as point A (startingPoint + startCoords)
    // 3) Save the trip and flip tracking on so MapComponent can live‑track
    if (!destination) {
      alert("Please set a destination before starting the trip.")
      return
    }

    getCurrentLocationWithLabel()
      .then(({ lat, lng, label }) => {
        // Update point A to current user location
        setStartCoords({ lat, lng })
        setStartingPoint(label)

        // Remember original values while tracking is active
        originalStartingPointRef.current = label
        originalStartCoordsRef.current = { lat, lng }

        // Persist trip in Firestore
        tripSavedRef.current = true
        return saveTrip(
          label || "",
          { lat, lng },
          destination || "",
          destCoords,
          fare
        )
      })
      .then((tripId) => {
        if (tripId) {
          currentTripIdRef.current = tripId
        }
        // Enable tracking so MapComponent can start live GPS tracking
        setIsTracking(true)
      })
      .catch((err) => {
        console.error("Failed to start tracking / save trip:", err)
        tripSavedRef.current = false
        alert("Could not start tracking. Please try again.")
      })
  }, [
    isTracking,
    destination,
    destCoords,
    fare,
    startingPoint,
    startCoords,
    getCurrentLocationWithLabel,
  ])

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background relative overflow-hidden">
      {/* Left Panel - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <NavigationPanel
          destination={destination}
          setDestination={setDestination}
          startingPoint={startingPoint}
          setStartingPoint={setStartingPointSafe}
          fare={fare}
          isCalculatingFare={isCalculatingFare}
          onRequestCurrentLocation={handleRequestCurrentLocation}
          isTracking={isTracking}
          onToggleTracking={handleToggleTracking}
          mapClickMode={mapClickMode}
          onMapClickModeChange={setMapClickMode}
          onStartingPointCoordsChange={setStartCoords}
          onDestinationCoordsChange={setDestCoords}
        />
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative w-full h-full md:h-auto min-h-0">
        <MapComponent
          startingPoint={startingPoint}
          destination={destination}
          startCoords={startCoords}
          destCoords={destCoords}
          onFareChange={handleFareChange}
          onFareCalculating={handleFareCalculating}
          onMapClick={handleMapClick}
          startTracking={isTracking}
        />
      </div>

      {/* Mobile Panel - Bottom sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-lg max-h-[70vh] overflow-y-auto">
        <NavigationPanel
          destination={destination}
          setDestination={setDestination}
          startingPoint={startingPoint}
          setStartingPoint={setStartingPointSafe}
          fare={fare}
          isCalculatingFare={isCalculatingFare}
          onRequestCurrentLocation={handleRequestCurrentLocation}
          isTracking={isTracking}
          onToggleTracking={handleToggleTracking}
          mapClickMode={mapClickMode}
          onMapClickModeChange={setMapClickMode}
          onStartingPointCoordsChange={setStartCoords}
          onDestinationCoordsChange={setDestCoords}
        />
      </div>
    </div>
  )
}
