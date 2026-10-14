export type AttendanceStatus = 'present' | 'absent' | 'late' | 'off' | 'none';
export type PaymentStatus = 'paid' | 'due' | 'partial';

export interface Student {
  id: string;
  teacherId: string;
  name: string;
  phone: string;
  guardianName?: string;
  classGrade: string;
  institution?: string;
  batchTime?: string;
  daysPerWeek: number; // e.g., 3
  weeklySchedule: string[]; // e.g. ["Saturday", "Monday", "Wednesday"]
  monthlyFee: number; // e.g., 2000
  currentMonthPaid: boolean;
  lastPaymentDate?: string;
  attendanceToday: AttendanceStatus;
  lastAttendanceDate?: string; // YYYY-MM-DD
  notes?: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'off';
  note?: string;
  markedAt: string;
}

export interface PaymentRecord {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  month: string; // e.g., "2026-10" or "October 2026"
  amount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface TeacherProfile {
  userId: string;
  name: string;
  email: string;
  currency: string;
  phone?: string;
  tuitionName?: string;
  address?: string;
  subjects?: string;
  classesTaught?: string;
  securityPin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Weekday = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const WEEKDAYS_LIST: { id: Weekday; labelBn: string; labelEn: string; shortBn: string; shortEn: string }[] = [
  { id: 'Saturday', labelBn: 'শনিবার', labelEn: 'Saturday', shortBn: 'শনি', shortEn: 'Sat' },
  { id: 'Sunday', labelBn: 'রবিবার', labelEn: 'Sunday', shortBn: 'রবি', shortEn: 'Sun' },
  { id: 'Monday', labelBn: 'সোমবার', labelEn: 'Monday', shortBn: 'সোম', shortEn: 'Mon' },
  { id: 'Tuesday', labelBn: 'মঙ্গলবার', labelEn: 'Tuesday', shortBn: 'মঙ্গল', shortEn: 'Tue' },
  { id: 'Wednesday', labelBn: 'বুধবার', labelEn: 'Wednesday', shortBn: 'বুধ', shortEn: 'Wed' },
  { id: 'Thursday', labelBn: 'বৃহস্পতিবার', labelEn: 'Thursday', shortBn: 'বৃহঃ', shortEn: 'Thu' },
  { id: 'Friday', labelBn: 'শুক্রবার', labelEn: 'Friday', shortBn: 'শুক্র', shortEn: 'Fri' },
];

export interface AuthUser {
  id?: string;
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  [key: string]: any;
}
