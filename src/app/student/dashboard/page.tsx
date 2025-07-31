
'use client';

import { useState, useEffect } from 'react';
import type { Student, EntryLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LocateFixed, User, LogOut, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock student data. In a real app, this would be fetched based on the logged-in user.
const MOCK_STUDENT: Student = {
    id: 'STU-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1234567890',
    location: { lat: 34.0522, lng: -118.2437 },
    status: 'safe',
    lastStatusCheck: 'complete',
    entryLogs: [
        { time: '10/26/2023, 9:05:15 AM' },
        { time: '10/26/2023, 1:30:45 PM' },
        { time: '10/27/2023, 9:01:22 AM' },
        { time: '10/28/2023, 8:59:58 AM' },
    ],
};


export default function StudentDashboardPage() {
    const [student, setStudent] = useState<Student>(MOCK_STUDENT);
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        setYear(currentYear);
        // In a real app, you'd fetch the student's data here.
        // For now, we'll add some more dynamic logs to the mock data for demonstration.
        const interval = setInterval(() => {
            setStudent(prev => ({
                ...prev,
                entryLogs: [...prev.entryLogs, { time: new Date().toLocaleString() }]
            }))
        }, 30000); // Add a new log every 30 seconds
        return () => clearInterval(interval);
    }, []);
    
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

    if (!student) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LocateFixed className="h-8 w-8" />
                        <h1 className="text-2xl font-headline font-bold">
                            Student Dashboard
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
                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader className="flex flex-row items-start gap-4">
                        <div className="p-4 bg-muted rounded-full">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-headline">{student.name}</CardTitle>
                            <CardDescription className="text-lg">Student ID: {student.id}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-xl font-headline font-semibold mb-4">Geofence Entry Log</h2>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Here is a record of all the times you have entered the designated campus area. Total entries: <Badge>{student.entryLogs.length}</Badge>
                        </div>
                        <ScrollArea className="h-96 border rounded-md p-4">
                            <div className="space-y-6">
                                {Object.entries(groupLogsByDay(student.entryLogs)).reverse().map(([day, logs]) => (
                                    <div key={day}>
                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 sticky top-0 bg-background py-2">
                                            <Calendar className="h-5 w-5"/> {day} <Badge variant="secondary">{logs.length} entries</Badge>
                                        </h3>
                                        <ul className="space-y-2 list-disc pl-5">
                                            {logs.map((log, index) => (
                                               <li key={index} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                                   <Clock className="h-5 w-5 text-primary" />
                                                   <span className="font-mono text-sm">{new Date(log.time).toLocaleTimeString()}</span>
                                               </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {student.entryLogs.length === 0 && (
                                    <p className="text-muted-foreground text-center py-16">No entry logs recorded yet.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
            <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
                <div className="container mx-auto">
                    <p>&copy; {year || '...'} StudentMovementTracker. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
