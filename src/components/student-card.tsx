'use client';

import type { Student } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, CheckCircle, AlertCircle, LoaderCircle, History } from 'lucide-react';

type StudentCardProps = {
  student: Student;
  onClick?: () => void;
};

export function StudentCard({ student, onClick }: StudentCardProps) {
  const getStatusIcon = () => {
    if (student.lastStatusCheck === 'pending') {
      return <LoaderCircle className="h-4 w-4 text-muted-foreground animate-spin" />;
    }
    switch (student.status) {
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'breached':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = () => {
    switch(student.status) {
        case 'safe': return 'secondary';
        case 'breached': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
                <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">{student.name}</p>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{student.location.lat.toFixed(4)}, {student.location.lng.toFixed(4)}</span>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {onClick && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <History className="h-3 w-3" />
                <span>{student.entryLogs.length}</span>
              </div>
            )}
            {getStatusIcon()}
            <Badge variant={getStatusVariant()} className="capitalize w-20 justify-center">
              {student.lastStatusCheck === 'pending' ? 'Checking...' : student.status}
            </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
