import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  MapPin, Calendar, Users, Heart, Briefcase, 
  Palmtree, X, CheckCircle, Plane, Hotel, FileText, ExternalLink,
  ArrowRight, Sparkles, Map as MapIcon, Navigation, 
  Utensils, Search, Plus, Minus, Locate, Layers, ArrowLeft, 
  Loader2, Compass, Database, Clock, Sun, AlertCircle, Star, Check, ChevronDown, Wifi, Bed, Info,
  ShieldCheck, Upload, Trash2, File, User, Image as ImageIcon,
  DollarSign, FileWarning, Download, Car, Bus, Train, Footprints, Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { DreamTripInput, DreamTripResult, TripTheme, UserProfile, GeneratedPlace, Attraction, RouteSegment, UserPreferences } from '../types';
import { generateDreamTrip } from '../services/mockSmartPlan';
import { CityGuideSection } from './CityGuideModal';
import { CountryGuideSection } from './CountryGuideModal';
import { CURRENCIES, formatCurrency } from '../services/data';
import ReplanModal from './ReplanModal';
import { ItineraryActivity } from '../services/replanService';
import { updateItineraryInDatabase } from '../services/tripService';


interface SmartPlanProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (plan: DreamTripResult) => void;
  initialPlan?: DreamTripResult | null;
  onAddToWishlist: (attraction: Attraction | Attraction[]) => void;
  onRemoveFromWishlist: (id: string | string[]) => void;
  itinerary: Attraction[];
  language?: string;
  initialDestination?: { name: string; lat: number; lng: number } | null;
  isLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  /** Feature 1: user preferences for replanning context */
  userPreferences?: UserPreferences | null;
  /** Authenticated user ID for preference feedback */
  userId?: string;
  /** Optional callback to notify parent of plan updates (e.g. replanning) */
  onUpdatePlan?: (plan: DreamTripResult) => void;
}


const MapPicker: React.FC<{ 
  label: string; 
  value: { name: string; lat: number; lng: number } | null;
  onChange: (val: { name: string; lat: number; lng: number }) => void;
}> = ({ label, value, onChange }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ name: string; lat: number; lng: number } | null>(value);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const getLeaflet = () => (window as any).L;

  useEffect(() => {
    if (isMapOpen && mapContainerRef.current && !mapInstanceRef.current) {
      const L = getLeaflet();
      if (!L) return;
      const startLat = value?.lat || 20;
      const startLng = value?.lng || 0;
      const startZoom = value ? 12 : 2;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: true }).setView([startLat, startLng], startZoom);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri, Maxar', maxZoom: 19 }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);
      if (value) markerInstanceRef.current = L.marker([value.lat, value.lng]).addTo(map);
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerInstanceRef.current) markerInstanceRef.current.remove();
        markerInstanceRef.current = L.marker([lat, lng]).addTo(map);
        setTempLocation({ name: 'Selected Location', lat, lng });
        try {
           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
           const data = await res.json();
           const displayName = data.address?.city || data.address?.town || "Custom Location";
           setTempLocation({ name: displayName, lat, lng });
        } catch (err) { console.error(err); }
      });
      mapInstanceRef.current = map;
    }
    return () => { if (!isMapOpen && mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [isMapOpen]);

  useEffect(() => { if (isMapOpen) { setTempLocation(value); setSearchQuery(value?.name || ''); } }, [isMapOpen, value]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            const shortName = display_name.split(',')[0];

            onChange({ name: shortName, lat: latitude, lng: longitude });
            setIsMapOpen(false);
        } else {
            alert("Location not found. Try a different name.");
        }
    } catch (err) {
        console.error("Search failed", err);
    } finally {
        setIsSearching(false);
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const handleLocateMe = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude, longitude } = pos.coords;
              if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([latitude, longitude], 14);
                  const L = getLeaflet();
                  if (markerInstanceRef.current) markerInstanceRef.current.remove();
                  markerInstanceRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
                  
                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                   .then(res => res.json())
                   .then(data => {
                       const name = data.address?.city || data.address?.town || "My Location";
                       setTempLocation({ name, lat: latitude, lng: longitude });
                   });
              }
          });
      }
  };

  const confirmLocation = () => {
    if (tempLocation) {
      onChange(tempLocation);
      setIsMapOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-1 flex-1 min-w-0">
        <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">{label}</h3>
        <button 
          type="button" 
          onClick={() => setIsMapOpen(true)} 
          className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left flex items-center justify-between transition-all hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm min-h-[52px]"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full text-[#4F46E5] shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
              <MapPin size={14} />
            </div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
              {value ? value.name : 'Select Location'}
            </p>
          </div>
          <ArrowRight size={14} className="text-[#CBD5E1] shrink-0 ml-2" />
        </button>
      </div>
      {isMapOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          <div className="absolute top-6 left-6 right-6 z-[500] flex items-center gap-4">
            <button onClick={() => setIsMapOpen(false)} className="p-3 bg-white rounded-full shadow-2xl text-black">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <form onSubmit={handleSearch} className="flex-1 relative shadow-2xl">
              <input 
                autoFocus
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search destination..." 
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full outline-none text-slate-900 font-bold" 
              />
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              {isSearching && (
                <div className="absolute right-4 top-4">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                </div>
              )}
            </form>
          </div>
          <div className="w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            
            <div className="absolute bottom-32 right-4 flex flex-col gap-3 z-[400]">
                 <button onClick={handleLocateMe} className="p-3.5 bg-white dark:bg-slate-800 rounded-full shadow-xl text-blue-600 hover:bg-gray-50 border border-gray-200 dark:border-slate-700">
                    <Locate size={22} />
                 </button>
                 <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <button onClick={() => handleZoom(1)} className="p-3.5 hover:bg-gray-50 text-gray-700 dark:text-white border-b border-gray-100 dark:border-slate-700"><Plus size={22} /></button>
                    <button onClick={() => handleZoom(-1)} className="p-3.5 hover:bg-gray-50 text-gray-700 dark:text-white"><Minus size={22} /></button>
                 </div>
            </div>

            {tempLocation && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl z-[500] animate-slide-up">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">{tempLocation.name}</h3>
                <button onClick={confirmLocation} className="w-full bg-[#9333EA] text-white py-5 rounded-2xl font-black text-xl shadow-xl">
                  {label.toLowerCase().includes('departure') ? 'Set as Departure' : 'Set as Destination'}
                </button>
              </div>
            )}
          </div>
        </div>, document.body
      )}
    </>
  );
};

