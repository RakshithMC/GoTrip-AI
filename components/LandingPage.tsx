import React, { useState } from 'react';
import { 
  Sparkles, Compass, MapPin, Calendar, Briefcase, Phone, ArrowRight, 
  CheckCircle2, Globe, Search, ShieldCheck, Heart, Users, BrainCircuit,
  Plane, Utensils, Hotel, Menu, X, ChevronRight, Layers, Star
} from 'lucide-react';

interface LandingPageProps {
  onStartPlanning: () => void;
  onLoginClick: () => void;
  onExploreClick: () => void;
  openEmergency: () => void;
  isAuthenticated: boolean;
  onGoToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onLoginClick,
  onExploreClick,
  openEmergency,
  isAuthenticated,
  onGoToApp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* PUBLIC NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png" 
              alt="GoTrip AI Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-black tracking-tight text-slate-900">GoTrip AI</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('ai-spotlight')} 
              className="hover:text-blue-600 transition-colors"
            >
              AI Features
            </button>
            <button 
              onClick={openEmergency} 
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              <Phone size={14} /> Emergency
            </button>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Log In
            </button>

            {isAuthenticated && (
              <button
                onClick={onGoToApp}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-sm rounded-full transition-all flex items-center gap-2"
              >
                Go to Application <ArrowRight size={16} />
              </button>
            )}

            <button
              onClick={onStartPlanning}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-4 shadow-xl animate-fade-in">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 text-slate-700 font-bold hover:text-blue-600"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left py-2 text-slate-700 font-bold hover:text-blue-600"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('ai-spotlight')} 
              className="block w-full text-left py-2 text-slate-700 font-bold hover:text-blue-600"
            >
              AI Features
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); openEmergency(); }} 
              className="flex items-center gap-2 w-full text-left py-2 text-red-600 font-bold"
            >
              <Phone size={16} /> Emergency Assistance
            </button>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                className="w-full py-3 bg-slate-100 text-slate-800 font-bold rounded-xl text-center border border-slate-200"
              >
                Log In
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onGoToApp(); }}
                  className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl text-center shadow-md flex items-center justify-center gap-2"
                >
                  Go to Application <ArrowRight size={16} />
                </button>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); onStartPlanning(); }}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-center shadow-md flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/80 via-indigo-50/20 to-slate-50">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/60 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-200/60 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles size={14} className="fill-current text-blue-600" /> Next-Gen AI Travel Platform
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                GoTrip AI
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 mt-2">
                  Your AI-Powered Travel Companion
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover destinations, build personalized itineraries, plan your budget, and travel smarter with AI.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onStartPlanning}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-full shadow-xl shadow-blue-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Start Planning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-xs font-semibold border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" /> Instant Itineraries
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" /> Multi-User Protected
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" /> 24/7 AI Assistant
                </div>
              </div>
            </div>

            {/* Hero Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-900/10 bg-white p-4">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                    alt="Paris Travel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-600 rounded-full shadow-sm">
                      Featured AI Itinerary
                    </span>
                    <h3 className="text-xl font-extrabold mt-1 text-white">Paris 3-Day Trip Dossier</h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-blue-400" /> Paris, France • €1,850 Estimated
                    </p>
                  </div>
                </div>

                <div className="space-y-3 px-2 pb-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BrainCircuit size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">AI Smart Routing Active</p>
                      <p className="text-[10px] text-slate-500">Eiffel Tower → Louvre Museum → Seine Cruise</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 pt-1">
                    <span>Generated in 1.4 seconds</span>
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline" onClick={onStartPlanning}>
                      Explore Preview <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY GOTRIP AI / FEATURES SECTION */}
      <section id="features" className="py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why GoTrip AI?</h2>
            <p className="text-3xl md:text-4xl font-black text-slate-900">
              Everything You Need for Smarter Travel
            </p>
            <p className="text-sm text-slate-600">
              Powerful artificial intelligence tailored to make every aspect of your journey seamless, budget-friendly, and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Trip Planner</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate personalized travel itineraries based on destination, travel dates, budget targets, and personal themes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Travel Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask travel questions, upload landmark images, and receive real-time localized guidance and answers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-purple-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Explore</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover top tourist attractions, hidden gems, local restaurants, and luxury accommodations across the globe.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Budget Planning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculate estimated trip expenses, accommodation costs, and activity budgets with multi-currency support.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-amber-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Trip Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save, organize, and export your trip itineraries to PDF or share dossiers with your travel companions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-red-300 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Emergency Assistance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant access to 24/7 country-specific emergency police, medical, and embassy hotline information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Simple & Fast</h2>
            <p className="text-3xl md:text-4xl font-black text-slate-900">How GoTrip AI Works</p>
            <p className="text-sm text-slate-600">
              Four simple steps to transform your trip ideas into a complete, hassle-free travel plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-4xl font-black text-blue-600/30">01</div>
              <h4 className="text-lg font-bold text-slate-900">Choose Destination</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your target city or country anywhere in the world.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-4xl font-black text-indigo-600/30">02</div>
              <h4 className="text-lg font-bold text-slate-900">Tell Preferences</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specify travel dates, budget limits, number of travelers, and theme.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-4xl font-black text-purple-600/30">03</div>
              <h4 className="text-lg font-bold text-slate-900">Generate Itinerary</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                GoTrip AI generates day-by-day activities, routes, and hotel picks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-4xl font-black text-emerald-600/30">04</div>
              <h4 className="text-lg font-bold text-slate-900">Save & Travel</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save your dossier, export to PDF, and enjoy a stress-free trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI SPOTLIGHT SECTION */}
      <section id="ai-spotlight" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <BrainCircuit size={14} /> AI Assistant Spotlight
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Ask Anything. Get Multimodal Answers.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you need advice on local dining, historical background of a monument, or quick translation help, GoTrip AI Assistant responds in real time.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Upload photos of landmarks for instant identification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Local weather and travel safety recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Multi-language conversational AI assistant
                </li>
              </ul>
              <button
                onClick={onStartPlanning}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/20 transition-all"
              >
                Try AI Assistant Now
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pro Assistant</h4>
                  <p className="text-[10px] text-slate-500">Powered by GoTrip AI</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-200/80 p-3.5 rounded-2xl rounded-tl-none text-slate-800 font-medium">
                  What are the top 3 hidden gems in Tokyo for sushi lovers?
                </div>
                <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-md font-normal">
                  Here are 3 top spots: 1. Sukiyabashi Jiro (Ginza), 2. Sushi Sawada, and 3. Toyosu Market stalls!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-center relative overflow-hidden text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Join thousands of travelers using GoTrip AI to discover destinations and craft unforgettable itineraries.
          </p>
          <button
            onClick={onStartPlanning}
            className="px-10 py-4 bg-white hover:bg-blue-50 text-blue-700 font-black text-lg rounded-full shadow-2xl transition-all active:scale-95 inline-flex items-center gap-3"
          >
            Start Planning Now <ArrowRight size={22} />
          </button>
        </div>
      </section>

      {/* PUBLIC FOOTER */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png" 
              alt="GoTrip AI Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-slate-900 text-base">GoTrip AI</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-600 transition-colors">How It Works</button>
            <button onClick={openEmergency} className="hover:text-red-600 transition-colors">Emergency</button>
          </div>

          <div>
            © {new Date().getFullYear()} GoTrip AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
