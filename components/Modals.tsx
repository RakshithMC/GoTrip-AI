import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Star, AlertTriangle, User, Mail, Phone, MapPin, Save, Plus, MessageSquare, Image, Map as MapIcon, ArrowRight, Search, ArrowLeft, Locate, Minus, Link as LinkIcon, Calendar, Clock, Briefcase, CreditCard, CheckSquare, ExternalLink, Check, Loader2, ChevronDown, Upload, Trash2 } from 'lucide-react';
import { UserProfile, DreamTripResult, UserPreferences } from '../types';
import { CURRENCIES, getEmergencyNumbers, LANGUAGES, getTranslation, COUNTRY_CODES } from '../services/data';
import { v4 as uuidv4 } from 'uuid';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

export const EmergencyModal: React.FC<ModalProps & { country: string }> = ({ isOpen, onClose, country, language }) => {
  const t = (key: string) => getTranslation(language, key);
  const [locationName, setLocationName] = useState(country || 'Unknown Location');
  const [numbers, setNumbers] = useState(getEmergencyNumbers(country));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      if (country) {
         setNumbers(getEmergencyNumbers(country));
         setLocationName(country);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              
              if (data && data.address) {
                  const detectedCountry = data.address.country || 'Unknown Location';
                  const city = data.address.city || data.address.town || data.address.state;
                  const displayName = city ? `${city}, ${detectedCountry}` : detectedCountry;
                  
                  setLocationName(displayName);
                  setNumbers(getEmergencyNumbers(detectedCountry));
              }
            } catch (error) {
              console.error("Failed to fetch location details", error);
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Geolocation denied or failed", error);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    }
  }, [isOpen, country]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden animate-scale-up">
        <div className="bg-red-600 p-4 pb-5 text-white flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-bold text-lg flex items-center gap-2 leading-none">
              <AlertTriangle size={24} className="animate-pulse" /> {t('Emergency')}
            </h3>
            <p className="text-[12px] opacity-90 font-medium ml-8 mt-1.5 leading-[12px]">{t('We always takecare about our customers')}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-700 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-2">
               {t('Current location')} 
               {loading && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <MapPin size={24} className="text-red-500" />
                {locationName}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a href={`tel:${numbers.police}`} className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-100 dark:border-red-900/30 hover:border-red-500 dark:hover:border-red-500 transition-all group cursor-pointer">
              <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Phone size={24} className="text-red-600 dark:text-red-200" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{t('police')}</span>
              <span className="text-xl text-red-600 dark:text-red-400 font-black font-mono mt-1">{numbers.police}</span>
            </a>
            <a href={`tel:${numbers.ambulance}`} className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 hover:border-red-500 dark:hover:border-red-500 transition-all group cursor-pointer">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Phone size={24} className="text-blue-600 dark:text-blue-200" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{t('ambulance')}</span>
              <span className="text-xl text-blue-600 dark:text-blue-400 font-black font-mono mt-1">{numbers.ambulance}</span>
            </a>
            <a href={`tel:${numbers.fire}`} className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border-2 border-orange-100 dark:border-orange-900/30 hover:border-red-500 dark:hover:border-red-500 transition-all group cursor-pointer col-span-2">
              <div className="bg-orange-100 dark:bg-orange-800 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Phone size={24} className="text-orange-600 dark:text-orange-200" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{t('fire')}</span>
              <span className="text-xl text-orange-600 dark:text-orange-400 font-black font-mono mt-1">{numbers.fire}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditModal: React.FC<ModalProps & { onSave: (plan: DreamTripResult) => void }> = ({ isOpen, onClose, onSave, language }) => {
  const t = (key: string) => getTranslation(language, key);
  const [formData, setFormData] = useState({
    tripName: '',
    startDate: '',
    endDate: '',
    duration: '7 Days',
    travelerType: 'Solo',
    purpose: 'Vacation',
    flightCost: 0,
    accCost: 0,
    checklist: {
      bookFlight: false,
      bookAcc: false,
      visa: false,
      insurance: false
    }
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChecklist = (item: keyof typeof formData.checklist) => {
    setFormData(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [item]: !prev.checklist[item] }
    }));
  };

  const isFormValid = formData.tripName.trim() !== '';

  const handleSave = () => {
    if (!isFormValid) return;

    const totalCost = Number(formData.flightCost) + Number(formData.accCost);
    const plan: DreamTripResult = {
        id: uuidv4(),
        destination: formData.tripName,
        dates: formData.startDate && formData.endDate ? `${formData.startDate} - ${formData.endDate}` : `${formData.duration} trip`,
        travelers: formData.travelerType === 'Solo' ? 1 : 2,
        totalEstimatedCost: totalCost,
        highlights: [formData.purpose, formData.travelerType + " Trip"],
        flights: { outbound: [], return: [] },
        hotel: { 
            id: 'manual', 
            name: 'Manual Booking', 
            image: '', 
            rating: 0, 
            pricePerNight: 0, 
            address: '', 
            amenities: [], 
            website: '' 
        },
        itinerary: [],
        visa: { type: 'Standard', required: formData.checklist.visa, checklist: [], processingTime: '' },
        route: []
    };
    onSave(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-20">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Briefcase size={24} className="text-blue-600" /> {t('travel_dashboard')}
            </h2>
            <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                <X size={28} />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar overflow-x-hidden">
            <div className="space-y-4">
                {/* Trip Name */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('trip_name')}</label>
                    <input 
                      type="text" 
                      value={formData.tripName} 
                      onChange={(e) => handleChange('tripName', e.target.value)} 
                      className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white placeholder-gray-400 shadow-sm" 
                      placeholder="My Adventure" 
                    />
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('start_date')}</label>
                        <div className="relative">
                            <input 
                              type="date" 
                              value={formData.startDate} 
                              onChange={(e) => handleChange('startDate', e.target.value)} 
                              className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white shadow-sm appearance-none" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('end_date')}</label>
                        <div className="relative">
                            <input 
                              type="date" 
                              value={formData.endDate} 
                              onChange={(e) => handleChange('endDate', e.target.value)} 
                              className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white shadow-sm appearance-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('duration')}</label>
                    <div className="relative">
                        <select 
                          value={formData.duration} 
                          onChange={(e) => handleChange('duration', e.target.value)} 
                          className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white shadow-sm appearance-none"
                        >
                            {['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '21 Days', '30 Days'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>

                {/* Traveler Type */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('traveler_type')}</label>
                    <div className="relative">
                        <select 
                          value={formData.travelerType} 
                          onChange={(e) => handleChange('travelerType', e.target.value)} 
                          className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white shadow-sm appearance-none"
                        >
                            {['Solo', 'Couple', 'Family', 'Group', 'Business'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{t('purpose')}</label>
                    <div className="relative">
                        <select 
                          value={formData.purpose} 
                          onChange={(e) => handleChange('purpose', e.target.value)} 
                          className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-white shadow-sm appearance-none"
                        >
                            {['Vacation', 'Adventure', 'Culture', 'Relaxation', 'Work', 'Honeymoon'].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>
            </div>

            {/* Booking Checklist Section */}
            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{t('booking_checklist')}</h3>
                <div className="space-y-3">
                    {[
                        { id: 'bookFlight', label: t('book_flight'), url: 'https://www.google.com/travel/flights' },
                        { id: 'bookAcc', label: t('book_accommodation'), url: 'https://www.booking.com' },
                        { id: 'visa', label: t('apply_visa'), url: 'https://ivisatravel.com/' },
                        { id: 'insurance', label: t('buy_insurance'), url: 'https://www.worldnomads.com' }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center gap-3 group">
                            <button 
                                type="button" 
                                onClick={() => handleChecklist(item.id as keyof typeof formData.checklist)} 
                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.checklist[item.id as keyof typeof formData.checklist] ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200 dark:border-slate-600 hover:border-blue-400'}`}
                            >
                                {formData.checklist[item.id as keyof typeof formData.checklist] && <Check size={16} className="text-white" strokeWidth={4} />}
                            </button>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-300 hover:text-blue-600">
                                {item.label} <ExternalLink size={14} className="text-blue-500 opacity-60 group-hover:opacity-100" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 sticky bottom-0 z-20">
            <button 
              onClick={onClose} 
              className="flex-1 px-6 py-3.5 text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              {t('close')}
            </button>
            <button 
              onClick={handleSave} 
              disabled={!isFormValid} 
              className={`flex-1 px-8 py-3.5 rounded-2xl text-sm font-black shadow-xl transition-all flex items-center justify-center gap-2 ${isFormValid ? 'bg-black dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'}`}
            >
              {t('save_dashboard')}
            </button>
        </div>
      </div>
    </div>
  );
};

export const AddActionModal: React.FC<ModalProps & { onAction: (action: 'add_place' | 'review' | 'photo' | 'city_guide' | 'country_db') => void }> = ({ isOpen, onClose, onAction, language }) => {
  const t = (key: string) => getTranslation(language, key);
  if (!isOpen) return null;
  const actions = [
    { id: 'add_place', label: t('add_place'), icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'review', label: t('write_review'), icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 md:p-0">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up md:animate-scale-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400"><X size={20} /></button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('contribute')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <button key={action.id} onClick={() => onAction(action.id as any)} className="flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border border-gray-100 dark:border-slate-700 group">
              <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><action.icon size={24} className={action.color} /></div>
              <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProfileEditModal: React.FC<ModalProps & { profile: UserProfile, onSave: (p: UserProfile) => Promise<{ success: boolean; error?: string } | void> | void }> = ({ isOpen, onClose, profile, onSave, language }) => {
  const t = (key: string) => getTranslation(language, key);
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
      setSaveError(null);
      setSaveSuccess(false);
      setIsSaving(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (saveError) setSaveError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await onSave(formData);
      setIsSaving(false);
      if (res && res.success === false) {
        setSaveError(res.error || 'Unable to save your profile. Please try again.');
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          onClose();
          setSaveSuccess(false);
        }, 1200);
      }
    } catch (err: any) {
      setIsSaving(false);
      setSaveError('Unable to save your profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar overflow-x-hidden">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 p-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
             <h3 className="text-xl font-black text-slate-900 dark:text-white mx-auto">{t('Edit profile')}</h3>
             <button onClick={onClose} className="text-gray-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {saveError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold animate-fade-in">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold animate-fade-in">
                Profile updated successfully.
              </div>
            )}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 mb-3">
                        {formData.photoURL ? <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={64} /></div>}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110">
                        <Camera size={18} />
                    </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('full name')}</label>
                    <input name="displayName" value={formData.displayName || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Your Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('age')}</label>
                        <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Age" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('gender')}</label>
                        <div className="relative">
                            <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none">
                                <option value="">-</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('country')}</label>
                    <input name="country" value={formData.country || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="Your Country" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('language')}</label>
                    <div className="relative">
                        <select name="language" value={formData.language || 'English'} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none">
                            {LANGUAGES.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('phone number')}</label>
                    <div className="flex gap-2">
                        <div className="relative w-24 shrink-0">
                            <select 
                                value={formData.phone?.split(' ')[0] || '+91'} 
                                onChange={(e) => {
                                    const parts = formData.phone?.split(' ') || [];
                                    const num = parts.length > 1 ? parts.slice(1).join(' ') : '';
                                    setFormData({ ...formData, phone: `${e.target.value} ${num}`.trim() });
                                }}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none text-sm"
                            >
                                {COUNTRY_CODES.map(c => (<option key={c.code} value={c.code}>{c.code}</option>))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <input 
                            type="tel"
                            value={formData.phone?.split(' ').slice(1).join(' ') || (formData.phone && !formData.phone.startsWith('+') ? formData.phone : '')} 
                            onChange={(e) => {
                                const code = formData.phone?.split(' ')[0] || '+91';
                                setFormData({ ...formData, phone: `${code} ${e.target.value}`.trim() });
                            }}
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" 
                            placeholder="Phone Number" 
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('currency')}</label>
                    <div className="relative">
                        <select name="currency" value={formData.currency || 'INR'} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none">
                            {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">{t('bio') || 'Bio'}</label>
                    <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={2} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" placeholder="Tell us about yourself..." />
                </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 mt-4 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2">
              {isSaving ? 'Saving...' : t('Save Changes')}
            </button>
        </form>
      </div>
    </div>
  );
};

const MapPickerModalComponent: React.FC<{ label: string; value: { name: string; lat: number; lng: number } | null; onChange: (val: { name: string; lat: number; lng: number }) => void; language: string; }> = ({ label, value, onChange, language }) => {
  const t = (key: string) => getTranslation(language, key);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempLocation, setTempLocation] = useState<{ name: string; lat: number; lng: number } | null>(value);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const L = (window as any).L;

  useEffect(() => {
    if (isMapOpen && mapRef.current && !mapInstance.current) {
      const startLat = value?.lat || 20, startLng = value?.lng || 0;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([startLat, startLng], value ? 12 : 2);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri, Maxar', maxZoom: 19 }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);
      if (value) markerInstance.current = L.marker([value.lat, value.lng]).addTo(map);
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerInstance.current) markerInstance.current.remove();
        markerInstance.current = L.marker([lat, lng]).addTo(map);
        setTempLocation({ name: 'Selected Location', lat, lng });
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`).then(r => r.json());
        setTempLocation({ name: res.address?.city || res.address?.town || "Custom Location", lat, lng });
      });
      mapInstance.current = map;
    }
    return () => { if (!isMapOpen && mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [isMapOpen]);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
      <button type="button" onClick={() => setIsMapOpen(true)} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-left text-sm text-slate-700 dark:text-white flex items-center gap-3">
        <MapPin size={16} className="text-blue-500" /> {value ? value.name : t('select_location_map')}
      </button>
      {isMapOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in">
          <div className="absolute top-4 left-4 right-4 z-[500] flex gap-3">
            <button onClick={() => setIsMapOpen(false)} className="p-3 bg-white rounded-full text-black"><ArrowLeft size={20} /></button>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-3 bg-white rounded-full outline-none text-black" placeholder={t('search_location')} />
          </div>
          <div ref={mapRef} className="w-full h-full" />
          {tempLocation && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 rounded-t-3xl z-[500] animate-slide-up">
              <h3 className="text-xl font-bold dark:text-white mb-4">{tempLocation.name}</h3>
              <button onClick={() => { onChange(tempLocation); setIsMapOpen(false); }} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg">{t('confirm_location')}</button>
            </div>
          )}
        </div>, document.body
      )}
    </div>
  );
};

export const UserContributionModal: React.FC<ModalProps & { mode: 'add_place' | 'review' | 'photo' | null }> = ({ isOpen, onClose, mode, language }) => {
  const t = (key: string) => getTranslation(language, key);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !mode) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onClose();
    alert(t('thanks_contribution'));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col my-8 animate-scale-up">
        <div className="relative p-6 border-b border-gray-100 dark:border-slate-800 text-center bg-white dark:bg-slate-950 sticky top-0 z-20">
            {mode === 'add_place' ? <h2 className="text-2xl font-bold text-blue-600 pt-2">{t('add_new_place')}</h2> : <h2 className="text-xl font-bold dark:text-white">{mode === 'review' ? t('write_review') : t('add_photo')}</h2>}
            <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] no-scrollbar overflow-x-hidden">
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'add_place' && (
                  <>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{t('place_name')}</label><input required className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" /></div>
                   <MapPickerModalComponent label={t('location_on_map')} value={location} onChange={setLocation} language={language} />
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{t('description')}</label><textarea className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none dark:text-white resize-none h-24" /></div>
                   
                   {selectedImage ? (
                     <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                       <img src={selectedImage} className="w-full h-40 object-cover" />
                       <button 
                         type="button"
                         onClick={() => setSelectedImage(null)} 
                         className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ) : (
                     <div className="flex gap-3">
                        <button 
                          type="button" 
                          onClick={() => setShowCamera(true)}
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
                        >
                          <Camera size={20} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Take Photo</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
                        >
                          <Upload size={20} className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Upload</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                     </div>
                   )}
                  </>
              )}
              {mode === 'review' && (
                  <>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{t('place')}</label><input required className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none dark:text-white" /></div>
                   <div className="flex gap-2">
                         {[1,2,3,4,5].map(star => (<button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110"><Star size={32} className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} /></button>))}
                   </div>
                   <textarea required className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none dark:text-white resize-none h-32" placeholder={t('your_review')} />
                  </>
              )}
              <div className="flex gap-3 mt-4 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button type="button" onClick={onClose} className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-bold">{t('cancel')}</button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg">{loading ? t('submitting') : t('submit')}</button>
              </div>
            </form>
        </div>
      </div>
      <CameraModal 
        isOpen={showCamera} 
        onClose={() => setShowCamera(false)} 
        onCapture={(img) => {
          setSelectedImage(img);
          setShowCamera(false);
        }} 
        language={language} 
      />
    </div>
  );
};

export const CameraModal: React.FC<{ isOpen: boolean; onClose: () => void; onCapture: (image: string) => void; language: string }> = ({ isOpen, onClose, onCapture, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied or not available.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4">
      <div className="relative w-full h-full md:h-auto md:max-w-lg md:aspect-[3/4] bg-slate-900 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white font-bold text-sm tracking-tight">Camera</h3>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {error ? (
            <div className="text-white text-center p-8 max-w-xs">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <p className="font-bold text-lg mb-2">Camera Error</p>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button onClick={startCamera} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors">Try Again</button>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="p-10 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
          <div className="relative flex items-center justify-center">
            <button 
              onClick={capture}
              disabled={!stream}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 z-10"
            >
              <div className="w-16 h-16 bg-white rounded-full" />
            </button>
            <div className="absolute w-24 h-24 rounded-full border border-white/30 animate-ping opacity-20" />
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>,
    document.body
  );
};

export const SettingsModal: React.FC<ModalProps & { type: 'privacy' | 'help' }> = ({ isOpen, onClose, type, language }) => {
    const t = (key: string) => getTranslation(language, key);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-xl animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white capitalize">{type === 'privacy' ? t('privacy') : t('help')}</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t('settings_update_msg')}</p>
                <button onClick={onClose} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{t('got_it')}</button>
            </div>
        </div>
    );
};

export const PreferenceEditModal: React.FC<ModalProps & {
  preferences: UserPreferences | null;
  onSave: (prefs: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string } | void>;
}> = ({ isOpen, onClose, preferences, onSave, language }) => {
  const AVAILABLE_INTERESTS = [
    'Nature', 'History', 'Culture', 'Adventure', 'Food', 'Shopping', 
    'Beaches', 'Nightlife', 'Photography', 'Architecture', 'Family activities', 'Relaxation'
  ];

  const TRAVEL_STYLES = ['Relaxed', 'Balanced', 'Packed', 'Luxury', 'Budget', 'Backpacking', 'Family'];
  const TRIP_PACES = ['Relaxed', 'Moderate', 'Fast-paced'];
  const TRANSPORTS = ['Transit', 'Driving', 'Flight', 'Walking'];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dislikedInterests, setDislikedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [tripPace, setTripPace] = useState('Moderate');
  const [preferredTransport, setPreferredTransport] = useState('Transit');
  const [budgetMin, setBudgetMin] = useState(10000);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && preferences) {
      const positiveInterests = Object.entries(preferences.interests || {})
        .filter(([_, score]) => score > 0)
        .map(([name]) => name);
      setSelectedInterests(positiveInterests);
      setDislikedInterests(preferences.dislikedInterests || []);
      setTravelStyle(preferences.travelStyle || 'Balanced');
      setTripPace(preferences.tripPace || 'Moderate');
      setPreferredTransport(preferences.preferredTransport || 'Transit');
      setBudgetMin(preferences.budgetMin ?? 10000);
      setBudgetMax(preferences.budgetMax ?? 50000);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
    setDislikedInterests(prev => prev.filter(i => i !== interest));
  };

  const toggleDislike = (interest: string) => {
    setDislikedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const interestsObj: Record<string, number> = { ...(preferences?.interests || {}) };
    AVAILABLE_INTERESTS.forEach(item => {
      if (selectedInterests.includes(item)) {
        interestsObj[item] = Math.max(1, (interestsObj[item] || 0) + 1);
      } else if (dislikedInterests.includes(item)) {
        interestsObj[item] = -1;
      }
    });

    try {
      const res = await onSave({
        interests: interestsObj,
        dislikedInterests,
        travelStyle,
        tripPace,
        preferredTransport,
        budgetMin,
        budgetMax,
      });

      setIsSaving(false);
      if (res && res.success === false) {
        setSaveError(res.error || 'Failed to save preferences.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setIsSaving(false);
      setSaveError('Failed to save preferences.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Travel Preferences</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
        </div>

        {saveError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preferred Interests */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-wider">
              Liked Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disliked Interests */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-wider">
              Disliked / Avoid Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map(interest => {
                const isDisliked = dislikedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleDislike(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isDisliked
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-red-400'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Style & Pace */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={e => setTravelStyle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TRAVEL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Trip Pace
              </label>
              <select
                value={tripPace}
                onChange={e => setTripPace(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TRIP_PACES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Min Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Max Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all text-base disabled:opacity-50"
          >
            {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
};
