'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Circle } from './circle';
import { Pin } from './pin';
import type { Student, Geofence } from '@/types';
import { AlertTriangle } from 'lucide-react';

type MapViewProps = {
  apiKey: string | undefined;
  students: Student[];
  geofence: Geofence;
};

export function MapView({ apiKey, students, geofence }: MapViewProps) {
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-2 text-lg font-medium">Google Maps API Key is Missing</h3>
          <p className="mt-1 text-sm">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={geofence.center}
        defaultZoom={15}
        mapId="student-tracker-map"
        className="w-full h-full rounded-lg"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <Circle
          center={geofence.center}
          radius={geofence.radius}
          strokeColor="hsl(var(--primary))"
          strokeOpacity={0.8}
          strokeWeight={2}
          fillColor="hsl(var(--primary))"
          fillOpacity={0.15}
        />
        {students.map(student => (
          <AdvancedMarker key={student.id} position={student.location} title={student.name}>
             <Pin
                background={student.status === 'breached' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                borderColor={student.status === 'breached' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                glyphColor={'hsl(var(--primary-foreground))'}
             />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
