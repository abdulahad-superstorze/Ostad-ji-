import React from 'react';
import { CalendarDays, CheckCircle2, XCircle, Clock, CheckCheck, Users } from 'lucide-react';
import { Student, Weekday, WEEKDAYS_LIST } from '../types';
import { Language, translations } from '../translations';

interface TodayScheduleSectionProps {
  students: Student[];
  currentWeekday: Weekday;
  language: Language;
  onUpdateAttendance: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  onSelectStudent: (student: Student) => void;
  onMarkAllPresent: (studentIds: string[]) => void;
}

export const TodayScheduleSection: React.FC<TodayScheduleSectionProps> = ({
  students,
  currentWeekday,
  language,
  onUpdateAttendance,
  onSelectStudent,
  onMarkAllPresent,
}) => {
  const t = translations[language];

  const weekdayInfo = WEEKDAYS_LIST.find(w => w.id === currentWeekday);
  const weekdayLabel = language === 'bn' ? weekdayInfo?.labelBn : weekdayInfo?.labelEn;

  // Filter students who have this day in their schedule
  const scheduledStudents = students.filter(s => 
    s.weeklySchedule && s.weeklySchedule.includes(currentWeekday)
  );

  if (scheduledStudents.length === 0) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-200/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              {language === 'bn' ? `আজকের পড়ার দিন: ${weekdayLabel}` : `Today's Schedule: ${weekdayLabel}`}
            </h3>
            <p className="text-xs text-amber-800/80">
              {language === 'bn' ? 'আজকের দিনে কোনো ছাত্রের শিডিউল নির্ধারিত নেই।' : 'No students scheduled for tuition today.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const unrecordedCount = scheduledStudents.filter(s => s.attendanceToday === 'none').length;
  const scheduledIds = scheduledStudents.map(s => s.id);

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border border-indigo-100 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'bn' ? `আজকের শিডিউল (${weekdayLabel})` : `Today's Schedule (${weekdayLabel})`}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {scheduledStudents.length} {language === 'bn' ? 'জন ছাত্র' : 'students'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'আজকে যাদের প্রাইভেট ক্লাস আছে, তাদের দ্রুত হাজিরা নিন' 
                : 'Take quick attendance for students scheduled today'}
            </p>
          </div>
        </div>

        {unrecordedCount > 0 && (
          <button
            onClick={() => onMarkAllPresent(scheduledIds)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.batchMarkAllPresent}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scheduledStudents.map(student => {
          return (
            <div
              key={student.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-between gap-2"
            >
              <div 
                className="cursor-pointer flex-1 min-w-0"
                onClick={() => onSelectStudent(student)}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                    {student.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {student.classGrade} {student.batchTime ? `• ${student.batchTime}` : ''}
                </p>
              </div>

              {/* Quick Attendance Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateAttendance(student.id, 'present')}
                  title={t.present}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    student.attendanceToday === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateAttendance(student.id, 'absent')}
                  title={t.absent}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    student.attendanceToday === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateAttendance(student.id, 'late')}
                  title={t.late}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    student.attendanceToday === 'late'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
