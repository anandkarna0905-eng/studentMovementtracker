
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Student, BreachAlert, Geofence, EntryLog } from '@/types';
import { getLocationStatus } from '@/ai/flows/location-status-reasoning';
import { haversineDistance } from '@/lib/utils';
import { MapView } from './map-view';
import { StudentCard } from './student-card';
import { AlertCard } from './alert-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Users, Bell, Hourglass } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';

const GEOFENCE: Geofence = {
  id: 'main',
  name: 'Main Campus',
  center: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
  radius: 100, // 100 meters
};

const INITIAL_STUDENTS: Student[] = [
  { id: 'STU-001', name: 'Alice Johnson', email: 'a@a.com', phone: '123', location: { lat: 34.0522, lng: -118.2437 }, status: 'unknown', lastStatusCheck: 'complete', entryLogs: [] },
  { id: 'STU-002', name: 'Bob Williams', email: 'b@b.com', phone: '123', location: { lat: 34.0524, lng: -118.2435 }, status: 'unknown', lastStatusCheck: 'complete', entryLogs: [] },
  { id: 'STU-003', name: 'Charlie Brown', email: 'c@c.com', phone: '123', location: { lat: 34.0519, lng: -118.2440 }, status: 'unknown', lastStatusCheck: 'complete', entryLogs: [] },
  { id: 'STU-004', name: 'Diana Miller', email: 'd@d.com', phone: '123', location: { lat: 34.0530, lng: -118.2430 }, status: 'unknown', lastStatusCheck: 'complete', entryLogs: [] },
];

const COLLEGE_HOURS = { start: 9, end: 17 }; // 9:00 AM to 5:00 PM

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [alerts, setAlerts] = useState<BreachAlert[]>([]);
  const [isCollegeHours, setIsCollegeHours] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, lastStatusCheck: 'complete' } : s));
    } catch (error) {
      console.error("Error with GenAI flow:", error);
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'unknown', lastStatusCheck: 'complete' } : s));
    }
  }, []);
  
  // Effect for simulating student movement and status changes
  useEffect(() => {
    if (!isCollegeHours) {
      // Outside college hours, mark everyone as safe and add exit times to open logs
      setStudents(prevStudents => prevStudents.map(s => ({
        ...s,
        status: 'safe',
        lastStatusCheck: 'complete',
        entryLogs: s.entryLogs.map(log => log.exitTime ? log : { ...log, exitTime: new Date().toLocaleString() })
      })));
      return;
    }

    const interval = setInterval(() => {
      let studentsToUpdate = [...students];
      let hasBreached = false;

      studentsToUpdate = studentsToUpdate.map(student => {
        if (student.lastStatusCheck === 'pending') {
          return student;
        }

        // Simulate movement
        const newLocation = {
          lat: student.location.lat + (Math.random() - 0.5) * 0.001,
          lng: student.location.lng + (Math.random() - 0.5) * 0.001,
        };

        const distance = haversineDistance(GEOFENCE.center, newLocation);
        const wasInside = student.status === 'safe';
        const isInside = distance <= GEOFENCE.radius;
        const wasBreached = student.status === 'breached';

        let newStatus = student.status;
        let newEntryLogs = [...student.entryLogs];

        if (isInside && !wasInside) {
          // Student just entered
          newStatus = 'safe';
          newEntryLogs.push({ entryTime: new Date().toLocaleString() });
        } else if (!isInside && wasInside) {
          // Student just exited
          newStatus = 'breached';
          hasBreached = true;
          const lastLogIndex = newEntryLogs.findLastIndex(log => !log.exitTime);
          if (lastLogIndex !== -1) {
            newEntryLogs[lastLogIndex] = { ...newEntryLogs[lastLogIndex], exitTime: new Date().toLocaleString() };
          }
        }
        
        return { 
            ...student, 
            location: newLocation, 
            status: newStatus,
            entryLogs: newEntryLogs
        };
      });
      
      setStudents(studentsToUpdate);
      
      if(hasBreached) {
          studentsToUpdate.forEach(s => {
              if (s.status === 'breached' && s.lastStatusCheck !== 'pending') {
                 handleBreach(s);
              }
          })
      }

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isCollegeHours, students, handleBreach]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleStudentCardClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const groupLogsByDay = (logs: EntryLog[]) => {
    return logs.reduce((acc, log) => {
      const date = new Date(log.entryTime).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<string, EntryLog[]>);
  }

  return (
    <>
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
                  <StudentCard key={student.id} student={student} onClick={() => handleStudentCardClick(student)} />
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
    {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{selectedStudent.name}'s Entry Log</DialogTitle>
                    <div className="text-sm text-muted-foreground pt-1">
                        History of when the student entered the geofence. Total entries: <Badge>{selectedStudent.entryLogs.length}</Badge>
                    </div>
                </DialogHeader>
                <ScrollArea className="h-72 mt-4">
                    <div className="space-y-4 pr-4">
                        {Object.entries(groupLogsByDay(selectedStudent.entryLogs)).map(([day, logs]) => (
                            <div key={day}>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Calendar className="h-5 w-5"/> {day} <Badge variant="secondary">{logs.length} sessions</Badge></h3>
                                <ul className="space-y-2">
                                    {logs.map((log, index) => (
                                        <li key={index} className="p-2 rounded-md bg-muted/50 space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <LogIn className="h-4 w-4 text-green-600" />
                                                <span className="font-semibold">In:</span>
                                                <span>{new Date(log.entryTime).toLocaleTimeString()}</span>
                                            </div>
                                            {log.exitTime && (
                                                <div className="flex items-center gap-2">
                                                    <LogOut className="h-4 w-4 text-red-600" />
                                                    <span className="font-semibold">Out:</span>
                                                    <span>{new Date(log.exitTime).toLocaleTimeString()}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                         {selectedStudent.entryLogs.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No entry logs recorded yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}
