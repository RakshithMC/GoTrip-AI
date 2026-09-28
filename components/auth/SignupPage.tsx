import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showLoginFallback, setShowLoginFallback] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const parseAuthError = (error: any): { userMsg: string; isRateLimit: boolean; isUserExists: boolean } => {
    const errCode = String(error?.code || '').toLowerCase();
    const status = error?.status;
    const msg = String(error?.message || error || '').toLowerCase();

    const isRateLimit = status === 429 || 
                        errCode.includes('over_email_send_rate_limit') || 
                        errCode.includes('over_request_rate_limit') ||
                        msg.includes('rate limit') || 
                        msg.includes('email rate limit');

    const isUserExists = errCode.includes('user_already_exists') || 
                         msg.includes('user already registered') || 
                         msg.includes('already registered');

    if (isRateLimit) {
      return {
        userMsg: 'Too many verification emails have been requested. Please wait before trying again.',
        isRateLimit: true,
        isUserExists: false,
      };
    }

    if (isUserExists) {
      return {
        userMsg: 'An account with this email already exists. Please log in.',
        isRateLimit: false,
        isUserExists: true,
      };
    }

    if (msg.includes('password should be at least')) {
      return { userMsg: 'Please choose a stronger password (minimum 6 characters).', isRateLimit: false, isUserExists: false };
    }

    if (msg.includes('invalid email')) {
      return { userMsg: 'Please enter a valid email address.', isRateLimit: false, isUserExists: false };
    }

    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return { userMsg: 'Unable to connect. Please try again.', isRateLimit: false, isUserExists: false };
    }

    return { userMsg: error?.message || 'Failed to create account. Please try again.', isRateLimit: false, isUserExists: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    setErrorMessage(null);
    setInfoMessage(null);
    setShowLoginFallback(false);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/app`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if ((import.meta as any).env?.DEV && error) {
        console.log('[Auth Dev] Operation details:', {
          authOperation: 'signup',
          status: error.status,
          code: error.code,
        });
      }

      if (error) {
        const { userMsg, isRateLimit, isUserExists } = parseAuthError(error);
        setErrorMessage(userMsg);
        if (isRateLimit || isUserExists) {
          setShowLoginFallback(true);
        }
        if (isRateLimit) {
          setCooldownSeconds(60);
        }
      } else if (data.session) {
        onSuccess();
      } else if (data.user) {
        setInfoMessage('Account created successfully. Please check your email to verify your account.');
        setShowResend(true);
        setShowLoginFallback(true);
        setCooldownSeconds(60);
      }
    } catch (err: any) {
      if ((import.meta as any).env?.DEV) {
        console.log('[Auth Dev] Operation details:', {
          authOperation: 'signup',
          status: err?.status,
          code: err?.code,
        });
      }
      const { userMsg, isRateLimit, isUserExists } = parseAuthError(err);
      setErrorMessage(userMsg);
      if (isRateLimit || isUserExists) {
        setShowLoginFallback(true);
      }
      if (isRateLimit) {
        setCooldownSeconds(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendLoading || cooldownSeconds > 0 || !email.trim()) return;

    setResendLoading(true);
    setErrorMessage(null);

    try {
      const redirectUrl = `${window.location.origin}/app`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if ((import.meta as any).env?.DEV && error) {
        console.log('[Auth Dev] Resend operation details:', {
          authOperation: 'resend',
          status: error.status,
          code: error.code,
        });
      }

      if (error) {
        const { userMsg, isRateLimit, isUserExists } = parseAuthError(error);
        setErrorMessage(userMsg);
        if (isRateLimit || isUserExists) {
          setShowLoginFallback(true);
        }
      } else {
        setInfoMessage('Verification email resent! Please check your inbox.');
      }
      setCooldownSeconds(60);
    } catch (err: any) {
      if ((import.meta as any).env?.DEV) {
        console.log('[Auth Dev] Resend operation details:', {
          authOperation: 'resend',
          status: err?.status,
          code: err?.code,
        });
      }
      const { userMsg, isRateLimit, isUserExists } = parseAuthError(err);
      setErrorMessage(userMsg);
      if (isRateLimit || isUserExists) {
        setShowLoginFallback(true);
      }
      setCooldownSeconds(60);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <img
            src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png"
            alt="GoTrip AI Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-2xl font-black text-slate-900 dark:text-white">GoTrip AI</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an Account</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Join GoTrip AI for personalized travel planning
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-2">
          <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>

          {showLoginFallback && (
            <div className="pt-1 text-right">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Already have an account? Try Log In <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-2">
          <div className="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>

          {showResend && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || cooldownSeconds > 0}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1.5"
              >
                {resendLoading ? (
                  <RotateCw size={12} className="animate-spin" />
                ) : (
                  <RotateCw size={12} />
                )}
                {cooldownSeconds > 0 
                  ? `Resend verification email (${cooldownSeconds}s)` 
                  : 'Resend verification email'}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Rakshith M.C"
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              disabled={loading}
              className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || cooldownSeconds > 0}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : cooldownSeconds > 0 ? (
            `Please wait (${cooldownSeconds}s)`
          ) : (
            <>
              Create Account <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Log in
        </button>
      </div>
    </div>
  );
};
