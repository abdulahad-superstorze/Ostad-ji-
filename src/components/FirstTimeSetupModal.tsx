import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  Phone, 
  CheckCircle2, 
  MapPin, 
  Lock, 
  Layers, 
  X
} from 'lucide-react';
import { Language } from '../translations';
import { TeacherProfile } from '../types';

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  userEmail: string;
  defaultName: string;
  initialProfile?: TeacherProfile | null;
  onClose?: () => void;
  onSaveProfile: (profile: TeacherProfile) => void;
  language: Language;
}

export const FirstTimeSetupModal: React.FC<FirstTimeSetupModalProps> = ({
  isOpen,
  userEmail,
  defaultName,
  initialProfile,
  onClose,
  onSaveProfile,
  language,
}) => {
  const [name, setName] = useState('');
  const [tuitionName, setTuitionName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [classesTaught, setClassesTaught] = useState('');
  const [subjects, setSubjects] = useState('');
  const [currency] = useState('৳');
  const [error, setError] = useState('');

  // Synchronize state when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setName(initialProfile?.name || defaultName || '');
      setTuitionName(
        initialProfile?.tuitionName || 
        (language === 'bn' ? 'ওস্তাদ জী প্রাইভেট ব্যাচ' : 'Ostad Ji Private Batch')
      );
      setPhone(initialProfile?.phone || '');
      setAddress(initialProfile?.address || '');
      setSecurityPin(initialProfile?.securityPin || '');
      setClassesTaught(initialProfile?.classesTaught || '');
      setSubjects(initialProfile?.subjects || '');
      setError('');
    }
  }, [isOpen, initialProfile, defaultName, language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন' : 'Please enter your full name');
      return;
    }

    onSaveProfile({
      userId: userEmail,
      name: name.trim(),
      email: userEmail,
      currency,
      tuitionName: tuitionName.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      securityPin: securityPin.trim() || undefined,
      classesTaught: classesTaught.trim() || undefined,
      subjects: subjects.trim() || undefined,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button if editing */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center pb-5 border-b border-slate-100 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-300">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {initialProfile 
              ? (language === 'bn' ? 'ব্যক্তিগত শিক্ষক প্রোফাইল পরিবর্তন' : 'Edit Teacher Profile')
              : (language === 'bn' ? 'স্বাগতম! ব্যক্তিগত প্রোফাইল সেটআপ' : 'Welcome! Profile Setup')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn' 
              ? 'আপনার ব্যক্তিগত নাম ও টিউশন ব্যাচের তথ্য সংরক্ষণ করুন।' 
              : 'Set up your tutor name and private batch details.'}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-100">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'bn' ? 'লগইন ইমেইল: ' : 'Logged in: '}{userEmail}</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Teacher Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'আপনার পুরো নাম (ব্যক্তিগত প্রোফাইল)' : 'Your Full Name (Personal Profile)'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={language === 'bn' ? 'আপনার নাম লিখুন' : 'e.g. Master Instructor'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Tuition / Center Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'প্রাইভেট ব্যাচ বা প্রতিষ্ঠানের নাম' : 'Tuition / Batch Name'}
            </label>
            <input
              type="text"
              value={tuitionName}
              onChange={e => setTuitionName(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: ওস্তাদ জী প্রাইভেট কেয়ার' : 'e.g. Ostad Ji Tuition'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'আপনার মোবাইল নম্বর' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'ঠিকানা / এলাকা' : 'Location / Address'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি, ঢাকা' : 'e.g. Dhaka, Bangladesh'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Security PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'ব্যক্তিগত নিরাপত্তা পিন (ঐচ্ছিক)' : 'Security PIN (Optional)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={6}
                value={securityPin}
                onChange={e => setSecurityPin(e.target.value)}
                placeholder="4-6 digit PIN"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Classes & Subjects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'কোন কোন ক্লাস পড়ান' : 'Classes Taught'}
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={classesTaught}
                  onChange={e => setClassesTaught(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ক্লাস ৬-১০, একাদশ' : 'e.g. Class 6-10, HSC'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'পড়ানোর বিষয়সমূহ' : 'Subjects'}
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={subjects}
                  onChange={e => setSubjects(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: গণিত, বিজ্ঞান, ইংরেজি' : 'e.g. Math, Science'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {initialProfile 
                  ? (language === 'bn' ? 'প্রোফাইল আপডেট করুন' : 'Update Profile')
                  : (language === 'bn' ? 'প্রোফাইল সেভ করে প্রবেশ করুন' : 'Save Profile & Enter')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
