import { createClient } from '@supabase/supabase-js';
import { PaymentRecord, AttendanceRecord } from './types';

export const SUPABASE_PROJECT_ID = 'ndawjbgtsmptxotauxqv';
export const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  'sb_publishable_mbiQfLBWhXpLM0rYVvIs-w_NEFsrpuy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sign in with Email and Password using Supabase Auth
 */
export async function signInWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with Email and Password using Supabase Auth (for any user/teacher)
 */
export async function signUpWithEmailPassword(email: string, password: string, fullName?: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
    },
  });
}

/**
 * Send Magic Link / OTP to Email using Supabase Auth
 */
export async function signInWithMagicLink(email: string) {
  const targetRedirect = typeof window !== 'undefined' ? window.location.origin : undefined;
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: targetRedirect,
    },
  });
}

/**
 * Sign in with Google using Supabase Auth signInWithOAuth (legacy/fallback)
 */
export async function signInWithGoogleOAuth(redirectTo?: string) {
  const targetRedirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined);
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
    },
  });
}

// -------------------------------------------------------------
// 1. SUPABASE FEE PAYMENTS (বেতন কালেকশন সংরক্ষণ ও ফেচ)
// -------------------------------------------------------------

export interface SupabasePaymentRow {
  id: string;
  teacher_id: string;
  student_id: string;
  student_name: string;
  month: string;
  amount: number;
  payment_method: string;
  date: string;
  note?: string | null;
  created_at?: string;
}

/**
 * Save fee payment record directly to Supabase backend table
 */
export async function savePaymentToSupabase(payment: PaymentRecord): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload: SupabasePaymentRow = {
      id: payment.id,
      teacher_id: payment.teacherId || '',
      student_id: payment.studentId,
      student_name: payment.studentName,
      month: payment.month,
      amount: Number(payment.amount) || 0,
      payment_method: payment.paymentMethod,
      date: payment.date,
      note: payment.note || null,
      created_at: payment.createdAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('payments')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase save payment warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase save payment error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all fee payment records from Supabase
 */
export async function fetchPaymentsFromSupabase(teacherId?: string): Promise<{ success: boolean; data?: PaymentRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch payments warning:', error.message);
      return { success: false, error: error.message };
    }

    const mapped: PaymentRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      teacherId: row.teacher_id,
      studentId: row.student_id,
      studentName: row.student_name,
      month: row.month,
      amount: Number(row.amount) || 0,
      paymentMethod: row.payment_method,
      date: row.date,
      note: row.note || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }));

    return { success: true, data: mapped };
  } catch (err: any) {
    console.warn('Supabase fetch payments error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// -------------------------------------------------------------
// 2. SUPABASE ATTENDANCE (হাজিরা সংরক্ষণ ও ফেচ)
// -------------------------------------------------------------

export interface SupabaseAttendanceRow {
  id: string;
  teacher_id: string;
  student_id: string;
  student_name?: string | null;
  date: string;
  status: string;
  note?: string | null;
  marked_at?: string;
}

/**
 * Save or update attendance record directly in Supabase backend table
 */
export async function saveAttendanceToSupabase(record: AttendanceRecord): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload: SupabaseAttendanceRow = {
      id: record.id,
      teacher_id: record.teacherId || '',
      student_id: record.studentId,
      student_name: record.studentName || null,
      date: record.date,
      status: record.status,
      note: record.note || null,
      marked_at: record.markedAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('attendance')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase save attendance warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase save attendance error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete attendance record in Supabase (e.g. when unmarking or deleting)
 */
export async function deleteAttendanceFromSupabase(studentId: string, date: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .match({ student_id: studentId, date });

    if (error) {
      console.warn('Supabase delete attendance warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase delete attendance error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all attendance records from Supabase
 */
export async function fetchAttendanceFromSupabase(teacherId?: string): Promise<{ success: boolean; data?: AttendanceRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch attendance warning:', error.message);
      return { success: false, error: error.message };
    }

    const mapped: AttendanceRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      teacherId: row.teacher_id,
      studentId: row.student_id,
      studentName: row.student_name || undefined,
      date: row.date,
      status: row.status as any,
      note: row.note || undefined,
      markedAt: row.marked_at || new Date().toISOString(),
    }));

    return { success: true, data: mapped };
  } catch (err: any) {
    console.warn('Supabase fetch attendance error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// -------------------------------------------------------------
// 3. MONTHLY FEE STATUS (মাসে একবার বেতন স্ট্যাটাস আপডেট ও সংরক্ষণ)
// -------------------------------------------------------------

export interface StudentMonthlyStatusRow {
  id: string; // `${studentId}_${month}` e.g. "std_1_2026-10"
  student_id: string;
  month: string; // e.g. "2026-10" or "October 2026"
  is_paid: boolean;
  amount?: number;
  last_updated?: string;
}

/**
 * Update and save student's monthly fee status (Paid / Due) in Supabase
 */
export async function saveStudentMonthlyFeeStatusToSupabase(
  studentId: string,
  month: string,
  isPaid: boolean,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const statusId = `${studentId}_${month.replace(/\s+/g, '_')}`;
    const payload = {
      id: statusId,
      student_id: studentId,
      month,
      is_paid: isPaid,
      amount: amount || 0,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('student_monthly_status')
      .upsert([payload], { onConflict: 'id' });

    if (error) {
      console.warn('Supabase monthly fee status save warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase monthly fee status save error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch monthly fee statuses from Supabase
 */
export async function fetchStudentMonthlyStatusesFromSupabase(): Promise<{
  success: boolean;
  data?: Record<string, boolean>; // key: `${studentId}_${month}` -> isPaid
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('student_monthly_status')
      .select('*');

    if (error) {
      console.warn('Supabase fetch monthly statuses warning:', error.message);
      return { success: false, error: error.message };
    }

    const recordMap: Record<string, boolean> = {};
    (data || []).forEach((row: any) => {
      recordMap[`${row.student_id}_${row.month}`] = Boolean(row.is_paid);
    });

    return { success: true, data: recordMap };
  } catch (err: any) {
    console.warn('Supabase fetch monthly statuses error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// -------------------------------------------------------------
// 4. SQL SCHEMA SETUP SCRIPT (FOR SUPABASE SQL EDITOR)
// -------------------------------------------------------------
export const SUPABASE_SETUP_SQL = `
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/ndawjbgtsmptxotauxqv/sql):

-- 1. Payments Table (বেতন কালেকশন টেবিল)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  month TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance Table (হাজিরা টেবিল)
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  student_id TEXT NOT NULL,
  student_name TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Monthly Status Table (মাসের ১ তারিখের রিসেট ও মাসিক ফি স্ট্যাটাস)
CREATE TABLE IF NOT EXISTS public.student_monthly_status (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  month TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  amount NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) & Public Policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_monthly_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for payments" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for attendance" ON public.attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for student_monthly_status" ON public.student_monthly_status FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`.trim();
