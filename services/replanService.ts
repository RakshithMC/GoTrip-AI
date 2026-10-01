/**
 * GoTrip AI — Dynamic Trip Replanning Service (Feature 2)
 *
 * Handles user-triggered itinerary replanning by:
 * 1. Collecting disruption context from the user.
 * 2. Calling the gemini-plan Edge Function with a 'replan' action.
 * 3. Returning the AI-generated replacement in a preview-safe format.
 * 4. Providing a helper to apply the replacement only after user confirmation.
 *
 * SECURITY:
 * - No Gemini API key is exposed to the browser.
 * - All AI calls go through the existing gemini-plan Edge Function.
 * - No auth tokens are sent to Gemini directly.
 */

import { AIService } from './ai/aiService';
import { AIRequestOptions } from './ai/aiTypes';
import { UserPreferences, ActivityExplanation } from '../types';
import { fetchRouteData } from './geminiService';
import { buildReplanExplanation } from './explanationService';

// ─── Disruption Reasons ───────────────────────────────────────────────────────

export const DISRUPTION_REASONS = [
  { id: 'unavailable', label: 'Attraction unavailable' },
  { id: 'late', label: 'Running late' },
  { id: 'far', label: 'Too far' },
  { id: 'expensive', label: 'Too expensive' },
  { id: 'not_interested', label: 'Not interested' },
  { id: 'closed', label: 'Closed' },
  { id: 'other', label: 'Other' },
] as const;

export type DisruptionReasonId = typeof DISRUPTION_REASONS[number]['id'];

// ─── Activity Shape ────────────────────────────────────────────────────────────

export interface ItineraryActivity {
  time: string;
  name: string;
  description: string;
  icon: 'food' | 'activity' | 'travel';
  /** Optional fields added by replan */
  isReplanned?: boolean;
  replanReason?: string;
  latitude?: number;
  longitude?: number;
  /** Feature 3: Optional explanation for this recommendation */
  explanation?: ActivityExplanation;
}

// ─── Replan Request & Result ──────────────────────────────────────────────────

export interface ReplanRequest {
  /** The activity being replaced */
  originalActivity: ItineraryActivity;
  /** Index of activity within the day */
  activityIndex: number;
  /** Day number (1-based) */
  dayNumber: number;
  /** The full day's activities for context */
  dayActivities: ItineraryActivity[];
  /** Trip destination city */
  destination: string;
  /** Trip dates string */
  dates: string;
  /** User's budget (total) */
  budget: number;
  /** Disruption reason selected by user */
  disruptionReason: DisruptionReasonId;
  /** Free-text reason for 'other' */
  disruptionNotes?: string;
  /** User preferences from Feature 1 */
  userPreferences?: UserPreferences | null;
  /** Trip theme */
  theme?: string;
}

export interface ReplanResult {
  replacement: ItineraryActivity;
  reason: string;
  scheduleImpact: string;
  estimatedBudgetImpact: number | null;
  travelTimeFromPrev?: string;
  travelTimeToNext?: string;
  /** Feature 3: Structured explanation for this replacement */
  explanation?: ActivityExplanation;
}

// ─── OSRM Route Enrichment ────────────────────────────────────────────────────

/**
 * Tries to fetch OSRM travel times between adjacent activities.
 * Gracefully returns null on failure — replanning continues without route data.
 */
async function enrichWithOSRM(
  prevActivity: ItineraryActivity | null,
  replacementLat: number | undefined,
  replacementLng: number | undefined,
  nextActivity: ItineraryActivity | null
): Promise<{ fromPrev?: string; toNext?: string }> {
  if (!replacementLat || !replacementLng) return {};

  const result: { fromPrev?: string; toNext?: string } = {};

  // We store lat/lng on activities when available; for OSRM we need coords.
  const prevLat = (prevActivity as any)?.latitude;
  const prevLng = (prevActivity as any)?.longitude;
  const nextLat = (nextActivity as any)?.latitude;
  const nextLng = (nextActivity as any)?.longitude;

  if (prevLat && prevLng) {
    try {
      const route = await fetchRouteData(
        { lat: prevLat, lng: prevLng },
        { lat: replacementLat, lng: replacementLng }
      );
      if (route) result.fromPrev = route.durationText;
    } catch (_) { /* OSRM failure is non-fatal */ }
  }

  if (nextLat && nextLng) {
    try {
      const route = await fetchRouteData(
        { lat: replacementLat, lng: replacementLng },
        { lat: nextLat, lng: nextLng }
      );
      if (route) result.toNext = route.durationText;
    } catch (_) { /* OSRM failure is non-fatal */ }
  }

  return result;
}