const RouteMap = React.forwardRef<any, { route?: RouteSegment[] }>(({ route = [] }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getLeaflet = () => (window as any).L;

  React.useImperativeHandle(ref, () => ({
    getMapImage: async () => {
      if (!mapContainerRef.current) return null;
      
      // Hide UI elements for a clean capture
      const elementsToHide = mapContainerRef.current.querySelectorAll('.leaflet-control-container, .absolute');
      elementsToHide.forEach((el: any) => { if(el) el.style.opacity = '0'; });
      
      try {
        // Give Leaflet a moment to settle if needed
        return await toJpeg(mapContainerRef.current, { 
          pixelRatio: 1.5,
          quality: 0.9,
          canvasWidth: mapContainerRef.current.offsetWidth,
          canvasHeight: mapContainerRef.current.offsetHeight,
          cacheBust: false,
          backgroundColor: '#ffffff'
        });
      } catch (err) {
        console.error("Failed to capture map:", err);
        return null;
      } finally {
        // Restore UI elements
        elementsToHide.forEach((el: any) => { if(el) el.style.opacity = '1'; });
      }
    }
  }));

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const L = getLeaflet();
      if (!L) return;

      const map = L.map(mapContainerRef.current, { 
        zoomControl: false, // Turn off default to avoid clutter
        scrollWheelZoom: true,
        dragging: true 
      }).setView([20, 0], 2);
      
      // Reliable Hybrid Satellite Tiles
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 22,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        crossOrigin: true // Crucial for image capture
      }).addTo(map);

      const bounds: any[] = [];

      (route || []).forEach((segment) => {
        if (!segment.coords || segment.coords.length < 2) return;
        
        const pathCoords = segment.coords;
        bounds.push(...pathCoords);

        let color = '#3B82F6'; 
        let weight = 4;
        let finalPathCoords: [number, number][] = pathCoords;

        // Visual Logic per Mode
        if (segment.mode === 'Flight') {
            color = '#f97316'; 
            weight = 4;
            const start = pathCoords[0];
            const end = pathCoords[1];
            const numPoints = 100;
            const arcCoords: [number, number][] = [];
            for (let i = 0; i <= numPoints; i++) {
                const f = i / numPoints;
                const lat = start[0] + (end[0] - start[0]) * f;
                const lng = start[1] + (end[1] - start[1]) * f;
                const archHeight = Math.sin(Math.PI * f) * 12; 
                arcCoords.push([lat + archHeight, lng]);
            }
            finalPathCoords = arcCoords;
            L.polyline(arcCoords, { 
              color, 
              weight, 
              opacity: 0.9,
              lineJoin: 'round'
            }).addTo(map);
            
            const midIndex = Math.floor(arcCoords.length / 2);
            const mid = arcCoords[midIndex];
            
            // Plane Icon
            const planeIcon = L.divIcon({
              html: `<div class="text-orange-500 filter drop-shadow-lg"><svg style="transform: rotate(45deg);" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-1.1-.3-2.3.3-2.8 1.4-.5 1.1-.1 2.4 1 3.1l6.4 4.8-2.8 2.8-2.7-.7c-.7-.2-1.4.1-1.8.7l-.5.7c-.2.4-.2.8-.1 1.2s.4.7.9.8l3.3.7.7 3.3c.1.5.4.8.8.9s.8.1 1.2-.1l.7-.5c.6-.4.9-1.1.7-1.8l-.7-2.7 2.8-2.8 4.8 6.4c.7 1.1 2 1.5 3.1 1 1.1-.5 1.7-1.7 1.4-2.8z"/></svg></div>`,
              className: '',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            L.marker(mid, { icon: planeIcon }).addTo(map);

            const cleanName = (name: string) => {
              if (name.includes('Bengaluru')) return 'Bangalore';
              if (name.includes('Dubai Emirate')) return 'Dubai';
              return name.split(',')[0];
            };
            const routeText = `${cleanName(segment.from)} to ${cleanName(segment.to)}`;

            // Label
            const labelIcon = L.divIcon({
              html: `<div class="whitespace-nowrap"><p class="text-[11px] font-black tracking-widest text-[#f97316] uppercase filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Flight Route</p><p class="text-[9px] font-bold text-white uppercase tracking-tighter filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">${routeText}</p></div>`,
              className: '',
              iconSize: [120, 30],
              iconAnchor: [60, -20]
            });
            L.marker(mid, { icon: labelIcon }).addTo(map);

        } else if (segment.mode === 'Train') {
            color = '#cbd5e1'; 
            weight = 6;
            // Rail Background
            L.polyline(pathCoords, { color: '#1e293b', weight: weight + 2, opacity: 0.6 }).addTo(map);
            // Rail Track
            L.polyline(pathCoords, { color, weight, dashArray: '8, 12', opacity: 1 }).addTo(map);
            
            const mid = pathCoords[Math.floor(pathCoords.length / 2)];
            const trainIcon = L.divIcon({
                html: `<div class="text-white filter drop-shadow-md bg-slate-800 p-1.5 rounded-lg border-2 border-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15 3-3 3 3"/><path d="M11 22 8 18"/><path d="m13 22 3-4"/><path d="M14 18H8a4 4 0 0 1-4-4V8c0-3 2-5 5-5h6c3 0 5 2 5 5v6a4 4 0 0 1-4 4Z"/></svg></div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            L.marker(mid, { icon: trainIcon }).addTo(map);

            const labelIcon = L.divIcon({
                html: `<div class="whitespace-nowrap"><p class="text-[11px] font-black tracking-widest text-[#94a3b8] uppercase filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Railway Route</p></div>`,
                className: '',
                iconSize: [120, 20],
                iconAnchor: [60, 24]
            });
            L.marker(mid, { icon: labelIcon }).addTo(map);

        } else if (segment.mode === 'Bus') {
            color = '#facc15'; 
            weight = 10;
            // Bus Road Base
            L.polyline(pathCoords, { color: '#ca8a04', weight: weight + 2, opacity: 0.3 }).addTo(map);
            // Bus Route
            L.polyline(pathCoords, { color, weight, opacity: 0.9 }).addTo(map);
            // Dash center
            L.polyline(pathCoords, { color: '#ffffff', weight: 1.5, dashArray: '12, 12', opacity: 0.8 }).addTo(map);
            
            const mid = pathCoords[Math.floor(pathCoords.length / 2)];
            const busIcon = L.divIcon({
                html: `<div class="text-yellow-900 bg-yellow-400 p-1.5 rounded-xl border-2 border-yellow-200 shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="4" y="7" rx="2"/><path d="m9 17 3-3 3 3"/><path d="M11 22 8 18"/><path d="m13 22 3-4"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            L.marker(mid, { icon: busIcon }).addTo(map);

            const labelIcon = L.divIcon({
                html: `<div class="whitespace-nowrap"><p class="text-[11px] font-black tracking-widest text-yellow-400 uppercase filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Bus Route</p></div>`,
                className: '',
                iconSize: [120, 20],
                iconAnchor: [60, 24]
            });
            L.marker(mid, { icon: labelIcon }).addTo(map);

        } else if (segment.mode === 'Walking') {
            color = '#22c55e'; 
            weight = 5;
            // Walking Path (Dotted)
            L.polyline(pathCoords, { 
                color, 
                weight, 
                dashArray: '2, 10', 
                opacity: 0.9,
                lineCap: 'round'
            }).addTo(map);
            
            const mid = pathCoords[Math.floor(pathCoords.length / 2)];
            const walkIcon = L.divIcon({
                html: `<div class="text-white bg-green-600 p-1.5 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 16 3-3.6C5.5 11.5 6 11 7 11c1 0 1.5.5 2 1.4L12 16"/><path d="M11 6c1 0 1.5.5 2 1.4L16 11c1 0 1.5-.5 2-1.4L21 6"/></svg></div>`,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            L.marker(mid, { icon: walkIcon }).addTo(map);

            const labelIcon = L.divIcon({
                html: `<div class="whitespace-nowrap flex flex-col items-center"><p class="text-[10px] font-black tracking-widest text-green-400 uppercase filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Walking Trail</p></div>`,
                className: '',
                iconSize: [120, 20],
                iconAnchor: [60, 24]
            });
            L.marker(mid, { icon: labelIcon }).addTo(map);
        } else {
            L.polyline(pathCoords, { color, weight, opacity: 0.8 }).addTo(map);
        }
      });

      // Start/End Pins
      const safeRoute = route || [];
      if (safeRoute.length > 0 && safeRoute[0]?.coords?.[0] && safeRoute[safeRoute.length-1]?.coords?.[1]) {
          const first = safeRoute[0].coords[0];
          const last = safeRoute[safeRoute.length-1].coords[1];
          
          const startPin = L.divIcon({
              html: `<div class="flex flex-col items-center"><div class="px-2 py-1 bg-white rounded shadow-lg border border-slate-200 text-[9px] font-black uppercase mb-1">Start</div><div class="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-xl"></div></div>`,
              className: '',
              iconSize: [50, 40],
              iconAnchor: [25, 40]
          });
          L.marker(first, { icon: startPin }).addTo(map);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }

      mapInstanceRef.current = map;
    }
  }, [route]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 300);
    }
  }, [isFullscreen]);

  return (
    <div className={`transition-all duration-500 ease-in-out ${
      isFullscreen 
        ? "fixed inset-0 z-[10000] bg-slate-900" 
        : "w-full h-[275px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group animate-fade-in"
    }`}>
      <div ref={mapContainerRef} className="w-full h-full contrast-[1.1] brightness-[1.1] saturate-[1.1]" />
      
      {/* Control Elements */}
      <div className="absolute top-6 left-6 z-[1001] flex flex-col gap-4">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2">
            <button 
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-white/40 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-white"
                title="Zoom In"
            >
                <Plus size={20} />
            </button>
            <button 
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-white/40 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-white"
                title="Zoom Out"
            >
                <Minus size={20} />
            </button>
        </div>

        {/* Action Controls */}
        <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-white/40 dark:border-white/10 hover:bg-blue-600 hover:text-white transition-all text-slate-800 dark:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
        >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

    </div>
  );
});

