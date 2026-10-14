import React, { useState } from 'react';
import { 
  UserPlus, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  BookOpen, 
  Clock, 
  Calendar, 
  Check, 
  Save 
} from 'lucide-react';
import { Student, WEEKDAYS_LIST, Weekday } from '../types';
import { Language, translations } from '../translations';
import { TimeSlotPicker } from './TimeSlotPicker';

interface AddStudentSectionProps {
  onAddStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  language: Language;
}

export const AddStudentSection: React.FC<AddStudentSectionProps> = ({
  onAddStudent,
  language,
}) => {
  const t = translations[language];

  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 9');
  const [customClass, setCustomClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(['Saturday', 'Monday', 'Wednesday']);
  const [monthlyFee, setMonthlyFee] = useState<number>(2000);
  const [currentMonthPaid, setCurrentMonthPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const toggleDay = (day: Weekday) => {
    let updated: Weekday[];
    if (selectedDays.includes(day)) {
      updated = selectedDays.filter(d => d !== day);
    } else {
      updated = [...selectedDays, day];
    }
    setSelectedDays(updated);
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
      teacherId: 'local-teacher',
      name: name.trim(),
      phone: phone.trim(),
      guardianName: guardianName.trim() || undefined,
      classGrade: finalClass,
      institution: institution.trim() || undefined,
      batchTime: batchTime.trim() || undefined,
      daysPerWeek: selectedDays.length,
      weeklySchedule: selectedDays,
      monthlyFee: Number(monthlyFee) || 0,
      currentMonthPaid: currentMonthPaid,
      lastPaymentDate: currentMonthPaid ? new Date().toISOString().split('T')[0] : undefined,
      attendanceToday: 'none',
      lastAttendanceDate: undefined,
      notes: notes.trim() || undefined,
      joinedDate: new Date().toISOString().split('T')[0],
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
    setMonthlyFee(2000);
    setCurrentMonthPaid(false);
    setNotes('');
    setError('');
    setIsExpanded(false);
  };

  const standardClasses = [
    'Class 6', 
    'Class 7', 
    'Class 8', 
    'Class 9', 
    'Class 10 (SSC)', 
    'HSC 1st Year', 
    'HSC 2nd Year', 
    'Honours',
    'Other'
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs mb-6 overflow-hidden">
      
      {/* Section Header with Click to Expand */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {language === 'bn' ? 'নতুন ছাত্র যোগ করার অপশন' : 'Add New Student'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'ছাত্রের নাম, ফোন, সপ্তাহে কয় দিন পড়বে ও মাসিক বেতন নির্ধারণ করুন' 
                : 'Enter student details, weekly schedule days and monthly fee'}
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-fadeIn">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.name} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g., Tanvir Ahmed'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.phone} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="01712xxxxxx"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Guardian & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.guardian} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'পিতা/মাতার নাম' : "Parent's Name"}
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.classGrade}
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={classGrade}
                  onChange={e => setClassGrade(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {standardClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              {classGrade === 'Other' && (
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'শ্রেণি লিখুন' : 'Enter Class'}
                  value={customClass}
                  onChange={e => setCustomClass(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              )}
            </div>
          </div>

          {/* Institution & Batch Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.institution} ({language === 'bn' ? 'স্কুল/কলেজ' : 'School/College'})
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: আইডিয়াল স্কুল' : 'e.g., Ideal School'}
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.batchTime} ({language === 'bn' ? 'পড়ার সময় বা ব্যাচ' : 'Class Time / Batch'})
              </label>
              <TimeSlotPicker
                value={batchTime}
                onChange={setBatchTime}
                language={language}
              />
            </div>
          </div>

          {/* Weekly Days: "soptae koe din pora setao ad korar option thabe" */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-indigo-950">
                {t.weeklySchedule} ({language === 'bn' ? 'সপ্তাহে কয় দিন পড়বে এবং কোন কোন দিন' : 'Weekly days & schedule'})
              </label>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                {selectedDays.length} {t.daysCount}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
              {WEEKDAYS_LIST.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{language === 'bn' ? day.shortBn : day.shortEn}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Fee & Current Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.monthlyFee} (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-slate-500 font-bold absolute left-3.5 top-2.5">৳</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={monthlyFee}
                  onChange={e => setMonthlyFee(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.feeStatus} ({language === 'bn' ? 'চলতি মাস' : 'Current Month'})
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonthPaid(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.note}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'বিশেষ কোনো নোট থাকলে লিখুন' : 'Any special notes'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'ছাত্র সেভ করুন' : 'Save Student'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
