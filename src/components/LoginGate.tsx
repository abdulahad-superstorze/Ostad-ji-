import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles,
  Loader2,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Language, translations } from '../translations';

interface LoginGateProps {
  onSignInWithEmail: (email: string, password: string, isSignUp: boolean, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  onSendMagicLink?: (email: string) => Promise<{ success: boolean; error?: string }>;
  unauthorizedEmail?: string | null;
  onClearUnauthorized?: () => void;
  language: Language;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  onSignInWithEmail,
  onSendMagicLink,
  unauthorizedEmail,
  onClearUnauthorized,
  language,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।' : 'Please enter your email.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।' : 'Please enter your password.'
      );
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        setErrorMessage(
          language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.'
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(
          language === 'bn' ? 'উভয় পাসওয়ার্ড একই হতে হবে। আবার মিলিয়ে দেখুন।' : 'Passwords do not match.'
        );
        return;
      }
    }

    try {
      setLoading(true);
      const res = await onSignInWithEmail(cleanEmail, password, isSignUp, fullName.trim() || undefined);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      } else if (res.success && res.error) {
        // e.g. Notice to check inbox
        setSuccessNotice(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkClick = async () => {
    if (!onSendMagicLink) return;
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage(
        language === 'bn' ? 'ম্যাজিক লিংক পাঠানোর জন্য প্রথমে আপনার ইমেইল লিখুন।' : 'Please enter your email to receive a login link.'
      );
      return;
    }

    try {
      setMagicLinkLoading(true);
      const res = await onSendMagicLink(cleanEmail);
      if (res.success) {
        setSuccessNotice(
          language === 'bn'
            ? `আপনার ইমেইল (${cleanEmail}) এ তাৎক্ষণিক লগইন লিংক পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`
            : `Instant login link has been sent to ${cleanEmail}! Please check your email inbox/spam folder.`
        );
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send login link');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-center animate-fadeIn">
        
        {/* App Logo */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-3 text-white shadow-xl shadow-indigo-500/30">
          <GraduationCap className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to Ostad Ji
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-base font-extrabold text-indigo-600 tracking-wide">
            ওস্তাদ জী
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'bn' ? 'প্রাইভেট টিউশন ড্যাশবোর্ড' : 'Private Tuition Dashboard'}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
          {language === 'bn' 
            ? 'ছাত্রদের হাজিরা ও বেতন হিসাবের বিশ্বস্ত প্ল্যাটফর্ম' 
            : 'Smart Tuition, Student Attendance & Fee Management'}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-left animate-slideUp">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-black text-rose-900">
                  {language === 'bn' ? 'বিজ্ঞপ্তি / সমস্যা' : 'Notice'}
                </h3>
                <p className="text-rose-700 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Notice if magic link was sent */}
        {successNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left animate-slideUp">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-black text-emerald-900">
                  {language === 'bn' ? 'সফল হয়েছে!' : 'Success!'}
                </h3>
                <p className="text-emerald-700 mt-1 leading-relaxed">
                  {successNotice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mode Switch Tabs: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isSignUp 
                ? 'bg-white text-indigo-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ইমেল দিয়ে লগইন' : 'Email Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isSignUp 
                ? 'bg-white text-indigo-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন একাউন্ট তৈরি' : 'Create Account'}</span>
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          
          {/* Full Name Field (Only on Sign Up) */}
          {isSignUp && (
            <div className="animate-slideDown">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (unauthorizedEmail && onClearUnauthorized) onClearUnauthorized();
                  if (errorMessage) setErrorMessage(null);
                }}
                required
                placeholder={language === 'bn' ? 'আপনার ইমেইল (যেমন: teacher@example.com)' : 'name@example.com'}
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              {isSignUp && (
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'Min 6 characters'}
                </span>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                required
                placeholder={
                  isSignUp
                    ? (language === 'bn' ? 'নতুন পাসওয়ার্ড দিন' : 'Enter new password')
                    : (language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password')
                }
                className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Only for Sign Up) */}
          {isSignUp && (
            <div className="animate-slideDown">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required={isSignUp}
                  placeholder={language === 'bn' ? 'পাসওয়ার্ডটি পুনরায় লিখুন' : 'Confirm your password'}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || magicLinkLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-lg shadow-indigo-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
              </>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন একাউন্ট তৈরি করুন' : 'Create Account'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'ইমেল দিয়ে লগইন করুন' : 'Sign In with Email'}</span>
              </>
            )}
          </button>
        </form>

        {/* Magic Link / Passwordless Option */}
        {onSendMagicLink && !isSignUp && (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleMagicLinkClick}
              disabled={loading || magicLinkLoading}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer disabled:opacity-50"
            >
              {magicLinkLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>
                {language === 'bn'
                  ? 'পাসওয়ার্ড ছাড়া ম্যাজিক লিংক দিয়ে সরাসরি প্রবেশ করুন'
                  : 'Send passwordless magic login link'}
              </span>
            </button>
          </div>
        )}

        <p className="mt-6 text-[11px] text-slate-400">
          ওস্তাদ জী (Ostad Ji) • Supabase Authentication
        </p>

      </div>
    </div>
  );
};
