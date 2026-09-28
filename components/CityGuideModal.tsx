import React, { useState, useEffect, useRef } from 'react';
// Added missing import for createPortal
import { createPortal } from 'react-dom';
import { X, Sparkles, MapPin, Globe, Loader2, Heart, Navigation, Clock, Sun, Users, Map as MapIcon, AlertCircle, ExternalLink, Star, Car, Check, Trash2, List, FileCode, Calendar } from 'lucide-react';
import { generateCityGuide } from '../services/geminiService';
import { GeneratedPlace, Attraction } from '../types';
import { DayTripPlanner } from './DayTripPlanner';

interface CityGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist: (attraction: Attraction | Attraction[]) => void;
  onRemoveFromWishlist: (id: string | string[]) => void;
  itinerary: Attraction[];
  language?: string;
}

export const CityGuideSection: React.FC<any> = ({ onAddToWishlist, onRemoveFromWishlist, itinerary, language = 'English' }) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<GeneratedPlace[]>([]);
  const [error, setError] = useState('');
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [isDayTripOpen, setIsDayTripOpen] = useState(false);

  const placesRef = useRef<GeneratedPlace[]>([]);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos((prev) => {
          if (!prev) return newPos;
          const diff = calculateDistance(prev.lat, prev.lng, newPos.lat, newPos.lng);
          if (diff > 0.05) { // 50 meters significance
            return newPos;
          }
          return prev;
        });
      },
      (err) => console.log("Location watch error:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCityCenterCoordinates = async (cityName: string, countryName: string): Promise<{lat: number, lng: number} | null> => {
    try {
      const q = `${cityName}, ${countryName}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (err) {
      console.error("Failed to geocode city center:", err);
    }
    return null;
  };

  const updateDistancesAndSort = async (currentPlaces: GeneratedPlace[], customPos?: {lat: number, lng: number}) => {
    if (currentPlaces.length === 0) return;

    let targetPos = customPos || userPos;

    // If no GPS position, fetch city center coordinates
    if (!targetPos && city && country) {
      const fallback = await getCityCenterCoordinates(city, country);
      if (fallback) {
        targetPos = fallback;
      }
    }

    if (!targetPos) {
      // If still no position, just set places as is
      setPlaces(currentPlaces);
      return;
    }

    // Filter out places missing latitude or longitude
    const validPlaces = currentPlaces.filter(p => {
      const pLat = p.latitude !== undefined ? p.latitude : p.lat;
      const pLng = p.longitude !== undefined ? p.longitude : p.lng;
      return pLat !== undefined && pLng !== undefined && !isNaN(pLat) && !isNaN(pLng);
    });

    const calculated = validPlaces.map(p => {
      const pLat = p.latitude !== undefined ? p.latitude : p.lat!;
      const pLng = p.longitude !== undefined ? p.longitude : p.lng!;
      
      const distance = calculateDistance(targetPos!.lat, targetPos!.lng, pLat, pLng);
      const estMins = Math.max(2, Math.round((distance / 20) * 60));
      const estimatedTravelTime = `${estMins} mins`;
      
      return {
        ...p,
        lat: pLat,
        lng: pLng,
        latitude: pLat,
        longitude: pLng,
        distance,
        estimatedTravelTime,
        distanceText: `${distance.toFixed(1)} km`,
        travelTime: estimatedTravelTime
      };
    });

    // Sort ascending: Nearest to Farthest (stable sort)
    calculated.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setPlaces(calculated);
  };

  // Listen to userPos updates to re-sort existing places
  useEffect(() => {
    if (placesRef.current.length > 0 && userPos) {
      updateDistancesAndSort(placesRef.current);
    }
  }, [userPos]);

  // Listen to city and country changes with a debounce to re-sort existing places
  useEffect(() => {
    if (placesRef.current.length === 0) return;

    const handler = setTimeout(() => {
      updateDistancesAndSort(placesRef.current);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [city, country]);

  const getCategoryImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('museum') || cat.includes('history')) return 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=400&q=80';
    if (cat.includes('nature') || cat.includes('park')) return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80';
    if (cat.includes('food') || cat.includes('market')) return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80';
  };

  const createAttractionFromPlace = (place: GeneratedPlace, index: number): Attraction => {
    return {
        id: `gen_city_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        cityId: `gen_${city.toLowerCase()}`,
        name: place.name,
        category: place.category,
        rating: place.rating || 4.5,
        price: 'Free',
        priceValue: 0,
        image: getCategoryImage(place.category),
        gallery: [],
        description: place.short_description,
        hours: '9:00 AM - 5:00 PM',
        address: place.address || `${place.nearby_area}, ${city}, ${country}`,
        website: '',
        mapUri: place.mapUri
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !country || loading) return;
    setLoading(true);
    setError('');
    try {
      const results = await generateCityGuide(city, country, language);
      if (!results || results.length === 0) {
        setError('Could not generate guide. Please check the location or try again later.');
      } else {
        await updateDistancesAndSort(results);
      }
    } catch (err: any) {
      setError(err?.userMessage || 'An error occurred while generating the city guide.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = (place: GeneratedPlace, index = 0) => {
    const existingItem = itinerary.find(i => i.name === place.name);
    if (existingItem) {
        onRemoveFromWishlist(existingItem.id);
    } else {
        onAddToWishlist(createAttractionFromPlace(place, index));
    }
  };

  const areAllAdded = places.length > 0 && places.every(p => itinerary.some(i => i.name === p.name));

  const handleToggleAll = () => {
    if (areAllAdded) {
      const idsToRemove = itinerary.filter(i => places.some(p => p.name === i.name)).map(i => i.id);
      onRemoveFromWishlist(idsToRemove);
    } else {
      const newItems = places.filter(p => !itinerary.some(i => i.name === p.name)).map((p, i) => createAttractionFromPlace(p, i));
      if (newItems.length > 0) onAddToWishlist(newItems);
    }
  };

  const handleViewOnMap = () => {
    if (places.length === 0) return;
    
    // Origin is user position or city name
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : encodeURIComponent(`${city}, ${country}`);
    
    // Destination is the last place
    const lastPlace = places[places.length - 1];
    const destination = `${lastPlace.lat},${lastPlace.lng}`;
    
    // Waypoints are all places except the last one
    const waypoints = places.slice(0, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full font-sans">
        <form onSubmit={handleGenerate} className="space-y-3 mb-4 max-w-xl mx-auto w-full">
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-black text-lg shadow-sm transition-all placeholder:font-bold" />
                </div>
                <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-black text-lg shadow-sm transition-all placeholder:font-bold" />
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#059669] text-white rounded-xl font-black text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5 tracking-tight">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate City Guide
            </button>
        </form>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[9px] animate-pulse">Calculating nearest routes...</p>
            </div>
        ) : places.length > 0 ? (
            <div className="animate-fade-in space-y-3 pb-8">
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={handleToggleAll} className={`h-[45px] rounded-xl font-black text-sm border transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 ${areAllAdded ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-blue-50 dark:bg-blue-900/10 text-[#2563EB] dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}>
                        {areAllAdded ? <Trash2 size={14} /> : <Check size={14} />} {areAllAdded ? 'Remove All' : 'Add All'}
                    </button>
                    <button onClick={handleViewOnMap} className="h-[45px] rounded-xl font-black text-sm border bg-blue-50 dark:bg-blue-900/10 text-[#2563EB] dark:text-blue-400 border-blue-100 dark:border-blue-800 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                        <MapIcon size={14} /> Map
                    </button>
                    <button onClick={() => setIsDayTripOpen(true)} className="h-[45px] rounded-xl font-black text-sm border bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                        <Calendar size={14} /> Day Trip
                    </button>
                </div>

                <DayTripPlanner 
                    isOpen={isDayTripOpen} 
                    onClose={() => setIsDayTripOpen(false)} 
                    cityName={city} 
                    places={places} 
                    language={language}
                />

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <FileCode className="text-[#059669]" size={20} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Places in {city}</h3>
                    </div>
                    <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-400">{places.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">RECORDS</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {places.map((place, idx) => {
                        const isAdded = itinerary.some(i => i.name === place.name);
                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-[1.25rem] border border-gray-50 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <button onClick={(e) => { e.stopPropagation(); handleToggleWishlist(place, idx); }} className={`absolute top-3 right-3 p-2 rounded-full transition-all shrink-0 shadow-md z-10 ${isAdded ? 'bg-pink-100 text-pink-600' : 'bg-white dark:bg-slate-700 text-gray-300 hover:text-pink-500 hover:scale-110'}`}><Heart size={14} className={isAdded ? "fill-current" : ""} /></button>
                                <div className="mb-1.5"><span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider">{place.category}</span></div>
                                <h3 className="text-xl font-black text-[#0F172A] dark:text-white mb-0.5 group-hover:text-blue-600 transition-colors tracking-tight cursor-pointer" onClick={() => window.open(place.mapUri, '_blank')}>{place.name}</h3>
                                <div className="flex items-center gap-1 mb-2"><span className="text-xs font-black text-slate-900 dark:text-slate-100">{place.rating || '4.5'}</span><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(star => <Star key={star} size={12} className={star <= (place.rating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-slate-600"} />)}</div></div>
                                <p className="text-xs text-[#475569] dark:text-gray-300 mb-3 font-medium leading-normal line-clamp-2">{place.short_description}</p>
                                <div className="bg-[#ECFDF5] dark:bg-emerald-900/10 px-3 py-2 rounded-xl flex items-center gap-2.5 mb-1.5 border border-emerald-50 dark:border-emerald-800/20"><Navigation size={14} className="text-[#10B981] rotate-45" /><span className="font-black text-sm text-[#059669] dark:text-emerald-400 tracking-tight">{place.distanceText || '0 km'} • {place.travelTime || 'Now'}</span></div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#94A3B8] dark:text-slate-500"><MapPin size={12} /><span className="truncate">{place.address}</span></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-40 h-full">
                <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[9px] text-center">Enter a location to generate your AI city guide</p>
            </div>
        )}
    </div>
  );
};

export const CityGuideModal: React.FC<CityGuideProps> = ({ isOpen, onClose, ...props }) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-950 w-full max-w-xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">AI City Guide</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 no-scrollbar overflow-x-hidden">
                    <CityGuideSection {...props} />
                </div>
            </div>
        </div>,
        document.body
    );
};