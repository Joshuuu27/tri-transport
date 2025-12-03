"use client";

import { Circle, MoreVertical } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGoogleMapsScript(apiKey: string) {
  if (typeof window === "undefined" || document.getElementById("google-maps-script")) return;
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  document.body.appendChild(script);
}

interface NavigationPanelProps {
  destination: string;
  setDestination: (value: string) => void;
  startingPoint: string;
  setStartingPoint: (value: string) => void;
  fare?: number | null;
  onRequestCurrentLocation?: () => void;
  isTracking?: boolean;
  onToggleTracking?: () => void;
  mapClickMode?: "from" | "to";
  onMapClickModeChange?: (mode: "from" | "to") => void;
}

export default function NavigationPanel({
  destination,
  setDestination,
  startingPoint,
  setStartingPoint,
  fare,
  onRequestCurrentLocation,
  isTracking,
  onToggleTracking, 
  mapClickMode,
  onMapClickModeChange,
}: NavigationPanelProps) {
  const [locating, setLocating] = useState(false);
  const startInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Load Google Places Autocomplete for both fields
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initAutocomplete = () => {
      if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.places) return;
      // Starting Point Autocomplete
      if (startInputRef.current) {
        const autocompleteStart = new (window as any).google.maps.places.Autocomplete(startInputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "ph" },
        });
        autocompleteStart.addListener("place_changed", () => {
          // Don't allow autocomplete to change starting point if tracking is active
          if (isTracking) return;
          const place = autocompleteStart.getPlace();
          if (place && place.formatted_address) setStartingPoint(place.formatted_address);
          else if (place && place.name) setStartingPoint(place.name);
        });
      }
      // Destination Autocomplete
      if (destInputRef.current) {
        const autocompleteDest = new (window as any).google.maps.places.Autocomplete(destInputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "ph" },
        });
        autocompleteDest.addListener("place_changed", () => {
          const place = autocompleteDest.getPlace();
          if (place && place.formatted_address) setDestination(place.formatted_address);
          else if (place && place.name) setDestination(place.name);
        });
      }
    };

    if (!(window as any).google) {
      if (GOOGLE_MAPS_API_KEY) {
        loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        const handle = () => {
          initAutocomplete();
        };
        window.addEventListener("google-maps-ready", handle);
        // Some browsers fire onload for script, so also poll until available
        const poll = setInterval(() => {
          if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
            clearInterval(poll);
            initAutocomplete();
          }
        }, 200);
        return () => {
          clearInterval(poll);
          window.removeEventListener("google-maps-ready", handle);
        };
      }
      return;
    }

    initAutocomplete();
  }, [setStartingPoint, setDestination]);

  return (
    <div className="w-full md:w-96 bg-background border-r border-border flex flex-col h-full md:h-auto">
      {/* Header with menu icon */}
      <div className="p-3 md:p-4 border-b border-border flex items-center justify-between">
        {/* <Circle className="w-6 h-6 text-muted-foreground" /> */}
        <div>
          <h3 className="text-sm md:text-base font-semibold">Trip Details</h3>
        </div>
        <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
      </div>

      {/* Input Fields */}
      <div className="p-3 md:p-4 space-y-3">
        {/* Starting Point (From) Input */}
        <div className="relative flex gap-2 items-stretch">
          <Input
            ref={startInputRef}
            placeholder="From (click map or use My Location)"
            value={startingPoint}
            onChange={(e) => {
              // Don't allow changes if tracking is active
              if (!isTracking) {
                setStartingPoint(e.target.value); 
              }
            }}
            onFocus={() => { if (onMapClickModeChange) onMapClickModeChange('from'); }}
            onClick={() => { if (onMapClickModeChange) onMapClickModeChange('from'); }}
            readOnly={isTracking}
            className="flex-1 text-sm md:text-base pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 border-2 border-border rounded-lg min-h-[44px]"
          />
          <button
            type="button"
            className={`px-3 md:px-2 py-2.5 md:py-2 rounded-lg text-xs font-semibold transition min-w-[44px] md:min-w-0 flex items-center justify-center ${mapClickMode === 'from' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => { if (onMapClickModeChange) onMapClickModeChange('from'); }}
            title="Click map to set From location"
          >
            📍
          </button>
          <button
            type="button"
            className="px-3 md:px-3 py-2.5 md:py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition whitespace-nowrap min-h-[44px] md:min-h-0"
            onClick={() => {
              if (onRequestCurrentLocation) {
                setLocating(true);
                onRequestCurrentLocation();
                setTimeout(() => setLocating(false), 2000);
              }
            }}
            disabled={locating}
            title="Use my location"
          >
            {locating ? "..." : "📍"}
          </button>
        </div>

        {/* Destination (To) Input */}
        <div className="relative flex gap-2 items-stretch">
          <Input
            ref={destInputRef}
            placeholder="To (search or click map)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => { if (onMapClickModeChange) onMapClickModeChange('to'); }}
            onClick={() => { if (onMapClickModeChange) onMapClickModeChange('to'); }}
            className="flex-1 text-sm md:text-base pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 border-2 border-border rounded-lg min-h-[44px]"
          />
          <button
            type="button"
            className={`px-3 md:px-2 py-2.5 md:py-2 rounded-lg text-xs font-semibold transition min-w-[44px] md:min-w-0 flex items-center justify-center ${mapClickMode === 'to' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => { if (onMapClickModeChange) onMapClickModeChange('to'); }}
            title="Click map to set To location"
          >
            📍
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="px-3 md:px-4">
        <div className="h-1 bg-border rounded-full"></div>
      </div>

      {/* Fare Section */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Fare</h3>
          {fare !== null ? (
            <p className="text-xl md:text-2xl font-bold text-primary mb-2">₱{fare}</p>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground mb-4">Enter route to see fare.</p>
          )}
        </div>
        {/* Start/Stop Tracking Button */}
        <div className="mt-auto">
          <button
            type="button"
            className={`w-full px-4 py-3 md:py-2 rounded-lg text-white font-semibold text-base md:text-sm min-h-[48px] md:min-h-[44px] ${isTracking ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'}`}
            onClick={() => { if (onToggleTracking) onToggleTracking(); }}
          >
            {isTracking ? 'Stop Tracking' : 'Start Your Ride'}
          </button>
        </div>
      </div>

      {/* Bottom menu area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition">
          <Circle className="w-5 h-5" />
          <span className="text-sm">Recent</span>
        </div>
      </div>
    </div>
  );
}
