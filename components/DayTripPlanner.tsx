import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, MapPin, Navigation, Star, Loader2, Sparkles, Calendar, ChevronRight, Map as MapIcon } from 'lucide-react';
import { GeneratedPlace } from '../types';
import { generateDayTripItinerary } from '../services/geminiService';

interface DayTripPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  places: GeneratedPlace[];
  language?: string;
}

export const DayTripPlanner: React.FC<DayTripPlannerProps> = ({ isOpen, onClose, cityName, places, language = 'English' }) => {
  const [itinerary, setItinerary] = useState<{time: string, placeName: string, activity: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (isOpen && places.length > 0) {
      handleGenerate();
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location error:", err)
      );
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await generateDayTripItinerary(cityName, places, language);
      setItinerary(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnMap = () => {
    if (itinerary.length === 0) return;
    
    // Get the actual place objects for the itinerary items
    const itineraryPlaces = itinerary
      .map(item => places.find(p => p.name === item.placeName))
      .filter((p): p is GeneratedPlace => p !== undefined);

    if (itineraryPlaces.length === 0) return;

    // Origin is user position or city name
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : encodeURIComponent(cityName);
    
    // Destination is the last place in the itinerary
    const lastPlace = itineraryPlaces[itineraryPlaces.length - 1];
    const destination = `${lastPlace.lat},${lastPlace.lng}`;
    
    // Waypoints are all places except the last one
    const waypoints = itineraryPlaces.slice(0, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl h-full md:h-[90vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{cityName} Day Trip</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">AI Curated Itinerary</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleViewOnMap}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95"
            >
              <MapIcon size={14} /> Map
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Planning your perfect day...</p>
            </div>
          ) : itinerary.length > 0 ? (
            <div className="space-y-8 relative">
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-blue-100 dark:bg-blue-900/30" />
              
              {itinerary.map((item, idx) => {
                const place = places.find(p => p.name === item.placeName);
                return (
                  <div key={idx} className="relative pl-12 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Dot */}
                    <div className="absolute left-0 top-1.5 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs border-4 border-white dark:border-slate-950 shadow-md z-10">
                      {idx + 1}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.time}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{item.placeName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.activity}</p>
                      
                      {place && (
                        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm" onClick={() => window.open(place.mapUri, '_blank')}>
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-inner">
                              <img src={`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=150&q=80`} alt={place.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-black text-slate-900 dark:text-white">{place.rating || '4.5'}</span>
                              </div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 truncate uppercase tracking-widest">{place.category}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Calendar size={48} className="text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest">No itinerary generated</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest">
            <Sparkles size={18} /> Regenerate Plan
          </button>
        </div>
      </div>
    </div>
  );
};
