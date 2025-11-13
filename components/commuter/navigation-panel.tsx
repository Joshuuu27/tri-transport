"use client";

import { Circle, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NavigationPanelProps {
  destination: string;
  setDestination: (value: string) => void;
  startingPoint: string;
  setStartingPoint: (value: string) => void;
}

export default function NavigationPanel({
  destination,
  setDestination,
  startingPoint,
  setStartingPoint,
}: NavigationPanelProps) {
  return (
    <div className="w-96 bg-white border-r border-border flex flex-col">
      {/* Header with menu icon */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {/* <Circle className="w-6 h-6 text-muted-foreground" /> */}
        <div>
          <h3></h3>
        </div>
        <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
      </div>

      {/* Input Fields */}
      <div className="p-4 space-y-3">
        {/* Destination Input */}
        <div className="relative">
          <Input
            placeholder="Choose destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-4 pr-4 py-3 border-2 border-border rounded-lg"
          />
        </div>

        {/* Starting Point Input */}
        <div className="relative">
          <Input
            placeholder="Choose starting point, or click on the map"
            value={startingPoint}
            onChange={(e) => setStartingPoint(e.target.value)}
            className="w-full pl-4 pr-4 py-3 border-2 border-border rounded-lg"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="px-4">
        <div className="h-1 bg-border rounded-full"></div>
      </div>

      {/* Delays Section */}
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2">Price</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Price value depends on the LGU rates.
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {/* No known road disruptions. Traffic incidents will show{" "} */}
          {/* <span className="text-primary cursor-pointer">up here</span>. */}
        </p>
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
