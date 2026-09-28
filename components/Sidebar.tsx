
import React from 'react';
import { Settings, Sparkles, Terminal, Info, Globe, Plane } from 'lucide-react';
import { AppConfig, AVAILABLE_MODELS } from '../types';

interface SidebarProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, isOpen, onToggle }) => {
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({ ...config, model: e.target.value });
  };

  const handleSystemInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig({ ...config, systemInstruction: e.target.value });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, temperature: parseFloat(e.target.value) });
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300 absolute md:relative z-20">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center justify-center select-none">
          <img 
            src="https://cdn.phototourl.com/member/2026-09-26-05eff847-7d0c-46b8-b7a0-a986dc4170f0.png" 
            alt="GoTrip AI Logo" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="pl-4 border-l border-slate-700">
          <h1 className="font-bold text-sm text-white tracking-tight">Travel Assistant</h1>
          <p className="text-[10px] text-slate-400">AI Studio</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Model Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Terminal className="w-4 h-4" />
            <label className="text-xs font-semibold uppercase tracking-wider">Model</label>
          </div>
          <div className="relative">
            <select 
              value={config.model}
              onChange={handleModelChange}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer hover:border-slate-700 transition-colors"
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {AVAILABLE_MODELS.find(m => m.id === config.model)?.description}
          </p>
        </div>

        {/* System Instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Settings className="w-4 h-4" />
            <label className="text-xs font-semibold uppercase tracking-wider">System Instructions</label>
          </div>
          <textarea
            value={config.systemInstruction}
            onChange={handleSystemInstructionChange}
            placeholder="You are a helpful AI assistant..."
            className="w-full h-32 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none placeholder-slate-600"
          />
          <p className="text-xs text-slate-500">
            Define the persona, tone, and constraints for the model.
          </p>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
           <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Creativity</label>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{config.temperature}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.1"
            value={config.temperature} 
            onChange={handleTemperatureChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex gap-3 items-start">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-300/80 leading-relaxed">
            Powered by <strong className="text-indigo-300">Google GenAI SDK</strong>. 
            Images and text are processed securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
