import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md my-8 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-slate-700 transition-transform active:scale-90"
        >
          <X size={18} />
        </button>

        {mode === 'login' && (
          <LoginPage
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToForgot={() => setMode('forgot')}
            onSuccess={handleSuccess}
          />
        )}

        {mode === 'signup' && (
          <SignupPage
            onSwitchToLogin={() => setMode('login')}
            onSuccess={handleSuccess}
          />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordPage
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
