
'use client';

import { useState, useEffect } from 'react';
import type { Student, EntryLog, Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { StudentCard } from '@/components/student-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LocateFixed, User, LogOut, Calendar as CalendarIcon, Users, Settings, X, Mail, Phone, Copy, LogIn, LogOut as LogOutIcon, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store } from '@/lib/store';

type AttendanceReport = {
    studentId: string;
    studentName: string;
    daysPresent: number;
}[];

export default function TeacherDashboardPage() {
    const [data, setData] = useState(store.get());
    const [year, setYear] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [viewMode, setViewMode] = useState<'live' | 'calendar'>('live');

    const [selectedMonth, setSelectedMonth] = useState<string>( (new Date().getMonth() + 1).toString());
    const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null);
    const [reportMonth, setReportMonth] = useState<string>('');
    
    useEffect(() => {
        setYear(new Date().getFullYear());
        const unsubscribe = store.subscribe(setData);
        return () => unsubscribe();
    }, []);

    const teacher = data.teachers[0]; // Assuming one teacher for this dashboard
    const students = data.students;

    if (!teacher) {
        return <div className="p-8">Loading teacher data...</div>;
    }

    const studentsInside = students.filter(s => s.status === 'safe');
    const studentsOutside = students.filter(s => s.status === 'breached');
    
    const allEntryDates = students.flatMap(s => s.entryLogs.map(log => new Date(log.entryTime)));

    const getStudentsForDate = (date: Date) => {
        const attended = students.filter(student => 
            student.entryLogs.some(log => new Date(log.entryTime).toDateString() === date.toDateString())
        );
        const absent = students.filter(student => 
            !student.entryLogs.some(log => new Date(log.entryTime).toDateString() === date.toDateString())
        );
        return { attended, absent };
    };

    const { attended: attendedOnDate, absent: absentOnDate } = selectedDate ? getStudentsForDate(selectedDate) : { attended: [], absent: [] };
    
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
    
    const copyToClipboard = () => {
        if (teacher.teacherCode) {
          navigator.clipboard.writeText(teacher.teacherCode);
          alert('Copied to clipboard!');
        }
    }
    
    const handleShowAttendance = () => {
        const month = parseInt(selectedMonth, 10);
        const currentYear = new Date().getFullYear();

        const report = students.map(student => {
            const presentDates = new Set<string>();
            student.entryLogs.forEach(log => {
                const logDate = new Date(log.entryTime);
                if (logDate.getFullYear() === currentYear && (logDate.getMonth() + 1) === month) {
                    presentDates.add(logDate.toDateString());
                }
            });
            return {
                studentId: student.id,
                studentName: student.name,
                daysPresent: presentDates.size,
            };
        });

        setAttendanceReport(report);
        const monthName = new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' });
        setReportMonth(`${monthName} ${currentYear}`);
    };
    
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    }));

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
                 <div className="flex flex-col gap-8">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                <User />
                                Your Profile
                            </CardTitle>
                            <CardDescription>Your personal information and unique code for students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">{teacher.name}</h3>
                                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                    <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> {teacher.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {teacher.phone}</div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="teacher-code">Your Teacher Code</Label>
                                <div 
                                    className="flex items-center justify-between rounded-lg border bg-muted p-3 mt-1 cursor-pointer"
                                    onClick={copyToClipboard}
                                >
                                    <span className="font-mono text-xl tracking-widest">{teacher.teacherCode}</span>
                                    <Button variant="ghost" size="icon">
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                </div>
                                 <p className="text-xs text-muted-foreground mt-2">Click the code to copy it.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                             <Card className="shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                         <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                            <Users />
                                            Student Status
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="font-semibold mb-2 text-muted-foreground">Students Inside Geofence ({studentsInside.length})</div>
                                        <ScrollArea className="h-48 pr-4">
                                            <div className="space-y-4">
                                                {studentsInside.length > 0 ? studentsInside.map(student => (
                                                    <StudentCard key={student.id} student={student} onClick={() => handleStudentCardClick(student)} />
                                                )) : <p className="text-muted-foreground text-center py-8">No students are currently inside the geofence.</p>}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-2 text-muted-foreground">Students Outside Geofence ({studentsOutside.length})</div>
                                        <ScrollArea className="h-48 pr-4">
                                            <div className="space-y-4">
                                                {studentsOutside.length > 0 ? studentsOutside.map(student => (
                                                    <StudentCard key={student.id} student={student} onClick={() => handleStudentCardClick(student)} />
                                                )) : <p className="text-muted-foreground text-center py-8">All students are currently accounted for.</p>}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </CardContent>
                            </Card>
                            {attendanceReport && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                            <BarChart />
                                            Monthly Attendance Report ({reportMonth})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-64 pr-4">
                                            <div className="space-y-2">
                                                {attendanceReport.map(report => (
                                                    <div key={report.studentId} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                                        <span className="font-medium">{report.studentName}</span>
                                                        <span className="text-sm font-mono text-muted-foreground">
                                                            Present: <span className="font-semibold text-foreground">{report.daysPresent} days</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2 font-headline text-xl">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon />
                                            Daily View
                                        </div>
                                        {selectedDate && <Button variant="ghost" size="icon" onClick={() => { setSelectedDate(undefined); setViewMode('live'); }}><X className="h-4 w-4"/></Button>}
                                    </CardTitle>
                                    <CardDescription>Select a day to see who was present or absent. Days with entries are highlighted.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => { setSelectedDate(date); setViewMode(date ? 'calendar' : 'live'); }}
                                        modifiers={{
                                            entries: allEntryDates,
                                        }}
                                        modifiersClassNames={{
                                            entries: 'bg-primary/20',
                                        }}
                                        className="rounded-md border"
                                    />
                                </CardContent>
                            </Card>
                            
                             <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                        <BarChart />
                                        Attendance Report
                                    </CardTitle>
                                    <CardDescription>Select a month to generate an attendance report.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="month-select">Month</Label>
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger id="month-select">
                                                <SelectValue placeholder="Select month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleShowAttendance} className="w-full">
                                        Show Report
                                    </Button>
                                </CardContent>
                            </Card>
                            
                             {viewMode === 'calendar' && selectedDate && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-lg">
                                            Status for {selectedDate.toLocaleDateString()}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                         <div>
                                            <div className="font-semibold mb-2 text-green-600">Attended ({attendedOnDate.length})</div>
                                            <ScrollArea className="h-32 pr-4">
                                                {attendedOnDate.length > 0 ? attendedOnDate.map(s => <p key={s.id} className="text-sm py-1 border-b">{s.name}</p>) : <p className="text-sm text-muted-foreground">None</p>}
                                            </ScrollArea>
                                        </div>
                                        <div className="mt-4">
                                            <div className="font-semibold mb-2 text-destructive">Absent ({absentOnDate.length})</div>
                                            <ScrollArea className="h-32 pr-4">
                                                {absentOnDate.length > 0 ? absentOnDate.map(s => <p key={s.id} className="text-sm py-1 border-b">{s.name}</p>) : <p className="text-sm text-muted-foreground">None</p>}
                                            </ScrollArea>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
                <div className="container mx-auto">
                    <p>&copy; {year ?? ''} StudentMovementTracker. All rights reserved.</p>
                </div>
            </footer>
             {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-muted rounded-full">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <DialogTitle className="font-headline text-2xl">{selectedStudent.name}</DialogTitle>
                                    <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span>{selectedStudent.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{selectedStudent.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogDescription>
                                History of when the student entered and exited the geofence. Total sessions: <Badge>{selectedStudent.entryLogs.length}</Badge>
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-60 mt-4">
                            <div className="space-y-4 pr-4">
                                {Object.entries(groupLogsByDay(selectedStudent.entryLogs)).reverse().map(([day, logs]) => (
                                    <div key={day}>
                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> {day} <Badge variant="secondary">{logs.length} sessions</Badge></h3>
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
                                                            <LogOutIcon className="h-4 w-4 text-red-600" />
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

    