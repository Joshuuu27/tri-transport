'use client';

import { MapPin, Calendar, Clock, Navigation2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  duration?: string;
  distance?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

interface TripHistoryCardProps {
  trip: Trip;
  onViewDetails?: (trip: Trip) => void;
}

export default function TripHistoryCard({ trip, onViewDetails }: TripHistoryCardProps) {
  const statusColors = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    upcoming: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className="group rounded-lg border border-border bg-card p-4 sm:p-6 hover:shadow-md hover:border-primary/50 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Trip Route */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-accent/30" />
              <div className="h-3 w-3 rounded-full bg-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="text-lg font-semibold text-foreground truncate">{trip.from}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="text-lg font-semibold text-foreground truncate">{trip.to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-3 sm:text-right">
          <div className="flex items-center gap-2 text-sm sm:justify-end">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{trip.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:justify-end">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{trip.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:justify-end">
            <Navigation2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium">{trip.distance}</span>
          </div>
        </div>
      </div>

      {/* Status and Action */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[trip.status]}`}>
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 gap-1"
          onClick={() => onViewDetails?.(trip)}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
