
import type { Student, Teacher } from '@/types';

type StoreData = {
  students: Student[];
  teachers: Teacher[];
};

// Initial mock data
const MOCK_TEACHERS: Teacher[] = [
    { 
        id: 'TCH-001', 
        name: 'Mr. Smith', 
        email: 'mr.smith@example.com', 
        phone: '+19876543210', 
        teacherCode: '123456', 
        students: []
    },
];

const MOCK_STUDENTS: Student[] = [
    { id: 'STU-001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+11111111111', location: { lat: 34.0522, lng: -118.2437 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-10-26T09:05:15', exitTime: '2023-10-26T13:00:00' }, { entryTime: '2023-10-27T09:01:22' }, { entryTime: '2023-11-01T09:01:22' }, { entryTime: '2023-11-02T09:01:22' }, { entryTime: '2023-11-03T09:01:22' }, { entryTime: '2023-11-04T09:01:22' }, { entryTime: '2023-11-05T09:01:22' }, { entryTime: '2023-11-06T09:01:22' }, { entryTime: '2023-11-07T09:01:22' }, { entryTime: '2023-11-08T09:01:22' }, { entryTime: '2023-11-09T09:01:22' }, { entryTime: '2023-11-10T09:01:22' }, { entryTime: '2023-11-13T09:01:22' }, { entryTime: '2023-11-14T09:01:22' }, { entryTime: '2023-11-15T09:01:22' }, { entryTime: '2023-11-16T09:01:22' }, { entryTime: '2023-11-17T09:01:22' }] },
    { id: 'STU-002', name: 'Bob Williams', email: 'bob@example.com', phone: '+12222222222', location: { lat: 34.0524, lng: -118.2435 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-11-01T09:03:00' }, { entryTime: '2023-11-02T09:03:00' }, { entryTime: '2023-11-03T09:03:00' }, { entryTime: '2023-11-06T09:03:00' }] },
    { id: 'STU-003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+13333333333', location: { lat: 34.0599, lng: -118.2449 }, status: 'breached', lastStatusCheck: 'complete', entryLogs: [] },
    { id: 'STU-004', name: 'Diana Miller', email: 'diana@example.com', phone: '+14444444444', location: { lat: 34.0530, lng: -118.2430 }, status: 'safe', lastStatusCheck: 'complete', entryLogs: [{ entryTime: '2023-10-26T09:05:15' }, { entryTime: '2023-10-27T09:01:22' }, { entryTime: '2023-10-28T08:59:58' }, { entryTime: '2023-11-01T09:05:15' }, { entryTime: '2023-11-02T09:01:22' }, { entryTime: '2023-11-03T08:59:58' }, { entryTime: '2023-11-04T09:05:15' }, { entryTime: '2023-11-05T09:01:22' }, { entryTime: '2023-11-06T08:59:58' }, { entryTime: '2023-11-07T09:05:15' }, { entryTime: '2023-11-08T09:01:22' }, { entryTime: '2023-11-09T08:59:58' }, { entryTime: '2023-11-10T09:05:15' }, { entryTime: '2023-11-11T09:01:22' }, { entryTime: '2023-11-12T08:59:58' }, { entryTime: '2023-11-13T09:05:15' }, { entryTime: '2023-11-14T09:01:22' }, { entryTime: '2023-11-15T08:59:58' }, { entryTime: '2023-11-16T09:01:22' }, { entryTime: '2023-11-17T08:59:58' }, { entryTime: '2023-11-18T09:01:22' }] },
];


let data: StoreData = {
    students: MOCK_STUDENTS,
    teachers: MOCK_TEACHERS,
};

let listeners: ((data: StoreData) => void)[] = [];

export const store = {
  subscribe(listener: (data: StoreData) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  get() {
    return data;
  },
};

function notify() {
  for (const listener of listeners) {
    listener(data);
  }
}

export function addTeacher(teacher: Teacher) {
  data = { ...data, teachers: [...data.teachers, teacher] };
  notify();
}

export function addStudent(student: Student, teacherId: string) {
    data = {
        ...data,
        students: [...data.students, student],
        teachers: data.teachers.map(t => 
            t.id === teacherId 
                ? { ...t, students: [...t.students, student] }
                : t
        ),
    };
    notify();
}

    