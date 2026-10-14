import React, { useState, useEffect } from 'react';
import { X, Edit3, Phone, BookOpen, Clock, Calendar, Check, Save, DollarSign } from 'lucide-react';
import { Student, WEEKDAYS_LIST, Weekday } from '../types';
import { Language, translations } from '../translations';
import { TimeSlotPicker } from './TimeSlotPicker';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSaveStudent: (student: Student) => void;
  language: Language;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSaveStudent,
  language,
}) => {
  const t = translations[language];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [institution, setInstitution] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [monthlyFee, setMonthlyFee] = useState<number>(2000);
  const [currentMonthPaid, setCurrentMonthPaid] = useState<boolean>(false);
  const [lastPaymentDate, setLastPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setPhone(student.phone);
      setGuardianName(student.guardianName || '');
      setClassGrade(student.classGrade);
      setInstitution(student.institution || '');
      setBatchTime(student.batchTime || '');
      setSelectedDays((student.weeklySchedule as Weekday[]) || []);
      setMonthlyFee(student.monthlyFee || 0);
      setCurrentMonthPaid(student.currentMonthPaid ?? false);
      setLastPaymentDate(student.lastPaymentDate || '');
      setNotes(student.notes || '');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const toggleDay = (day: Weekday) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    onSaveStudent({
      ...student,
      name: name.trim(),
      phone: phone.trim(),
      guardianName: guardianName.trim() || undefined,
      classGrade: classGrade.trim(),
      institution: institution.trim() || undefined,
      batchTime: batchTime.trim() || undefined,
      daysPerWeek: selectedDays.length,
      weeklySchedule: selectedDays,
      monthlyFee: Number(monthlyFee) || 0,
      currentMonthPaid: currentMonthPaid,
      lastPaymentDate: currentMonthPaid ? (lastPaymentDate || todayStr) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'bn' ? 'ছাত্রের প্রোফাইল ও বেতন এডিট' : 'Edit Student Profile & Fee'}
              </h3>
              <p className="text-xs text-slate-500">
                {student.name} • {student.classGrade}
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

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.name}</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.phone}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Guardian & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.guardian}</label>
              <input
                type="text"
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.classGrade}</label>
              <input
                type="text"
                value={classGrade}
                onChange={e => setClassGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Institution & Batch Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.institution}</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.batchTime} ({language === 'bn' ? 'পড়ার সময় বা ব্যাচ' : 'Class Time / Batch'})</label>
              <TimeSlotPicker
                value={batchTime}
                onChange={setBatchTime}
                language={language}
              />
            </div>
          </div>

          {/* Weekly Days Schedule */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-indigo-950">
                {t.weeklySchedule} ({selectedDays.length} {t.daysCount})
              </label>
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

          {/* Monthly Fee Amount & Editable Payment Status (The key requested feature!) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-950">
                {language === 'bn' ? 'মাসিক বেতন ও চলতি মাসের পেমেন্ট স্ট্যাটাস' : 'Monthly Fee & Payment Status'}
              </label>
              <span className="text-xs font-bold text-amber-800">
                {currentMonthPaid 
                  ? (language === 'bn' ? '✓ বেতন পরিশোধিত' : '✓ Paid') 
                  : (language === 'bn' ? '⚠ বেতন বকেয়া' : '⚠ Due')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t.monthlyFee} (৳)
                </label>
                <div className="relative">
                  <span className="text-slate-500 font-bold absolute left-3 top-2.5">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'bn' ? 'এই মাসের বেতন কি দিয়েছে?' : 'This Month Paid?'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentMonthPaid(false)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !currentMonthPaid
                        ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⚠ {t.due}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMonthPaid(true);
                      if (!lastPaymentDate) {
                        setLastPaymentDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentMonthPaid
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✓ {t.paid}
                  </button>
                </div>
              </div>
            </div>

            {currentMonthPaid && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'bn' ? 'বেতন প্রদানের তারিখ' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={lastPaymentDate}
                  onChange={e => setLastPaymentDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.note}</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
