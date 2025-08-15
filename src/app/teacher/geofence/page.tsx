
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
import { LocateFixed, LogOut, ArrowLeft, Trash2, Edit, PlusCircle, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const handleReset = () => {
    if(currentGeofence.id !== 'new') {
        const originalLocation = MOCK_SAVED_LOCATIONS.find(l => l.id === currentGeofence.id);
        if(originalLocation) {
            setCurrentGeofence(originalLocation);
        }
    } else {
        setCurrentGeofence(INITIAL_GEOFENCE);
    }
  }

  const handleRadiusChange = (value: number[]) => {
    setCurrentGeofence(g => ({ ...g, radius: value[0] }));
  };

  const handleCenterChange = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setCurrentGeofence(g => ({ ...g, center: e.latLng!.toJSON() }));
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
       <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-6xl shadow-2xl">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-headline">Setup Boundaries</CardTitle>
                        <CardDescription className="mt-1">Add, remove, and edit geofence boundaries for the campus. Click 'Add Boundary' to create one and 'Reset' to undo changes.</CardDescription>
                    </div>
                     <Link href="/teacher/dashboard" passHref>
                        <Button variant="ghost" size="icon">
                            <X className="h-5 w-5"/>
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="flex gap-2">
                        <Button onClick={handleAddNew} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Add Boundary</Button>
                        <Button onClick={handleReset} variant="outline" className="w-full"><RefreshCw className="mr-2 h-4 w-4"/> Reset Changes</Button>
                    </div>

                    <ScrollArea className="h-40 border rounded-md p-2">
                        <div className="space-y-2">
                             {savedLocations.map(location => (
                                <div key={location.id}
                                    onClick={() => handleSelectLocation(location)}
                                    className={cn("flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted",
                                    currentGeofence.id === location.id ? 'bg-muted border border-primary' : ''
                                    )}
                                >
                                    <span className="font-medium text-sm">{location.name}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(location.id); }}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                             ))}
                             {savedLocations.length === 0 && (
                                <p className="text-muted-foreground text-center py-4 text-sm">No saved locations yet.</p>
                            )}
                        </div>
                    </ScrollArea>
                    
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Boundary Name</Label>
                            <Input id="name" type="text" value={currentGeofence.name} onChange={handleNameChange} placeholder="e.g., Main Campus" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="radius">Radius: {currentGeofence.radius}m</Label>
                            <Slider
                                id="radius"
                                min={50}
                                max={1000}
                                step={10}
                                value={[currentGeofence.radius]}
                                onValueChange={handleRadiusChange}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Center</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input value={currentGeofence.center.lat.toFixed(6)} readOnly placeholder="Latitude"/>
                                <Input value={currentGeofence.center.lng.toFixed(6)} readOnly placeholder="Longitude"/>
                            </div>
                        </div>
                    </div>
                    
                </div>
                 <div className="md:col-span-2 h-[50vh] md:h-auto rounded-lg overflow-hidden">
                    {apiKey ? (
                        <APIProvider apiKey={apiKey}>
                            <Map
                                center={currentGeofence.center}
                                zoom={15}
                                mapId="geofence-map"
                                className="w-full h-full"
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                onClick={handleCenterChange}
                            >
                                <Circle
                                    center={currentGeofence.center}
                                    radius={currentGeofence.radius}
                                    strokeColor="hsl(var(--primary))"
                                    strokeOpacity={0.8}
                                    strokeWeight={2}
                                    fillColor="hsl(var(--primary))"
                                    fillOpacity={0.25}
                                />
                                <AdvancedMarker position={currentGeofence.center} title={'Geofence Center'}>
                                    <Pin
                                        background={'hsl(var(--primary))'}
                                        borderColor={'hsl(var(--primary-foreground))'}
                                        glyphColor={'hsl(var(--primary-foreground))'}
                                    />
                                </AdvancedMarker>
                            </Map>
                        </APIProvider>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted rounded-lg p-4">
                            <div className="text-center text-sm text-destructive">
                                <h3 className="font-semibold">Error: AuthFailure</h3>
                                <p className="mt-1 text-muted-foreground">A problem with your API key prevents the map from rendering correctly. Please make sure the value of the APIProvider.apiKey prop is correct. Check the error-message in the console for further details.</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
                <Link href="/teacher/dashboard" passHref><Button variant="outline">Cancel</Button></Link>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
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

    