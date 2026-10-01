/**
 * GoTrip AI — Explainable AI Recommendations Modal (Feature 3)
 *
 * Displays a concise, grounded explanation of why an activity, replacement,
 * or attraction was recommended.
 *
 * Adheres strictly to the GoTrip AI design system.
 * Shows "Explanation unavailable for this recommendation." if no data exists.
 */

import React from 'react';
import { X, CheckCircle2, Info, Sparkles, Utensils, Compass, Plane } from 'lucide-react';
import { ActivityExplanation } from '../types';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName: string;
  itemIcon?: 'food' | 'activity' | 'travel' | string;
  explanation?: ActivityExplanation | null;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  title = 'Why this was recommended',
  itemName,
  itemIcon = 'activity',
  explanation,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (itemIcon) {
      case 'food':
        return <Utensils size={18} className="text-amber-500" />;
      case 'travel':
        return <Plane size={18} className="text-sky-500" />;
      default:
        return <Compass size={18} className="text-blue-500" />;
    }
  };

  const hasReasons = explanation?.reasons && explanation.reasons.length > 0;

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Transparent AI decision reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Item Banner */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs shrink-0">
              {renderIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Recommendation
              </p>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                {itemName}
              </h4>
            </div>
          </div>

          {/* Factual Reasons List */}
          {hasReasons ? (
            <div className="space-y-2.5">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Key Factors Grounded in Data
              </p>
              <div className="space-y-2">
                {explanation!.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {reason.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Explanation unavailable for this recommendation.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Detailed reasoning is generated for newly planned stops and personalized activities.
                </p>
              </div>
            </div>
          )}

          {/* Summary / AI explanation text */}
          {explanation?.summary && (
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                AI Context Summary
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{explanation.summary}"
              </p>
            </div>
          )}

          {/* Fact grounding badge */}
          <div className="pt-1 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <span>✓</span> Grounded in your preferences, destination data &amp; schedule
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;
