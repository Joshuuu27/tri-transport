'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Calendar, Clock, Navigation2, PhilippinePeso, CheckCircle2, Loader2, CalendarClock } from 'lucide-react';

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  duration?: string;
  distance?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  fare?: number | null;
  startedAt?: number;
}

interface TripDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
}

export default function TripDetailsModal({
  open,
  onOpenChange,
  trip,
}: TripDetailsModalProps) {
  if (!trip) return null;

  const statusConfig = {
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle2,
    },
    ongoing: {
      label: 'Ongoing',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: Loader2,
    },
    upcoming: {
      label: 'Upcoming',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: CalendarClock,
    },
  };

  const StatusIcon = statusConfig[trip.status].icon;

  const formatDate = () => {
    // First, try to use startedAt timestamp if available
    if (trip.startedAt) {
      const date = new Date(trip.startedAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    // Try to parse the date string
    if (trip.date) {
      // Try parsing as ISO string first
      let date = new Date(trip.date);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      // If that fails, try to parse common date formats
      // Handle formats like "Nov 12, 2024" or "11/12/2024"
      const parsed = Date.parse(trip.date);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    // If all parsing fails, return the original date string
    return trip.date || 'Date not available';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusConfig[trip.status].color.includes('green') ? 'text-green-600' : statusConfig[trip.status].color.includes('blue') ? 'text-blue-600' : 'text-yellow-600'}`} />
            Trip Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your trip
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${statusConfig[trip.status].color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig[trip.status].label}
            </span>
          </div>

          {/* Route Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Route</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex flex-col items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="w-0.5 h-16 bg-gradient-to-b from-primary to-accent/30" />
                  <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">From</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-base font-semibold text-foreground">{trip.from}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">To</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-base font-semibold text-foreground">{trip.to}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">Date & Time</h4>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate()}</p>
            </div>

            {/* Duration */}
            {trip.duration && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-foreground">Duration</h4>
                </div>
                <p className="text-sm text-muted-foreground">{trip.duration}</p>
              </div>
            )}

            {/* Distance */}
            {trip.distance && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation2 className="h-5 w-5 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-foreground">Distance</h4>
                </div>
                <p className="text-sm text-muted-foreground">{trip.distance}</p>
              </div>
            )}

            {/* Fare */}
            {trip.fare !== null && trip.fare !== undefined && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PhilippinePeso className="h-5 w-5 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-foreground">Fare</h4>
                </div>
                <p className="text-lg font-semibold text-foreground">₱{trip.fare.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Trip ID */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Trip ID</p>
            <p className="text-sm font-mono text-foreground">{trip.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

