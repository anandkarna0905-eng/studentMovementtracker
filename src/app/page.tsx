import { Dashboard } from '@/components/dashboard';
import { LocateFixed } from 'lucide-react';

export default function Home() {
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
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Dashboard />
      </main>
      <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
        <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} StudentMovementTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
