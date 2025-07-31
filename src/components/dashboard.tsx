'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Student, BreachAlert, Geofence } from '@/types';
import { getLocationStatus } from '@/ai/flows/location-status-reasoning';
import { haversineDistance } from '@/lib/utils';
import { MapView } from './map-view';
import { StudentCard } from './student-card';
import { AlertCard } from './alert-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Users, Bell, Hourglass } from 'lucide-react';

const GEOFENCE: Geofence = {
  center: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
  radius: 100, // 100 meters
};

const INITIAL_STUDENTS: Student[] = [
  { id: 'STU-001', name: 'Alice Johnson', location: { lat: 34.0522, lng: -118.2437 }, status: 'unknown', lastStatusCheck: 'complete' },
  { id: 'STU-002', name: 'Bob Williams', location: { lat: 34.0524, lng: -118.2435 }, status: 'unknown', lastStatusCheck: 'complete' },
  { id: 'STU-003', name: 'Charlie Brown', location: { lat: 34.0519, lng: -118.2440 }, status: 'unknown', lastStatusCheck: 'complete' },
  { id: 'STU-004', name: 'Diana Miller', location: { lat: 34.0530, lng: -118.2430 }, status: 'unknown', lastStatusCheck: 'complete' },
];

const COLLEGE_HOURS = { start: 9, end: 16 }; // 9:00 AM to 4:00 PM

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [alerts, setAlerts] = useState<BreachAlert[]>([]);
  const [isCollegeHours, setIsCollegeHours] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const checkCollegeHours = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    setIsCollegeHours(currentHour >= COLLEGE_HOURS.start && currentHour < COLLEGE_HOURS.end);
    setCurrentTime(now.toLocaleTimeString());
  }, []);

  useEffect(() => {
    checkCollegeHours();
    const timer = setInterval(checkCollegeHours, 1000); // Check every second
    return () => clearInterval(timer);
  }, [checkCollegeHours]);

  const handleBreach = useCallback(async (student: Student) => {
    const timeOfBreach = new Date().toLocaleString();
    
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, lastStatusCheck: 'pending' } : s));

    try {
      const result = await getLocationStatus({
        isBreaching: true,
        studentName: student.name,
        studentId: student.id,
        locationCoordinates: `${student.location.lat.toFixed(4)}, ${student.location.lng.toFixed(4)}`,
        timeOfBreach,
      });

      const newAlert: BreachAlert = {
        id: `${student.id}-${Date.now()}`,
        studentName: student.name,
        message: result.notificationMessage,
        time: timeOfBreach,
      };

      setAlerts(prev => [newAlert, ...prev]);
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'breached', lastStatusCheck: 'complete' } : s));
    } catch (error) {
      console.error("Error with GenAI flow:", error);
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'unknown', lastStatusCheck: 'complete' } : s));
    }
  }, []);

  useEffect(() => {
    if (!isCollegeHours) {
        setStudents(prev => prev.map(s => ({...s, status: 'safe'})));
        return;
    };

    const interval = setInterval(() => {
      setStudents(prevStudents =>
        prevStudents.map(student => {
          if (student.lastStatusCheck === 'pending') return student;

          // Simulate movement
          const newLocation = {
            lat: student.location.lat + (Math.random() - 0.5) * 0.001,
            lng: student.location.lng + (Math.random() - 0.5) * 0.001,
          };

          const distance = haversineDistance(GEOFENCE.center, newLocation);
          const wasBreached = student.status === 'breached';
          const isBreaching = distance > GEOFENCE.radius;

          if (isBreaching && !wasBreached) {
            handleBreach({ ...student, location: newLocation });
            return { ...student, location: newLocation, status: 'breached', lastStatusCheck: 'pending' };
          }

          return { ...student, location: newLocation, status: isBreaching ? 'breached' : 'safe', lastStatusCheck: 'complete' };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isCollegeHours, handleBreach]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="shadow-lg h-[400px] lg:h-[650px]">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-headline text-xl">Campus Geofence</CardTitle>
             <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${isCollegeHours ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <Hourglass className="w-4 h-4" />
                <span>{isCollegeHours ? `Monitoring Active: ${currentTime}` : `Inactive: ${currentTime}`}</span>
            </div>
          </CardHeader>
          <CardContent className="h-full pb-6">
            <MapView apiKey={apiKey} students={students} geofence={GEOFENCE} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <Users />
              Student Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {students.map(student => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <Bell />
              Breach Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No alerts yet.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
