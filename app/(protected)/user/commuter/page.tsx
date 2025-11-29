"use client"

import { useState, useCallback, useRef } from "react"
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

  // Callback to receive fare from MapComponent
  const handleFareChange = useCallback((fareValue: number | null) => {
    setFare(fareValue)
  }, [])

  // Set starting point to user's current location
  const handleRequestCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStartingPoint(`${pos.coords.latitude},${pos.coords.longitude}`)
        },
        (err) => {
          alert("Could not get your location.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }, [])

  // Set starting point or destination by clicking on the map
  const handleMapClick = useCallback((data: { lat: number; lng: number; address?: string }) => {
    const coordsOrAddress = data.address ? data.address : `${data.lat},${data.lng}`;
    if (mapClickMode === "from") {
      setStartingPoint(coordsOrAddress)
      setStartCoords({ lat: data.lat, lng: data.lng })
    } else {
      setDestination(coordsOrAddress)
      setDestCoords({ lat: data.lat, lng: data.lng })
    }
  }, [mapClickMode])

  const handleToggleTracking = useCallback(() => {
    setIsTracking((prev) => {
      const next = !prev;
      // When starting tracking, record a trip to Firestore
      if (!prev && next && !tripSavedRef.current) {
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
        setStartingPoint={setStartingPoint}
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
        onFareChange={handleFareChange}
        onMapClick={handleMapClick}
        startTracking={isTracking}
      />
    </div>
  )
}
