import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Camera, Mic, Trash2, Upload, Aperture, Sparkles, BrainCircuit, ExternalLink, ChevronRight, Search, Globe, MapPin, Coffee, ArrowRight, CheckCheck, HelpCircle } from 'lucide-react';
import { getTravelChatResponse, getTravelChatStream } from '../services/geminiService';
import { ChatMessage, Source } from '../types';
import { SettingsModal, CameraModal } from './Modals';
import { getTranslation } from '../services/data';

interface AIChatProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenSmartPlan: () => void;
  language?: string;
  currentRoute?: string;
  isLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  isOpen,
  setIsOpen,
  onOpenSmartPlan,
  language = 'English',
  currentRoute,
  isLoggedIn = false,
  onOpenAuthModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => getTranslation(language, key);

  // Get current month name dynamically
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  const STARTER_PROMPTS = [
    { icon: HelpCircle, text: language === 'Kannada' ? "ಈ ಆ್ಯಪ್ ಬಳಸುವುದು ಹೇಗೆ?" : "How to use this app?" },
    { icon: Globe, text: language === 'Kannada' ? "ಈ ತಿಂಗಳಲ್ಲಿ ಭೇಟಿ ನೀಡಲು ಉತ್ತಮ ಸ್ಥಳಗಳು?" : `Best places to visit in ${currentMonth}?` },
    { icon: MapPin, text: language === 'Kannada' ? "ಟೋಕಿಯೊಗೆ 3 ದಿನಗಳ ಪ್ರವಾಸ" : "3-day itinerary for Tokyo" },
  ];

  useEffect(() => { 
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (lastMessage?.role === 'model') {
      // When model responds, scroll to the top of its message so user sees the start
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  useEffect(() => {
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    if (selectedImage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedImage]);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
            (error) => console.log("Location error:", error)
        );
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCameraMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowCameraMenu(false);
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow re-selecting the same file if removed
    e.target.value = '';
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async (textOverride?: string) => {
    const userMsgText = typeof textOverride === 'string' ? textOverride : input;
    const userImage = selectedImage;
    if ((!userMsgText.trim() && !userImage) || loading) return;

    if (!isLoggedIn) {
      const newUserMsg: ChatMessage = { role: 'user', text: userMsgText, image: userImage || undefined, timestamp: Date.now() };
      const authRequiredMsg: ChatMessage = {
        role: 'model',
        text: 'Please log in to use GoTrip AI.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newUserMsg, authRequiredMsg]);
      setInput('');
      setSelectedImage(null);
      return;
    }
    
    // Abort any existing active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const newUserMsg: ChatMessage = { role: 'user', text: userMsgText, image: userImage || undefined, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);
    
    const modelPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelPlaceholder]);
    
    try {
      const result = await getTravelChatStream(
        [...messages, newUserMsg].slice(-10), 
        userMsgText || "Analyze", 
        userImage || undefined, 
        userLocation, 
        language
      );
      
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
          lastMsg.text = result.text;
          lastMsg.sources = result.sources;
          lastMsg.relatedQuestions = result.relatedQuestions;
        }
        return updated;
      });
    } catch (error: any) { 
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
          lastMsg.text = error?.userMessage || "GoTrip AI is handling high request traffic or limit reached. Please wait a moment and try again.";
        }
        return updated;
      });
    } finally { 
      setLoading(false); 
      abortControllerRef.current = null;
    }
  };

  if (!isOpen) {
    // Only show trigger buttons on the home page
    if (currentRoute !== 'home') return null;
    
    return (
      <div 
        className="fixed bottom-20 right-4 md:bottom-12 md:right-12 flex flex-col gap-2.5 items-end z-50"
        style={{ width: '76.7639px', height: '104.7778px' }}
      >
        {/* Compressed pill-shaped AI button */}
        <button 
          onClick={onOpenSmartPlan} 
          className="group flex items-center bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] p-0.5 border border-gray-100 dark:border-slate-700 transition-all hover:scale-105 active:scale-95"
        >
          <span className="px-3 font-black text-[#4F46E5] dark:text-indigo-400 tracking-tighter text-sm">AI</span>
          <div className="w-8 h-8 bg-gradient-to-br from-[#9333EA] to-[#7C3AED] rounded-full flex items-center justify-center text-white shadow-inner">
            <Sparkles size={14} className="fill-current" />
          </div>
        </button>

        {/* Compressed circular Chat button */}
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-[52px] h-[52px] bg-[#2563EB] hover:bg-blue-700 text-white rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        >
          <MessageCircle size={24} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-full max-w-[90vw] md:w-[340px] h-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 rounded-lg shadow-sm"><BrainCircuit size={18} className="text-white" /></div>
          <div><h3 className="font-bold text-slate-800 dark:text-white leading-none text-sm">Pro Assistant</h3><p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('generated_by')}</p></div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 rounded-full text-gray-500"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6"><Search size={32} className="text-blue-500 opacity-80" /></div>
              <div className="grid grid-cols-1 gap-3 w-full max-w-[300px]">
                 {STARTER_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => handleSend(p.text)} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-700 transition-all text-left">
                       <p.icon size={16} className="text-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{p.text}</span>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {messages.map((m, i) => (
          <div 
            key={i} 
            ref={i === messages.length - 1 ? lastMessageRef : null}
            className={`flex flex-col mb-6 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {m.role === 'user' ? (
               <div className="bg-gray-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl rounded-br-none max-w-[85%] text-slate-800 dark:text-slate-200 text-sm border border-transparent dark:border-slate-700">
                  {m.image && <img src={m.image} alt="User" className="mb-2 rounded-lg max-h-40 object-cover w-full" />}
                  <div>{m.text}</div>
               </div>
            ) : (
              <div className="w-full space-y-3">
                 {m.sources && m.sources.length > 0 && (
                    <div>
                       <div className="flex items-center gap-2 mb-2"><BrainCircuit size={14} className="text-blue-600" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('chat_sources')}</span></div>
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {m.sources.map((src, idx) => (
                             <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="flex-shrink-0 w-36 p-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg group h-20 flex flex-col justify-between overflow-hidden">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{src.title}</p>
                                <span className="text-[9px] text-gray-400 truncate">{new URL(src.uri).hostname}</span>
                             </a>
                          ))}
                       </div>
                    </div>
                 )}
                 <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                 </div>

                 {m.text.includes('Please log in to use GoTrip AI.') && onOpenAuthModal && (
                   <div className="mt-3 p-3 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl flex flex-col gap-2">
                     <p className="text-xs text-blue-900 dark:text-blue-200 font-semibold">
                       Log in to unlock AI travel assistance with GoTrip AI.
                     </p>
                     <button
                       onClick={onOpenAuthModal}
                       className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all self-start"
                     >
                       Log In / Sign Up
                     </button>
                   </div>
                 )}

                 {m.relatedQuestions && m.relatedQuestions.length > 0 && (
                    <div className="pt-1">
                       <div className="flex items-center gap-2 mb-2"><Sparkles size={14} className="text-orange-500" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('chat_related')}</span></div>
                       <div className="flex flex-col gap-2">
                          {m.relatedQuestions.map((q, idx) => (
                             <button key={idx} onClick={() => handleSend(q)} className="flex items-center justify-between text-left p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 transition-colors group">
                                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-700">{q}</span>
                                <ArrowRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                             </button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
            )}
          </div>
        ))} 
        {loading && (
          <div className="flex items-start gap-3 mt-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0"><BrainCircuit size={16} className="animate-pulse" /></div>
             <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700 flex items-center gap-2">
                 <div className="flex space-x-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div></div>
                 <span className="text-xs text-gray-500 font-medium">{t('thinking')}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0 relative">
        {selectedImage && (
          <div className="absolute bottom-full left-0 right-0 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-fade-in-up border-t border-gray-100 dark:border-slate-800">
            <div className="relative inline-block">
              <img src={selectedImage} alt="Selected" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500 shadow-md" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-[2.5rem] px-2 py-2 border border-gray-200 dark:border-slate-700">
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowCameraMenu(!showCameraMenu)} 
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${showCameraMenu ? 'bg-blue-100 text-blue-600' : 'bg-[#EFF6FF] text-blue-600 hover:bg-blue-100'}`}
              title="Camera Options"
            >
              <Camera size={20} />
            </button>
            
            {showCameraMenu && (
              <div className="absolute bottom-full left-0 mb-4 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-slate-700 overflow-hidden animate-scale-up origin-bottom-left z-[60]">
                <div className="flex flex-col">
                  <button 
                    onClick={() => {
                      setIsCameraOpen(true);
                      setShowCameraMenu(false);
                    }} 
                    className="flex items-center gap-3.5 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left group"
                  >
                    <div className="text-blue-600 group-hover:scale-110 transition-transform">
                      <Aperture size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Take Photo</span>
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-slate-700 mx-3" />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-3.5 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left group"
                  >
                    <div className="text-[#10B981] group-hover:scale-110 transition-transform">
                      <Upload size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Upload</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Standard upload input for system storage */}
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
            placeholder={t('search_placeholder')} 
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none py-2 min-w-0 font-medium placeholder-gray-400" 
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || (!input.trim() && !selectedImage)} 
            className="bg-[#2563EB] hover:bg-blue-700 text-white w-10 h-10 rounded-full disabled:opacity-50 transition-transform active:scale-90 flex items-center justify-center shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(img) => setSelectedImage(img)} 
        language={language} 
      />
    </div>
  );
};