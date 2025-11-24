"use client"

import { useState } from "react"
import MapComponent from "@/components/commuter/map-component"
import NavigationPanel from "@/components/commuter/navigation-panel"

export default function Home() {
  const [destination, setDestination] = useState("")
  const [startingPoint, setStartingPoint] = useState("")

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Panel */}
      <NavigationPanel
        destination={destination}
        setDestination={setDestination}
        startingPoint={startingPoint}
        setStartingPoint={setStartingPoint}
      />

      {/* Right Panel - Map */}
      <MapComponent />
    </div>
  )
}
