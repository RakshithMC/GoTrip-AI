import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase, checkAccountRegistration } from '../../services/supabaseClient';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToSignup,
  onSwitchToForgot,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapAuthError = (error: any): string => {
    const msg = String(error?.message || error || '').toLowerCase();
    const status = error?.status;

    if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
      return 'Too many login attempts. Please wait a while and try again.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Please verify your email before logging in.';
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'Email or password is incorrect.';
    }
    if (msg.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Unable to connect. Please try again.';
    }
    return error?.message || 'Failed to log in. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Perform server-side account existence check
      const checkResult = await checkAccountRegistration(normalizedEmail);

      if (checkResult.error) {
        setErrorMessage(checkResult.error);
        setLoading(false);
        return;
      }

      if (checkResult.serviceUnavailable) {
        setErrorMessage('Email is not registered. Please create an account.');
        setLoading(false);
        return;
      }

      if (checkResult.registered === false) {
        setErrorMessage('Email is not registered. Please create an account.');
        setLoading(false);
        return;
      }

      // 2. Account exists (registered === true) -> proceed with signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage(mapAuthError(error));
      } else if (data.session) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setLoading(false);
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Continue your journey with GoTrip AI
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            {errorMessage === 'Email is not registered. Please create an account.' ? (
              <span>
                Email is not registered.{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="font-bold underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Please create an account.
                </button>
              </span>
            ) : (
              <span>{errorMessage}</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Log In <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Create account
        </button>
      </div>
    </div>
  );
};
