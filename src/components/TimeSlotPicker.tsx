import React from 'react';
import { Clock } from 'lucide-react';
import { Language } from '../translations';

interface TimeSlotPickerProps {
  value: string;
  onChange: (val: string) => void;
  language: Language;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  value,
  onChange,
  language,
}) => {
  const quickPresets = [
    { labelBn: '🌅 সকাল ৭:০০ - ৮:০০', labelEn: '7:00 AM - 8:00 AM', val: 'সকাল ৭:০০ - ৮:০০' },
    { labelBn: '🌅 সকাল ৮:০০ - ৯:০০', labelEn: '8:00 AM - 9:00 AM', val: 'সকাল ৮:০০ - ৯:০০' },
    { labelBn: '☀️ সকাল ৯:০০ - ১০:০০', labelEn: '9:00 AM - 10:00 AM', val: 'সকাল ৯:০০ - ১০:০০' },
    { labelBn: '🌇 বিকাল ৩:৩০ - ৪:৩০', labelEn: '3:30 PM - 4:30 PM', val: 'বিকাল ৩:৩০ - ৪:৩০' },
    { labelBn: '🌇 বিকাল ৪:০০ - ৫:০০', labelEn: '4:00 PM - 5:00 PM', val: 'বিকাল ৪:০০ - ৫:০০' },
    { labelBn: '🌆 বিকাল ৫:০০ - ৬:০০', labelEn: '5:00 PM - 6:00 PM', val: 'বিকাল ৫:০০ - ৬:০০' },
    { labelBn: '🌙 সন্ধ্যা ৬:৩০ - ৭:৩০', labelEn: '6:30 PM - 7:30 PM', val: 'সন্ধ্যা ৬:৩০ - ৭:৩০' },
    { labelBn: '🌙 রাত ৮:০০ - ৯:০০', labelEn: '8:00 PM - 9:00 PM', val: 'রাত ৮:০০ - ৯:০০' },
  ];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'যেমন: সকাল ৮:০০ - ৯:০০ বা কাস্টম সময়' : 'e.g., 8:00 AM - 9:00 AM'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
        />
      </div>

      {/* Quick 1-tap presets */}
      <div>
        <span className="text-[10px] font-semibold text-slate-500 block mb-1">
          {language === 'bn' ? 'দ্রুত সময় নির্বাচন করুন:' : 'Quick time presets:'}
        </span>
        <div className="flex flex-wrap gap-1">
          {quickPresets.map(preset => {
            const isSelected = value === preset.val || value === preset.labelEn;
            return (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(language === 'bn' ? preset.val : preset.labelEn)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {language === 'bn' ? preset.labelBn : preset.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
