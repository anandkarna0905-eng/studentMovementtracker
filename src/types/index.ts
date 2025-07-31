export type Location = {
  lat: number;
  lng: number;
};

export type EntryLog = {
    time: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: Location;
  status: 'safe' | 'breached' | 'unknown';
  lastStatusCheck: 'pending' | 'complete';
  entryLogs: EntryLog[];
  teacherCode?: string;
  breachDetails?: {
    time: string;
    location: Location;
    message: string;
  };
};

export type Teacher = {
    id: string;
    name: string;
    teacherCode: string;
    students: Student[];
}

export type BreachAlert = {
  id: string;
  studentName: string;
  message: string;
  time: string;
};

export type Geofence = {
  center: Location;
  radius: number; // in meters
};
