import React, { useState, useEffect, useRef } from 'react';
/* Added missing icon imports Waves and Activity */
import { MapPin, Search, Star, Sparkles, Wand2, Compass, Calendar, Utensils, ChevronLeft, Mic, ExternalLink, Map as MapIcon, Plane, Edit3, Globe, Mail, Phone, User, Ticket, Coffee, Info, Wifi, Bed, CheckCircle, Check, Share2, Bell, Shield, HelpCircle, LogOut, ChevronRight, X, Sun, Moon, Users, Briefcase, ArrowRight, Trash2, Settings, Hotel, Share, Clock, Image as ImageIcon, MessageCircle, DollarSign, Waves, Activity, CheckCheck, Heart } from 'lucide-react';
import { MOCK_DB, formatCurrency, getTranslation, CURRENCIES, getCountryCurrency } from '../services/data';
import { generateAttractionSummary } from '../services/geminiService';
import { Attraction, UserProfile, Notification, DreamTripResult } from '../types';
import { SettingsModal } from './Modals';
import { supabase } from '../services/supabaseClient';

interface ViewProps {
  navigate: (route: string, params?: any) => void;
  goBack?: () => void;
  userProfile: UserProfile;
}

interface HomeViewProps extends ViewProps {
  handleSearch: (q: string) => void;
  notifications: Notification[];
  markAllAsRead: () => void;
}

