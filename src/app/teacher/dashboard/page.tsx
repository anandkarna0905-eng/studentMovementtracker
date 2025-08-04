
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
import { LocateFixed, User, LogOut, Calendar as CalendarIcon, Users, CheckCircle, AlertTriangle, Settings, X, Mail, Phone, Copy, LogIn, LogOut as LogOutIcon, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Mock data, in a real app this would come from a backend.
const MOCK_TEACHER: Teacher = {
    id: 'TCH-001',
    name: 'Mr. Smith',
    email: 'mr.smith@example.com',
    phone: '+19876543210',
    teacherCode: '123456',
    students: [],
};

const MOCK_STUDENTS: Student[] = [
    { id: 'STU-001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+11111111111', location: { lat: 34.0522, lng: -118.2437 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-10-26T09:05:15', exitTime: '2023-10-26T13:00:00' }, { entryTime: '2023-10-27T09:01:22' }, { entryTime: '2023-11-01T09:01:22' }, { entryTime: '2023-11-02T09:01:22' }, { entryTime: '2023-11-03T09:01:22' }, { entryTime: '2023-11-04T09:01:22' }, { entryTime: '2023-11-05T09:01:22' }, { entryTime: '2023-11-06T09:01:22' }, { entryTime: '2023-11-07T09:01:22' }, { entryTime: '2023-11-08T09:01:22' }, { entryTime: '2023-11-09T09:01:22' }, { entryTime: '2023-11-10T09:01:22' }, { entryTime: '2023-11-13T09:01:22' }, { entryTime: '2023-11-14T09:01:22' }, { entryTime: '2023-11-15T09:01:22' }, { entryTime: '2023-11-16T09:01:22' }, { entryTime: '2023-11-17T09:01:22' }] },
    { id: 'STU-002', name: 'Bob Williams', email: 'bob@example.com', phone: '+12222222222', location: { lat: 34.0524, lng: -118.2435 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-11-01T09:03:00' }, { entryTime: '2023-11-02T09:03:00' }, { entryTime: '2023-11-03T09:03:00' }, { entryTime: '2023-11-06T09:03:00' }] },
    { id: 'STU-003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+13333333333', location: { lat: 34.0599, lng: -118.2449 }, status: 'breached', lastStatusCheck: 'complete', entryLogs: [] },
    { id: 'STU-004', name: 'Diana Miller', email: 'diana@example.com', phone: '+14444444444', location: { lat: 34.0530, lng: -118.2430 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-10-26T09:05:15' }, { entryTime: '2023-10-27T09:01:22' }, { entryTime: '2023-10-28T08:59:58' }, { entryTime: '2023-11-01T09:05:15' }, { entryTime: '2023-11-02T09:01:22' }, { entryTime: '2023-11-03T08:59:58' }, { entryTime: '2023-11-04T09:05:15' }, { entryTime: '2023-11-05T09:01:22' }, { entryTime: '2023-11-06T08:59:58' }, { entryTime: '2023-11-07T09:05:15' }, { entryTime: '2023-11-08T09:01:22' }, { entryTime: '2023-11-09T08:59:58' }, { entryTime: '2023-11-10T09:05:15' }, { entryTime: '2023-11-11T09:01:22' }, { entryTime: '2023-11-12T08:59:58' }, { entryTime: '2023-11-13T09:05:15' }, { entryTime: '2023-11-14T09:01:22' }, { entryTime: '2023-11-15T08:59:58' }, { entryTime: '2023-11-16T09:01:22' }, { entryTime: '2023-11-17T08:59:58' }, { entryTime: '2023-11-18T09:01:22' }] },
];

type AttendanceData = {
    studentId: string;
    attendedDays: number;
    attendancePercentage: number;
};

export default function TeacherDashboardPage() {
    const [teacher, setTeacher] = useState<Teacher>(MOCK_TEACHER);
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [year, setYear] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [viewMode, setViewMode] = useState<'live' | 'attendance' | 'calendar'>('live');
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [workingDays, setWorkingDays] = useState<number>(22);
    const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);


    useEffect(() => {
        const currentYear = new Date().getFullYear();
        setYear(currentYear);
    }, []);

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
        if (!workingDays || workingDays <= 0) {
            alert("Please enter a valid number of working days.");
            return;
        }

        const [year, month] = selectedMonth.split('-').map(Number);

        const newAttendanceData = students.map(student => {
            const attendedDaysInMonth = new Set(
                student.entryLogs
                    .map(log => new Date(log.entryTime))
                    .filter(date => date.getFullYear() === year && date.getMonth() === month - 1)
                    .map(date => date.toDateString())
            ).size;
            
            const attendancePercentage = Math.round((attendedDaysInMonth / workingDays) * 100);

            return {
                studentId: student.id,
                attendedDays: attendedDaysInMonth,
                attendancePercentage: attendancePercentage > 100 ? 100 : attendancePercentage,
            };
        });
        
        setAttendanceData(newAttendanceData);
        setViewMode('attendance');
    };
    
    const getStudentAttendance = (studentId: string) => {
        return attendanceData.find(data => data.studentId === studentId);
    };

    const getMonthYearOptions = () => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value, label });
        }
        return options;
    };
    
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
                                <Label>Your Teacher Code</Label>
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
                                            {viewMode === 'attendance' ? <BarChart /> : <Users />}
                                            {viewMode === 'attendance' ? 'Monthly Attendance Report' : 'Student Status'}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button variant={viewMode === 'live' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('live')}>Live Status</Button>
                                            <Button variant={viewMode === 'attendance' ? 'secondary' : 'outline'} size="sm" onClick={() => handleShowAttendance()}>Attendance</Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {viewMode === 'live' && (
                                        <>
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
                                        </>
                                    )}
                                     {viewMode === 'attendance' && (
                                        <ScrollArea className="h-96 pr-4">
                                            <div className="space-y-4">
                                                {students.map(student => (
                                                    <StudentCard 
                                                        key={student.id} 
                                                        student={student} 
                                                        onClick={() => handleStudentCardClick(student)}
                                                        attendanceData={getStudentAttendance(student.id)}
                                                        workingDays={workingDays}
                                                    />
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-8">
                             <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2 font-headline text-xl">
                                        <div className="flex items-center gap-2">
                                            <BarChart />
                                            Attendance Calculator
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Select a month and enter working days to see the attendance report.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="month-select">Month</Label>
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger id="month-select">
                                                <SelectValue placeholder="Select a month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getMonthYearOptions().map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label htmlFor="working-days">Total Working Days</Label>
                                        <Input 
                                            id="working-days"
                                            type="number"
                                            value={workingDays}
                                            onChange={(e) => setWorkingDays(Number(e.target.value))}
                                            placeholder="e.g., 22"
                                        />
                                    </div>
                                    <Button onClick={handleShowAttendance} className="w-full">
                                        Show Report
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2 font-headline text-xl">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon />
                                            Daily View
                                        </div>
                                        {selectedDate && <Button variant="ghost" size="icon" onClick={() => { setSelectedDate(undefined); setViewMode('live'); }}><X className="h-4 w-4"/></Button>}
                                    </CardTitle>
                                    <CardDescription>Select a day to see who was present or absent.</CardDescription>
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
                    <p>&copy; {year || '...'} StudentMovementTracker. All rights reserved.</p>
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
                            <div className="text-sm text-muted-foreground">
                                History of when the student entered and exited the geofence. Total sessions: <Badge>{selectedStudent.entryLogs.length}</Badge>
                            </div>
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

    