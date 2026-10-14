import React, { useState } from 'react';
import { X, UserPlus, Calendar, DollarSign, BookOpen, Phone, Clock, FileText } from 'lucide-react';
import { Student, WEEKDAYS_LIST, Weekday } from '../types';
import { Language, translations } from '../translations';
import { TimeSlotPicker } from './TimeSlotPicker';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  teacherId: string;
  language: Language;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  teacherId,
  language,
}) => {
  const t = translations[language];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 9');
  const [customClass, setCustomClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(['Saturday', 'Monday', 'Wednesday']);
  const [monthlyFee, setMonthlyFee] = useState<number>(2500);
  const [currentMonthPaid, setCurrentMonthPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleDay = (day: Weekday) => {
    let updated: Weekday[];
    if (selectedDays.includes(day)) {
      updated = selectedDays.filter(d => d !== day);
    } else {
      updated = [...selectedDays, day];
    }
    setSelectedDays(updated);
    setDaysPerWeek(updated.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে ছাত্রের নাম লিখুন' : 'Please enter student name');
      return;
    }
    if (!phone.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে মোবাইল নম্বর লিখুন' : 'Please enter phone number');
      return;
    }

    const finalClass = classGrade === 'Other' ? (customClass.trim() || 'General') : classGrade;

    onAddStudent({
      teacherId,
      name: name.trim(),
      phone: phone.trim(),
      guardianName: guardianName.trim() || undefined,
      classGrade: finalClass,
      institution: institution.trim() || undefined,
      batchTime: batchTime.trim() || undefined,
      daysPerWeek: selectedDays.length || daysPerWeek,
      weeklySchedule: selectedDays,
      monthlyFee: Number(monthlyFee) || 0,
      currentMonthPaid: currentMonthPaid,
      lastPaymentDate: currentMonthPaid ? new Date().toISOString().split('T')[0] : undefined,
      attendanceToday: 'none',
      lastAttendanceDate: undefined,
      notes: notes.trim() || undefined,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
      status: 'active',
    });

    // Reset fields
    setName('');
    setPhone('');
    setGuardianName('');
    setClassGrade('Class 9');
    setCustomClass('');
    setInstitution('');
    setBatchTime('');
    setMonthlyFee(2500);
    setCurrentMonthPaid(false);
    setNotes('');
    setError('');
    onClose();
  };

  const standardClasses = [
    'Class 6', 
    'Class 7', 
    'Class 8', 
    'Class 9', 
    'Class 10 (SSC)', 
    'HSC 1st Year', 
    'HSC 2nd Year', 
    'Admission/Pre-Med', 
    'Honours',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {t.addNewStudent}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'নতুন ছাত্রের সম্পূর্ণ তথ্য ও পড়ার শিডিউল এন্ট্রি করুন' : 'Enter complete student details and schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* Student Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.name} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g., Tanvir Ahmed'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.phone} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder={language === 'bn' ? '01712xxxxxx' : '01712xxxxxx'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Guardian & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.guardian} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'পিতা/মাতার নাম' : "Parent's Name"}
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.classGrade}
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={classGrade}
                  onChange={e => setClassGrade(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all cursor-pointer"
                >
                  {standardClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              {classGrade === 'Other' && (
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'শ্রেণি / কোর্স লিখুন' : 'Enter Class / Course'}
                  value={customClass}
                  onChange={e => setCustomClass(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Institution & Batch Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.institution} ({language === 'bn' ? 'স্কুল/কলেজ' : 'School/College'})
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: আইডিয়াল স্কুল' : 'e.g., Ideal School'}
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.batchTime} ({language === 'bn' ? 'পড়ার সময় বা ব্যাচ' : 'Class Time / Batch'})
              </label>
              <TimeSlotPicker
                value={batchTime}
                onChange={setBatchTime}
                language={language}
              />
            </div>
          </div>

          {/* Weekly Tuition Days (Crucial requested feature!) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-indigo-950">
                {t.weeklySchedule} ({language === 'bn' ? 'সপ্তাহে কয় দিন পড়বে এবং কোন কোন দিন' : 'Days per week & Schedule'})
              </label>
              <span className="text-xs font-semibold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                {selectedDays.length} {t.daysCount}
              </span>
            </div>
            
            <p className="text-[11px] text-indigo-700/80 mb-3">
              {language === 'bn' 
                ? 'ছাত্র সপ্তাহে যে যে দিন পড়বে সেই দিনগুলো সিলেক্ট করুন:' 
                : 'Select the days the student will attend classes:'}
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {WEEKDAYS_LIST.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span>{language === 'bn' ? day.shortBn : day.shortEn}</span>
                    <span className="text-[9px] opacity-75 font-normal">
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Fee & Current Month Payment status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.monthlyFee} (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-slate-500 font-bold absolute left-3.5 top-2.5">৳</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="2500"
                  value={monthlyFee}
                  onChange={e => setMonthlyFee(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.feeStatus} ({language === 'bn' ? 'চলতি মাস' : 'Current Month'})
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonthPaid(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    !currentMonthPaid
                      ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚠ {t.due}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonthPaid(true)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    currentMonthPaid
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ✓ {t.paid}
                </button>
              </div>
            </div>
          </div>

          {/* Admission Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.joinedDate}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={joinedDate}
                  onChange={e => setJoinedDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.note}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: বিশেষ দুর্বলতা বা লক্ষ্য' : 'Remarks or notes'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 cursor-pointer"
            >
              {t.save}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
