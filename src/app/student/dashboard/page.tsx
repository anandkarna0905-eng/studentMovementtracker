
'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard';
import { LocateFixed } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function StudentDashboardPage() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

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
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Dashboard />
      </main>
      <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
            <p>&copy; {year || '...'} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
