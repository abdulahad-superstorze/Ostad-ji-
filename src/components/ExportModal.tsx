import React from 'react';
import { X, Printer, Download, Copy, Check, FileSpreadsheet } from 'lucide-react';
import { Student } from '../types';
import { Language, translations } from '../translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  language: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  students,
  language,
}) => {
  const t = translations[language];
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Class', 'Weekly Days', 'Monthly Fee', 'Current Month Paid', 'Today Attendance'];
    const rows = students.map(s => [
      `"${s.name}"`,
      `"${s.phone}"`,
      `"${s.classGrade}"`,
      s.daysPerWeek,
      s.monthlyFee,
      s.currentMonthPaid ? 'Paid' : 'Due',
      s.attendanceToday
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tutor_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySummaryText = () => {
    const text = students.map((s, idx) => 
      `${idx + 1}. ${s.name} (${s.classGrade}) - ফোন: ${s.phone} - ফি: ৳${s.monthlyFee} (${s.currentMonthPaid ? 'পরিশোধিত' : 'বকেয়া'}) - হাজিরা: ${s.attendanceToday}`
    ).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCollected = students.filter(s => s.currentMonthPaid).reduce((sum, s) => sum + s.monthlyFee, 0);
  const totalDue = students.filter(s => !s.currentMonthPaid).reduce((sum, s) => sum + s.monthlyFee, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:shadow-none print:border-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'bn' ? 'ছাত্র ও বেতন রিপোর্ট' : 'Student & Fee Report'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'প্রিন্ট অথবা এক্সপোর্ট করুন' : 'Print or Export Report Sheet'}
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

        {/* Action Buttons (hidden on print) */}
        <div className="flex items-center gap-2 mb-6 flex-wrap print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'প্রিন্ট করুন (Print)' : 'Print Report'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'CSV ডাউনলোড' : 'Download CSV'}</span>
          </button>
          <button
            onClick={copySummaryText}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'টেক্সট কপি করুন' : 'Copy Text')}</span>
          </button>
        </div>

        {/* Printable Sheet View */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 print:border-none print:p-0">
          <div className="text-center mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'bn' ? 'প্রাইভেট টিউশন ছাত্র ও বেতন রেজিস্টার' : 'Private Tuition Student & Fee Register'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn' ? 'তারিখ:' : 'Date:'} {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
            </p>
            <div className="flex justify-center gap-6 mt-3 text-xs">
              <span className="font-semibold text-slate-700">মোট ছাত্র: {students.length} জন</span>
              <span className="font-semibold text-emerald-700">আদায়: ৳{totalCollected.toLocaleString()}</span>
              <span className="font-semibold text-rose-700">বকেয়া: ৳{totalDue.toLocaleString()}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 font-bold">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">{t.name}</th>
                <th className="py-2 px-2">{t.phone}</th>
                <th className="py-2 px-2">{t.classGrade}</th>
                <th className="py-2 px-2">{t.weeklySchedule}</th>
                <th className="py-2 px-2">{t.monthlyFee}</th>
                <th className="py-2 px-2">{t.feeStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student, i) => (
                <tr key={student.id}>
                  <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 px-2 font-bold text-slate-900">{student.name}</td>
                  <td className="py-2 px-2 text-slate-600 font-mono">{student.phone}</td>
                  <td className="py-2 px-2 text-slate-700">{student.classGrade}</td>
                  <td className="py-2 px-2 text-slate-600">{student.daysPerWeek} দিন/সপ্তাহ</td>
                  <td className="py-2 px-2 font-bold">৳{student.monthlyFee.toLocaleString()}</td>
                  <td className="py-2 px-2">
                    <span className={student.currentMonthPaid ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {student.currentMonthPaid ? 'পরিশোধিত' : 'বকেয়া'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
