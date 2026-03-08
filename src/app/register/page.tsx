'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocateFixed, User, School, UserPlus, Copy } from 'lucide-react';
import Link from 'next/link';
import { store, addTeacher, addStudent } from '@/lib/store';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  role: z.enum(['student', 'teacher']),
  teacherCode: z.string().optional(),
});

export default function RegisterPage() {
  const [year, setYear] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'student',
      teacherCode: '',
    },
  });

  const role = form.watch('role');

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const onSubmit = (values) => {
    if (values.role === 'teacher') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const newTeacher = {
        id: `TCH-${Date.now()}`,
        name: values.name,
        email: values.email,
        phone: values.phone,
        teacherCode: code,
        students: [],
      };

      addTeacher(newTeacher);
      setGeneratedCode(code);
    } else {
      const teacher = store.get().teachers.find(
        (t) => t.teacherCode === values.teacherCode
      );

      if (teacher) {
        const newStudent = {
          id: `STU-${Date.now()}`,
          name: values.name,
          email: values.email,
          phone: values.phone,
          location: {
            lat: 34.0522 + (Math.random() - 0.5) * 0.01,
            lng: -118.2437 + (Math.random() - 0.5) * 0.01,
          },
          status: 'safe',
          lastStatusCheck: 'complete',
          entryLogs: [],
          teacher: { name: teacher.name, phone: teacher.phone },
        };

        addStudent(newStudent, teacher.id);
        alert('Student registration successful!');
        router.push('/');
      }
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert('Copied to clipboard!');
    }
  };

  const closeDialogAndRedirect = () => {
    setGeneratedCode(null);
    router.push('/');
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex items-center gap-4">
            <LocateFixed className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-bold">Student Movement Tracker</h1>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center container mx-auto p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
              <CardDescription>Join the platform as a student or teacher.</CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>I am a...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="student" id="student" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="student"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <User className="mb-3 h-6 w-6" />
                                Student
                              </Label>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="teacher"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <School className="mb-3 h-6 w-6" />
                                Teacher
                              </Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {role === 'student' && (
                    <FormField
                      control={form.control}
                      name="teacherCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 6-digit code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full font-bold">
                    Create Account
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/" className="underline">
                  Login
                </Link>
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

      <Dialog open={!!generatedCode} onOpenChange={(open) => !open && closeDialogAndRedirect()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Registration Successful!</DialogTitle>
            <DialogDescription>
              Here is your unique 6-digit teacher code. Please share this with your students so they can register under you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div
              className="flex items-center justify-between rounded-lg border bg-muted p-4 cursor-pointer"
              onClick={copyToClipboard}
            >
              <span className="font-mono text-2xl tracking-widest">{generatedCode}</span>
              <Button variant="ghost" size="icon">
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click the code to copy it to your clipboard.</p>
          </div>
          <Button onClick={closeDialogAndRedirect} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
