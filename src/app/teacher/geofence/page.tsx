
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
import { LocateFixed, LogOut } from 'lucide-react';
import Link from 'next/link';

const INITIAL_GEOFENCE: Geofence = {
  center: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
  radius: 100, // 100 meters
};

export default function GeofencePage() {
  const [geofence, setGeofence] = useState<Geofence>(INITIAL_GEOFENCE);
  const [isMounted, setIsMounted] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setIsMounted(true);
    // You might fetch the current geofence from your backend here
  }, []);

  const handleRadiusChange = (value: number[]) => {
    setGeofence(g => ({ ...g, radius: value[0] }));
  };

  const handleCenterChange = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setGeofence(g => ({ ...g, center: e.latLng!.toJSON() }));
    }
  };

  const handleSave = () => {
    // Here you would save the geofence to your backend
    console.log('Saving geofence:', geofence);
    alert('Geofence saved!');
  };
  
  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <LocateFixed className="h-8 w-8" />
                <h1 className="text-2xl font-headline font-bold">
                    Teacher Geofence Control
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
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[60vh] lg:h-auto">
            {apiKey ? (
                <APIProvider apiKey={apiKey}>
                    <Map
                        defaultCenter={geofence.center}
                        defaultZoom={15}
                        mapId="geofence-map"
                        className="w-full h-full rounded-lg shadow-lg"
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        onClick={handleCenterChange}
                    >
                        <Circle
                            center={geofence.center}
                            radius={geofence.radius}
                            strokeColor="hsl(var(--accent))"
                            strokeOpacity={0.8}
                            strokeWeight={2}
                            fillColor="hsl(var(--accent))"
                            fillOpacity={0.25}
                        />
                         <AdvancedMarker position={geofence.center} title={'Geofence Center'}>
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
                    <CardTitle className="font-headline text-xl">Set Geofence Boundary</CardTitle>
                    <CardDescription>Click on the map to set the center and use the controls below to adjust the boundary.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lat">Latitude</Label>
                            <Input id="lat" value={geofence.center.lat.toFixed(6)} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lng">Longitude</Label>
                            <Input id="lng" value={geofence.center.lng.toFixed(6)} readOnly />
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
                                value={[geofence.radius]}
                                onValueChange={handleRadiusChange}
                            />
                            <span className="font-mono text-lg w-24 text-center p-2 rounded-md bg-muted">{geofence.radius}m</span>
                        </div>
                    </div>
                     <Button onClick={handleSave} className="w-full font-bold">Save Geofence</Button>
                </CardContent>
            </Card>
        </div>
      </main>
       <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