export const ImageWithFallback: React.FC<{ src: string, alt: string, className?: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setError(false);
  }, [src]);
  
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 ${className}`}>
        <div className="text-center p-2 overflow-hidden">
           <MapPin size={24} className="mx-auto mb-1 opacity-50" />
           <span className="text-[10px] font-medium leading-tight block truncate w-full">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ navigate, handleSearch, userProfile, notifications, markAllAsRead }) => {
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => getTranslation(userProfile.language, key);
  const unreadCount = notifications.filter(n => n.unread).length;

  const featuredItems = MOCK_DB.cities.slice(0, 4).map(city => {
      const mainAttr = MOCK_DB.attractions.find(a => a.cityId === city.id);
      return { city, mainAttr };
  });

  // Handle outside clicks for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchVal(transcript);
            handleSearch(transcript);
        };
        recognition.start();
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-white dark:bg-slate-900 font-sans overflow-x-hidden">
       {/* Adjusted Hero Height to fit larger text comfortably */}
       <div className="relative w-full h-[220px] md:h-[320px] z-40">
         <div className="absolute inset-0 overflow-hidden">
            <ImageWithFallback src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover object-center" alt="Hero Background" />
            <div className="absolute inset-0 bg-black/45" />
         </div>
         
         <div className="relative z-50 flex flex-col items-center px-4 pt-3 h-full">
           {/* Search Bar Row */}
           <div className="flex items-center gap-2 w-full max-w-lg mb-4">
             <div className="flex-1 bg-white p-1 rounded-full shadow-2xl flex items-center h-[46px] min-w-0">
               <MapPin className="ml-3 text-gray-400 shrink-0" size={16} />
               <input 
                 type="text" 
                 value={searchVal}
                 onChange={(e) => setSearchVal(e.target.value)}
                 placeholder="Where do you want to go?" 
                 className="flex-1 px-2 py-1 outline-none text-slate-700 bg-transparent min-w-0 text-sm font-bold placeholder-gray-400" 
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchVal)} 
               />
               <button onClick={handleVoiceSearch} className={`p-1.5 shrink-0 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}>
                   <Mic size={16} />
               </button>
               <button 
                onClick={() => handleSearch(searchVal)} 
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-3 md:px-4 rounded-full font-black transition-all shrink-0 whitespace-nowrap text-[10px] md:text-xs h-8 mr-0.5"
               >
                Search
               </button>
             </div>
             
             <div className="relative shrink-0" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center h-[46px] w-[46px]"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[100] overflow-hidden animate-scale-up origin-top-right">
                    <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs">{t('notifications')}</h3>
                        <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="mx-auto text-gray-300 mb-2" size={24} />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('no_notifications')}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50 dark:divide-slate-700">
                          {notifications.map((n) => (
                            <div key={n.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex gap-2.5 ${n.unread ? 'bg-blue-50/10 dark:bg-blue-900/10' : ''}`}>
                               <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-blue-500' : 'bg-transparent'}`} />
                               <div className="flex-1">
                                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5">{n.title}</h4>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{n.message}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                      className="w-full p-2.5 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-2 uppercase tracking-tighter"
                    >
                      {t('mark_read')}
                    </button>
                  </div>
                )}
             </div>
           </div>
           
           <div className="text-center max-w-2xl px-4 mt-2">
             {/* Significantly increased title font size */}
             <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-lg tracking-tighter leading-[1.1]">
               {t('hero_title')}
             </h1>
             {/* Significantly increased subtitle font size and container width */}
             <p className="text-white text-sm md:text-lg max-w-[320px] md:max-w-xl mx-auto drop-shadow-md font-bold leading-tight opacity-95">
               {t('hero_subtitle')}
             </p>
           </div>
         </div>
       </div>

       {/* Featured Destinations Section */}
       <div className="px-5 md:px-12 pt-0 pb-10 max-w-7xl mx-auto -mt-6 relative z-20 bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.15)]">
         <div className="pt-6">
            <h2 className="text-xl md:text-2xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tighter">Featured Destinations</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
              {featuredItems.map(({ city, mainAttr }) => (
                <div key={city.id} onClick={() => { if (mainAttr) navigate('attraction', { id: mainAttr.id }); else handleSearch(city.name); }} className="group cursor-pointer flex flex-col gap-1">
                  <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-gray-100 dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-800">
                    <ImageWithFallback src={city.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={city.name} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#0F172A] dark:text-white leading-tight truncate tracking-tight">{city.name}</h3>
                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 truncate uppercase tracking-widest">{city.country}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>
       </div>
    </div>
  );
};

export const SearchView: React.FC<ViewProps & { query: string; setQuery: (q: string) => void; handleSearch: (q: string) => void }> = ({ navigate, goBack, query, setQuery, userProfile, handleSearch }) => {
  const t = (key: string) => getTranslation(userProfile.language, key);
  const matchingCities = MOCK_DB.cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase()));
  const matchingAttractions = MOCK_DB.attractions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => goBack ? goBack() : navigate('home')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors"><ChevronLeft size={24} /></button>
          <div className="flex-1 relative"><Search className="absolute left-4 top-3.5 text-gray-400" size={20} /><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium shadow-sm" placeholder={t('search_placeholder')} /></div>
        </div>
        {matchingAttractions.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{t('Places to visit')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{matchingAttractions.map(attr => (<div key={attr.id} onClick={() => navigate('attraction', { id: attr.id })} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-gray-100 dark:border-slate-700"><div className="aspect-video overflow-hidden"><ImageWithFallback src={attr.image} alt={attr.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div><div className="p-5"><div className="flex justify-between items-start mb-1"><h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{attr.name}</h3><span className="flex items-center gap-1 text-xs font-bold text-yellow-500"><Star size={12} className="fill-current" /> {attr.rating}</span></div><p className="text-xs text-gray-500 font-bold opacity-70 uppercase tracking-wider">{attr.category} • {MOCK_DB.cities.find(c => c.id === attr.cityId)?.name}</p></div></div>))}</div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{query ? `${t('cities_matching')} "${query}"` : t('all_destinations')}</h2>
          <span className="text-sm font-bold text-gray-500 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-gray-100 dark:border-slate-800">{matchingCities.length} {t('results')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{matchingCities.map(city => (<div key={city.id} onClick={() => handleSearch(city.name)} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-gray-100 dark:border-slate-700"><div className="aspect-[4/3] overflow-hidden"><ImageWithFallback src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div><div className="p-5"><div className="flex justify-between items-start mb-2"><h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{city.name}</h3><span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded uppercase tracking-widest">{city.country}</span></div><div className="flex items-center gap-4 text-xs font-bold text-gray-400"><span className="flex items-center gap-1"><Plane size={14} /> From {formatCurrency(city.baseFlight, userProfile.currency)}</span><span className="flex items-center gap-1"><Hotel size={14} /> {formatCurrency(city.avgHotel, userProfile.currency)}/nt</span></div></div></div>))}</div>
      </div>
    </div>
  );
};

export const AttractionDetailView: React.FC<ViewProps & { id: string; addToItinerary: (a: Attraction | Attraction[]) => void; saved: boolean, openEditModal: () => void; removeFromItinerary: (id: string | string[]) => void; setIsChatOpen?: (open: boolean) => void; onPlanWithAI?: (dest: { name: string; lat: number; lng: number }) => void }> = ({ navigate, goBack, id, addToItinerary, saved, openEditModal, userProfile, removeFromItinerary, setIsChatOpen, onPlanWithAI }) => {
    const attr = MOCK_DB.attractions.find(a => a.id === id);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAllRestaurants, setShowAllRestaurants] = useState(false);
    const [showAllAccommodations, setShowAllAccommodations] = useState(false);
    
    const t = (key: string) => getTranslation(userProfile.language, key);

    if (!attr) return <div className="p-8 text-center text-gray-500 font-bold">{t('attraction_not_found')}</div>;
    const city = MOCK_DB.cities.find(c => c.id === attr.cityId);
    
    const nearbyRestaurants = MOCK_DB.restaurants.filter(r => r.cityId === attr.cityId);
    const nearbyAccommodations = MOCK_DB.accommodations.filter(a => a.cityId === attr.cityId);
    const cityAttractions = MOCK_DB.attractions.filter(a => a.cityId === attr.cityId && a.id !== attr.id);
    const localCurrency = city ? getCountryCurrency(city.country, userProfile.currency) : userProfile.currency;

    const handleGenerate = async () => {
        if (loading) return;
        setLoading(true);
        const text = await generateAttractionSummary(attr.name, city?.name || '', userProfile.language);
        setSummary(text);
        setLoading(false);
    };

    const handleShare = () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attr.name + ' ' + attr.address)}`;
        if (navigator.share) navigator.share({ title: attr.name, text: `Check out ${attr.name} in ${city?.name}!`, url: mapsUrl }).catch(err => console.error(err));
        else { navigator.clipboard.writeText(mapsUrl); alert(t('copied')); }
    };

    const toggleSave = () => {
      if (saved) removeFromItinerary(attr.id);
      else addToItinerary(attr);
    };

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-32 font-sans relative">
        <div className="relative h-[32vh] md:h-[40vh] w-full">
          <ImageWithFallback src={attr.image} className="w-full h-full object-cover" alt={attr.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <button onClick={() => goBack ? goBack() : navigate('home')} className="absolute top-5 left-5 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all z-20"><ChevronLeft size={22} strokeWidth={3} /></button>
          <div className="absolute bottom-6 left-0 right-0 px-6 md:px-12 max-w-6xl mx-auto text-white">
            <h1 className="text-[25px] font-black mb-1.5 tracking-tight drop-shadow-lg">{attr.name}</h1>
            <div className="flex items-center gap-4 text-xs font-bold tracking-tight"><span className="flex items-center gap-1.5 drop-shadow-md text-yellow-400"><Star className="fill-current" size={14} /> {attr.rating}</span><span className="flex items-center gap-1.5 drop-shadow-md"><MapPin size={16} className="text-white" /> {city?.name}</span></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 relative">
          <div className="flex flex-col gap-7">
            <section className="min-h-[99px] bg-indigo-50/60 dark:bg-indigo-900/10 p-6 rounded-[1.5rem] border border-indigo-100/50 dark:border-indigo-800 shadow-sm transition-all duration-300">
              <div className="flex justify-between items-center mb-0"><div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300"><Sparkles size={20} className="fill-indigo-600 dark:fill-indigo-400 text-indigo-600" /><h3 className="font-extrabold text-[19px] tracking-tight">{t('ai_insight_title')}</h3></div><button onClick={handleGenerate} disabled={loading} className="text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full font-black shadow-sm hover:shadow-md transition-all border border-indigo-100 dark:border-indigo-900 active:scale-95 whitespace-nowrap uppercase tracking-wider">{loading ? t('thinking') : t('ai_summary')}</button></div>
              {summary && <div className="mt-4 prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base font-bold leading-relaxed italic border-l-4 border-indigo-500/50 pl-4 py-0.5 animate-fade-in">"{summary}"</div>}
            </section>

            <div><p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium opacity-90">{attr.description}</p></div>

            {/* Visitor Info Card */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="space-y-8">
                    <div className="space-y-4 pt-2">
                        <h2 className="text-[19px] font-black text-[#0F172A] dark:text-white tracking-tight mb-2">{t('visitor_info')}</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 text-[#1E293B] dark:text-slate-200">
                                <div className="text-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-800/50">
                                  <Compass size={22} />
                                </div>
                                <span className="font-bold text-base leading-tight flex-1">{attr.address}</span>
                            </div>
                            <div className="flex items-center gap-5 text-[#1E293B] dark:text-slate-200">
                                <div className="text-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-800/50">
                                  <Calendar size={22} />
                                </div>
                                <span className="font-bold text-base leading-tight">{attr.hours || '24 Hours'}</span>
                            </div>
                            <div className="flex items-center gap-5 text-[#1E293B] dark:text-slate-200">
                                <div className="text-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-800/50">
                                  <Ticket size={22} />
                                </div>
                                <span className="font-bold text-base leading-tight">Entry: {attr.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Coffee className="text-[#F97316]" size={22} />
                            <h3 className="text-[19px] font-black text-[#0F172A] dark:text-white tracking-tight">{t('local_exp')}</h3>
                        </div>
                        <ul className="space-y-3 pl-2">
                            {city?.experiences?.map((exp, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] shrink-0" />
                                    <span className="font-bold text-base text-[#475569] dark:text-slate-300">{exp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="text-[#2563EB]" size={22} />
                            <h3 className="text-[19px] font-black text-[#0F172A] dark:text-white tracking-tight">{t('good_know')}</h3>
                        </div>
                        <ul className="space-y-3 pl-2">
                            <li className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                                <span className="font-bold text-base text-[#475569] dark:text-slate-300">{t('Best time')}: {city?.bestTime || 'Spring'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                                <span className="font-bold text-base text-[#475569] dark:text-slate-300">{t('label_currency')}: {localCurrency}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 space-y-4">
                        {/* Plan with AI - Pill Shaped Style (Solid Blue variant) */}
                        <button 
                            onClick={() => onPlanWithAI && onPlanWithAI({ name: attr.name, lat: city?.name === 'Paris' ? 48.8584 : 0, lng: city?.name === 'Paris' ? 2.2945 : 0 })} 
                            className="w-full h-[50px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 transform active:scale-95 shadow-xl shadow-indigo-500/25"
                        >
                            <Sparkles size={24} className="fill-white" /> {t('Plan With AI')}
                        </button>

                        {/* Plan My Trip - Pill Shaped Style (Solid Blue) */}
                        <button 
                            onClick={openEditModal} 
                            className="w-full h-[50px] bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 transform active:scale-95 shadow-xl shadow-blue-500/25"
                        >
                            <Plane size={24} strokeWidth={3} className="fill-none" /> {t('plan_trip')}
                        </button>
                        
                        {/* Add to Wishlist - Pill Shaped Style (Solid White/Secondary) */}
                        <button 
                            onClick={toggleSave} 
                            className={`w-full h-[50px] rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 transform active:scale-95 border ${
                                saved 
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' 
                                : 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white border-slate-200 dark:border-slate-700 shadow-sm'
                            }`}
                        >
                            {saved ? <Check size={24} strokeWidth={3} /> : <Heart size={24} />} {saved ? t('saved') : t('add_wishlist')}
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-3 gap-3">
              <button onClick={() => window.open(attr.website, '_blank')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group shadow-sm bg-white dark:bg-slate-900">
                <ExternalLink size={22} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-300 text-center leading-tight uppercase tracking-wider">{t('Visit Website')}</span>
              </button>
              <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attr.name + ' ' + attr.address)}`, '_blank')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group shadow-sm bg-white dark:bg-slate-900">
                <MapIcon size={22} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-300 text-center leading-tight uppercase tracking-wider">{t('View On Map')}</span>
              </button>
              <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group shadow-sm bg-white dark:bg-slate-900">
                <Share2 size={22} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-300 text-center leading-tight uppercase tracking-wider">{t('Share location')}</span>
              </button>
            </section>

            <div className="space-y-12">
                {nearbyAccommodations.length > 0 && (
                    <section className="animate-fade-in mt-2">
                        <div className="flex justify-between items-center mb-6 px-2"><h2 className="text-[19px] font-black text-[#0F172A] dark:text-white tracking-tight">{t('nearby_acc')}</h2><button onClick={() => setShowAllAccommodations(!showAllAccommodations)} className="px-4 py-1.5 border border-slate-200 rounded-xl font-bold text-xs text-[#2563EB] hover:bg-blue-50 transition-colors whitespace-nowrap">{showAllAccommodations ? t('view_less') : t('view_all')}</button></div>
                        <div className="grid grid-cols-2 gap-5">{(showAllAccommodations ? nearbyAccommodations : nearbyAccommodations.slice(0, 2)).map((hotel) => (<div key={hotel.id} onClick={() => navigate('accommodation', { id: hotel.id })} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer border border-white/10"><ImageWithFallback src={hotel.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={hotel.name} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white"><h3 className="font-extrabold text-base leading-tight mb-1">{hotel.name}</h3><p className="text-[10px] font-bold opacity-90 flex items-center gap-1.5">{hotel.type} • {hotel.rating} <Star size={10} className="fill-current text-white" /></p></div></div>))}</div>
                    </section>
                )}
                {nearbyRestaurants.length > 0 && (
                    <section className="animate-fade-in pb-12 mt-2">
                        <div className="flex justify-between items-center mb-6 px-2"><h2 className="text-[19px] font-black text-[#0F172A] dark:text-white tracking-tight">{t('top_rest')}</h2><button onClick={() => setShowAllRestaurants(!showAllRestaurants)} className="px-4 py-1.5 border border-slate-200 rounded-xl font-bold text-xs text-[#2563EB] hover:bg-blue-50 transition-colors whitespace-nowrap">{showAllRestaurants ? t('view_less') : t('view_all')}</button></div>
                        <div className="grid grid-cols-2 gap-5">{(showAllRestaurants ? nearbyRestaurants : nearbyRestaurants.slice(0, 2)).map((rest) => (<div key={rest.id} onClick={() => navigate('restaurant', { id: rest.id })} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer border border-white/10"><ImageWithFallback src={rest.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={rest.name} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white"><h3 className="font-extrabold text-base leading-tight mb-1">{rest.name}</h3><p className="text-[10px] font-bold opacity-90 flex items-center gap-1.5">{rest.cuisine} • {rest.rating} <Star size={10} className="fill-current text-white" /></p></div></div>))}</div>
                    </section>
                )}
            </div>
          </div>
        </div>
      </div>
    );
};

export const ProfileView: React.FC<ViewProps & { openEditModal: () => void; toggleTheme: () => void; darkMode: boolean; onLogout?: () => void }> = ({ navigate, userProfile, openEditModal, toggleTheme, darkMode, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState<'privacy' | 'help'>('privacy');
  const t = (key: string) => getTranslation(userProfile.language, key);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    navigate('home');
  };

  const initial = userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans text-slate-900 dark:text-white">
      {/* Profile Header / Hero Section */}
      <div className="max-w-2xl mx-auto pt-10 px-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-blue-600 flex items-center justify-center text-white text-3xl font-black">
            {userProfile.photoURL ? (
              <ImageWithFallback src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {userProfile.displayName || 'GoTrip Traveler'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate mt-0.5">
              {userProfile.email}
            </p>
            <button
              onClick={openEditModal}
              className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={15} />
              {t('profile_edit')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Column */}
      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
        {/* PERSONAL INFO Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            {t('personal_info')}
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {[
              { label: t('label_age'), value: userProfile.age || '-', icon: User },
              { label: t('label_gender'), value: userProfile.gender || '-', icon: Users },
              { label: 'Phone Number', value: userProfile.phone || '-', icon: Phone },
              { label: t('label_country'), value: userProfile.country || '-', icon: Globe },
              { label: t('label_language'), value: userProfile.language || '-', icon: Info },
              { label: t('label_currency'), value: userProfile.currency || '-', icon: DollarSign },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <item.icon size={18} className="shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            {t('settings')}
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {/* Light/Dark Mode toggle */}
            <div className="flex justify-between items-center py-3.5 first:pt-0">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                {darkMode ? <Moon size={18} className="shrink-0" /> : <Sun size={18} className="shrink-0" />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {darkMode ? t('theme_dark') : t('theme_light')}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Privacy */}
            <button
              onClick={() => {
                setSettingsType('privacy');
                setShowSettings(true);
              }}
              className="w-full flex justify-between items-center py-3.5 hover:opacity-80 transition-opacity text-left"
            >
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Shield size={18} className="shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('privacy')}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>

            {/* Help */}
            <button
              onClick={() => {
                setSettingsType('help');
                setShowSettings(true);
              }}
              className="w-full flex justify-between items-center py-3.5 last:pb-0 hover:opacity-80 transition-opacity text-left"
            >
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <HelpCircle size={18} className="shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('help')}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          </div>
        </div>

        {/* Full-width pale-red Log Out button */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#FEF2F2] dark:bg-red-950/30 border border-[#FECACA] dark:border-red-900/40 text-[#DC2626] dark:text-red-400 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors shadow-sm active:scale-[0.99]"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        type={settingsType}
        language={userProfile.language}
      />
    </div>
  );
};

export const AccommodationDetailView: React.FC<ViewProps & { id: string }> = ({ navigate, goBack, id, userProfile }) => {
  const hotel = MOCK_DB.accommodations.find(a => a.id === id);
  const city = MOCK_DB.cities.find(c => c.id === hotel?.cityId);
  const t = (key: string) => getTranslation(userProfile.language, key);
  if (!hotel) return <div className="p-8 text-center text-gray-500 font-bold">Hotel not found</div>;
  const AMENITY_ICONS: Record<string, any> = { 'Pool': Waves, 'Spa': Sparkles, 'Gym': Activity, 'Fine Dining': Utensils, 'Bar': Coffee, 'Luxury Rooms': Bed, 'Breakfast Included': Utensils, 'Free Wifi': Wifi, 'City Center': Compass };
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-32 font-sans relative">
      <div className="relative h-[40vh] w-full overflow-hidden"><ImageWithFallback src={hotel.image} className="w-full h-full object-cover" alt={hotel.name} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" /><button onClick={() => goBack ? goBack() : navigate('home')} className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl p-2 rounded-full text-white hover:bg-white/30 transition-all z-20 border border-white/20"><ChevronLeft size={20} strokeWidth={3} /></button><div className="absolute bottom-6 left-6 right-6 text-white z-10"><h1 className="text-3xl md:text-5xl font-black mb-1.5 tracking-tighter drop-shadow-xl">{hotel.name}</h1><div className="flex items-center gap-3 text-xs md:text-sm font-bold drop-shadow-lg opacity-90"><span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-400" /> {city?.name}, {city?.country}</span></div></div></div>
      <div className="max-w-md mx-auto px-5 -mt-4 relative z-20"><div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 space-y-8"><div className="flex justify-between items-center pb-5 border-b border-slate-50 dark:border-slate-800/50"><div className="flex items-center gap-2"><Star className="text-[#EAB308] fill-[#EAB308]" size={20} /><span className="text-lg font-black text-[#EAB308]">{hotel.rating} Rating</span></div><div className="text-right"><p className="text-2xl font-black text-[#10B981] leading-none">{formatCurrency(hotel.priceValue, userProfile.currency)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">per night</p></div></div><section className="space-y-4"><h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest pl-0.5">Amenities</h2><div className="space-y-4">{hotel.amenities.map((amenity, idx) => { const Icon = AMENITY_ICONS[amenity] || Bed; return (<div key={idx} className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700"><Icon size={18} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{amenity}</span></div>); })}</div></section><div className="space-y-3 pt-2">

      {/* Book Now - Pill Shaped Style (Solid Blue) */}
      <button onClick={() => window.open(hotel.website, '_blank')} className="w-full h-[55px] bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-black text-lg shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"><Hotel size={22} /> Book Now</button>

      {/* View Map - Pill Shaped Style (Solid White/Secondary) */}
      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + (city?.name || ''))}`, '_blank')} className="w-full h-[55px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"><MapIcon size={22} /> View on Map</button>
      </div></div></div>
    </div>
  );
};

export const RestaurantDetailView: React.FC<ViewProps & { id: string }> = ({ navigate, goBack, id, userProfile }) => {
  const rest = MOCK_DB.restaurants.find(r => r.id === id);
  const city = MOCK_DB.cities.find(c => c.id === rest?.cityId);
  const t = (key: string) => getTranslation(userProfile.language, key);
  if (!rest) return <div className="p-8 text-center text-gray-500 font-bold">Restaurant not found</div>;
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-32 font-sans relative">
      <div className="relative h-[30vh] md:h-[35vh] w-full overflow-hidden"><ImageWithFallback src={rest.image} className="w-full h-full object-cover" alt={rest.name} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" /><button onClick={() => goBack ? goBack() : navigate('home')} className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl p-2 rounded-full text-white hover:bg-white/30 transition-all z-20 border border-white/20"><ChevronLeft size={20} strokeWidth={3} /></button><div className="absolute bottom-6 left-6 right-6 text-white z-10"><h1 className="text-3xl md:text-5xl font-black mb-1.5 tracking-tighter drop-shadow-xl">{rest.name}</h1><div className="flex items-center gap-3 text-xs md:text-sm font-bold drop-shadow-lg opacity-90"><span className="flex items-center gap-1.5"><Utensils size={14} className="text-blue-400" /> {rest.cuisine}</span><span className="w-1 h-1 rounded-full bg-white/40" /><span className="flex items-center gap-1.5">{city?.name}</span></div></div></div>
      <div className="max-w-md mx-auto px-5 -mt-4 relative z-20"><div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 space-y-6"><div className="flex justify-between items-center pb-5 border-b border-slate-50 dark:border-slate-800/50"><div className="flex items-center gap-2"><Star className="text-[#EAB308] fill-[#EAB308]" size={20} /><span className="text-lg font-black text-[#EAB308]">{rest.rating} Rating</span></div><div className="text-right"><p className="text-2xl font-black text-[#10B981] leading-none">{formatCurrency(rest.priceValue, userProfile.currency)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">per person</p></div></div><section className="space-y-4"><h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest pl-0.5">Features</h2><div className="grid grid-cols-2 gap-x-4 gap-y-4">{[{ id: 'res', label: 'Reservations' }, { id: 'seat', label: 'Seating' }, { id: 'svc', label: 'Table Service' }, { id: 'take', label: 'Takeout' }].map(f => (<div key={f.id} className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700"><Check size={14} strokeWidth={4} /></div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.label}</span></div>))}</div></section><div className="space-y-3 pt-2">
      {/* Reserve - Pill Shaped Style (Solid Blue) */}
      <button onClick={() => window.open(rest.website, '_blank')} className="w-full h-[55px] bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"><Utensils size={22} strokeWidth={2.5} /> Reserve Table</button>
      {/* View Map - Pill Shaped Style (Solid White/Secondary) */}
      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rest.name + ' ' + (city?.name || ''))}`, '_blank')} className="w-full h-[55px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"><MapIcon size={22} /> View on Map</button>
      </div></div></div>
    </div>
  );
};

export const MyPlansView: React.FC<ViewProps & { plans: DreamTripResult[]; onViewPlan: (plan: DreamTripResult) => void; onOpenPlanner: () => void }> = ({ navigate, userProfile, plans, onViewPlan, onOpenPlanner }) => {
  const t = (key: string) => getTranslation(userProfile.language, key);
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t('my_plans_title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">{t('manage_plans_sub')}</p>
        
        {plans.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_plans')}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">{t('no_plans_sub')}</p>
            <button onClick={onOpenPlanner} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              {t('go_to_planner')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} onClick={() => onViewPlan(plan)} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-slate-700">
                    <ImageWithFallback src={plan.hotel.image} alt={plan.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{plan.destination}</h3>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                           {formatCurrency(plan.totalEstimatedCost, userProfile.currency)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                        <Calendar size={14} /> {plan.dates}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {plan.highlights.slice(0, 2).map((h, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 md:pt-0">
                      <button className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        {t('view_details')} <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
