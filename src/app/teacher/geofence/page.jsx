'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Circle } from '@/components/circle';
import { Pin } from '@/components/pin';
import { LocateFixed, LogOut, ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const INITIAL_GEOFENCE = {
  id: 'new',
  name: '',
  center: { lat: 34.0522, lng: -118.2437 },
  radius: 100,
};

const MOCK_SAVED_LOCATIONS = [
  { id: 'loc1', name: 'Main Campus', center: { lat: 34.0522, lng: -118.2437 }, radius: 200 },
  { id: 'loc2', name: 'Sports Complex', center: { lat: 34.06, lng: -118.25 }, radius: 150 },
];

export default function GeofencePage() {
  const [currentGeofence, setCurrentGeofence] = useState(INITIAL_GEOFENCE);
  const [savedLocations, setSavedLocations] = useState(MOCK_SAVED_LOCATIONS);
  const [year, setYear] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSelectLocation = (location) => {
    setCurrentGeofence(location);
  };

  const handleRadiusChange = (value) => {
    setCurrentGeofence((g) => ({ ...g, radius: value[0] }));
  };

  const handleCenterChange = (e) => {
    if (e.latLng) {
      setCurrentGeofence((g) => ({
        ...g,
        center: e.latLng.toJSON(),
      }));
    }
  };

  const handleNameChange = (e) => {
    setCurrentGeofence((g) => ({ ...g, name: e.target.value }));
  };

  const handleSave = () => {
    if (!currentGeofence.name) {
      alert('Please provide a name for the location.');
      return;
    }

    if (currentGeofence.id === 'new') {
      const newLocation = { ...currentGeofence, id: `loc-${Date.now()}` };
      setSavedLocations((prev) => [...prev, newLocation]);
      alert(`Location "${newLocation.name}" saved!`);
    } else {
      setSavedLocations((prev) =>
        prev.map((loc) =>
          loc.id === currentGeofence.id ? currentGeofence : loc
        )
      );
      alert(`Location "${currentGeofence.name}" updated!`);
    }

    setCurrentGeofence(INITIAL_GEOFENCE);
  };

  const handleDelete = (e, locationId) => {
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this location?')) {
      setSavedLocations((prev) =>
        prev.filter((loc) => loc.id !== locationId)
      );

      if (currentGeofence.id === locationId) {
        setCurrentGeofence(INITIAL_GEOFENCE);
      }
    }
  };

  const handleAddNew = () => {
    setCurrentGeofence(INITIAL_GEOFENCE);
  };

  const isApiKeyValid = apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LocateFixed className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-bold">
              Geofence Control
            </h1>
          </div>
          <Link href="/">
            <Button variant="secondary" className="font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-6xl shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-headline">
                  Setup Boundaries
                </CardTitle>
                <CardDescription className="mt-1">
                  Add, remove, and edit geofence boundaries for the campus.
                </CardDescription>
              </div>
              <Link href="/teacher/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardHeader>

          {/* Remaining JSX unchanged */}

        </Card>
      </main>

      <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>&copy; {year ?? ''} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
