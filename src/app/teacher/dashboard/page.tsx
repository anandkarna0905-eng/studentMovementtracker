
'use client';

import { useState, useEffect } from 'react';
import type { Student, EntryLog, Geofence } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { StudentCard } from '@/components/student-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LocateFixed, User, LogOut, Calendar as CalendarIcon, Clock, Users, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';

// Mock data, in a real app this would come from a backend.
const MOCK_STUDENTS: Student[] = [
    { id: 'STU-001', name: 'Alice Johnson', location: { lat: 34.0522, lng: -118.2437 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ time: '2023-10-26T09:05:15' }, { time: '2023-10-27T09:01:22' }] },
    { id: 'STU-002', name: 'Bob Williams', location: { lat: 34.0524, lng: -118.2435 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ time: '2023-10-26T09:03:00' }] },
    { id: 'STU-003', name: 'Charlie Brown', location: { lat: 34.0599, lng: -118.2449 }, status: 'breached', lastStatusCheck: 'complete', entryLogs: [] },
    { id: 'STU-004', name: 'Diana Miller', location: { lat: 34.0530, lng: -118.2430 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ time: '2023-10-26T09:05:15' }, { time: '2023-10-27T09:01:22' }, { time: '2023-10-28T08:59:58' }] },
];

export default function TeacherDashboardPage() {
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [year, setYear] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const studentsInside = students.filter(s => s.status === 'safe');
    const studentsOutside = students.filter(s => s.status === 'breached');
    
    const allEntryDates = students.flatMap(s => s.entryLogs.map(log => new Date(log.time)));
    
    const handleStudentCardClick = (student: Student) => {
        setSelectedStudent(student);
    };

    const groupLogsByDay = (logs: EntryLog[]) => {
        return logs.reduce((acc, log) => {
          const date = new Date(log.time).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(log);
          return acc;
        }, {} as Record<string, EntryLog[]>);
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LocateFixed className="h-8 w-8" />
                        <h1 className="text-2xl font-headline font-bold">Teacher Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/teacher/geofence" passHref>
                            <Button variant="secondary" className="font-bold">
                                <Settings className="mr-2 h-4 w-4" />
                                Geofence Settings
                            </Button>
                        </Link>
                        <Link href="/" passHref>
                            <Button variant="secondary" className="font-bold">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-xl"><CheckCircle className="text-green-600"/> Students Inside Geofence</CardTitle>
                                <CardDescription>Students currently within the designated college area. Total: <Badge>{studentsInside.length}</Badge></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                    <div className="space-y-4">
                                        {studentsInside.length > 0 ? studentsInside.map(student => (
                                            <StudentCard key={student.id} student={student} onClick={() => handleStudentCardClick(student)} />
                                        )) : <p className="text-muted-foreground text-center py-8">No students are currently inside the geofence.</p>}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-xl"><AlertTriangle className="text-destructive"/> Students Outside Geofence (Breached)</CardTitle>
                                <CardDescription>Students currently outside the designated college area. Total: <Badge variant="destructive">{studentsOutside.length}</Badge></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                    <div className="space-y-4">
                                        {studentsOutside.length > 0 ? studentsOutside.map(student => (
                                            <StudentCard key={student.id} student={student} onClick={() => handleStudentCardClick(student)} />
                                        )) : <p className="text-muted-foreground text-center py-8">All students are currently accounted for.</p>}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                    <CalendarIcon />
                                    Attendance Calendar
                                </CardTitle>
                                <CardDescription>Days with student geofence entries are highlighted.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="multiple"
                                    selected={allEntryDates}
                                    className="rounded-md border"
                                    classNames={{
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
                <div className="container mx-auto">
                    <p>&copy; {year || '...'} StudentMovementTracker. All rights reserved.</p>
                </div>
            </footer>
             {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl">{selectedStudent.name}'s Entry Log</DialogTitle>
                            <DialogDescription>
                                History of when the student entered the geofence. Total entries: <Badge>{selectedStudent.entryLogs.length}</Badge>
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-72 mt-4">
                            <div className="space-y-4 pr-4">
                                {Object.entries(groupLogsByDay(selectedStudent.entryLogs)).reverse().map(([day, logs]) => (
                                    <div key={day}>
                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> {day} <Badge variant="secondary">{logs.length} entries</Badge></h3>
                                        <ul className="space-y-1 list-disc pl-5">
                                            {logs.map((log, index) => (
                                               <li key={index} className="flex items-center gap-2 text-sm">
                                                   <Clock className="h-4 w-4 text-muted-foreground" />
                                                   <span>{new Date(log.time).toLocaleTimeString()}</span>
                                               </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                 {selectedStudent.entryLogs.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">No entry logs recorded for this student.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
