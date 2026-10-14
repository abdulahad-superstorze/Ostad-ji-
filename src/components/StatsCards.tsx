import React from 'react';
import { 
  Users, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays,
  TrendingUp
} from 'lucide-react';
import { Student, Weekday } from '../types';
import { Language, translations } from '../translations';

interface StatsCardsProps {
  students: Student[];
  language: Language;
  currentWeekday: Weekday;
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  students,
  language,
  currentWeekday,
  onFilterChange,
  activeFilter,
}) => {
  const t = translations[language];

  const totalStudents = students.length;
  const presentTodayCount = students.filter(s => s.attendanceToday === 'present').length;
  const absentTodayCount = students.filter(s => s.attendanceToday === 'absent').length;

  const paidCount = students.filter(s => s.currentMonthPaid).length;
  const dueCount = students.filter(s => !s.currentMonthPaid).length;

  const totalCollectedFees = students
    .filter(s => s.currentMonthPaid)
    .reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);

  const totalDueFees = students
    .filter(s => !s.currentMonthPaid)
    .reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);

  const scheduledTodayCount = students.filter(s => 
    s.weeklySchedule && s.weeklySchedule.includes(currentWeekday)
  ).length;

  const attendancePercent = totalStudents > 0 ? Math.round((presentTodayCount / totalStudents) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Total Students */}
      <div 
        onClick={() => onFilterChange('all')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'all' 
            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20' 
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">{t.totalStudents}</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalStudents}</span>
          <span className="text-xs text-slate-500 font-normal">{language === 'bn' ? 'জন' : 'students'}</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-indigo-600 font-medium">
          <span>{language === 'bn' ? 'সকল ব্যাচের ছাত্র' : 'Active batches'}</span>
        </div>
      </div>

      {/* 2. Today's Attendance */}
      <div 
        onClick={() => onFilterChange('present')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'present' 
            ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20' 
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">{t.presentToday}</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-emerald-700 tracking-tight">{presentTodayCount}</span>
          <span className="text-xs text-slate-400">/ {totalStudents}</span>
          <span className="text-xs font-semibold text-emerald-600 ml-auto bg-emerald-50 px-1.5 py-0.5 rounded-md">
            {attendancePercent}%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{language === 'bn' ? `অনুপস্থিত: ${absentTodayCount} জন` : `Absent: ${absentTodayCount}`}</span>
        </div>
      </div>

      {/* 3. Fees Collected This Month */}
      <div 
        onClick={() => onFilterChange('paid')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'paid' 
            ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20' 
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">{t.feesCollected}</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">৳{totalCollectedFees.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-blue-600 font-medium">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>{language === 'bn' ? `${paidCount} জন পরিশোধ করেছে` : `${paidCount} students paid`}</span>
        </div>
      </div>

      {/* 4. Pending Due Fees */}
      <div 
        onClick={() => onFilterChange('due')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'due' 
            ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' 
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-rose-600 font-semibold">{t.feesPending}</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight">৳{totalDueFees.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-rose-600 font-medium">
          <span>{language === 'bn' ? `${dueCount} জনের বেতন বাকি` : `${dueCount} students due`}</span>
        </div>
      </div>

      {/* 5. Today's Class Schedule */}
      <div 
        onClick={() => onFilterChange('todaySchedule')}
        className={`col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'todaySchedule' 
            ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20' 
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">{t.todaySchedule}</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-amber-700 tracking-tight">{scheduledTodayCount}</span>
          <span className="text-xs text-slate-500 font-normal">{language === 'bn' ? 'জনের ক্লাস' : 'classes'}</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-amber-700 font-medium">
          <span>{language === 'bn' ? 'আজকের শিডিউলে' : 'Scheduled today'}</span>
        </div>
      </div>

    </div>
  );
};
