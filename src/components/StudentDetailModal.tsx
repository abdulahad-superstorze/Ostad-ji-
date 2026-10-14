import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Plus, 
  Check,
  Building,
  History,
  TrendingUp,
  Banknote,
  CalendarCheck2
} from 'lucide-react';
import { Student, AttendanceRecord, PaymentRecord, WEEKDAYS_LIST, Weekday } from '../types';
import { Language, translations } from '../translations';
import { StudentMonthlyCalendar } from './StudentMonthlyCalendar';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onUpdateAttendance: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  onAddPastAttendance?: (studentId: string, date: string, status: 'present' | 'absent' | 'late' | 'off', note?: string) => void;
  onDeleteAttendanceRecord?: (studentId: string, date: string) => void;
  onToggleFeeStatus: (studentId: string, isPaid: boolean, monthStr?: string) => void;
  onOpenFeeCollection: (student: Student, monthStr?: string) => void;
  onOpenEdit: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  attendanceHistory: AttendanceRecord[];
  paymentHistory: PaymentRecord[];
  language: Language;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  onClose,
  onUpdateAttendance,
  onAddPastAttendance,
  onDeleteAttendanceRecord,
  onToggleFeeStatus,
  onOpenFeeCollection,
  onOpenEdit,
  onDeleteStudent,
  attendanceHistory,
  paymentHistory,
  language,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'history' | 'attendance' | 'payments'>('history');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Quick past attendance form state
  const [showAddAttendanceForm, setShowAddAttendanceForm] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStatus, setManualStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [manualNote, setManualNote] = useState('');

  if (!isOpen || !student) return null;

  const studentAttendance = attendanceHistory.filter(a => a.studentId === student.id);
  const studentPayments = paymentHistory.filter(p => p.studentId === student.id);

  // Calculate monthly stats for this student
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g., "2026-10"
  const currentMonthAttendance = studentAttendance.filter(a => a.date.startsWith(currentMonthPrefix));

  const presentDaysCount = currentMonthAttendance.filter(a => a.status === 'present').length;
  const absentDaysCount = currentMonthAttendance.filter(a => a.status === 'absent').length;
  const lateDaysCount = currentMonthAttendance.filter(a => a.status === 'late').length;
  const totalDaysLogged = currentMonthAttendance.length;

  const currentMonthName = new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });

  // WhatsApp helper
  const cleanPhone = student.phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('0') 
    ? '880' + cleanPhone.slice(1) 
    : cleanPhone.startsWith('880') 
      ? cleanPhone 
      : '88' + cleanPhone;

  const absentMessage = language === 'bn'
    ? `আসসালামু আলাইকুম। ${student.guardianName ? student.guardianName + ' মহোদয়, ' : ''}আপনার সন্তান ${student.name} আজকের প্রাইভেট ক্লাসে অনুপস্থিত ছিল।`
    : `Assalamu Alaikum. Your child ${student.name} was absent in today's private tuition class.`;

  const feeMessage = language === 'bn'
    ? `আসসালামু আলাইকুম। ${student.guardianName ? student.guardianName + ' মহোদয়, ' : ''}${student.name}-এর ${currentMonthName} মাসের প্রাইভেট টিউশন ফি ৳${student.monthlyFee} বকেয়া রয়েছে। অনুগ্রহ করে সুবিধাজনক সময়ে পরিশোধ করবেন। ধন্যবাদ।`
    : `Assalamu Alaikum. Tuition fee for ${student.name} for ${currentMonthName} (৳${student.monthlyFee}) is due. Please clear at your convenience.`;

  const handleManualAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddPastAttendance) {
      onAddPastAttendance(student.id, manualDate, manualStatus, manualNote.trim() || undefined);
    } else {
      onUpdateAttendance(student.id, manualStatus);
    }
    setShowAddAttendanceForm(false);
    setManualNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {student.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {student.classGrade}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap font-medium">
              {student.institution && <span><Building className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{student.institution}</span>}
              <span><Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{student.phone}</span>
              {student.guardianName && <span>({t.guardian}: {student.guardianName})</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(student);
              }}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              title={t.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="py-2.5 px-3.5 my-4 bg-slate-50 rounded-2xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <a 
              href={`tel:${student.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.call}</span>
            </a>
            <a 
              href={`https://wa.me/${internationalPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <a 
              href={`https://wa.me/${internationalPhone}?text=${encodeURIComponent(absentMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              {language === 'bn' ? 'অনুপস্থিতির বার্তা' : 'Absence Alert'}
            </a>
            <a 
              href={`https://wa.me/${internationalPhone}?text=${encodeURIComponent(feeMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              {language === 'bn' ? 'বেতন তাগাদা' : 'Fee Reminder'}
            </a>
          </div>
        </div>

        {/* Navigation Tabs for History */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-5">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'চলতি মাসের পূর্ণাঙ্গ হিস্ট্রি' : 'Full Monthly History'}</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'হাজিরা খাতা' : 'Attendance Log'} ({studentAttendance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বেতন হিস্ট্রি' : 'Fee History'} ({studentPayments.length})</span>
          </button>
        </div>

        {/* Tab 1: Comprehensive Monthly Calendar & Fee History (Key requested feature!) */}
        {activeTab === 'history' && (
          <StudentMonthlyCalendar
            student={student}
            attendanceHistory={attendanceHistory}
            paymentHistory={paymentHistory}
            language={language}
            onUpdateAttendanceRecord={(stdId, date, status, note) => {
              if (onAddPastAttendance) {
                onAddPastAttendance(stdId, date, status, note);
              } else {
                onUpdateAttendance(stdId, status === 'off' ? 'late' : status);
              }
            }}
            onDeleteAttendanceRecord={onDeleteAttendanceRecord}
            onToggleMonthlyFee={(stdId, monthStr, isPaid) => {
              onToggleFeeStatus(stdId, isPaid, monthStr);
            }}
            onOpenFeeCollection={(std, monthStr) => {
              onOpenFeeCollection(std, monthStr);
            }}
          />
        )}

        {/* Tab 2: Attendance History & Past Attendance Logger */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {language === 'bn' ? 'হাজিরার বিস্তারিত হিস্ট্রি' : 'Detailed Attendance Sheet'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'bn' ? `মোট রেকর্ড: ${studentAttendance.length} দিন (চলতি মাসে: ${presentDaysCount} দিন উপস্থিত)` : `Total: ${studentAttendance.length} records`}
                </p>
              </div>

              <button
                onClick={() => setShowAddAttendanceForm(!showAddAttendanceForm)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আগের দিনের হাজিরা দিন' : 'Log Past Date'}</span>
              </button>
            </div>

            {/* Add Past Date Attendance Form */}
            {showAddAttendanceForm && (
              <form onSubmit={handleManualAttendanceSubmit} className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 animate-fadeIn">
                <span className="text-xs font-bold text-indigo-950 block">
                  {language === 'bn' ? 'নির্দিষ্ট তারিখের হাজিরা যোগ করুন:' : 'Add Attendance for Specific Date:'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">তারিখ</label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={e => setManualDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">স্ট্যাটাস</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setManualStatus('present')}
                        className={`py-1.5 text-xs font-bold rounded-lg ${manualStatus === 'present' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'}`}
                      >
                        উপস্থিত
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualStatus('absent')}
                        className={`py-1.5 text-xs font-bold rounded-lg ${manualStatus === 'absent' ? 'bg-rose-600 text-white' : 'bg-white border text-slate-700'}`}
                      >
                        অনুপস্থিত
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualStatus('late')}
                        className={`py-1.5 text-xs font-bold rounded-lg ${manualStatus === 'late' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-700'}`}
                      >
                        দেরি
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="নোট (যেমন: পড়া শেষ করেছে / ছুটি ছিল)"
                    value={manualNote}
                    onChange={e => setManualNote(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddAttendanceForm(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            )}

            {studentAttendance.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {language === 'bn' ? 'এখনো কোনো হাজিরার রেকর্ড নেই।' : 'No attendance records logged yet.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {studentAttendance.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">{item.date}</span>
                      {item.note && <span className="text-slate-500">({item.note})</span>}
                    </div>
                    <div>
                      {item.status === 'present' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ {t.present}
                        </span>
                      )}
                      {item.status === 'absent' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          ✕ {t.absent}
                        </span>
                      )}
                      {item.status === 'late' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          ⏱ {t.late}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Monthly Payment History */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t.feeHistory}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'সকল মাসের বেতন আদায়ের রেকর্ড' : 'All monthly fee payment entries'}
                </p>
              </div>

              <button
                onClick={() => onOpenFeeCollection(student)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বেতন গ্রহণ এন্ট্রি' : 'Record Fee'}</span>
              </button>
            </div>

            {studentPayments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {language === 'bn' ? 'এখনো কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি।' : 'No payment records found.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {studentPayments.map(p => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-slate-900">{p.month}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.date} • {p.paymentMethod} {p.note ? `• ${p.note}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700">
                        ৳{p.amount.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-bold">✓ {t.paid}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions (Edit & Delete options) */}
        <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.delete}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(student);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রোফাইল ও বেতন এডিট' : 'Edit Profile & Fee'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 animate-fadeIn">
            <p className="text-xs font-bold mb-2">
              {t.confirmDelete}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDeleteStudent(student.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
