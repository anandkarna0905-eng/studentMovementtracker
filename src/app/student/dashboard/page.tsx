'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LocateFixed, User, LogOut, Calendar, LogIn, LogOut as LogOutIcon, Mail, Phone, School } from 'lucide-react';
import Link from 'next/link';

// Mock student data
const MOCK_STUDENT = {
  id: 'STU-001',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  phone: '+1234567890',
  location: { lat: 34.0522, lng: -118.2437 },
  status: 'safe',
  lastStatusCheck: 'complete',
  teacher: {
    name: 'Mr. Smith',
    phone: '+19876543210',
  },
  entryLogs: [
    { entryTime: '10/26/2023, 9:05:15 AM', exitTime: '10/26/2023, 1:30:45 PM' },
    { entryTime: '10/27/2023, 9:01:22 AM', exitTime: '10/27/2023, 5:01:22 PM' },
    { entryTime: '10/28/2023, 8:59:58 AM' },
  ],
};

export default function StudentDashboardPage() {
  const [student, setStudent] = useState(MOCK_STUDENT);
  const [year, setYear] = useState(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const groupLogsByDay = (logs) => {
    return logs.reduce((acc, log) => {
      const date = new Date(log.entryTime).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {});
  };

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
          <Link href="/">
            <Button variant="secondary" className="font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-muted rounded-full h-24 w-24 flex items-center justify-center mb-4 border">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-headline">
                  {student.name}
                </CardTitle>
                <CardDescription>
                  Student ID: {student.id}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-base font-headline">
                    Your Information
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {student.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {student.phone}
                  </div>
                </div>

                {student.teacher && (
                  <div className="space-y-2 text-sm pt-4 border-t">
                    <h3 className="font-semibold text-base font-headline">
                      Assigned Teacher
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <School className="h-4 w-4" /> {student.teacher.name}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {student.teacher.phone}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2">
            <Card className="w-full mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline font-semibold">
                  Geofence Entry & Exit Log
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Here is a record of all the times you have entered and exited
                  the designated campus area. Total entries:{' '}
                  <Badge>{student.entryLogs.length}</Badge>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-96 border rounded-md p-4">
                  <div className="space-y-6">
                    {Object.entries(groupLogsByDay(student.entryLogs))
                      .reverse()
                      .map(([day, logs]) => (
                        <div key={day}>
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 sticky top-0 bg-background py-2">
                            <Calendar className="h-5 w-5" /> {day}{' '}
                            <Badge variant="secondary">
                              {logs.length} sessions
                            </Badge>
                          </h3>

                          <ul className="space-y-2">
                            {logs.map((log, index) => (
                              <li
                                key={index}
                                className="p-3 rounded-md bg-muted/50 space-y-2"
                              >
                                <div className="flex items-center gap-3">
                                  <LogIn className="h-5 w-5 text-green-600" />
                                  <div>
                                    <span className="font-semibold">
                                      Entry:
                                    </span>
                                    <span className="font-mono text-sm ml-2">
                                      {new Date(
                                        log.entryTime
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>

                                {log.exitTime && (
                                  <div className="flex items-center gap-3">
                                    <LogOutIcon className="h-5 w-5 text-red-600" />
                                    <div>
                                      <span className="font-semibold">
                                        Exit:
                                      </span>
                                      <span className="font-mono text-sm ml-2">
                                        {new Date(
                                          log.exitTime
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                    {student.entryLogs.length === 0 && (
                      <p className="text-muted-foreground text-center py-16">
                        No entry logs recorded yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>&copy; {year ?? ''} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
