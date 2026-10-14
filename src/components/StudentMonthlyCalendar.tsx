import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Check,
  RotateCcw,
  Clock
} from 'lucide-react';
import { Student, AttendanceRecord, PaymentRecord, WEEKDAYS_LIST, Weekday } from '../types';
import { Language, translations } from '../translations';

interface StudentMonthlyCalendarProps {
  student: Student;
  attendanceHistory: AttendanceRecord[];
  paymentHistory: PaymentRecord[];
  language: Language;
  onUpdateAttendanceRecord: (studentId: string, date: string, status: 'present' | 'absent' | 'late' | 'off', note?: string) => void;
  onDeleteAttendanceRecord?: (studentId: string, date: string) => void;
  onToggleMonthlyFee: (studentId: string, monthStr: string, isPaid: boolean) => void;
  onOpenFeeCollection: (student: Student, monthStr: string) => void;
}

export const StudentMonthlyCalendar: React.FC<StudentMonthlyCalendarProps> = ({
  student,
  attendanceHistory,
  paymentHistory,
  language,
  onUpdateAttendanceRecord,
  onDeleteAttendanceRecord,
  onToggleMonthlyFee,
  onOpenFeeCollection,
}) => {
  const t = translations[language];

  // Currently viewed year and month
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-indexed (0 = Jan, 9 = Oct)

  // Selected date for popover/quick action
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
    setActiveDateModal(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
    setActiveDateModal(null);
  };

  const handleResetToCurrentMonth = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setActiveDateModal(null);
  };

  // Month code for queries e.g. "2026-10"
  const monthPadded = String(viewMonth + 1).padStart(2, '0');
  const currentMonthCode = `${viewYear}-${monthPadded}`;

  // Month display label e.g. "October 2026" or "অক্টোবর ২০২৬"
  const monthDateObj = new Date(viewYear, viewMonth, 1);
  const monthDisplayLabel = monthDateObj.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in this month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Day of week for 1st day of month:
  // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // We want our calendar starting on Saturday (শনিবার = 0), then Sun(1), Mon(2), Tue(3), Wed(4), Thu(5), Fri(6)
  const firstDayJS = new Date(viewYear, viewMonth, 1).getDay();
  // Map JS Sunday(0) -> 1, Mon(1) -> 2, ..., Sat(6) -> 0
  const firstDayOffset = (firstDayJS + 1) % 7;

  // Filter attendance for this student strictly
  const studentAtt = attendanceHistory.filter(a => a.studentId === student.id);
  
  // Map date -> status for this student
  const attendanceMap: Record<string, { status: string; note?: string }> = {};
  studentAtt.forEach(a => {
    attendanceMap[a.date] = { status: a.status, note: a.note };
  });

  // Find fee payment for this month for this student
  const thisMonthPayment = paymentHistory.find(
    p => p.studentId === student.id && (p.month.includes(currentMonthCode) || p.month.toLowerCase().includes(monthDateObj.toLocaleString('en-US', { month: 'long' }).toLowerCase()))
  );

  // Check if fee is considered paid for this viewed month:
  // If viewing current month, student.currentMonthPaid is the live status, or thisMonthPayment exists
  const isCurrentViewingMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isPaidThisMonth = isCurrentViewingMonth 
    ? Boolean(student.currentMonthPaid || thisMonthPayment) 
    : Boolean(thisMonthPayment);

  // Stats calculation for the viewed month
  let presentCount = 0;
  let absentCount = 0;
  let offCount = 0; // "ছিল না" / ছুটি / দেরি

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${viewYear}-${monthPadded}-${String(day).padStart(2, '0')}`;
    const rec = attendanceMap[dStr];
    if (rec) {
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'late' || rec.status === 'off') offCount++;
    }
  }

  // Weekday column headers (Starting Saturday for Bangladesh tuition context)
  const calendarColumns = [
    { id: 'Saturday', bn: 'শনি', en: 'Sat' },
    { id: 'Sunday', bn: 'রবি', en: 'Sun' },
    { id: 'Monday', bn: 'সোম', en: 'Mon' },
    { id: 'Tuesday', bn: 'মঙ্গল', en: 'Tue' },
    { id: 'Wednesday', bn: 'বুধ', en: 'Wed' },
    { id: 'Thursday', bn: 'বৃহঃ', en: 'Thu' },
    { id: 'Friday', bn: 'শুক্র', en: 'Fri' },
  ];

  const todayISO = today.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      
      {/* 1. TOP SECTION: MONTHLY FEE STATUS (উপরে বেতন দিছে কিনা) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isPaidThisMonth 
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' 
          : 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-300 text-rose-950 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              isPaidThisMonth ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {isPaidThisMonth ? <Check className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {monthDisplayLabel} - {language === 'bn' ? 'বেতন হিসাব:' : 'Tuition Fee:'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  isPaidThisMonth 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {isPaidThisMonth 
                    ? (language === 'bn' ? '✓ বেতন পরিশোধিত' : '✓ Fee Paid') 
                    : (language === 'bn' ? '⚠ বেতন বকেয়া' : '⚠ Fee Due')}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {language === 'bn' ? 'মাসিক ফি:' : 'Monthly Fee:'} <strong className="text-slate-900">৳{student.monthlyFee.toLocaleString()}</strong>
                {thisMonthPayment && (
                  <span className="text-[11px] text-slate-500 ml-2">
                    (পরিশোধ: {thisMonthPayment.date} • {thisMonthPayment.paymentMethod})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Fee Action Toggle */}
          <div className="flex items-center gap-2">
            {isPaidThisMonth ? (
              <button
                type="button"
                onClick={() => onToggleMonthlyFee(student.id, currentMonthCode, false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বকেয়া মার্ক করুন' : 'Mark Due'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenFeeCollection(student, monthDisplayLabel)}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>{language === 'bn' ? 'বেতন গ্রহণ করুন' : 'Collect Fee'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MONTH NAVIGATION & STATS (নিচে মাস পরিবর্তন ও সারাংশ) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title={language === 'bn' ? 'আগের মাস' : 'Previous Month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-black text-slate-900 px-2 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              {monthDisplayLabel}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title={language === 'bn' ? 'পরের মাস' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrentViewingMonth && (
              <button
                onClick={handleResetToCurrentMonth}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'bn' ? 'চলতি মাস' : 'Current Month'}</span>
              </button>
            )}

            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {student.daysPerWeek} {t.daysCount}
            </span>
          </div>
        </div>

        {/* Attendance Counter Chips for This Month */}
        <div className="grid grid-cols-3 gap-2 my-3">
          {/* Green: আসছে */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                {language === 'bn' ? 'আসছে (সবুজ)' : 'Present (Green)'}
              </span>
              <span className="text-lg font-black text-emerald-700">
                {presentCount} {language === 'bn' ? 'দিন' : 'days'}
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></div>
          </div>

          {/* Red: আসে নাই */}
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-800 uppercase block">
                {language === 'bn' ? 'আসে নাই (লাল)' : 'Absent (Red)'}
              </span>
              <span className="text-lg font-black text-rose-700">
                {absentCount} {language === 'bn' ? 'দিন' : 'days'}
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs"></div>
          </div>

          {/* Yellow: ছিল না / ছুটি */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                {language === 'bn' ? 'ছিল না / ছুটি (হলুদ)' : 'Off/Leave (Yellow)'}
              </span>
              <span className="text-lg font-black text-amber-700">
                {offCount} {language === 'bn' ? 'দিন' : 'days'}
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs"></div>
          </div>
        </div>

        {/* 3. CALENDAR GRID (ক্যালেন্ডার ভিউ) */}
        <div className="pt-2">
          {/* Weekday headers (শনি, রবি, সোম, মঙ্গল, বুধ, বৃহস্পতি, শুক্র) */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-1">
            {calendarColumns.map((col, idx) => (
              <div 
                key={col.id} 
                className={`py-1 rounded-md text-[11px] ${
                  student.weeklySchedule?.includes(col.id as Weekday)
                    ? 'text-indigo-700 font-black bg-indigo-50/50'
                    : 'text-slate-400'
                }`}
              >
                {language === 'bn' ? col.bn : col.en}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before the first day */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-xl bg-slate-50/40"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${viewYear}-${monthPadded}-${String(dayNum).padStart(2, '0')}`;
              
              // Calculate day of week for this date to see if student normally has class
              const dateObj = new Date(viewYear, viewMonth, dayNum);
              const dayOfWeekJS = dateObj.getDay();
              const weekdayNames: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const thisWeekday = weekdayNames[dayOfWeekJS];
              const isScheduledDay = student.weeklySchedule?.includes(thisWeekday);

              const record = attendanceMap[dateStr];
              const isTodayCell = dateStr === todayISO;

              // Color determination requested by user:
              // আসছে = সবুজ (Green)
              // আসে নাই = লাল (Red)
              // ছিল না = হলুদ (Yellow)
              let cellBg = 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80';
              let badgeColor = '';
              let statusLabel = '';

              if (record) {
                if (record.status === 'present') {
                  // সবুজ (Green)
                  cellBg = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold';
                  badgeColor = 'bg-white text-emerald-800';
                  statusLabel = language === 'bn' ? 'আসছে' : 'Present';
                } else if (record.status === 'absent') {
                  // লাল (Red)
                  cellBg = 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-xs font-bold';
                  badgeColor = 'bg-white text-rose-800';
                  statusLabel = language === 'bn' ? 'আসে নাই' : 'Absent';
                } else if (record.status === 'late' || record.status === 'off') {
                  // হলুদ (Yellow)
                  cellBg = 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 shadow-xs font-bold';
                  badgeColor = 'bg-white text-amber-900';
                  statusLabel = language === 'bn' ? 'ছিল না' : 'Off/Late';
                }
              }

              return (
                <div
                  key={dateStr}
                  onClick={() => setActiveDateModal(dateStr)}
                  className={`h-12 sm:h-14 p-1 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none relative ${cellBg} ${
                    isTodayCell ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  title={`${dateStr}: ${statusLabel || (isScheduledDay ? 'ক্লাসের দিন' : 'সাধারণ দিন')}`}
                >
                  {/* Date number & Today dot */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black leading-none">
                      {dayNum}
                    </span>
                    {isScheduledDay && !record && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="শিডিউল দিন"></span>
                    )}
                  </div>

                  {/* Status Indicator text/badge */}
                  <div className="text-[9px] font-bold truncate leading-tight">
                    {record ? (
                      <span className={`px-1 py-0.2 rounded-md ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    ) : isScheduledDay ? (
                      <span className="text-slate-400 text-[8px]">
                        {language === 'bn' ? 'পড়ার দিন' : 'Class'}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend (কালার গাইড) */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-2xs"></span>
                <span>{language === 'bn' ? 'সবুজ = আসছে' : 'Green = Present'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-2xs"></span>
                <span>{language === 'bn' ? 'লাল = আসে নাই' : 'Red = Absent'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400 inline-block shadow-2xs"></span>
                <span>{language === 'bn' ? 'হলুদ = ছিল না / ছুটি' : 'Yellow = Off/Holiday'}</span>
              </span>
            </div>

            <span className="text-slate-400 text-[10px]">
              {language === 'bn' ? '* যেকোনো তারিখে ক্লিক করে হাজিরা বদলান' : '* Click any date to update'}
            </span>
          </div>

        </div>

      </div>

      {/* QUICK DATE ATTENDANCE SELECTOR POPUP (ক্লিক করা তারিখের হাজিরা সেট) */}
      {activeDateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-slideUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {language === 'bn' ? 'হাজিরা নির্ধারণ করুন' : 'Mark Attendance'}
                </h4>
                <p className="text-xs font-semibold text-indigo-700">
                  {activeDateModal} ({student.name})
                </p>
              </div>
              <button
                onClick={() => setActiveDateModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3 font-medium">
              {language === 'bn' ? 'এই তারিখে ছাত্রের উপস্থিতি সিলেক্ট করুন:' : 'Select status for this date:'}
            </p>

            <div className="grid grid-cols-1 gap-2 mb-4">
              {/* 1. আসছে (সবুজ) */}
              <button
                type="button"
                onClick={() => {
                  onUpdateAttendanceRecord(student.id, activeDateModal, 'present');
                  setActiveDateModal(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-between border cursor-pointer transition-all ${
                  attendanceMap[activeDateModal]?.status === 'present'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></span>
                  <span>{language === 'bn' ? '🟢 আসছে (উপস্থিত)' : '🟢 Present'}</span>
                </div>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {/* 2. আসে নাই (লাল) */}
              <button
                type="button"
                onClick={() => {
                  onUpdateAttendanceRecord(student.id, activeDateModal, 'absent');
                  setActiveDateModal(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-between border cursor-pointer transition-all ${
                  attendanceMap[activeDateModal]?.status === 'absent'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white"></span>
                  <span>{language === 'bn' ? '🔴 আসে নাই (অনুপস্থিত)' : '🔴 Absent'}</span>
                </div>
                <XCircle className="w-4 h-4" />
              </button>

              {/* 3. ছিল না (হলুদ) */}
              <button
                type="button"
                onClick={() => {
                  onUpdateAttendanceRecord(student.id, activeDateModal, 'off');
                  setActiveDateModal(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-between border cursor-pointer transition-all ${
                  attendanceMap[activeDateModal]?.status === 'off' || attendanceMap[activeDateModal]?.status === 'late'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white"></span>
                  <span>{language === 'bn' ? '🟡 ছিল না / ছুটি' : '🟡 Off / Leave'}</span>
                </div>
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {attendanceMap[activeDateModal] && onDeleteAttendanceRecord && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAttendanceRecord(student.id, activeDateModal);
                    setActiveDateModal(null);
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'হাজিরা মুছুন' : 'Clear Entry'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveDateModal(null)}
                className="ml-auto px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
