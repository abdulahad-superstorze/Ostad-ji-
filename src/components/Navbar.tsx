import React from 'react';
import { 
  GraduationCap, 
  PlusCircle, 
  Globe, 
  Printer,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Language, translations } from '../translations';
import { TeacherProfile, AuthUser } from '../types';

interface NavbarProps {
  user: AuthUser | User | null;
  teacherProfile: TeacherProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenProfileModal?: () => void;
  onSignOut: () => void;
  studentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  teacherProfile,
  language,
  onLanguageChange,
  onOpenAddModal,
  onOpenExportModal,
  onOpenProfileModal,
  onSignOut,
  studentCount,
}) => {
  const t = translations[language];

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', dateOptions);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  {teacherProfile?.tuitionName || t.appTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {(teacherProfile?.name || user?.displayName) ? `${teacherProfile?.name || user?.displayName} • ` : ''}{formattedDate}
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'bn' ? 'en' : 'bn')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Print / Report button */}
            {studentCount > 0 && (
              <button
                onClick={onOpenExportModal}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title={t.printOrExport}
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.printOrExport}</span>
              </button>
            )}

            {/* Add New Student Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-300 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.quickAddStudent}</span>
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  onClick={onOpenProfileModal}
                  className={`flex items-center gap-2 p-1 rounded-xl transition-all ${
                    onOpenProfileModal ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  title={language === 'bn' ? 'ব্যক্তিগত প্রোফাইল ও তথ্য পরিবর্তন করুন' : 'Click to view & edit your profile'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={teacherProfile?.name || user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-indigo-200 ring-2 ring-indigo-50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {teacherProfile?.name 
                        ? teacherProfile.name.charAt(0) 
                        : user.displayName 
                        ? user.displayName.charAt(0) 
                        : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight truncate max-w-[125px]">
                      {teacherProfile?.name || user.displayName || (user.email ? user.email.split('@')[0] : (language === 'bn' ? 'ব্যক্তিগত প্রোফাইল' : 'Individual Profile'))}
                    </p>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[125px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title={t.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
