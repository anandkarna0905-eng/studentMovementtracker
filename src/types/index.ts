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
  location: Location;
  status: 'safe' | 'breached' | 'unknown';
  lastStatusCheck: 'pending' | 'complete';
  entryLogs: EntryLog[];
  breachDetails?: {
    time: string;
    location: Location;
    message: string;
  };
};

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
