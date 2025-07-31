
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
import type { Geofence } from '@/types';
import { LocateFixed, LogOut, ArrowLeft, Trash2, Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const INITIAL_GEOFENCE: Geofence = {
  id: 'new',
  name: '',
  center: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
  radius: 100, // 100 meters
};

const MOCK_SAVED_LOCATIONS: Geofence[] = [
    { id: 'loc1', name: 'Main Campus', center: { lat: 34.0522, lng: -118.2437 }, radius: 200 },
    { id: 'loc2', name: 'Sports Complex', center: { lat: 34.06, lng: -118.25 }, radius: 150 },
]

export default function GeofencePage() {
  const [currentGeofence, setCurrentGeofence] = useState<Geofence>(INITIAL_GEOFENCE);
  const [savedLocations, setSavedLocations] = useState<Geofence[]>(MOCK_SAVED_LOCATIONS);
  const [year, setYear] = useState<number | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  const handleSelectLocation = (location: Geofence) => {
    setCurrentGeofence(location);
  };

  const handleRadiusChange = (value: number[]) => {
    setCurrentGeofence(g => ({ ...g, radius: value[0] }));
  };

  const handleCenterChange = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setCurrentGeofence(g => ({ ...g, center: e.latLng!.toJSON() }));
    }
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) {
      setCurrentGeofence(g => ({ ...g, center: { ...g.center, lat } }));
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) {
      setCurrentGeofence(g => ({ ...g, center: { ...g.center, lng } }));
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGeofence(g => ({ ...g, name: e.target.value }));
  };

  const handleSave = () => {
    if (!currentGeofence.name) {
        alert('Please provide a name for the location.');
        return;
    }
    if (currentGeofence.id === 'new') {
        const newLocation = { ...currentGeofence, id: `loc-${Date.now()}`};
        setSavedLocations(prev => [...prev, newLocation]);
        alert(`Location "${newLocation.name}" saved!`);
    } else {
        setSavedLocations(prev => prev.map(loc => loc.id === currentGeofence.id ? currentGeofence : loc));
        alert(`Location "${currentGeofence.name}" updated!`);
    }
    setCurrentGeofence(INITIAL_GEOFENCE);
  };
  
  const handleDelete = (locationId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
        setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
        if (currentGeofence.id === locationId) {
            setCurrentGeofence(INITIAL_GEOFENCE);
        }
    }
  }
  
  const handleAddNew = () => {
    setCurrentGeofence(INITIAL_GEOFENCE);
  }

  if (year === null) return null;

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
            <Link href="/" passHref>
                <Button variant="secondary" className="font-bold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </Link>
        </div>
      </header>
       <main className="flex-grow container mx-auto p-4 md:p-8">
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

        <Card className="mb-8 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Saved Locations
                    <Button variant="outline" size="sm" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add New
                    </Button>
                </CardTitle>
                <CardDescription>
                    Manage your saved geofence locations. Select one to edit or view it on the map.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {savedLocations.map(location => (
                        <Card key={location.id} className={`flex items-center justify-between p-4 ${currentGeofence.id === location.id ? 'border-primary' : ''}`}>
                            <div>
                                <h3 className="font-semibold">{location.name}</h3>
                                <p className="text-sm text-muted-foreground">Radius: {location.radius}m</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleSelectLocation(location)}>
                                    <Edit className="h-4 w-4"/>
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(location.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {savedLocations.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No saved locations yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[60vh] lg:h-auto">
                {apiKey ? (
                    <APIProvider apiKey={apiKey}>
                        <Map
                            center={currentGeofence.center}
                            zoom={15}
                            mapId="geofence-map"
                            className="w-full h-full rounded-lg shadow-lg"
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            onClick={handleCenterChange}
                        >
                            <Circle
                                center={currentGeofence.center}
                                radius={currentGeofence.radius}
                                strokeColor="hsl(var(--accent))"
                                strokeOpacity={0.8}
                                strokeWeight={2}
                                fillColor="hsl(var(--accent))"
                                fillOpacity={0.25}
                            />
                             <AdvancedMarker position={currentGeofence.center} title={'Geofence Center'}>
                                 <Pin
                                    background={'hsl(var(--accent))'}
                                    borderColor={'hsl(var(--accent-foreground))'}
                                    glyphColor={'hsl(var(--accent-foreground))'}
                                 />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                ) : (
                    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                        <p className="text-muted-foreground">Google Maps API Key is missing.</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{currentGeofence.id === 'new' ? 'Add New Geofence' : `Editing: ${currentGeofence.name}`}</CardTitle>
                        <CardDescription>Click on the map to set the center and use the controls below to adjust the boundary.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="name">Location Name</Label>
                            <Input id="name" type="text" value={currentGeofence.name} onChange={handleNameChange} placeholder="e.g., Main Campus" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lat">Latitude</Label>
                                <Input id="lat" type="number" value={currentGeofence.center.lat} onChange={handleLatChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lng">Longitude</Label>
                                <Input id="lng" type="number" value={currentGeofence.center.lng} onChange={handleLngChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="radius">Radius (meters)</Label>
                            <div className="flex items-center gap-4">
                                <Slider
                                    id="radius"
                                    min={50}
                                    max={1000}
                                    step={10}
                                    value={[currentGeofence.radius]}
                                    onValueChange={handleRadiusChange}
                                />
                                <span className="font-mono text-lg w-24 text-center p-2 rounded-md bg-muted">{currentGeofence.radius}m</span>
                            </div>
                        </div>
                         <Button onClick={handleSave} className="w-full font-bold">{currentGeofence.id === 'new' ? 'Save New Location' : 'Update Location'}</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
       <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
            <p>&copy; {year} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

    