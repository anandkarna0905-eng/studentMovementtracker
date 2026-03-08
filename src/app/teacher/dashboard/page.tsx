'use client';

import { useState, useEffect } from 'react';
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

export default function TeacherDashboardPage() {
  const [data, setData] = useState(store.get());
  const [year, setYear] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState('live');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [reportMonth, setReportMonth] = useState('');

  useEffect(() => {
    setYear(new Date().getFullYear());
    const unsubscribe = store.subscribe(setData);
    return () => unsubscribe();
  }, []);

  const teacher = data.teachers[0];
  const students = data.students;

  if (!teacher) {
    return <div className="p-8">Loading teacher data...</div>;
  }

  const studentsInside = students.filter((s: any) => s.status === 'safe');
  const studentsOutside = students.filter((s: any) => s.status === 'breached');

  const allEntryDates = students.flatMap((s: any) =>
    s.entryLogs.map((log: any) => new Date(log.entryTime))
  );

  const getStudentsForDate = (date: Date) => {
    const attended = students.filter((student: any) =>
      student.entryLogs.some(
        (log: any) => new Date(log.entryTime).toDateString() === date.toDateString()
      )
    );

    const absent = students.filter((student: any) =>
      !student.entryLogs.some(
        (log: any) => new Date(log.entryTime).toDateString() === date.toDateString()
      )
    );

    return { attended, absent };
  };

  const { attended: attendedOnDate, absent: absentOnDate } =
    selectedDate ? getStudentsForDate(selectedDate) : { attended: [], absent: [] };

  const handleStudentCardClick = (student: any) => {
    setSelectedStudent(student);
  };

  const groupLogsByDay = (logs: any[]) => {
    return logs.reduce((acc: any, log: any) => {
      const date = new Date(log.entryTime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
  };

  const copyToClipboard = () => {
    if (teacher.teacherCode) {
      navigator.clipboard.writeText(teacher.teacherCode);
      alert('Copied to clipboard!');
    }
  };

  const handleShowAttendance = () => {
    const month = parseInt(selectedMonth, 10);
    const currentYear = new Date().getFullYear();

    const report = students.map((student: any) => {
      const presentDates = new Set();

      student.entryLogs.forEach((log: any) => {
        const logDate = new Date(log.entryTime);
        if (
          logDate.getFullYear() === currentYear &&
          logDate.getMonth() + 1 === month
        ) {
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

    const monthName = new Date(currentYear, month - 1).toLocaleString(
      'default',
      { month: 'long' }
    );

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
          <div className="flex items-center gap-2 sm:gap-4">
            <LocateFixed className="h-7 w-7 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl font-headline font-bold">
              Teacher Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/geofence">
              <Button variant="secondary" size="sm" className="font-bold">
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Geofence Settings</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="sm" className="font-bold">
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{studentsInside.length}</p>
              <p className="text-sm text-muted-foreground">students inside geofence</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{studentsOutside.length}</p>
              <p className="text-sm text-muted-foreground">students outside geofence</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              <p className="text-sm text-muted-foreground">students assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* VIEW MODE SELECTOR */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Dashboard Mode</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={viewMode === 'live' ? 'default' : 'outline'}
              onClick={() => setViewMode('live')}
              className="font-bold"
            >
              Live View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className="font-bold"
            >
              Calendar View
            </Button>
            <Button
              variant={viewMode === 'attendance' ? 'default' : 'outline'}
              onClick={() => setViewMode('attendance')}
              className="font-bold"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Attendance Report
            </Button>
          </CardContent>
        </Card>

        {/* LIVE VIEW */}
        {viewMode === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE - SAFE STUDENTS */}
            <div className="lg:col-span-1">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Safe</CardTitle>
                  <CardDescription>Students inside geofence</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2 pr-4">
                      {studentsInside.map((student: any) => (
                        <div
                          key={student.id}
                          className="p-2 rounded-md bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100"
                          onClick={() => handleStudentCardClick(student)}
                        >
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Lat: {student.location.lat.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Lng: {student.location.lng.toFixed(4)}
                          </p>
                        </div>
                      ))}
                      {studentsInside.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No students inside
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* CENTER - ALERT STUDENTS */}
            <div className="lg:col-span-1">
              <Card className="shadow-md h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Alert</CardTitle>
                  <CardDescription>Students outside geofence</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2 pr-4">
                      {studentsOutside.map((student: any) => (
                        <div
                          key={student.id}
                          className="p-2 rounded-md bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
                          onClick={() => handleStudentCardClick(student)}
                        >
                          <p className="font-semibold text-sm text-red-700">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Lat: {student.location.lat.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Lng: {student.location.lng.toFixed(4)}
                          </p>
                        </div>
                      ))}
                      {studentsOutside.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No alerts
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SIDE - STUDENT DETAILS */}
            <div className="lg:col-span-1">
              {selectedStudent ? (
                <Card className="shadow-md h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-headline">
                      Student Details
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold text-base font-headline">
                        {selectedStudent.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedStudent.id}
                      </p>
                    </div>
                    <div className="space-y-2 pt-4 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Status
                      </p>
                      <Badge
                        variant={selectedStudent.status === 'safe' ? 'default' : 'destructive'}
                      >
                        {selectedStudent.status === 'safe' ? 'Safe' : 'Alert'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md h-full flex items-center justify-center">
                  <CardContent className="text-center text-muted-foreground">
                    Select a student to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date: Date) =>
                    !allEntryDates.some(
                      (d) =>
                        new Date(d).toDateString() === date.toDateString()
                    )
                  }
                />
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">
                    Present ({attendedOnDate.length})
                  </CardTitle>
                  <CardDescription>
                    {selectedDate?.toDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendedOnDate.map((student: any) => (
                      <div key={student.id} className="p-2 rounded-md bg-green-50 border border-green-200">
                        <p className="font-semibold text-sm">{student.name}</p>
                      </div>
                    ))}
                    {attendedOnDate.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No data for this date
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">
                    Absent ({absentOnDate.length})
                  </CardTitle>
                  <CardDescription>
                    {selectedDate?.toDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {absentOnDate.map((student: any) => (
                      <div key={student.id} className="p-2 rounded-md bg-red-50 border border-red-200">
                        <p className="font-semibold text-sm">{student.name}</p>
                      </div>
                    ))}
                    {absentOnDate.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        All present
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ATTENDANCE REPORT */}
        {viewMode === 'attendance' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Attendance Report</CardTitle>
              <CardDescription>
                View attendance by month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label htmlFor="month-select" className="text-sm font-semibold">
                    Select Month
                  </Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="month-select" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleShowAttendance} className="font-bold">
                  Show Report
                </Button>
              </div>

              {attendanceReport && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-base font-headline mb-4">
                    {reportMonth}
                  </h3>
                  <ScrollArea className="h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Student Name</th>
                          <th className="text-center p-2">Days Present</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceReport.map((item: any) => (
                          <tr key={item.studentId} className="border-t">
                            <td className="p-2">{item.studentName}</td>
                            <td className="text-center p-2">
                              <Badge variant={item.daysPresent > 0 ? 'default' : 'secondary'}>
                                {item.daysPresent} days
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TEACHER INFO CARD */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Teacher Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Name</Label>
                <p className="text-base">{teacher.name}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Email</Label>
                <p className="text-base">{teacher.email}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Phone</Label>
                <p className="text-base">{teacher.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Teacher Code</Label>
                <div className="flex gap-2 items-center">
                  <p className="text-base font-mono">{teacher.teacherCode}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
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
