/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Student, AttendanceRecord, PaymentRecord, Weekday, TeacherProfile, AuthUser } from './types';
import { Language, translations } from './translations';
import { INITIAL_SAMPLE_STUDENTS, INITIAL_SAMPLE_ATTENDANCE, INITIAL_SAMPLE_PAYMENTS } from './sampleData';
import { 
  supabase, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  signInWithMagicLink,
  savePaymentToSupabase,
  fetchPaymentsFromSupabase,
  saveAttendanceToSupabase,
  deleteAttendanceFromSupabase,
  fetchAttendanceFromSupabase,
  saveStudentMonthlyFeeStatusToSupabase,
  fetchStudentMonthlyStatusesFromSupabase
} from './supabase';

import { LoginGate } from './components/LoginGate';
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal';
import { Navbar } from './components/Navbar';
import { AddStudentSection } from './components/AddStudentSection';
import { StudentListSection } from './components/StudentListSection';
import { AddStudentModal } from './components/AddStudentModal';
import { EditStudentModal } from './components/EditStudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { FeeCollectionModal } from './components/FeeCollectionModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [user, setUser] = useState<AuthUser | User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  
  // Teacher profile state (for first-time account setup)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(() => {
    const saved = localStorage.getItem('tutordesk_teacher_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isFirstTimeSetupOpen, setIsFirstTimeSetupOpen] = useState(false);

  const [language, setLanguage] = useState<Language>('bn');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student roster state
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('tutordesk_local_students');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('tutordesk_local_attendance');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_ATTENDANCE;
  });

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('tutordesk_local_payments');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_PAYMENTS;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [studentForEdit, setStudentForEdit] = useState<Student | null>(null);
  const [studentForFeeCollection, setStudentForFeeCollection] = useState<Student | null>(null);
  const [feeCollectionMonth, setFeeCollectionMonth] = useState<string | undefined>(undefined);

  const t = translations[language];

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Determine current day of week
  const daysMap: Record<number, Weekday> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  const currentWeekday = daysMap[new Date().getDay()] || 'Saturday';

  // Helper to load or check teacher profile
  const checkTeacherProfile = async (targetUser?: AuthUser | User | null) => {
    const activeUser = targetUser || user;
    const userEmail = activeUser?.email;
    const individualName = activeUser?.displayName || (userEmail ? userEmail.split('@')[0] : 'শিক্ষক');

    if (userEmail) {
      const perUserSaved = localStorage.getItem(`ostadji_profile_${userEmail}`);
      if (perUserSaved) {
        try {
          const parsed = JSON.parse(perUserSaved);
          setTeacherProfile(parsed);
          return;
        } catch {}
      }
    }

    try {
      const docKey = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'teacher_profile';
      const profileSnap = await getDoc(doc(db, 'teachers', docKey));
      if (profileSnap.exists()) {
        const data = profileSnap.data() as TeacherProfile;
        setTeacherProfile(data);
        if (userEmail) {
          localStorage.setItem(`ostadji_profile_${userEmail}`, JSON.stringify(data));
        }
        localStorage.setItem('tutordesk_teacher_profile', JSON.stringify(data));
      } else {
        const localSaved = localStorage.getItem('tutordesk_teacher_profile');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setTeacherProfile(parsed);
          } catch {}
        } else if (activeUser) {
          // Initialize individual profile using their name
          const newProf: TeacherProfile = {
            userId: userEmail || 'user',
            name: individualName,
            email: userEmail || '',
            currency: '৳',
            tuitionName: language === 'bn' ? 'ওস্তাদ জী' : 'Ostad Ji',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setTeacherProfile(newProf);
          if (userEmail) {
            localStorage.setItem(`ostadji_profile_${userEmail}`, JSON.stringify(newProf));
          }
        }
      }
    } catch (e) {
      console.warn('Profile fetch error, checking local:', e);
      if (userEmail) {
        const perUserSaved = localStorage.getItem(`ostadji_profile_${userEmail}`);
        if (perUserSaved) {
          try {
            setTeacherProfile(JSON.parse(perUserSaved));
            return;
          } catch {}
        }
      }
      const localSaved = localStorage.getItem('tutordesk_teacher_profile');
      if (localSaved) {
        try {
          setTeacherProfile(JSON.parse(localSaved));
        } catch {}
      }
    }
  };

  // Listen to Supabase Auth state & session
  useEffect(() => {
    let isMounted = true;

    const handleSupabaseUser = async (supaUser: any) => {
      if (!isMounted || !supaUser) return;
      const individualName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Teacher';
      const mappedUser: AuthUser = {
        id: supaUser.id,
        uid: supaUser.id,
        email: supaUser.email,
        displayName: individualName,
        photoURL: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
      };
      setUser(mappedUser);
      setUnauthorizedEmail(null);
      await checkTeacherProfile(mappedUser);
      setAuthLoading(false);
    };

    // 1. Initial check of existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else {
        setAuthLoading(false);
      }
    }).catch(err => {
      console.warn('Supabase getSession error:', err);
      setAuthLoading(false);
    });

    // 2. Subscribe to Supabase Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Listen to Firebase Auth state (fallback / dual compatibility)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser) {
        setUser(currentUser);
        setUnauthorizedEmail(null);
        await checkTeacherProfile();
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Supabase Initial Sync for Payments, Attendance, and Monthly Status
  useEffect(() => {
    if (!user) return;

    // 1. Fetch fee payments from Supabase
    fetchPaymentsFromSupabase().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setPaymentRecords(prev => {
          const fetchedIds = new Set(res.data!.map(d => d.id));
          const localOnly = prev.filter(p => !fetchedIds.has(p.id));
          return [...res.data!, ...localOnly];
        });
      }
    });

    // 2. Fetch attendance from Supabase
    fetchAttendanceFromSupabase().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setAttendanceRecords(prev => {
          const fetchedIds = new Set(res.data!.map(d => d.id));
          const localOnly = prev.filter(a => !fetchedIds.has(a.id));
          return [...res.data!, ...localOnly];
        });
      }
    });

    // 3. Fetch monthly fee status from Supabase
    fetchStudentMonthlyStatusesFromSupabase().then(res => {
      if (res.success && res.data) {
        const now = new Date();
        const currentMonthCode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setStudents(prev =>
          prev.map(s => {
            const key = `${s.id}_${currentMonthCode}`;
            if (res.data![key] !== undefined) {
              return { ...s, currentMonthPaid: res.data![key] };
            }
            return s;
          })
        );
      }
    });
  }, [user]);

  // Monthly fee status reset on the 1st of every month (keeping past month history intact!)
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentMonthCode = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

    const lastResetMonth = localStorage.getItem('tutordesk_last_fee_reset_month');

    // If month has changed (e.g. 1st of new month, or new month has rolled over)
    if (lastResetMonth && lastResetMonth !== currentMonthCode) {
      setStudents(prevStudents =>
        prevStudents.map(student => {
          // Check if there is already a payment for this new month
          const hasPaidNewMonth = paymentRecords.some(p =>
            p.studentId === student.id && (p.month.includes(currentMonthCode) || p.date.startsWith(currentMonthCode))
          );

          return {
            ...student,
            // Reset fee status for the 1st of new month
            currentMonthPaid: hasPaidNewMonth,
          };
        })
      );
      localStorage.setItem('tutordesk_last_fee_reset_month', currentMonthCode);
    } else if (!lastResetMonth) {
      localStorage.setItem('tutordesk_last_fee_reset_month', currentMonthCode);
    }
  }, [paymentRecords]);

  // Save to local storage as safety backup
  useEffect(() => {
    if (user) {
      localStorage.setItem('tutordesk_local_students', JSON.stringify(students));
    }
  }, [students, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tutordesk_local_attendance', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tutordesk_local_payments', JSON.stringify(paymentRecords));
    }
  }, [paymentRecords, user]);

  // Firestore real-time sync when authorized teacher is logged in
  useEffect(() => {
    if (!user) return;

    try {
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        snapshot => {
          const list: Student[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Student, 'id'>) });
          });
          setStudents(list);
        },
        error => console.warn('Students sync error:', error)
      );

      const unsubAtt = onSnapshot(
        collection(db, 'attendance'),
        snapshot => {
          const list: AttendanceRecord[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<AttendanceRecord, 'id'>) });
          });
          setAttendanceRecords(list);
        },
        error => console.warn('Attendance sync error:', error)
      );

      const unsubPay = onSnapshot(
        collection(db, 'payments'),
        snapshot => {
          const list: PaymentRecord[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<PaymentRecord, 'id'>) });
          });
          setPaymentRecords(list);
        },
        error => console.warn('Payment sync error:', error)
      );

      return () => {
        unsubStudents();
        unsubAtt();
        unsubPay();
      };
    } catch (err) {
      console.warn('Firestore subscription error:', err);
    }
  }, [user]);

  // Sign In or Sign Up with Email & Password via Supabase Auth
  const handleSignInWithEmail = async (
    email: string,
    password: string,
    isSignUp: boolean,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      setUnauthorizedEmail(null);

      if (isSignUp) {
        // Sign up with Supabase Auth
        const { data, error } = await signUpWithEmailPassword(cleanEmail, password, fullName);

        if (error) {
          console.error('Supabase signup error:', error);
          let msg = error.message;
          if (error.message.toLowerCase().includes('user already registered')) {
            msg =
              language === 'bn'
                ? 'এই ইমেইলে ইতোমধ্যেই একাউন্ট তৈরি করা আছে! অনুগ্রহ করে "ইমেল দিয়ে লগইন" অপশন দিয়ে পাসওয়ার্ড লিখে লগইন করুন।'
                : 'User already registered! Please sign in using your password.';
          }
          return { success: false, error: msg };
        }

        if (data.session?.user) {
          const mappedUser: AuthUser = {
            id: data.session.user.id,
            uid: data.session.user.id,
            email: data.session.user.email,
            displayName: data.session.user.user_metadata?.full_name || fullName || cleanEmail.split('@')[0],
            photoURL: null,
          };
          setUser(mappedUser);
          await checkTeacherProfile();
          showToast(language === 'bn' ? 'একাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।' : 'Account created successfully!');
          return { success: true };
        } else if (data.user) {
          // If created, attempt instant sign in
          const loginRes = await signInWithEmailPassword(cleanEmail, password);
          if (loginRes.data?.session?.user) {
            const mappedUser: AuthUser = {
              id: loginRes.data.session.user.id,
              uid: loginRes.data.session.user.id,
              email: loginRes.data.session.user.email,
              displayName: loginRes.data.session.user.user_metadata?.full_name || fullName || cleanEmail.split('@')[0],
              photoURL: null,
            };
            setUser(mappedUser);
            await checkTeacherProfile();
            showToast(language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Logged in successfully!');
            return { success: true };
          }

          return {
            success: true,
            error:
              language === 'bn'
                ? 'একাউন্ট তৈরি হয়েছে! আপনি এখন পাসওয়ার্ড দিয়ে লগইন করতে পারেন।'
                : 'Account created! You can now log in with your password.',
          };
        }
      } else {
        // Sign in with password
        const { data, error } = await signInWithEmailPassword(cleanEmail, password);

        if (error) {
          console.error('Supabase login error:', error);
          let msg = error.message;
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            msg =
              language === 'bn'
                ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। আপনি যদি এখনো একাউন্ট না খুলে থাকেন, তবে "নতুন একাউন্ট তৈরি" ট্যাবে ক্লিক করে একাউন্ট তৈরি করুন।'
                : 'Invalid login credentials. If you do not have an account yet, please click "Create Account".';
          }
          return { success: false, error: msg };
        }

        if (data.session?.user) {
          const mappedUser: AuthUser = {
            id: data.session.user.id,
            uid: data.session.user.id,
            email: data.session.user.email,
            displayName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Teacher',
            photoURL: null,
          };
          setUser(mappedUser);
          setUnauthorizedEmail(null);
          await checkTeacherProfile();
          showToast(language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Signed in successfully.');
          return { success: true };
        }
      }

      return { success: false, error: 'Authentication could not be completed.' };
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      return { success: false, error: err.message || 'Authentication error' };
    }
  };

  // Magic link option (open for all users)
  const handleSendMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error } = await signInWithMagicLink(cleanEmail);
      if (error) {
        return { success: false, error: error.message };
      }
      showToast(
        language === 'bn'
          ? `${cleanEmail} ঠিকানায় লগইন লিংক পাঠানো হয়েছে।`
          : `Login link sent to ${cleanEmail}.`
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send magic link' };
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await signOut(auth).catch(() => {});
      setUser(null);
      showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে।' : 'Signed out successfully.');
    } catch (error) {
      console.error('Sign-out failed', error);
    }
  };

  // Save or Update Teacher Profile
  const handleSaveTeacherProfile = async (profile: TeacherProfile) => {
    setTeacherProfile(profile);
    if (user?.email) {
      localStorage.setItem(`ostadji_profile_${user.email}`, JSON.stringify(profile));
    }
    localStorage.setItem('tutordesk_teacher_profile', JSON.stringify(profile));
    setIsFirstTimeSetupOpen(false);
    showToast(language === 'bn' ? 'ব্যক্তিগত প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');

    try {
      const docKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'teacher_profile';
      await setDoc(doc(db, 'teachers', docKey), profile);
    } catch (err) {
      console.warn('Failed to save profile to Firestore:', err);
    }
  };

  // Add Student Handler
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const studentId = `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newStudent: Student = {
      ...studentData,
      id: studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents(prev => [newStudent, ...prev]);
    showToast(t.studentAddedSuccess);

    try {
      await setDoc(doc(db, 'students', studentId), newStudent);
    } catch (err) {
      console.warn('Firestore student write warning:', err);
    }
  };

  // Edit Student Handler
  const handleSaveEditedStudent = async (updated: Student) => {
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    if (selectedStudentForDetail?.id === updated.id) {
      setSelectedStudentForDetail(updated);
    }
    showToast(t.studentUpdatedSuccess);

    try {
      await updateDoc(doc(db, 'students', updated.id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore student update warning:', err);
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudentForDetail?.id === studentId) {
      setSelectedStudentForDetail(null);
    }
    showToast(t.studentDeletedSuccess);

    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      console.warn('Firestore student delete warning:', err);
    }
  };

  // Mark Attendance Handler
  const handleUpdateAttendance = async (
    studentId: string, 
    status: 'present' | 'absent' | 'late' | 'off', 
    specificDate?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = specificDate || todayStr;
    const isToday = targetDate === todayStr;

    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    const attendanceDocId = `att_${studentId}_${targetDate}`;
    const newAttendanceItem: AttendanceRecord = {
      id: attendanceDocId,
      teacherId: user?.email || 'teacher',
      studentId,
      studentName: targetStudent.name,
      date: targetDate,
      status,
      markedAt: new Date().toISOString(),
    };

    if (isToday) {
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, attendanceToday: status, lastAttendanceDate: targetDate } : s))
      );
    }
    setAttendanceRecords(prev => {
      const filtered = prev.filter(a => !(a.studentId === studentId && a.date === targetDate));
      return [newAttendanceItem, ...filtered];
    });

    if (selectedStudentForDetail?.id === studentId && isToday) {
      setSelectedStudentForDetail(prev => prev ? { ...prev, attendanceToday: status, lastAttendanceDate: targetDate } : null);
    }

    showToast(t.attendanceRecorded);

    // Save directly to Supabase backend table 'attendance'
    saveAttendanceToSupabase(newAttendanceItem).catch(err => console.warn('Supabase attendance sync warning:', err));

    try {
      if (isToday) {
        await updateDoc(doc(db, 'students', studentId), {
          attendanceToday: status,
          lastAttendanceDate: targetDate,
          updatedAt: new Date().toISOString(),
        });
      }
      await setDoc(doc(db, 'attendance', attendanceDocId), newAttendanceItem);
    } catch (err) {
      console.warn('Firestore attendance sync:', err);
    }
  };

  // Delete/clear attendance record for a specific date
  const handleDeleteAttendanceRecord = async (studentId: string, date: string) => {
    const attendanceDocId = `att_${studentId}_${date}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;

    setAttendanceRecords(prev => prev.filter(a => !(a.studentId === studentId && a.date === date)));

    if (isToday) {
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, attendanceToday: 'none', lastAttendanceDate: undefined } : s))
      );
      if (selectedStudentForDetail?.id === studentId) {
        setSelectedStudentForDetail(prev => prev ? { ...prev, attendanceToday: 'none' } : null);
      }
    }

    showToast(language === 'bn' ? 'হাজিরা রেকর্ড মোছা হয়েছে' : 'Attendance record cleared');

    // Delete from Supabase backend table 'attendance'
    deleteAttendanceFromSupabase(studentId, date).catch(err => console.warn('Supabase attendance delete warning:', err));

    try {
      await deleteDoc(doc(db, 'attendance', attendanceDocId));
      if (isToday) {
        await updateDoc(doc(db, 'students', studentId), {
          attendanceToday: 'none',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore delete attendance sync:', err);
    }
  };

  // Record Fee Payment Handler (saves to Supabase & state)
  const handleRecordPayment = async (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const payId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newRecord: PaymentRecord = {
      ...paymentData,
      id: payId,
      teacherId: user?.email || paymentData.teacherId || 'teacher',
      createdAt: new Date().toISOString(),
    };

    setPaymentRecords(prev => [newRecord, ...prev]);

    // Check if payment corresponds to current month
    const now = new Date();
    const currentMonthCode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthName = now.toLocaleString('default', { month: 'long' });
    const isCurrentMonth = 
      paymentData.month.includes(currentMonthCode) || 
      paymentData.month.toLowerCase().includes(currentMonthName.toLowerCase());

    if (isCurrentMonth) {
      setStudents(prev =>
        prev.map(s => (s.id === paymentData.studentId ? { ...s, currentMonthPaid: true, lastPaymentDate: paymentData.date } : s))
      );
      if (selectedStudentForDetail?.id === paymentData.studentId) {
        setSelectedStudentForDetail(prev =>
          prev ? { ...prev, currentMonthPaid: true, lastPaymentDate: paymentData.date } : null
        );
      }
    }

    showToast(t.feeRecorded);

    // 1. Save to Supabase backend table 'payments'
    savePaymentToSupabase(newRecord).catch(err => console.warn('Supabase payment sync warning:', err));
    // 2. Save monthly status to Supabase
    saveStudentMonthlyFeeStatusToSupabase(paymentData.studentId, paymentData.month, true, paymentData.amount).catch(err =>
      console.warn('Supabase monthly fee status sync warning:', err)
    );

    try {
      await setDoc(doc(db, 'payments', payId), newRecord);
      if (isCurrentMonth) {
        await updateDoc(doc(db, 'students', paymentData.studentId), {
          currentMonthPaid: true,
          lastPaymentDate: paymentData.date,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore payment sync:', err);
    }
  };

  // Toggle Fee Status between Paid and Due directly for a specific month (or current month)
  const handleToggleFeeStatus = async (studentId: string, isPaid: boolean, monthStr?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonthCode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetMonthStr = monthStr || now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isCurrentMonth = !monthStr || monthStr.includes(currentMonthCode) || monthStr.toLowerCase().includes(now.toLocaleString('default', { month: 'long' }).toLowerCase());

    const targetStudent = students.find(s => s.id === studentId);

    // 1. If it affects the current month, update student roster state
    if (isCurrentMonth) {
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, currentMonthPaid: isPaid, lastPaymentDate: isPaid ? todayStr : s.lastPaymentDate } : s))
      );
      if (selectedStudentForDetail?.id === studentId) {
        setSelectedStudentForDetail(prev =>
          prev ? { ...prev, currentMonthPaid: isPaid, lastPaymentDate: isPaid ? todayStr : prev.lastPaymentDate } : null
        );
      }
    }

    // 2. If marked as Paid, record a PaymentRecord for this month
    if (isPaid && targetStudent) {
      const payId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newRecord: PaymentRecord = {
        id: payId,
        teacherId: user?.email || '',
        studentId,
        studentName: targetStudent.name,
        month: targetMonthStr,
        amount: targetStudent.monthlyFee,
        paymentMethod: 'Cash',
        date: todayStr,
        note: `Monthly Fee Status: Paid (${targetMonthStr})`,
        createdAt: new Date().toISOString(),
      };
      setPaymentRecords(prev => [newRecord, ...prev]);
      // Save directly to Supabase payments table
      savePaymentToSupabase(newRecord).catch(err => console.warn('Supabase payment sync warning:', err));
    } else if (!isPaid) {
      // If marked as Due, filter out payments recorded for this specific month from state
      setPaymentRecords(prev =>
        prev.filter(p => !(p.studentId === studentId && (p.month.includes(targetMonthStr) || targetMonthStr.includes(p.month))))
      );
    }

    // 3. Save monthly fee status to Supabase backend
    saveStudentMonthlyFeeStatusToSupabase(studentId, targetMonthStr, isPaid, targetStudent?.monthlyFee).catch(err =>
      console.warn('Supabase monthly fee status sync warning:', err)
    );

    showToast(
      isPaid
        ? (language === 'bn' ? `${targetMonthStr} মাসের বেতন পরিশোধিত হিসেবে সংরক্ষিত হয়েছে` : `Fee for ${targetMonthStr} marked as Paid`)
        : (language === 'bn' ? `${targetMonthStr} মাসের বেতন বকেয়া হিসেবে সংরক্ষিত হয়েছে` : `Fee for ${targetMonthStr} marked as Due`)
    );

    try {
      if (isCurrentMonth) {
        await updateDoc(doc(db, 'students', studentId), {
          currentMonthPaid: isPaid,
          lastPaymentDate: isPaid ? todayStr : undefined,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore fee status sync:', err);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // 1. IF NOT SIGNED IN: SHOW LOGIN GATE
  if (!user) {
    return (
      <LoginGate
        onSignInWithEmail={handleSignInWithEmail}
        onSendMagicLink={handleSendMagicLink}
        unauthorizedEmail={unauthorizedEmail}
        onClearUnauthorized={() => setUnauthorizedEmail(null)}
        language={language}
      />
    );
  }

  // 2. AUTHORIZED TEACHER SIGNED IN: RENDER FULL DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-xs sm:text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header with Teacher Profile and Logout */}
      <Navbar
        user={user}
        teacherProfile={teacherProfile}
        language={language}
        onLanguageChange={setLanguage}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenProfileModal={() => setIsFirstTimeSetupOpen(true)}
        onSignOut={handleSignOut}
        studentCount={students.length}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
        
        {/* Section 1: Add New Student Option */}
        <AddStudentSection
          onAddStudent={handleAddStudent}
          language={language}
        />

        {/* Section 2: Manage Student Profiles (All students, Phone, Attendance, Monthly Fee, Edit, Delete) */}
        <StudentListSection
          students={students}
          currentWeekday={currentWeekday}
          language={language}
          onSelectStudent={student => setSelectedStudentForDetail(student)}
          onEditStudent={student => setStudentForEdit(student)}
          onDeleteStudent={handleDeleteStudent}
          onUpdateAttendance={handleUpdateAttendance}
          onOpenFeeCollection={student => setStudentForFeeCollection(student)}
          onToggleFeeStatus={handleToggleFeeStatus}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          attendanceHistory={attendanceRecords}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {teacherProfile?.tuitionName || t.appTitle} • {language === 'bn' ? 'প্রাইভেট টিউশন ড্যাশবোর্ড' : 'Private Tuition Dashboard'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {user.email || 'Teacher Dashboard'}
          </p>
        </div>
      </footer>

      {/* Individual Teacher Profile Setup / Edit Modal */}
      <FirstTimeSetupModal
        isOpen={isFirstTimeSetupOpen}
        userEmail={user.email || 'teacher@example.com'}
        defaultName={teacherProfile?.name || user.displayName || user.email?.split('@')[0] || 'শিক্ষক'}
        initialProfile={teacherProfile}
        onClose={() => setIsFirstTimeSetupOpen(false)}
        onSaveProfile={handleSaveTeacherProfile}
        language={language}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={handleAddStudent}
        teacherId={user.email || 'teacher'}
        language={language}
      />

      {/* Edit Student Profile Modal */}
      <EditStudentModal
        isOpen={!!studentForEdit}
        student={studentForEdit}
        onClose={() => setStudentForEdit(null)}
        onSaveStudent={handleSaveEditedStudent}
        language={language}
      />

      {/* Student Deep Detail Modal (Contains Visual Monthly Calendar & Fee History) */}
      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        onUpdateAttendance={handleUpdateAttendance}
        onAddPastAttendance={(studentId, date, status) => handleUpdateAttendance(studentId, status, date)}
        onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
        onToggleFeeStatus={handleToggleFeeStatus}
        onOpenFeeCollection={(student, monthStr) => {
          setStudentForFeeCollection(student);
          setFeeCollectionMonth(monthStr);
        }}
        onOpenEdit={student => setStudentForEdit(student)}
        onDeleteStudent={handleDeleteStudent}
        attendanceHistory={attendanceRecords}
        paymentHistory={paymentRecords}
        language={language}
      />

      {/* Collect Fee Modal */}
      <FeeCollectionModal
        isOpen={!!studentForFeeCollection}
        student={studentForFeeCollection}
        initialMonth={feeCollectionMonth}
        onClose={() => {
          setStudentForFeeCollection(null);
          setFeeCollectionMonth(undefined);
        }}
        onRecordPayment={handleRecordPayment}
        teacherId={user.email || 'teacher'}
        language={language}
      />

      {/* Print / Export Report Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        students={students}
        language={language}
      />

    </div>
  );
}
