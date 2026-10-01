import React, { useState } from 'react';
import { Globe, Phone, Home, Search, Heart, User, Plane, Plus, Briefcase, UserCheck } from 'lucide-react';
import { getTranslation } from '../services/data';
import { UserMenu } from './auth/UserMenu';

interface TopNavProps {
  navigate: (route: string) => void;
  currentRoute: string;
  isLoggedIn: boolean;
  authUser?: any;
  openEmergency: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  language: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  navigate,
  currentRoute,
  isLoggedIn,
  authUser,
  openEmergency,
  onOpenAuthModal,
  onLogout,
  language,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = (key: string) => getTranslation(language, key);

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'My Account';

  return (
    <nav className="hidden md:flex items-center justify-between px-8 py-3 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 transition-colors h-[80px]">
      <div
        className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity"
        onClick={() => navigate('home')}
      >
        <img
          src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png"
          alt="GoTrip AI Logo"
          className="h-[50px] w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          GoTrip AI
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('home')}
          className={`font-medium hover:text-blue-600 capitalize transition-colors ${
            currentRoute === 'home' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {t('nav_home')}
        </button>

        <button
          onClick={() => navigate('my-plans')}
          className={`font-medium hover:text-blue-600 capitalize transition-colors ${
            currentRoute === 'my-plans' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {t('nav_my_plans')}
        </button>

        <button
          onClick={() => navigate('itinerary')}
          className={`font-medium hover:text-blue-600 capitalize transition-colors ${
            currentRoute === 'itinerary' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {t('nav_wishlist')}
        </button>

        <button
          onClick={openEmergency}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-md transition-colors text-sm"
        >
          <Phone size={16} /> {t('nav_emergency')}
        </button>

        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => navigate('profile')}
              className={`px-4 py-2 rounded-full font-bold transition-colors text-sm flex items-center gap-2 shadow-sm border ${
                currentRoute === 'profile'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-slate-700 dark:text-blue-300'
                  : 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600 border-blue-100 dark:border-slate-600'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[120px] truncate">{displayName}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all text-sm shadow-md shadow-blue-500/20 active:scale-95"
          >
            Log In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
};

interface BottomNavProps {
  navigate: (route: string) => void;
  currentRoute: string;
  isLoggedIn: boolean;
  openEmergency: () => void;
  openAddMenu: () => void;
  onOpenAuthModal: () => void;
  language: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  navigate,
  currentRoute,
  isLoggedIn,
  openEmergency,
  openAddMenu,
  onOpenAuthModal,
  language,
}) => {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-around py-3 pb-safe z-40 md:hidden shadow-lg transition-colors px-2">
      <button
        onClick={() => navigate('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentRoute === 'home' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <Home size={24} />
        <span className="text-[10px] font-medium capitalize">{t('nav_home')}</span>
      </button>

      <button
        onClick={() => navigate('my-plans')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentRoute === 'my-plans' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <Briefcase size={24} />
        <span className="text-[10px] font-medium capitalize">{t('nav_my_plans')}</span>
      </button>

      <button
        onClick={() => navigate('itinerary')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentRoute === 'itinerary' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <Heart size={24} />
        <span className="text-[10px] font-medium capitalize">{t('nav_wishlist')}</span>
      </button>

      {/* Add Button */}
      <button
        onClick={openAddMenu}
        className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
      >
        <div className="bg-blue-600 text-white rounded-full p-1 shadow-md">
          <Plus size={20} />
        </div>
        <span className="text-[10px] font-medium capitalize">{t('nav_add')}</span>
      </button>

      <button onClick={openEmergency} className="flex flex-col items-center gap-1 text-red-500">
        <Phone size={24} />
        <span className="text-[10px] font-medium capitalize">{t('nav_emergency')}</span>
      </button>

      <button
        onClick={() => {
          if (isLoggedIn) {
            navigate('profile');
          } else {
            onOpenAuthModal();
          }
        }}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentRoute === 'profile' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <User size={24} />
        <span className="text-[10px] font-medium capitalize">
          {isLoggedIn ? t('nav_profile') : 'Log In'}
        </span>
      </button>
    </div>
  );
};
