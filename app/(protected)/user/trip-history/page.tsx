'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TripHistoryCard from '@/components/commuter/trip-history-card';
import Header from '@/components/commuter/trip-history-header';

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  duration: string;
  distance: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

const SAMPLE_TRIPS: Trip[] = [
  {
    id: '1',
    from: 'Barangay Central (City Hall)',
    to: 'Dahican Beach',
    date: 'Nov 12, 2024',
    duration: '12 minutes',
    distance: '5.2 km',
    status: 'completed',
  },
  {
    id: '2',
    from: 'Matiao (Prk. Riverside)',
    to: 'Barangay Central (Public Market)',
    date: 'Nov 08, 2024',
    duration: '8 minutes',
    distance: '3.1 km',
    status: 'completed',
  },
  {
    id: '3',
    from: 'Badas Terminal',
    to: 'Dahican (Botona Beach)',
    date: 'Nov 01, 2024',
    duration: '15 minutes',
    distance: '6.8 km',
    status: 'completed',
  },
  {
    id: '4',
    from: 'Macambol',
    to: 'Barangay Central (City Hall)',
    date: 'Oct 28, 2024',
    duration: '35 minutes',
    distance: '18 km',
    status: 'completed',
  },
  {
    id: '5',
    from: 'Tamisan Elementary School',
    to: 'Matiao',
    date: 'Oct 20, 2024',
    duration: '20 minutes',
    distance: '10 km',
    status: 'completed',
  },
  {
    id: '6',
    from: 'Dahican (Amihan sa Dahican)',
    to: 'Sainz',
    date: 'Oct 15, 2024',
    duration: '10 minutes',
    distance: '4.4 km',
    status: 'completed',
  },
];


export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = SAMPLE_TRIPS.filter((trip) =>
    trip.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Search Section */}
        <section className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trips by location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-card border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with count */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Trip History</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Trips Grid */}
          {filteredTrips.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              {filteredTrips.map((trip) => (
                <TripHistoryCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-foreground font-medium">No trips found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