const visaDocumentTypes = [
  { id: 'passport', label: 'Passport', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
  { id: 'id', label: 'ID', icon: User, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { id: 'photo', label: 'Photo', icon: ImageIcon, bg: 'bg-purple-50', color: 'text-purple-600' },
];

export const SmartPlan: React.FC<SmartPlanProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSave,
  initialPlan,
  onAddToWishlist,
  onRemoveFromWishlist,
  itinerary,
  initialDestination,
  isLoggedIn = false,
  onOpenAuthModal,
  userPreferences,
  userId,
  onUpdatePlan,
}) => {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [tripResult, setTripResult] = useState<DreamTripResult | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSection, setActiveSection] = useState<'planner' | 'city' | 'country'>('planner');
  const [visaFiles, setVisaFiles] = useState<File[]>([]);
  const visaFileInputRef = useRef<HTMLInputElement>(null);
  const routeMapRef = useRef<any>(null);

  // ── Feature 2: Replan state ──────────────────────────────────────────────
  const [replanTarget, setReplanTarget] = useState<{
    activity: ItineraryActivity;
    activityIndex: number;
    dayIndex: number;
  } | null>(null);

  const currency = CURRENCIES.find(c => c.code === userProfile.currency) || CURRENCIES[0];
  const [tripInput, setTripInput] = useState<DreamTripInput>({ 
    departureLocation: null, 
    destinationLocation: null, 
    startDate: '', 
    endDate: '', 
    budget: 200000, 
    travelers: 1, 
    theme: 'Relax',
    needsFlight: false,
    needsAccommodation: false,
    needsItinerary: false
  });

  const tabs = ['Overview'];
  if (tripInput.needsItinerary) tabs.push('Itinerary');
  tabs.push('Route');
  if (tripInput.needsAccommodation) tabs.push('Accommodation');
  if (tripInput.needsFlight) tabs.push('Visa');

  useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setTripResult(initialPlan);
        setStep('result');
        setActiveTab('Overview');
      } else {
        // Reset state for a fresh generation session
        setStep('input');
        setTripResult(null);
        setActiveTab('Overview');
        setVisaFiles([]);

        // Handle initial destination if provided
        if (initialDestination) {
          setTripInput(prev => ({
            ...prev,
            destinationLocation: initialDestination
          }));
        } else {
          setTripInput({ 
            departureLocation: null, 
            destinationLocation: null, 
            startDate: '', 
            endDate: '', 
            budget: 200000, 
            travelers: 1, 
            theme: 'Relax',
            needsFlight: false,
            needsAccommodation: false,
            needsItinerary: false
          });
        }
      }
    }
  }, [isOpen, initialPlan, initialDestination]);

  if (!isOpen) return null;

  // ── Feature 2: Apply replacement to local trip result state ──────────────
  const handleApplyReplan = (replacement: ItineraryActivity) => {
    if (!replanTarget || !tripResult) return;
    const { dayIndex, activityIndex } = replanTarget;

    const targetDay = tripResult.itinerary[dayIndex];
    const dayNumber = targetDay?.day ?? dayIndex + 1;

    const updatedActivities = targetDay.activities.map((act, aIdx) =>
      aIdx !== activityIndex ? act : {
        ...replacement,
        // Preserve icon type compatibility
        icon: (replacement.icon === 'food' || replacement.icon === 'travel' ? replacement.icon : 'activity') as 'food' | 'activity' | 'travel',
      }
    );

    const updatedItinerary = tripResult.itinerary.map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;
      return { ...day, activities: updatedActivities };
    });

    const updatedTrip: DreamTripResult = {
      ...tripResult,
      itinerary: updatedItinerary,
    };

    setTripResult(updatedTrip);
    setReplanTarget(null);

    // Notify parent to keep savedPlans updated
    if (onUpdatePlan) {
      onUpdatePlan(updatedTrip);
    }

    // Persist single affected day to database if user is authenticated and trip is saved
    if (userId && tripResult.id) {
      updateItineraryInDatabase(userId, tripResult.id, dayNumber, updatedActivities).catch(err => {
        console.warn('[SmartPlan] Error persisting replanned itinerary to DB:', err);
      });
    }
  };

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (!tripInput.destinationLocation || !tripInput.startDate || !tripInput.endDate) {
      alert("Please specify destination and dates.");
      return;
    }
    setStep('loading');
    try {
      const result = await generateDreamTrip(tripInput);
      setTripResult(result);
      setStep('result');
    } catch (error) { 
        console.error(error);
        setStep('input'); 
        alert("Generation failed."); 
    }
  };

  const handleVisaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setVisaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeVisaFile = (index: number) => {
    setVisaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportPlan = async () => {
    try {
      if (!tripResult) return;
      
      // Capture the map image if available
      let mapImage = null;
      if (routeMapRef.current) {
          try {
            mapImage = await routeMapRef.current.getMapImage();
          } catch (e) {
            console.error("Map capture failed", e);
          }
      }

      const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // BRAND COLORS
    const PURPLE = [147, 51, 234];
    const INDIGO = [79, 70, 229];
    const SLATE_DARK = [15, 23, 42];
    const SLATE_BODY = [51, 65, 85];
    const SLATE_LIGHT = [148, 163, 184];
    const EMERALD = [16, 185, 129];

    const addBrandHeader = () => {
      doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text("GOTRIP AI", margin, 25);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text("Your Ultimate Travel Dossier", margin, 33);
      y = 60;
    };

    const addPageHeader = (title: string) => {
      doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin, 20);
      y = 45;
    };

    const addText = (text: string, fontSize = 10, style = 'normal', color = SLATE_BODY, xOffset = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, 170 - xOffset);
      
      if (y + (lines.length * (fontSize * 0.5)) > 275) {
        doc.addPage();
        addPageHeader("CONTINUED");
      }
      
      doc.text(lines, margin + xOffset, y);
      y += (lines.length * (fontSize * 0.5)) + 4;
    };

    const addSectionHeader = (title: string) => {
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 190, y);
      y += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.text(title, margin, y);
      y += 8;
    };

    // PAGE 1: TRIP OVERVIEW & HIGHLIGHTS
    addBrandHeader();
    addText(tripResult.destination.toUpperCase(), 24, 'bold', SLATE_DARK);
    
    // From where to where
    const routeText = `${tripInput.departureLocation?.name || 'Your Location'} to ${tripResult.destination}`;
    addText(routeText, 14, 'bold', INDIGO);
    
    addText(`Dates: ${tripResult.dates}`, 11, 'normal', SLATE_BODY);
    addText(`${tripResult.travelers} Travelers • Theme: ${tripInput.theme}`, 11, 'normal', SLATE_LIGHT);
    y += 5;
    
    addSectionHeader("CURATED HIGHLIGHTS");
    tripResult.highlights.forEach((h, i) => {
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(margin - 2, y - 5, 174, 10, 1, 1, 'F');
      addText(`${i + 1}. ${h}`, 11, 'normal', SLATE_BODY, 5);
      y += 2;
    });

    // PAGE 2: FLIGHT LOGISTICS
    doc.addPage();
    addPageHeader("FLIGHT LOGISTICS");
    ['outbound', 'return'].forEach(type => {
      const f = tripResult.flights[type as keyof typeof tripResult.flights][0];
      if (f) {
        addSectionHeader(type.toUpperCase());
        doc.setFont('helvetica', 'bold');
        addText(`${f.airline} (${f.flightNumber})`, 12, 'bold', SLATE_DARK);
        addText(`${f.origin}  ---->  ${f.destination}`, 11, 'bold', SLATE_BODY);
        addText(`Boarding: ${f.departureTime} | Dropping: ${f.arrivalTime}`, 10, 'normal', SLATE_BODY);
        addText(`Duration: ${f.duration}`, 10, 'normal', SLATE_LIGHT);
        y += 5;
      }
    });

    // PAGE 3: ACCOMMODATION
    doc.addPage();
    addPageHeader("ACCOMMODATION");
    addText(tripResult.hotel.name, 18, 'bold', SLATE_DARK);
    addText(`Address: ${tripResult.hotel.address}`, 11, 'normal', SLATE_BODY);
    addText(`Rating: ${tripResult.hotel.rating} / 5 Stars`, 11, 'bold', [234, 179, 8]);
    
    // Google Maps Link
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tripResult.hotel.name + ' ' + tripResult.hotel.address)}`;
    doc.setTextColor(INDIGO[0], INDIGO[1], INDIGO[2]);
    doc.setFontSize(10);
    doc.text("View on Google Maps", margin, y);
    const linkWidth = doc.getTextWidth("View on Google Maps");
    doc.link(margin, y - 5, linkWidth, 7, { url: mapsUrl });
    y += 8;

    addSectionHeader("AMENITIES");
    tripResult.hotel.amenities.forEach(amenity => {
      addText(`• ${amenity}`, 10, 'normal', SLATE_BODY, 5);
    });
    y += 5;

    // PAGE: ROUTE DETAILS
    doc.addPage();
    addPageHeader("COMPLETE TRIP ROUTE");
    
    // Add the visual map if captured
    if (mapImage && mapImage.startsWith('data:image')) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin - 2, y - 5, 174, 110, 3, 3, 'F');
        doc.addImage(mapImage, 'JPEG', margin + 2, y, 166, 100);
        y += 110;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
        doc.text("Visual Map Representation", margin, y);
        y += 10;
    }

    (tripResult.route || []).forEach((segment, idx) => {
      if (y > 220) {
        doc.addPage();
        addPageHeader("COMPLETE TRIP ROUTE (CONTINUED)");
      }
      
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin - 2, y - 6, 174, 40, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(INDIGO[0], INDIGO[1], INDIGO[2]);
      doc.text(segment.mode.toUpperCase(), margin + 2, y);
      y += 6;

      addText(`From: ${segment.from}`, 11, 'bold', SLATE_DARK, 2);
      addText(`To: ${segment.to}`, 11, 'bold', SLATE_DARK, 2);
      addText(`Duration: ${segment.duration} ${segment.distance ? `| Distance: ${segment.distance}` : ''}`, 9, 'normal', SLATE_LIGHT, 2);
      y += 4;
    });

    // PAGE 4+: ITINERARY
    doc.addPage();
    addPageHeader("DAILY ITINERARY");
    tripResult.itinerary.forEach(day => {
      if (y > 240) {
        doc.addPage();
        addPageHeader("DAILY ITINERARY (CONTINUED)");
      }
      
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(margin - 2, y - 6, 174, 12, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(INDIGO[0], INDIGO[1], INDIGO[2]);
      doc.text(`DAY ${day.day}: ${day.title}`, margin + 2, y + 2);
      y += 10;
      addText(day.date, 10, 'italic', SLATE_LIGHT, 2);
      y += 2;

      day.activities.forEach(act => {
        addText(`[ ${act.time} ]  ${act.name}`, 11, 'bold', SLATE_DARK, 5);
        addText(act.description, 10, 'normal', SLATE_BODY, 15);
        y += 2;
      });
      y += 6;
    });

    // FOOTER & PAGINATION
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
      doc.text(`GOTRIP AI TRAVEL DOSSIER | Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`, 105, 285, { align: 'center' });
    }

    doc.save(`GoTripAI_Plan_${tripResult.destination.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Export Plan failed:", error);
      alert("There was an error generating your PDF. Please try again.");
    }
  };

  const handleViewSegmentOnMap = (segment: any) => {
    if (!tripResult) return;
    const origin = encodeURIComponent(segment.from + (segment.mode !== 'Flight' ? `, ${tripResult.destination}` : ''));
    const destination = encodeURIComponent(segment.to + (segment.mode !== 'Flight' ? `, ${tripResult.destination}` : ''));
    
    let travelmode = 'driving';
    if (segment.mode === 'Walking') travelmode = 'walking';
    if (['Train', 'Bus', 'Flight'].includes(segment.mode)) travelmode = 'transit';

    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelmode}`, '_blank');
  };

  const handleViewTripOnMap = () => {
    if (!tripResult) return;
    
    // We prefer using the Route data if available as it represents the travel path better than just activities
    const route = tripResult.route;
    
    if (!route || route.length === 0) {
      // Fallback to itinerary activities
      const activities = tripResult.itinerary.flatMap(day => day.activities);
      if (activities.length === 0) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tripResult.hotel.name + ' ' + tripResult.hotel.address)}`, '_blank');
        return;
      }

      const origin = tripInput.departureLocation 
        ? `${tripInput.departureLocation.lat},${tripInput.departureLocation.lng}`
        : encodeURIComponent(activities[0].name + ', ' + tripResult.destination);

      const destination = encodeURIComponent(tripResult.hotel.name + ' ' + tripResult.hotel.address);

      // Limit waypoints to ensure Google Maps can find them all and load correctly
      // Adding city name to help Google Maps find correct locations
      const waypoints = activities.slice(1, 10).map(act => 
        encodeURIComponent(act.name + ', ' + tripResult.destination)
      ).join('|');

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      window.open(url, '_blank');
      return;
    }

    // Better Visualization: Use the actual calculated route segments
    // Origin: The very first starting point
    const origin = encodeURIComponent(route[0].from + (route[0].mode !== 'Flight' ? `, ${tripResult.destination}` : ''));
    
    // Destination: The very last destination point
    const destination = encodeURIComponent(route[route.length - 1].to + (route[route.length - 1].mode !== 'Flight' ? `, ${tripResult.destination}` : ''));

    // Intermediates: Every point in between
    const intermediatePoints = route.slice(0, -1).map(seg => 
      encodeURIComponent(seg.to + (seg.mode !== 'Flight' ? `, ${tripResult.destination}` : ''))
    );
    
    // Google Maps supports up to 9 waypoints in the URL API for many users
    const waypoints = intermediatePoints.slice(0, 9).join('|');

    // Detect primary travel mode
    const hasFlight = route.some(r => r.mode === 'Flight');
    const travelmode = hasFlight ? 'transit' : 'driving';

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${travelmode}`;
    window.open(url, '_blank');
  };

  const navItems = [
      { id: 'planner', label: 'AI Planner', icon: Plane },
      { id: 'city', label: 'AI City Guide', icon: Sparkles },
      { id: 'country', label: 'AI Country Guide', icon: Database }
  ];

  const themeOptions: { id: TripTheme; icon: any }[] = [
    { id: 'Relax', icon: Palmtree }, 
    { id: 'Adventure', icon: Compass }, 
    { id: 'Romantic', icon: Heart }, 
    { id: 'Family', icon: Users },
  ];

  const isVisaRequired = tripResult?.visa?.required;
  const hasUploadedAllDocs = visaFiles.length >= visaDocumentTypes.length;
  const isBookingDisabled = isVisaRequired && !hasUploadedAllDocs;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-full md:h-[90vh] md:rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-scale-up">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-xl shadow-lg w-10 h-10 flex items-center justify-center border border-slate-100">
                    <img 
                      src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png" 
                      alt="GoTrip AI Logo" 
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">GoTrip AI Planner</h2>
                </div>
            </div>
            <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                <X size={28} />
            </button>
        </div>

        {/* Tab Selection */}
        <div className="flex px-4 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar shrink-0">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 transition-all font-black text-[11px] uppercase tracking-wider whitespace-nowrap border-b-4 ${
                        activeSection === item.id 
                        ? `bg-slate-50 dark:bg-slate-800/50 ${item.id === 'country' ? 'border-emerald-600 text-emerald-600' : 'border-[#4F46E5] text-[#4F46E5]'} rounded-t-xl` 
                        : 'border-transparent text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <item.icon size={16} strokeWidth={activeSection === item.id ? 3 : 2} />
                    {item.label}
                </button>
            ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-white dark:bg-slate-950 no-scrollbar overflow-x-hidden">
            {activeSection === 'planner' && (
                <div className="h-full">
                    {step === 'input' && (
                        <div className="p-5 space-y-4 animate-fade-in max-w-md mx-auto">
                            {/* Locations Group */}
                            <div className="space-y-3">
                                <MapPicker label="Departure City" value={tripInput.departureLocation} onChange={(loc) => setTripInput({...tripInput, departureLocation: loc})} />
                                <MapPicker label="Destination" value={tripInput.destinationLocation} onChange={(loc) => setTripInput({...tripInput, destinationLocation: loc})} />
                            </div>

                            {/* Dates Row */}
                            <div className="space-y-1.5">
                                <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">Travel Dates</h3>
                                <div className="bg-gray-50/50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center shadow-sm">
                                    <div className="flex-1 px-3 py-1.5 flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 opacity-60">Start</span>
                                        <input 
                                            type="date" 
                                            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none w-full cursor-pointer h-7" 
                                            value={tripInput.startDate} 
                                            onChange={(e) => setTripInput({...tripInput, startDate: e.target.value})} 
                                        />
                                    </div>
                                    <div className="px-2 text-[#CBD5E1]"><ArrowRight size={14} /></div>
                                    <div className="flex-1 px-3 py-1.5 flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 opacity-60">End</span>
                                        <input 
                                            type="date" 
                                            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none w-full cursor-pointer h-7" 
                                            value={tripInput.endDate} 
                                            onChange={(e) => setTripInput({...tripInput, endDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">Travelers</h3>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CBD5E1]" size={16} />
                                        <select 
                                            className="w-full pl-11 pr-8 py-3 bg-gray-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold text-slate-800 dark:text-slate-200 appearance-none shadow-sm h-[52px]" 
                                            value={tripInput.travelers} 
                                            onChange={(e) => setTripInput({...tripInput, travelers: parseInt(e.target.value)})}
                                        >
                                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Traveler{n > 1 ? 's' : ''}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBD5E1] pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">Budget</h3>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F46E5] font-black text-sm">{currency.symbol}</div>
                                        <input 
                                            type="number" 
                                            className="w-full pl-9 pr-12 py-3 bg-gray-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl outline-none text-sm font-black text-slate-800 dark:text-slate-200 shadow-sm h-[52px]" 
                                            value={tripInput.budget || ''} 
                                            onChange={(e) => setTripInput({...tripInput, budget: parseInt(e.target.value) || 0})} 
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                            <button onClick={() => setTripInput(prev => ({...prev, budget: prev.budget + 500}))} className="p-0.5 bg-white dark:bg-slate-800 rounded-md text-slate-400 hover:text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700"><Plus size={10} /></button>
                                            <button onClick={() => setTripInput(prev => ({...prev, budget: Math.max(0, prev.budget - 500)}))} className="p-0.5 bg-white dark:bg-slate-800 rounded-md text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 dark:border-slate-700"><Minus size={10} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Selection */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">Trip Theme</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {themeOptions.map((opt) => (
                                        <button 
                                            key={opt.id} 
                                            onClick={() => setTripInput({...tripInput, theme: opt.id})} 
                                            className={`py-3 px-1 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm h-[76px] ${tripInput.theme === opt.id ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]' : 'bg-gray-50/50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-[#94A3B8] hover:border-slate-300'}`}
                                        >
                                            <opt.icon size={20} strokeWidth={opt.id === tripInput.theme ? 3 : 2} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{opt.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Needs Selection */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest pl-1">Needs</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div 
                                            onClick={() => setTripInput(prev => ({ ...prev, needsItinerary: !prev.needsItinerary }))}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${tripInput.needsItinerary ? 'bg-blue-600 border-blue-600 outline-none' : 'bg-transparent border-blue-200'}`}
                                        >
                                            {tripInput.needsItinerary && <Check size={16} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="flex items-center gap-2" onClick={() => setTripInput(prev => ({ ...prev, needsItinerary: !prev.needsItinerary }))}>
                                            <span className="font-bold text-[#1E293B] dark:text-white text-lg">Itinerary</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div 
                                            onClick={() => setTripInput(prev => ({ ...prev, needsFlight: !prev.needsFlight }))}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${tripInput.needsFlight ? 'bg-blue-600 border-blue-600 outline-none' : 'bg-transparent border-blue-200'}`}
                                        >
                                            {tripInput.needsFlight && <Check size={16} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="flex items-center gap-2" onClick={() => setTripInput(prev => ({ ...prev, needsFlight: !prev.needsFlight }))}>
                                            <span className="font-bold text-[#1E293B] dark:text-white text-lg">Book Flight</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div 
                                            onClick={() => setTripInput(prev => ({ ...prev, needsAccommodation: !prev.needsAccommodation }))}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${tripInput.needsAccommodation ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-blue-200'}`}
                                        >
                                            {tripInput.needsAccommodation && <Check size={16} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span onClick={() => setTripInput(prev => ({ ...prev, needsAccommodation: !prev.needsAccommodation }))} className="font-bold text-[#1E293B] dark:text-white text-lg">Book Accommodation</span>
                                    </label>
                                </div>
                            </div>

                            {/* Main CTA */}
                            <div className="pt-2">
                                <button 
                                    onClick={handleGenerate} 
                                    className="w-full h-[55px] bg-[#9333EA] hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Sparkles size={24} className="fill-current" /> Generate Plan
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in bg-slate-50 dark:bg-slate-950">
                            <div className="relative">
                                <div className="w-32 h-32 border-[6px] border-blue-50 dark:border-slate-800 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-32 h-32 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <Compass className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={48} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Analyzing Destinations</h3>
                                <p className="text-[#94A3B8] font-black uppercase tracking-[0.3em] text-[10px]">Accessing global travel servers...</p>
                            </div>
                        </div>
                    )}

                    {step === 'result' && tripResult && (
                        <div className="flex flex-col h-full animate-fade-in bg-white dark:bg-slate-950">
                            <div className="px-6 pt-3 pb-0 shrink-0">
                                <div className="flex flex-col gap-1 mb-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tighter leading-tight">{tripResult.destination}</h1>
                                        <span className="px-2 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-md text-[9px] font-black uppercase tracking-wider">{tripInput.theme} TRIP</span>
                                    </div>
                                    <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">{tripResult.dates} • {tripResult.travelers} Travelers</p>
                                </div>
                                <div className="flex flex-col gap-0 mb-2">
                                    <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest">TOTAL EST. COST</p>
                                    <p className="text-4xl font-black text-[#10B981] leading-none">{formatCurrency(tripResult.totalEstimatedCost, userProfile.currency)}</p>
                                </div>
                                <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                                    {tabs.map(tab => (
                                        <button 
                                          key={tab} 
                                          onClick={() => setActiveTab(tab)} 
                                          className={`pb-3 text-sm font-black transition-all whitespace-nowrap border-b-2 ${activeTab === tab ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'}`}
                                        >
                                          {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex-1 p-0 bg-slate-50 dark:bg-slate-900/30 overflow-y-auto no-scrollbar overflow-x-hidden relative">
                                 {/* Route Tab (Mounted for Capture) */}
                                 <div className={activeTab === 'Route' ? 'flex flex-col h-full animate-fade-in' : 'opacity-0 absolute pointer-events-none w-full h-full'}>
                                     {tripResult && (
                                         <div className="max-w-3xl mx-auto space-y-6 pb-24 p-6 no-scrollbar overflow-y-auto h-full w-full">
                                             <RouteMap ref={routeMapRef} route={tripResult.route || []} />
                                             
                                             <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                                                 <div className="flex items-center justify-between">
                                                     <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                         <Navigation className="text-blue-600" size={20} /> Complete Trip Route
                                                     </h3>
                                                     <button 
                                                         onClick={handleViewTripOnMap}
                                                         className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                     >
                                                         <ExternalLink size={18} />
                                                     </button>
                                                 </div>
                                                 
                                                 <div className="relative pt-2 pb-2">
                                                     <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                                                     
                                                     <div className="space-y-8 relative">
                                                         {tripResult.route && tripResult.route.length > 0 ? (
                                                          tripResult.route.map((segment, idx) => {
                                                             const ModeIcon = {
                                                                 'Flight': Plane,
                                                                 'Car': Car,
                                                                 'Bus': Bus,
                                                                 'Train': Train,
                                                                 'Walking': Footprints
                                                             }[segment.mode] || Compass;

                                                             return (
                                                                 <div key={idx} className="flex gap-6 items-start">
                                                                     <div className="relative z-10">
                                                                         <div className="w-[44px] h-[44px] bg-white dark:bg-slate-900 rounded-2xl border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center text-blue-600 shadow-xl">
                                                                             <ModeIcon size={18} />
                                                                         </div>
                                                                     </div>
                                                                     <div className="flex-1 space-y-1 bg-white dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md relative group/card">
                                                                         <div className="flex justify-between items-start gap-2">
                                                                             <div className="min-w-0">
                                                                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{segment.mode}</p>
                                                                                 <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{segment.from}</p>
                                                                             </div>
                                                                             <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                                                                 <div className="flex flex-col items-end">
                                                                                     <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{segment.duration}</p>
                                                                                     {segment.distance && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{segment.distance}</p>}
                                                                                 </div>
                                                                                 <button 
                                                                                     onClick={() => handleViewSegmentOnMap(segment)}
                                                                                     className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/card:opacity-100"
                                                                                     title="View this segment on Map"
                                                                                 >
                                                                                     <MapIcon size={14} />
                                                                                 </button>
                                                                             </div>
                                                                         </div>
                                                                         <div className="pt-2 flex items-center gap-2">
                                                                             <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                                                                             <ArrowRight size={10} className="text-slate-300" />
                                                                             <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                                                                         </div>
                                                                         <div className="pt-1">
                                                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5 leading-none mb-1">Destination</p>
                                                                             <p className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate">{segment.to}</p>
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                             );
                                                         })
                                                     ) : (
                                                         <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                             <Compass size={24} className="text-blue-500 mx-auto mb-1.5 opacity-60" />
                                                             <p className="font-bold text-xs text-slate-700 dark:text-slate-300">Route segments are calculated automatically from itinerary waypoints.</p>
                                                             <p className="text-[10px] text-slate-400 mt-0.5">Use "View Full Route in Google Maps" below for live turn-by-turn navigation.</p>
                                                         </div>
                                                     )}
                                                     </div>
                                                 </div>
                                                 
                                                 <button 
                                                     onClick={handleViewTripOnMap}
                                                     className="w-full h-[55px] bg-[#EEF2FF] dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-600 hover:text-white group border border-blue-100 dark:border-blue-900/30"
                                                 >
                                                     <MapIcon size={20} className="group-hover:rotate-12 transition-transform" /> View Full Route in Google Maps
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>

                                 {/* Other Tabs */}
                                 <div className={activeTab === 'Route' ? 'hidden' : 'h-full w-full'}>
                                     {activeTab === 'Overview' && (
                                    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in pb-24 p-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Sparkles className="text-[#EAB308] fill-current" size={20} /> Curated Highlights
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(tripResult.highlights || []).map((h, i) => (
                                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-[1rem] flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                                                        <span className="text-xs font-bold text-[#475569] dark:text-slate-300 leading-tight">{h}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                            {tripInput.needsFlight && (
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                        <Plane className="text-[#4F46E5]" size={20} /> Flight Summary
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {['outbound', 'return'].map((type, i) => {
                                                        const flight = tripResult.flights[type as keyof typeof tripResult.flights][0];
                                                        if (!flight) return null;
                                                        const isOutbound = type === 'outbound';
                                                        
                                                        return (
                                                            <div key={type} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 border-slate-800 relative overflow-hidden">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                    <img src={flight.logo} alt="Logo" className="w-full h-full object-contain" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-base text-slate-900 dark:text-white leading-none">{flight.airline}</h4>
                                                                    <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{flight.flightNumber}</p>
                                                                </div>
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${isOutbound ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
                                                                {type}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between relative mb-2 px-2">
                                                                <div className="z-10 bg-slate-50 dark:bg-slate-900 pr-4">
                                                                <p className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tighter">{flight.origin}</p>
                                                                </div>
                                                                
                                                                <div className="flex-1 relative flex flex-col items-center">
                                                                <div className="w-full h-[2px] border-t-2 border-dashed border-gray-300 relative flex items-center justify-center">
                                                                    <div className="absolute left-0 -top-[3px] w-2 h-2 rounded-full bg-gray-300" />
                                                                    <Plane size={14} className="text-gray-300 absolute bg-slate-50 dark:bg-slate-900 px-0.5" />
                                                                    <div className="absolute right-0 -top-[3px] w-2 h-2 rounded-full bg-gray-300" />
                                                                </div>
                                                                <div className="mt-4 px-3 py-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full shadow-sm">
                                                                    <p className="text-[10px] font-black text-gray-400 whitespace-nowrap">Duration: {flight.duration}</p>
                                                                </div>
                                                                </div>

                                                                <div className="z-10 bg-slate-50 dark:bg-slate-900 pl-4 text-right">
                                                                <p className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tighter">{flight.destination}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center mt-2 px-1">
                                                                <div>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Boarding</p>
                                                                <p className="text-base font-black text-[#4F46E5]">{flight.departureTime}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Dropping</p>
                                                                <p className="text-base font-black text-[#4F46E5]">{flight.arrivalTime}</p>
                                                                </div>
                                                            </div>
                                                            </div>
                                                        );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons Section */}
                                        <div className="pt-2 space-y-2">
                                            {/* Confirm and Book Button */}
                                            <button 
                                                onClick={() => { onSave(tripResult); onClose(); }} 
                                                className="w-full h-[55px] bg-[#9333EA] hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
                                            >
                                                <Sparkles size={24} className="fill-current" /> Confirm and Book
                                            </button>
                                            
                                            {/* Export Plan Button */}
                                            <button 
                                                onClick={handleExportPlan} 
                                                className="w-full h-[55px] bg-[#9333EA] hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
                                            >
                                                <FileText size={24} /> Export Plan
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Itinerary' && (
                                    <div className="max-w-3xl mx-auto space-y-4 pb-24 p-4">
                                        {(tripResult.itinerary || []).map((day, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50 dark:border-slate-700">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">Day {day.day}: {day.title}</h4>
                                                        <p className="text-[11px] font-bold text-[#4F46E5] uppercase mt-0.5">{day.date}</p>
                                                    </div>
                                                    <div className="bg-[#EEF2FF] p-2.5 rounded-xl text-[#4F46E5]"><Calendar size={20} /></div>
                                                </div>
                                                <div className="space-y-3">
                                                    {(day.activities || []).map((act, j) => {
                                                        const isReplanned = !!(act as any).isReplanned;
                                                        return (
                                                            <div key={`${day.day || i}-${j}`} className={`flex gap-4 p-4 rounded-[1.25rem] relative transition-all ${isReplanned ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800'}`}>
                                                                <div className="text-[#4F46E5] font-black text-[10px] uppercase tracking-widest pt-1 w-16 shrink-0">{act.time}</div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                                                <p className="font-black text-sm text-[#1E293B] dark:text-white leading-snug">{act.name}</p>
                                                                                {isReplanned && (
                                                                                    <span className="inline-block text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                                                                                        ✓ Replanned
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed mt-0.5">{act.description}</p>
                                                                        </div>
                                                                        {/* Clear, always-visible Replan action button for EVERY activity */}
                                                                        <button
                                                                            onClick={() => setReplanTarget({
                                                                                activity: act as ItineraryActivity,
                                                                                activityIndex: j,
                                                                                dayIndex: i,
                                                                            })}
                                                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/25 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700/60 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                                                                            title="Can't visit this stop? Click to replan with AI"
                                                                        >
                                                                            <RefreshCw size={13} className="text-amber-600 dark:text-amber-400" />
                                                                            <span>Replan</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}



                                {activeTab === 'Accommodation' && (
                                    <div className="animate-fade-in bg-white dark:bg-slate-950 pb-24">
                                        <div className="relative h-64 md:h-80 w-full overflow-hidden">
                                            <img src={tripResult.hotel.image} className="w-full h-full object-cover" alt="Hotel" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-2">{tripResult.hotel.name}</h1>
                                                <div className="flex items-center gap-2 font-bold text-sm opacity-90">
                                                    <span>Hotel</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">{tripResult.hotel.rating} Stars <Star size={14} className="fill-yellow-400 text-yellow-400" /></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 py-6 space-y-6">
                                            <section className="space-y-3">
                                                <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">About this place</h2>
                                                <p className="text-[#64748B] dark:text-gray-400 text-lg font-medium leading-relaxed">
                                                    Experience world-class service and comfort at {tripResult.hotel.name}. Located perfectly for exploring the city, this hotel offers exceptional amenities and a unique atmosphere.
                                                </p>
                                            </section>

                                            <section className="space-y-4">
                                                <h2 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">Amenities</h2>
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B]"><Bed size={20} /></div>
                                                        <span className="text-base font-bold text-[#1E293B] dark:text-slate-300 leading-tight">Luxury Rooms</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B]"><Utensils size={20} /></div>
                                                        <span className="text-base font-bold text-[#1E293B] dark:text-slate-300 leading-tight">Breakfast Included</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B]"><Wifi size={20} /></div>
                                                        <span className="text-base font-bold text-[#1E293B] dark:text-slate-300 leading-tight">Free Wifi</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B]"><Compass size={20} /></div>
                                                        <span className="text-base font-bold text-[#1E293B] dark:text-slate-300 leading-tight">City Center</span>
                                                    </div>
                                                </div>
                                            </section>

                                            <div className="bg-[#EFF6FF] dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-white dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200 shadow-sm"><Users size={18} /></div>
                                                <span className="font-bold text-blue-800 dark:text-blue-300">Approx. {formatCurrency(tripResult.hotel.pricePerNight, userProfile.currency)} / person</span>
                                            </div>

                                            <section className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ready to book?</h2>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-[#64748B] dark:text-gray-400">Check-in</span>
                                                        <span className="font-black text-[#1E293B] dark:text-white">3:00 PM</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-[#64748B] dark:text-gray-400">Check-out</span>
                                                        <span className="font-black text-[#1E293B] dark:text-white">11:00 AM</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 space-y-3">
                                                    <button 
                                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tripResult.hotel.name + ' ' + tripResult.hotel.address)}`, '_blank')}
                                                        className="w-full h-[55px] bg-[#9333EA] hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                                    >
                                                        <MapIcon size={22} /> View on Map
                                                    </button>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Visa' && (
                                    <div className="max-w-md mx-auto space-y-4 pb-24 p-6">
                                        <div className="space-y-3">
                                            {visaDocumentTypes.map((doc, idx) => {
                                                const isThisTypeUploaded = visaFiles.length > idx;
                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm transition-all hover:border-blue-100 group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-11 h-11 ${doc.bg} dark:bg-slate-700 rounded-xl flex items-center justify-center ${doc.color} shadow-sm`}>
                                                                {isThisTypeUploaded ? <Check size={22} className="text-emerald-500" /> : <doc.icon size={22} />}
                                                            </div>
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{doc.label}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => visaFileInputRef.current?.click()}
                                                            className="flex items-center gap-1.5 px-5 py-2 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-50 dark:border-blue-900/30"
                                                        >
                                                            {isThisTypeUploaded ? 'Uploaded' : 'Upload'} <Upload size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 pt-4">
                                            <input 
                                              type="file" 
                                              multiple 
                                              ref={visaFileInputRef}
                                              className="hidden" 
                                              onChange={handleVisaFileChange}
                                            />
                                            <button 
                                              onClick={() => visaFileInputRef.current?.click()}
                                              className="w-full h-[55px] bg-[#9333EA] text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
                                            >
                                              <FileText size={24} /> Upload All Documents
                                            </button>
                                        </div>

                                        {visaFiles.length > 0 && (
                                            <div className="mt-8 space-y-2 animate-fade-in">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Selected Files</h5>
                                                {visaFiles.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                                                                <File size={16} />
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{file.name}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeVisaFile(idx)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeSection === 'city' && (
                <div className="p-4 h-full animate-fade-in bg-white dark:bg-slate-950 no-scrollbar">
                    <CityGuideSection onAddToWishlist={onAddToWishlist} onRemoveFromWishlist={onRemoveFromWishlist} itinerary={itinerary} />
                </div>
            )}

            {activeSection === 'country' && (
                <div className="p-4 h-full animate-fade-in bg-white dark:bg-slate-950 no-scrollbar">
                    <CountryGuideSection onAddToWishlist={onAddToWishlist} onRemoveFromWishlist={onRemoveFromWishlist} itinerary={itinerary} />
                </div>
            )}
        </div>
      </div>

      {/* Feature 2: Dynamic Trip Replanning Modal */}
      {replanTarget && tripResult && (
        <ReplanModal
          isOpen={!!replanTarget}
          onClose={() => setReplanTarget(null)}
          activity={replanTarget.activity}
          activityIndex={replanTarget.activityIndex}
          dayNumber={tripResult.itinerary[replanTarget.dayIndex]?.day ?? replanTarget.dayIndex + 1}
          dayActivities={(tripResult.itinerary[replanTarget.dayIndex]?.activities as ItineraryActivity[]) ?? []}
          destination={tripResult.destination}
          dates={tripResult.dates}
          budget={tripInput.budget || tripResult.totalEstimatedCost}
          theme={tripInput.theme}
          userPreferences={userPreferences}
          userId={userId}
          onApply={handleApplyReplan}
          currencySymbol={currency.symbol}
        />
      )}
    </div>
  );
};
