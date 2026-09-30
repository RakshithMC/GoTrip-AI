import React, { useState, useEffect } from 'react';
import { TopNav, BottomNav } from './components/Navigation';
import { HomeView, SearchView, AttractionDetailView, ProfileView, AccommodationDetailView, RestaurantDetailView, MyPlansView, ImageWithFallback } from './components/TravelViews';
import { AIChat } from './components/AIChat';
import { EmergencyModal, EditModal, ProfileEditModal, AddActionModal, UserContributionModal, PreferenceEditModal } from './components/Modals';
import { SmartPlan } from './components/SmartPlan';
import { CityGuideModal } from './components/CityGuideModal';
import { CountryGuideModal } from './components/CountryGuideModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/LandingPage';
import { Attraction, UserProfile, Notification, DreamTripResult, UserPreferences } from './types';
import { getTranslation } from './services/data';
import { ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { getCurrentProfile, updateCurrentProfile } from './services/profileService';
import { getUserPreferences, updateUserPreferences } from './services/preferenceService';

// Clean initial profile state
const INITIAL_USER_PROFILE: UserProfile = {
  currency: 'INR',
  language: 'English',
  displayName: '',
  email: '',
  phone: '',
  country: '',
  age: '',
  gender: '',
  photoURL: '',
  bio: '',
};

function App() {
  const [viewState, setViewState] = useState<'landing' | 'app'>('landing');
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParams, setRouteParams] = useState<any>({});
  const [navigationHistory, setNavigationHistory] = useState<{route: string, params: any}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itinerary, setItinerary] = useState<Attraction[]>([]);
  
  // Auth state
  const [authUser, setAuthUser] = useState<any>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Saved Plans State
  const [savedPlans, setSavedPlans] = useState<DreamTripResult[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DreamTripResult | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Welcome to Go Pro', message: 'Start your journey by searching for a city!', time: 'Just now', unread: true },
    { id: 2, title: 'Flight Price Drop', message: 'Flights to Paris are down 15% this week.', time: '2h ago', unread: true },
    { id: 3, title: 'New Feature', message: 'Try our AI itinerary planner.', time: '1d ago', unread: false },
  ]);

  // Modals State
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isPreferenceEditOpen, setIsPreferenceEditOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [contributionMode, setContributionMode] = useState<'add_place' | 'review' | 'photo' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSmartPlanOpen, setIsSmartPlanOpen] = useState(false);
  const [isCityGuideOpen, setIsCityGuideOpen] = useState(false);
  const [isCountryGuideOpen, setIsCountryGuideOpen] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [initialPlannerDestination, setInitialPlannerDestination] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Path-based routing state
  const [pathName, setPathName] = useState(() => window.location.pathname || '/');

  // Sync popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setPathName(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigatePath = (newPath: string, replace: boolean = false) => {
    if (window.location.pathname !== newPath) {
      if (replace) {
        window.history.replaceState({}, '', newPath);
      } else {
        window.history.pushState({}, '', newPath);
      }
    }
    setPathName(newPath);
  };

  // Listen to Supabase auth state changes and restore session
  useEffect(() => {
    const loadDbProfile = async (userId: string, defaultName: string, defaultEmail: string) => {
      try {
        const dbProfile = await getCurrentProfile(userId, defaultEmail, defaultName);
        if (dbProfile) {
          setUserProfile(dbProfile);
        }
      } catch (err) {
        console.error('[App] Error loading DB profile:', err);
      }
    };

    const loadDbPreferences = async (userId: string) => {
      try {
        const prefs = await getUserPreferences(userId);
        setUserPreferences(prefs);
      } catch (err) {
        console.error('[App] Error loading user preferences:', err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setUserProfile(prev => ({
          ...prev,
          displayName: fullName || 'Traveler',
          email: session.user.email || prev.email,
        }));
        loadDbProfile(session.user.id, fullName || '', session.user.email || '');
        loadDbPreferences(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[App] Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id ?? null });
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setUserProfile(prev => ({
          ...prev,
          displayName: fullName || 'Traveler',
          email: session.user.email || prev.email,
        }));
        loadDbProfile(session.user.id, fullName || '', session.user.email || '');
        loadDbPreferences(session.user.id);
        if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        setUserProfile(INITIAL_USER_PROFILE);
        setUserPreferences(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Route protection & redirection effect
  useEffect(() => {
    if (authLoading) return;

    if (pathName.startsWith('/app') || pathName === '/account') {
      if (!authUser) {
        navigatePath('/login', true);
      }
    } else if (pathName === '/login') {
      if (authUser) {
        navigatePath('/app', true);
      }
    }
  }, [pathName, authUser, authLoading]);

  // Sync route path with currentRoute state
  useEffect(() => {
    if (pathName === '/account') {
      setCurrentRoute('profile');
    } else if (pathName.startsWith('/app') && currentRoute === 'profile') {
      setCurrentRoute('home');
    }
  }, [pathName]);

  // Effect to toggle dark mode on the html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = (key: string) => getTranslation(userProfile.language, key);

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    if (!authUser) {
      navigatePath('/login');
    }
  };

  const handleStartPlanning = () => {
    if (authUser) {
      navigatePath('/app');
    } else {
      setAuthModalMode('signup');
      navigatePath('/login');
    }
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    navigatePath('/login');
  };

  const handleExploreClick = () => {
    if (authUser) {
      navigatePath('/app');
    } else {
      setAuthModalMode('login');
      navigatePath('/login');
    }
  };

  const handleAuthSuccess = () => {
    navigatePath('/app');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthSession(null);
    setAuthUser(null);
    setUserProfile(INITIAL_USER_PROFILE);
    navigatePath('/');
  };

  // Navigate helper
  const navigate = (route: string, params: any = {}) => {
    window.scrollTo(0, 0);
    setNavigationHistory(prev => [...prev, { route: currentRoute, params: routeParams }]);
    if (route === 'profile') {
      setCurrentRoute('profile');
      navigatePath('/account');
    } else {
      setCurrentRoute(route);
      if (!pathName.startsWith('/app')) {
        navigatePath('/app');
      }
    }
    setRouteParams(params);
  };

  const goBack = () => {
    window.scrollTo(0, 0);
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(history => history.slice(0, -1));
      setCurrentRoute(prev.route);
      setRouteParams(prev.params);
    } else {
      setCurrentRoute('home');
      setRouteParams({});
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    navigate('search');
  };

  const addToItinerary = (items: Attraction | Attraction[]) => {
    setItinerary(prev => {
      const newItems = Array.isArray(items) ? items : [items];
      // Filter out duplicates
      const uniqueNewItems = newItems.filter(newItem => 
        !prev.some(existing => existing.id === newItem.id || existing.name === newItem.name)
      );
      return [...prev, ...uniqueNewItems];
    });
  };

  const removeFromItinerary = (id: string | string[]) => {
    setItinerary(prev => {
      if (Array.isArray(id)) {
        const idsToRemove = new Set(id);
        return prev.filter(i => !idsToRemove.has(i.id));
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const updateProfile = async (newProfile: UserProfile): Promise<{ success: boolean; error?: string }> => {
    if (!authUser) {
      return { success: false, error: 'User is not authenticated' };
    }

    const res = await updateCurrentProfile(authUser.id, newProfile);
    if (res.success && res.data) {
      setUserProfile(res.data);
      return { success: true };
    } else {
      return { success: false, error: res.error || 'Unable to save your profile. Please try again.' };
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleSavePlan = (plan: DreamTripResult) => {
    setSavedPlans(prev => {
        const exists = prev.find(p => p.id === plan.id);
        if (exists) return prev.map(p => p.id === plan.id ? plan : p);
        return [...prev, plan];
    });
    navigate('my-plans');
  };

  const handleViewPlan = (plan: DreamTripResult) => {
      setSelectedPlan(plan);
      setIsSmartPlanOpen(true);
  };

  const handleAddAction = (mode: 'add_place' | 'review' | 'photo' | 'city_guide' | 'country_db') => {
    setIsAddMenuOpen(false);
    if (mode === 'city_guide') {
      setContributionMode(null);
      setIsCountryGuideOpen(false);
      setIsCityGuideOpen(true);
    } else if (mode === 'country_db') {
      setContributionMode(null);
      setIsCityGuideOpen(false);
      setIsCountryGuideOpen(true);
    } else {
      setIsCityGuideOpen(false);
      setIsCountryGuideOpen(false);
      setContributionMode(mode as any);
    }
  };

  const isAppRoute = pathName.startsWith('/app');
  const isAccountRoute = pathName === '/account';
  const isLoginRoute = pathName === '/login';
  const isRootRoute = pathName === '/';
  const isKnownRoute = isRootRoute || isLoginRoute || isAppRoute || isAccountRoute;

  const isAppView = (isAppRoute || isAccountRoute) && !!authUser;
  const showAuthModal = isLoginRoute && !authUser;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-wide">Loading GoTrip AI...</p>
      </div>
    );
  }

  if (!isKnownRoute) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-6xl font-black text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm">The page you are looking for does not exist or has been moved.</p>
        <button onClick={() => navigatePath('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-colors">
          Go to GoTrip AI
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200 overflow-x-hidden">
      {!isAppView ? (
        <LandingPage
          onStartPlanning={handleStartPlanning}
          onLoginClick={handleLoginClick}
          onExploreClick={handleExploreClick}
          openEmergency={() => setIsEmergencyOpen(true)}
          isAuthenticated={!!authUser}
          onGoToApp={() => navigatePath('/app')}
        />
      ) : (
        <>
          <TopNav 
            navigate={navigate} 
            currentRoute={currentRoute} 
            isLoggedIn={!!authUser}
            authUser={authUser}
            openEmergency={() => setIsEmergencyOpen(true)}
            onOpenAuthModal={() => openAuthModal('login')}
            onLogout={handleLogout}
            language={userProfile.language}
          />
          
          <main className="min-h-[calc(100vh-60px)] relative">
            {currentRoute === 'home' && (
              <HomeView 
                navigate={navigate} 
                handleSearch={handleSearch} 
                userProfile={userProfile} 
                notifications={notifications}
                markAllAsRead={markAllAsRead}
              />
            )}
            
            {currentRoute === 'search' && (
              <SearchView 
                navigate={navigate} 
                goBack={goBack}
                query={searchQuery} 
                setQuery={setSearchQuery} 
                userProfile={userProfile} 
                handleSearch={handleSearch}
              />
            )}
            
            {currentRoute === 'attraction' && (
              <AttractionDetailView 
                navigate={navigate} 
                goBack={goBack}
                id={routeParams.id} 
                addToItinerary={addToItinerary} 
                saved={itinerary.some(i => i.id === routeParams.id)}
                openEditModal={() => setIsEditModalOpen(true)}
                userProfile={userProfile}
                removeFromItinerary={removeFromItinerary}
                setIsChatOpen={setIsChatOpen}
                onPlanWithAI={(dest) => {
                  setInitialPlannerDestination(dest);
                  setIsSmartPlanOpen(true);
                }}
              />
            )}

            {currentRoute === 'accommodation' && (
              <AccommodationDetailView 
                navigate={navigate} 
                goBack={goBack}
                id={routeParams.id}
                userProfile={userProfile}
              />
            )}

            {currentRoute === 'restaurant' && (
              <RestaurantDetailView 
                navigate={navigate} 
                goBack={goBack}
                id={routeParams.id}
                userProfile={userProfile}
              />
            )}

            {currentRoute === 'itinerary' && (
              <div className="max-w-4xl mx-auto px-4 py-4 pb-24 min-h-screen">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('wishlist_title')}</h1>
                  {itinerary.length > 0 && (
                    <span className="text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      {itinerary.length} {t('items')}
                    </span>
                  )}
                </div>
                
                {itinerary.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                     <div className="text-gray-400 mb-2">{t('No items saved')}</div>
                     <div className="text-sm text-gray-500">{t('wishlist_empty')}</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itinerary.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.address || ''))}`, '_blank')}
                        className="flex bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 gap-3 transition-all hover:shadow-md cursor-pointer group"
                      >
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                            <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                               <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   removeFromItinerary(item.id);
                                 }} 
                                 className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors z-10 relative"
                                 title={t('remove')}
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{item.category}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.address}</p>
                          </div>
                          <div className="flex justify-end pt-2 items-center gap-4">
                            {item.website && (
                                 <a 
                                   href={item.website} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   onClick={(e) => e.stopPropagation()}
                                   className="text-xs font-bold text-gray-500 hover:text-blue-600 z-10 relative"
                                 >
                                   {t('website')}
                                 </a>
                            )}
                            <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                                {t('view_on_map')} <ExternalLink size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentRoute === 'my-plans' && (
                <MyPlansView 
                    navigate={navigate} 
                    userProfile={userProfile} 
                    plans={savedPlans}
                    onViewPlan={handleViewPlan}
                    onOpenPlanner={() => setIsSmartPlanOpen(true)}
                />
            )}

            {currentRoute === 'profile' && (
                <ProfileView 
                  navigate={navigate} 
                  userProfile={userProfile} 
                  userPreferences={userPreferences}
                  openEditModal={() => setIsProfileEditOpen(true)}
                  openPreferenceModal={() => setIsPreferenceEditOpen(true)}
                  toggleTheme={() => setDarkMode(!darkMode)}
                  darkMode={darkMode}
                  onLogout={handleLogout}
                />
            )}
          </main>

          <BottomNav 
            navigate={navigate} 
            currentRoute={currentRoute} 
            isLoggedIn={!!authUser}
            openEmergency={() => setIsEmergencyOpen(true)} 
            openAddMenu={() => setIsAddMenuOpen(true)}
            onOpenAuthModal={() => openAuthModal('login')}
            language={userProfile.language} 
          />
          
          <AIChat 
            isOpen={isChatOpen} 
            setIsOpen={setIsChatOpen} 
            currentRoute={currentRoute}
            isLoggedIn={!!authUser}
            onOpenAuthModal={() => openAuthModal('login')}
            onOpenSmartPlan={() => {
                setSelectedPlan(null); 
                setIsSmartPlanOpen(true);
            }}
          />
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => navigatePath('/')}
        onSuccess={handleAuthSuccess}
      />
      
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} country={userProfile.country} language={userProfile.language} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSavePlan} language={userProfile.language} />
      <AddActionModal 
        isOpen={isAddMenuOpen} 
        onClose={() => setIsAddMenuOpen(false)} 
        onAction={handleAddAction}
        language={userProfile.language}
      />
      <UserContributionModal 
        isOpen={contributionMode !== null}
        onClose={() => setContributionMode(null)}
        mode={contributionMode}
        language={userProfile.language}
      />
      <ProfileEditModal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
        profile={userProfile} 
        onSave={updateProfile}
        language={userProfile.language}
      />
      <PreferenceEditModal
        isOpen={isPreferenceEditOpen}
        onClose={() => setIsPreferenceEditOpen(false)}
        preferences={userPreferences}
        onSave={async (newPrefs) => {
          if (!authUser) return { success: false, error: 'User is not authenticated' };
          const res = await updateUserPreferences(authUser.id, newPrefs);
          if (res.success && res.data) {
            setUserPreferences(res.data);
            return { success: true };
          }
          return { success: false, error: res.error || 'Unable to save preferences.' };
        }}
        language={userProfile.language}
      />
      <SmartPlan 
        isOpen={isSmartPlanOpen} 
        onClose={() => {
          setIsSmartPlanOpen(false);
          setInitialPlannerDestination(null);
        }} 
        userProfile={userProfile}
        onSave={handleSavePlan}
        initialPlan={selectedPlan}
        onAddToWishlist={addToItinerary}
        onRemoveFromWishlist={removeFromItinerary}
        itinerary={itinerary}
        language={userProfile.language}
        initialDestination={initialPlannerDestination}
        isLoggedIn={!!authUser}
        onOpenAuthModal={() => openAuthModal('login')}
      />
      <CityGuideModal 
        isOpen={isCityGuideOpen}
        onClose={() => setIsCityGuideOpen(false)}
        onAddToWishlist={addToItinerary}
        onRemoveFromWishlist={removeFromItinerary}
        itinerary={itinerary}
        language={userProfile.language}
      />
      <CountryGuideModal 
        isOpen={isCountryGuideOpen}
        onClose={() => setIsCountryGuideOpen(false)}
        onAddToWishlist={addToItinerary}
        onRemoveFromWishlist={removeFromItinerary}
        itinerary={itinerary}
        language={userProfile.language}
      />
    </div>
  );
}

export default App;