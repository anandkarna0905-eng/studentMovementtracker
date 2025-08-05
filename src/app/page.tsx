
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LocateFixed, User, School } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [year, setYear] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleLogin = () => {
    if (role === 'student') {
      router.push('/student/dashboard');
    } else {
      router.push('/teacher/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex items-center gap-4">
                <LocateFixed className="h-8 w-8" />
                <h1 className="text-2xl font-headline font-bold">
                    Student Movement Tracker
                </h1>
            </div>
        </header>
        <main className="flex-grow flex items-center justify-center container mx-auto p-4">
            <Card className="w-full max-w-sm shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
                    <CardDescription>Please select your role to login.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'teacher')} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="student" id="student" className="peer sr-only" />
                            <Label
                                htmlFor="student"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <User className="mb-3 h-6 w-6" />
                                Student
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                            <Label
                                htmlFor="teacher"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <School className="mb-3 h-6 w-6" />
                                Teacher
                            </Label>
                        </div>
                    </RadioGroup>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} className="w-full font-bold">Login</Button>
                </CardFooter>
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

    