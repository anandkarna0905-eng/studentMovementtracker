'use client';

import type { BreachAlert } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

type AlertCardProps = {
  alert: BreachAlert;
};

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Card className="border-l-4 border-accent bg-amber-50 dark:bg-amber-950/20 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-accent font-bold font-headline">
          <AlertTriangle className="h-5 w-5" />
          Geofence Breach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-2">{alert.message}</p>
        <CardDescription className="text-xs">{alert.time}</CardDescription>
      </CardContent>
    </Card>
  );
}
