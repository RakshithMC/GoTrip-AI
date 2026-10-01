/**
 * GoTrip AI — Replan Modal (Feature 2: Dynamic Trip Replanning)
 *
 * Two-phase UI:
 *   Phase 1 — "reason": User selects disruption reason + optional notes
 *   Phase 2 — "preview": AI alternative is shown; user picks Apply or Keep Original
 *
 * Security:
 * - All AI requests go through AIService → gemini-plan Edge Function
 * - No API keys or tokens are exposed in browser code
 * - Database write only happens on explicit "Apply Changes" click
 */

import React, { useState, useCallback } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, RefreshCw, ChevronRight, Clock, DollarSign, MapPin, Sparkles, Navigation } from 'lucide-react';
import { DISRUPTION_REASONS, DisruptionReasonId, ReplanResult, generateReplan, maybeRecordReplanFeedback, ItineraryActivity } from '../services/replanService';
import { UserPreferences } from '../types';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;

  /** The activity being replaced */
  activity: ItineraryActivity;
  /** Index of activity within the day */
  activityIndex: number;
  /** Day number (1-based) */
  dayNumber: number;
  /** Full list of activities for this day (for context) */
  dayActivities: ItineraryActivity[];

  /** Trip context */
  destination: string;
  dates: string;
  budget: number;
  theme?: string;

  /** Feature 1 preferences */
  userPreferences?: UserPreferences | null;

  /** Authenticated user ID — for preference feedback */
  userId?: string;

  /** Called when user clicks Apply Changes */
  onApply: (replacement: ItineraryActivity) => void;

  /** Currency symbol for display */
  currencySymbol?: string;
}

type Phase = 'reason' | 'loading' | 'preview' | 'error';

const ReplanModal: React.FC<ReplanModalProps> = ({
  isOpen,
  onClose,
  activity,
  activityIndex,
  dayNumber,
  dayActivities,
  destination,
  dates,
  budget,
  theme,
  userPreferences,
  userId,
  onApply,
  currencySymbol = '₹',
}) => {
  const [phase, setPhase] = useState<Phase>('reason');
  const [selectedReason, setSelectedReason] = useState<DisruptionReasonId | null>(null);
  const [otherNotes, setOtherNotes] = useState('');
  const [replanResult, setReplanResult] = useState<ReplanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = useCallback(() => {
    setPhase('reason');
    setSelectedReason(null);
    setOtherNotes('');
    setReplanResult(null);
    setErrorMsg('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleGenerate = useCallback(async () => {
    if (!selectedReason) return;
    setPhase('loading');
    setErrorMsg('');
    try {
      const result = await generateReplan({
        originalActivity: activity,
        activityIndex,
        dayNumber,
        dayActivities,
        destination,
        dates,
        budget,
        disruptionReason: selectedReason,
        disruptionNotes: selectedReason === 'other' ? otherNotes : undefined,
        userPreferences,
        theme,
      });
      setReplanResult(result);
      setPhase('preview');
    } catch (err: any) {
      console.error('[ReplanModal] Generation failed:', err);
      setErrorMsg(
        err?.userMessage ||
        'Unable to generate an alternative right now. Please try again.'
      );
      setPhase('error');
    }
  }, [selectedReason, otherNotes, activity, activityIndex, dayNumber, dayActivities, destination, dates, budget, userPreferences, theme]);

  const handleApply = useCallback(() => {
    if (!replanResult) return;
    // Record preference feedback if applicable (non-blocking)
    if (userId && selectedReason) {
      maybeRecordReplanFeedback(userId, activity, selectedReason).catch(() => {});
    }
    onApply(replanResult.replacement);
    handleClose();
  }, [replanResult, userId, selectedReason, activity, onApply, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <RefreshCw size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {phase === 'preview' ? 'AI Alternative Ready' : 'Replan Activity'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                {phase === 'preview' ? 'Review the suggested replacement' : 'User-suggested AI Dynamic Replanning'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">

          {/* ── Phase: Reason Selection ───────────────────────────────── */}
          {phase === 'reason' && (
            <div className="space-y-4">
              {/* Original activity pill */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex items-start gap-3">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg shrink-0">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Cannot Visit</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{activity.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time} · Day {dayNumber}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Why can't you visit?
                </p>
                <div className="space-y-2">
                  {DISRUPTION_REASONS.map(reason => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedReason === reason.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free-text for "Other" */}
              {selectedReason === 'other' && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tell us more (optional)</p>
                  <textarea
                    value={otherNotes}
                    onChange={e => setOtherNotes(e.target.value)}
                    placeholder="e.g. Too crowded today, Need a less tiring activity…"
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Phase: Loading ────────────────────────────────────────── */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-700 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <Sparkles size={24} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-black text-slate-900 dark:text-white">Generating alternative…</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Considering your preferences, schedule &amp; destination
                </p>
              </div>
            </div>
          )}

          {/* ── Phase: Error ──────────────────────────────────────────── */}
          {phase === 'error' && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">{errorMsg}</p>
                  <p className="text-xs text-red-500 mt-1">Your original itinerary has not been changed.</p>
                </div>
              </div>
              <button
                onClick={() => { setPhase('reason'); setErrorMsg(''); }}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Phase: Preview ────────────────────────────────────────── */}
          {phase === 'preview' && replanResult && (
            <div className="space-y-4">

              {/* Original → Replacement comparison */}
              <div className="space-y-2">
                {/* Original (struck-through) */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Original</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 line-through">
                    {activity.name}
                  </p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Alternative</span>
                  </div>
                </div>

                {/* Replacement */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Replacement</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {replanResult.replacement.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock size={11} />
                      {replanResult.replacement.time}
                    </span>
                    {replanResult.estimatedBudgetImpact !== null && replanResult.estimatedBudgetImpact !== 0 && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <DollarSign size={11} />
                        {replanResult.estimatedBudgetImpact > 0 ? '+' : ''}
                        {currencySymbol}{Math.abs(replanResult.estimatedBudgetImpact).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {replanResult.replacement.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {replanResult.replacement.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Why this replacement */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                  Why this replacement?
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {replanResult.reason}
                </p>
              </div>

              {/* Schedule impact */}
              {replanResult.scheduleImpact && replanResult.scheduleImpact !== 'None' && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                  <Clock size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    {replanResult.scheduleImpact}
                  </p>
                </div>
              )}

              {/* OSRM Travel times */}
              {(replanResult.travelTimeFromPrev || replanResult.travelTimeToNext) && (
                <div className="flex items-start gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Navigation size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium space-y-0.5">
                    {replanResult.travelTimeFromPrev && (
                      <p>From previous stop: ~{replanResult.travelTimeFromPrev}</p>
                    )}
                    {replanResult.travelTimeToNext && (
                      <p>To next stop: ~{replanResult.travelTimeToNext}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preferences signal used */}
              {userPreferences && Object.keys(userPreferences.interests || {}).length > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                  ✓ Your learned preferences were used to tailor this suggestion.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">

          {phase === 'reason' && (
            <>
              <button
                disabled={!selectedReason}
                onClick={handleGenerate}
                className="w-full h-[50px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Generate Alternative
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {phase === 'preview' && replanResult && (
            <>
              <button
                onClick={handleApply}
                className="w-full h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Apply Changes
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Keep Original
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplanModal;
