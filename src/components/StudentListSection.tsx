import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Banknote,
  Check,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Database
} from 'lucide-react';
import { Student, AttendanceRecord, Weekday, WEEKDAYS_LIST } from '../types';
import { Language, translations } from '../translations';

interface StudentListSectionProps {
  students: Student[];
  currentWeekday: Weekday;
  language: Language;
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateAttendance: (studentId: string, status: 'present' | 'absent' | 'late', date?: string) => void;
  onOpenFeeCollection: (student: Student) => void;
  onToggleFeeStatus: (studentId: string, isPaid: boolean) => void;
  onOpenAddModal: () => void;
  attendanceHistory?: AttendanceRecord[];
}

export const StudentListSection: React.FC<StudentListSectionProps> = ({
  students,
  currentWeekday,
  language,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdateAttendance,
  onOpenFeeCollection,
  onToggleFeeStatus,
  onOpenAddModal,
  attendanceHistory = [],
}) => {
  const t = translations[language];

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'paid' | 'today'>('all');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Helper to get attendance status for a student on the selected date
  const getAttendanceStatusForDate = (student: Student): 'present' | 'absent' | 'late' | 'off' | 'none' => {
    if (selectedDate === todayStr) {
      return student.attendanceToday || 'none';
    }
    const found = attendanceHistory.find(a => a.studentId === student.id && a.date === selectedDate);
    return found ? found.status : 'none';
  };

  // Filter students based on search and selected filter
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      student.name.toLowerCase().includes(query) ||
      student.phone.includes(query) ||
      student.classGrade.toLowerCase().includes(query) ||
      (student.guardianName && student.guardianName.toLowerCase().includes(query)) ||
      (student.institution && student.institution.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterType === 'due') return !student.currentMonthPaid;
    if (filterType === 'paid') return student.currentMonthPaid;
    if (filterType === 'today') {
      return student.weeklySchedule && student.weeklySchedule.includes(currentWeekday);
    }

    return true;
  });

  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs mb-10">
      
      {/* Header of Manage Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">
              {language === 'bn' ? 'ছাত্র প্রোফাইল ও ম্যানেজমেন্ট' : 'Manage Student Profiles'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {students.length} {language === 'bn' ? 'জন ছাত্র' : 'students'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'সকল ছাত্রের পড়ার সময়, হাজিরা, এই মাসের বেতন এবং প্রোফাইল এডিট/ডিলিট'
              : 'Student class times, attendance, monthly fee, and edit/delete controls'}
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Navigator Bar (Allows changing attendance date easily!) */}
      {students.length > 0 && (
        <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/70 border border-indigo-100/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {language === 'bn' ? 'হাজিরার তারিখ পরিবর্তন:' : 'Attendance Date:'}
            </span>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title={language === 'bn' ? 'আগের দিন' : 'Previous Day'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-2 py-1 text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer"
              />

              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title={language === 'bn' ? 'পরের দিন' : 'Next Day'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isToday ? (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আজকের তারিখে ফেরত' : 'Back to Today'}</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'bn' ? 'আজকের দিন' : 'Today'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs if students exist */}
      {students.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-b border-slate-100 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'সকল ছাত্র' : 'All Students'} ({students.length})
          </button>
          <button
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'today'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {language === 'bn' ? 'আজ যাদের ক্লাস আছে' : "Today's Class"} ({students.filter(s => s.weeklySchedule?.includes(currentWeekday)).length})
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'due'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {language === 'bn' ? 'বেতন বকেয়া' : 'Fee Due'} ({students.filter(s => !s.currentMonthPaid).length})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {language === 'bn' ? 'বেতন পরিশোধিত' : 'Fee Paid'} ({students.filter(s => s.currentMonthPaid).length})
          </button>
        </div>
      )}

      {/* Empty State when no students added yet */}
      {students.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {language === 'bn' ? 'এখনো কোনো ছাত্র যোগ করা হয়নি' : 'No Students Added Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {language === 'bn' 
              ? 'আপনার প্রথম ছাত্রের তথ্য এবং সপ্তাহে কয় দিন পড়বে তা যোগ করতে নিচের বোতামে চাপ দিন।' 
              : 'Click the button below to add your first student profile with schedule and tuition fees.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addNewStudent}</span>
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-xs text-slate-500 mb-3">
            {language === 'bn' ? 'অনুসন্ধানের সাথে কোনো ছাত্র পাওয়া যায়নি।' : 'No students found matching your criteria.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            {language === 'bn' ? 'সকল ছাত্র দেখান' : 'Show All'}
          </button>
        </div>
      ) : (
        
        /* Grid of Student Profiles */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredStudents.map(student => {
            const cleanPhone = student.phone.replace(/[^0-9]/g, '');
            const internationalPhone = cleanPhone.startsWith('0') 
              ? '880' + cleanPhone.slice(1) 
              : cleanPhone.startsWith('880') 
                ? cleanPhone 
                : '88' + cleanPhone;

            const isClassToday = student.weeklySchedule?.includes(currentWeekday);
            const statusOnSelectedDate = getAttendanceStatusForDate(student);

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Profile Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-base text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors truncate"
                        >
                          {student.name}
                        </h3>
                        {isClassToday && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                            {language === 'bn' ? 'আজ ক্লাস' : 'Class Today'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {student.classGrade} {student.institution ? `• ${student.institution}` : ''}
                      </p>
                    </div>

                    {/* Quick Call & WhatsApp */}
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${student.phone}`}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title={student.phone}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${internationalPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Phone & Class Time Slot */}
                  <div className="space-y-1 mb-2.5">
                    <div className="text-xs font-mono text-slate-600 flex items-center justify-between">
                      <span className="font-semibold">{student.phone}</span>
                      {student.guardianName && (
                        <span className="text-[11px] font-sans text-slate-400 font-normal">
                          ({student.guardianName})
                        </span>
                      )}
                    </div>

                    {/* Class Time / Batch Slot */}
                    {student.batchTime && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>{student.batchTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Weekly Days Schedule */}
                  <div className="mb-3 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {student.daysPerWeek} {t.daysCount}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700">
                      {student.weeklySchedule && student.weeklySchedule.length > 0
                        ? student.weeklySchedule.map(dayId => {
                            const found = WEEKDAYS_LIST.find(w => w.id === dayId);
                            return language === 'bn' ? found?.shortBn : found?.shortEn;
                          }).join(', ')
                        : 'শিডিউল নেই'}
                    </span>
                  </div>

                  {/* Monthly Fee Control */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.monthlyFee}</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ৳{student.monthlyFee.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      {student.currentMonthPaid ? (
                        <span 
                          onClick={() => onToggleFeeStatus(student.id, false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer transition-colors"
                          title={language === 'bn' ? 'ক্লিক করে বকেয়া করুন' : 'Click to toggle due'}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.paid}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenFeeCollection(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Banknote className="w-3.5 h-3.5 text-rose-600" />
                          <span>{t.due} ৳{student.monthlyFee}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attendance Buttons for the Selected Date */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600">
                        {isToday ? `${t.attendance} (আজ):` : `হাজিরা (${selectedDate}):`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onUpdateAttendance(student.id, 'present', selectedDate)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          statusOnSelectedDate === 'present'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.present}</span>
                      </button>

                      <button
                        onClick={() => onUpdateAttendance(student.id, 'absent', selectedDate)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          statusOnSelectedDate === 'absent'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t.absent}</span>
                      </button>

                      <button
                        onClick={() => onUpdateAttendance(student.id, 'late', selectedDate)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          statusOnSelectedDate === 'late'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t.late}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Profile Manage Actions: Details, Edit & Delete */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.details}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title={t.edit}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* Delete Confirmation Dialog */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {language === 'bn' ? 'ছাত্রের প্রোফাইল মুছে ফেলতে চান?' : 'Delete Student Profile?'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              <strong className="text-slate-800">{studentToDelete.name}</strong>-এর সমস্ত তথ্য, হাজিরা ও বেতন হিস্ট্রি মুছে যাবে।
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
