import React, { useRef, useEffect } from 'react';
import { User, Briefcase, Heart, Bell, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface UserMenuProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isOpen,
  onClose,
  navigate,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  const handleLogoutClick = async () => {
    onClose();
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-scale-up origin-top-right"
    >
      {/* User Header Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {displayName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="py-2 divide-y divide-gray-50 dark:divide-slate-700/50">
        <div className="space-y-0.5 px-1.5">
          <button
            onClick={() => handleItemClick(() => navigate('profile'))}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <User size={16} className="text-blue-500" />
              <span>My Account</span>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500" />
          </button>

          <button
            onClick={() => handleItemClick(() => navigate('my-plans'))}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Briefcase size={16} className="text-indigo-500" />
              <span>My Trips & Plans</span>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-indigo-500" />
          </button>

          <button
            onClick={() => handleItemClick(() => navigate('itinerary'))}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Heart size={16} className="text-rose-500" />
              <span>Wishlist</span>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-rose-500" />
          </button>
        </div>

        <div className="pt-1.5 px-1.5">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold transition-colors"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