// ─── Main Replan Function ─────────────────────────────────────────────────────

/**
 * Calls the gemini-plan Edge Function with action='replan'.
 * Returns a ReplanResult for preview — does NOT modify any database record.
 */
export const generateReplan = async (
  request: ReplanRequest,
  options?: AIRequestOptions
): Promise<ReplanResult> => {
  const {
    originalActivity,
    activityIndex,
    dayNumber,
    dayActivities,
    destination,
    dates,
    budget,
    disruptionReason,
    disruptionNotes,
    userPreferences,
    theme,
  } = request;

  // Build the preference context for the Edge Function
  const preferencesPayload = userPreferences
    ? {
        likes: Object.entries(userPreferences.interests || {})
          .filter(([, score]) => (score as number) > 0)
          .map(([cat]) => cat),
        dislikes: userPreferences.dislikedInterests || [],
        travelStyle: userPreferences.travelStyle || 'Balanced',
        tripPace: userPreferences.tripPace || 'Moderate',
        budgetMin: userPreferences.budgetMin,
        budgetMax: userPreferences.budgetMax,
      }
    : undefined;

  // Surrounding activities for context
  const prevActivity = activityIndex > 0 ? dayActivities[activityIndex - 1] : null;
  const nextActivity = activityIndex < dayActivities.length - 1 ? dayActivities[activityIndex + 1] : null;

  const reasonLabel =
    DISRUPTION_REASONS.find(r => r.id === disruptionReason)?.label || disruptionReason;
  const fullReason = disruptionNotes
    ? `${reasonLabel}: ${disruptionNotes}`
    : reasonLabel;

  const result = await AIService.replanActivity({
    originalActivity,
    prevActivity,
    nextActivity,
    destination,
    dates,
    budget,
    dayNumber,
    fullReason,
    theme,
    preferences: preferencesPayload,
  }, options);

  // Try to enrich with OSRM travel times (non-blocking)
  const osrmTimes = await enrichWithOSRM(
    prevActivity,
    result.replacement.latitude,
    result.replacement.longitude,
    nextActivity
  );

  // Feature 3: Build structured, grounded explanation for the replacement
  const structuredExplanation = buildReplanExplanation(
    originalActivity.name,
    result.replacement.name,
    reasonLabel,
    destination,
    theme,
    userPreferences,
    osrmTimes.fromPrev,
    osrmTimes.toNext,
    result.estimatedBudgetImpact,
    result.replacement.description,
    result.replacement.icon
  );

  if (result.reason) {
    structuredExplanation.summary = result.reason;
  }

  const replacementWithExplanation: ItineraryActivity = {
    ...result.replacement,
    explanation: structuredExplanation,
  };

  return {
    ...result,
    replacement: replacementWithExplanation,
    travelTimeFromPrev: osrmTimes.fromPrev,
    travelTimeToNext: osrmTimes.toNext,
    explanation: structuredExplanation,
  };
};

// ─── Preference Feedback on Replan ───────────────────────────────────────────

/**
 * When a user replans with reason 'not_interested', record a dislike signal
 * back to Feature 1's preference service.
 */
export const maybeRecordReplanFeedback = async (
  userId: string,
  originalActivity: ItineraryActivity,
  disruptionReason: DisruptionReasonId
): Promise<void> => {
  if (disruptionReason !== 'not_interested') return;

  try {
    const { recordPreferenceFeedback } = await import('./preferenceService');
    // Infer category from activity icon or name — use a simple heuristic
    const categoryGuess =
      originalActivity.icon === 'food'
        ? 'Food'
        : originalActivity.icon === 'travel'
        ? 'Travel'
        : 'Culture';
    await recordPreferenceFeedback(userId, categoryGuess, 'dislike');
  } catch (err) {
    // Non-fatal; preference learning should not block replanning
    console.warn('[replanService] Could not record preference feedback:', err);
  }
};
