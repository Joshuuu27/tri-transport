"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"

interface Profile {
  id: number
  name: string
  title: string
  image: string
}

interface ProfileCardProps {
  profile: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-input bg-card hover:bg-accent/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-muted">
          <Image
            src={profile.image || "/placeholder.svg"}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{profile.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.title}</p>
          <p>Current rating: 0.0</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
    </div>
  )
}
