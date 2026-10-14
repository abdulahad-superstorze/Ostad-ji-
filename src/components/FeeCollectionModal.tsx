import React, { useState } from 'react';
import { X, CheckCircle2, Banknote, Calendar, CreditCard } from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import { Language, translations } from '../translations';

interface FeeCollectionModalProps {
  isOpen: boolean;
  student: Student | null;
  initialMonth?: string;
  onClose: () => void;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  teacherId: string;
  language: Language;
}

export const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({
  isOpen,
  student,
  initialMonth,
  onClose,
  onRecordPayment,
  teacherId,
  language,
}) => {
  const t = translations[language];

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = currentDate.toISOString().split('T')[0];

  const [amount, setAmount] = useState<number>(student?.monthlyFee || 2500);
  const [month, setMonth] = useState<string>(initialMonth || currentMonthName);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('Cash');
  const [date, setDate] = useState<string>(todayStr);
  const [note, setNote] = useState<string>('');

  // Update initial amount and month when student changes
  React.useEffect(() => {
    if (student) {
      setAmount(student.monthlyFee || 0);
      if (initialMonth) {
        setMonth(initialMonth);
      } else {
        setMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
      }
    }
  }, [student, initialMonth]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount) || 0;
    onRecordPayment({
      teacherId,
      studentId: student.id,
      studentName: student.name,
      month,
      amount: finalAmount,
      paymentMethod,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const methods: { id: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank'; labelBn: string; labelEn: string; color: string }[] = [
    { id: 'Cash', labelBn: 'ক্যাশ (Cash)', labelEn: 'Cash', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
    { id: 'bKash', labelBn: 'বিকাশ (bKash)', labelEn: 'bKash', color: 'border-pink-500 bg-pink-50 text-pink-800' },
    { id: 'Nagad', labelBn: 'নগদ (Nagad)', labelEn: 'Nagad', color: 'border-orange-500 bg-orange-50 text-orange-800' },
    { id: 'Rocket', labelBn: 'রকেট (Rocket)', labelEn: 'Rocket', color: 'border-purple-500 bg-purple-50 text-purple-800' },
    { id: 'Bank', labelBn: 'ব্যাংক (Bank)', labelEn: 'Bank', color: 'border-blue-500 bg-blue-50 text-blue-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t.markPaid}
              </h3>
              <p className="text-xs text-slate-500">
                {student.name} • {student.classGrade}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'আদায়কৃত টাকার পরিমাণ' : 'Collected Amount'} (৳)
            </label>
            <div className="relative">
              <span className="text-slate-500 font-bold absolute left-3.5 top-2.5">৳</span>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Month & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'কোন মাসের বেতন' : 'Tuition Month'}
              </label>
              <input
                type="text"
                required
                value={month}
                onChange={e => setMonth(e.target.value)}
                placeholder="October 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'পেমেন্টের তারিখ' : 'Payment Date'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(m => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                      isSelected 
                        ? `${m.color} ring-2 ring-emerald-400 font-bold shadow-xs` 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'bn' ? m.labelBn : m.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / TrxID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.note} ({language === 'bn' ? 'যেমন: TrxID বা রশিদ নম্বর' : 'e.g., TrxID or receipt'})
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: নগদ পরিশোধ / বিকাশ নম্বর' : 'Cash / bKash TrxID'}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'বেতন আদায় নিশ্চিত করুন' : 'Confirm Fee Payment'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
