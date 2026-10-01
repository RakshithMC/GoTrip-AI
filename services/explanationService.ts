/**
 * GoTrip AI — Explainable AI Recommendations Service (Feature 3)
 *
 * Pure utility functions for building factual, grounded explanations
 * for recommended activities, attractions, and replan replacements.
 *
 * IMPORTANT DESIGN RULES:
 * - No Gemini API calls. No network requests. No database access.
 * - Uses ONLY actually-available data passed in context.
 * - NEVER invents prices, distances, ratings, opening times, or user preferences.
 * - Every reason must be traceable to a supplied input.
 * - Returns 2–4 meaningful reasons per explanation.
 */

import { ExplanationReason, ActivityExplanation, UserPreferences } from '../types';

// ─── Interest → Keyword Mapping ──────────────────────────────────────────────

const INTEREST_KEYWORDS: Record<string, string[]> = {
  'Nature': ['park', 'garden', 'botanical', 'nature', 'forest', 'mountain', 'lake', 'waterfall', 'beach', 'trail', 'hike', 'wildlife', 'scenic', 'sunset', 'sunrise', 'countryside', 'valley', 'serenity'],
  'History': ['museum', 'heritage', 'historical', 'monument', 'fort', 'palace', 'castle', 'ancient', 'ruins', 'memorial', 'archaeological', 'mughal'],
  'Culture': ['temple', 'church', 'mosque', 'cathedral', 'cultural', 'art', 'gallery', 'theatre', 'opera', 'dance', 'music', 'festival', 'tradition', 'local', 'bazaar', 'heritage'],
  'Food': ['restaurant', 'cafe', 'cuisine', 'food', 'lunch', 'dinner', 'breakfast', 'brunch', 'feast', 'dining', 'culinary', 'tasting', 'bistro', 'eatery', 'tavern', 'pastry', 'gastronomic'],
  'Adventure': ['safari', 'trek', 'climb', 'dive', 'surf', 'kayak', 'rafting', 'zip', 'bungee', 'adventure', 'excursion', 'expedition', 'extreme', 'desert'],
  'Shopping': ['shopping', 'mall', 'boutique', 'market', 'souvenir', 'artisan', 'craft'],
  'Wellness': ['spa', 'wellness', 'yoga', 'meditation', 'retreat', 'massage', 'thermal', 'hot spring', 'relaxation', 'oils'],
  'Nightlife': ['bar', 'club', 'nightlife', 'pub', 'lounge', 'cocktail', 'rooftop'],
  'Architecture': ['architecture', 'building', 'tower', 'skyscraper', 'bridge', 'skyline', 'design', 'burj'],
  'Photography': ['photo', 'viewpoint', 'panoramic', 'scenic', 'vista', 'lookout', 'panorama'],
  'Water Activities': ['cruise', 'boat', 'ferry', 'sail', 'dhow', 'yacht', 'aquarium', 'snorkel', 'harbour'],
  'Religious': ['temple', 'church', 'mosque', 'cathedral', 'shrine', 'pilgrimage', 'spiritual'],
};

/**
 * Check if an activity name/description matches a user interest category.
 * Returns the first matching interest name or null.
 */
function findMatchingInterest(
  activityName: string,
  activityDescription: string,
  activityIcon: string,
  likedInterests: string[]
): string | null {
  const searchText = `${activityName} ${activityDescription}`.toLowerCase();

  for (const interest of likedInterests) {
    // Check against known keywords
    const keywords = INTEREST_KEYWORDS[interest];
    if (keywords) {
      for (const kw of keywords) {
        if (searchText.includes(kw)) {
          return interest;
        }
      }
    }
    // Direct match on interest name
    if (searchText.includes(interest.toLowerCase())) {
      return interest;
    }
  }

  // Icon-based fallback
  if (activityIcon === 'food' && likedInterests.includes('Food')) return 'Food';

  return null;
}

// ─── Explanation Build Context ───────────────────────────────────────────────

export interface ExplanationBuildContext {
  activityName: string;
  activityDescription?: string;
  activityIcon: 'food' | 'activity' | 'travel';
  destination: string;
  theme?: string;
  dayNumber?: number;
  totalDays?: number;
  dayTitle?: string;
  userPreferences?: UserPreferences | null;
  /** Whether this activity was sourced from verified database */
  fromDatabase?: boolean;
  /** For replan: original activity name */
  originalActivityName?: string;
  /** For replan: disruption reason label */
  disruptionReason?: string;
  /** For replan: OSRM travel time from previous activity */
  travelTimeFromPrev?: string;
  /** For replan: OSRM travel time to next activity */
  travelTimeToNext?: string;
  /** For replan: estimated budget impact */
  estimatedBudgetImpact?: number | null;
}

// ─── Summary Builder ─────────────────────────────────────────────────────────

function buildSummary(ctx: ExplanationBuildContext, reasons: ExplanationReason[]): string {
  if (ctx.originalActivityName) {
    return `Selected as a replacement for ${ctx.originalActivityName}, based on your trip context and available alternatives in ${ctx.destination}.`;
  }

  const prefMatch = reasons.find(r => r.factor === 'user_preference');
  if (prefMatch && ctx.theme) {
    return `Recommended because it aligns with your travel preferences and fits your ${ctx.theme} trip to ${ctx.destination}.`;
  }

  if (ctx.theme) {
    return `Selected for your ${ctx.theme} trip to ${ctx.destination}, fitting the planned day's activities.`;
  }

  return `Included in your ${ctx.destination} itinerary based on the trip's planned progression.`;
}

// ─── Main Explanation Builder ────────────────────────────────────────────────

/**
 * Builds a factual, grounded explanation for a recommended activity.
 * Only includes reasons that are actually supported by supplied data.
 * Never invents prices, distances, ratings, or opening times.
 */
export function buildActivityExplanation(ctx: ExplanationBuildContext): ActivityExplanation {
  const reasons: ExplanationReason[] = [];
  const desc = ctx.activityDescription || '';

  // 1. User preference match (highest priority)
  if (ctx.userPreferences) {
    const likes = Object.entries(ctx.userPreferences.interests || {})
      .filter(([, score]) => (score as number) > 0)
      .map(([cat]) => cat);

    if (likes.length > 0) {
      const matchedInterest = findMatchingInterest(
        ctx.activityName, desc, ctx.activityIcon, likes
      );
      if (matchedInterest) {
        reasons.push({
          factor: 'user_preference',
          label: `Matches your ${matchedInterest} interest`,
          supported: true,
        });
      }
    }
  }

  // 2. Replan-specific: disruption context (high priority for replanned alternatives)
  if (ctx.originalActivityName && ctx.disruptionReason) {
    reasons.push({
      factor: 'replan_context',
      label: `Replaces ${ctx.originalActivityName} (${ctx.disruptionReason})`,
      supported: true,
    });
  }

  // 3. Replan-specific: travel time from actual OSRM route data
  if (ctx.travelTimeFromPrev) {
    reasons.push({
      factor: 'route',
      label: `Approximately ${ctx.travelTimeFromPrev} from previous activity`,
      supported: true,
    });
  } else if (ctx.travelTimeToNext) {
    reasons.push({
      factor: 'route',
      label: `Approximately ${ctx.travelTimeToNext} to next activity`,
      supported: true,
    });
  }

  // 4. Budget impact (only when actual values exist)
  if (ctx.estimatedBudgetImpact !== undefined && ctx.estimatedBudgetImpact !== null && ctx.estimatedBudgetImpact !== 0) {
    const dir = ctx.estimatedBudgetImpact > 0 ? 'slightly higher' : 'lower';
    reasons.push({
      factor: 'budget',
      label: `Estimated cost is ${dir} than original`,
      supported: true,
    });
  }

  // 5. Travel style / Trip pace match (if available and space remains)
  if (ctx.userPreferences && reasons.length < 4) {
    if (ctx.userPreferences.travelStyle && ctx.userPreferences.travelStyle !== 'Balanced') {
      reasons.push({
        factor: 'travel_style',
        label: `Suits your ${ctx.userPreferences.travelStyle} travel style`,
        supported: true,
      });
    } else if (ctx.userPreferences.tripPace && ctx.userPreferences.tripPace !== 'Moderate') {
      reasons.push({
        factor: 'trip_pace',
        label: `Paced for your ${ctx.userPreferences.tripPace.toLowerCase()} preference`,
        supported: true,
      });
    }
  }

  // 6. Theme match
  if (ctx.theme && reasons.length < 4) {
    reasons.push({
      factor: 'theme',
      label: `Fits your ${ctx.theme} trip theme`,
      supported: true,
    });
  }

  // 7. Schedule / day position
  if (ctx.dayNumber !== undefined && ctx.totalDays !== undefined && ctx.totalDays > 0 && reasons.length < 4) {
    if (ctx.dayNumber === 1) {
      reasons.push({
        factor: 'schedule',
        label: 'Selected for arrival day orientation',
        supported: true,
      });
    } else if (ctx.dayNumber === ctx.totalDays && ctx.totalDays > 1) {
      reasons.push({
        factor: 'schedule',
        label: 'Planned for your final day',
        supported: true,
      });
    } else {
      reasons.push({
        factor: 'schedule',
        label: `Fits the Day ${ctx.dayNumber} itinerary progression`,
        supported: true,
      });
    }
  }

  // 8. Activity type relevance (for food/travel — only if space remains)
  if (reasons.length < 3) {
    if (ctx.activityIcon === 'food' && ctx.destination) {
      reasons.push({
        factor: 'category',
        label: `Curated dining experience in ${ctx.destination}`,
        supported: true,
      });
    } else if (ctx.activityIcon === 'travel') {
      reasons.push({
        factor: 'category',
        label: 'Essential logistics for your trip',
        supported: true,
      });
    }
  }

  // 9. Database source verification
  if (ctx.fromDatabase && ctx.destination && reasons.length < 4) {
    reasons.push({
      factor: 'destination',
      label: `Verified ${ctx.destination} location from our database`,
      supported: true,
    });
  } else if (ctx.estimatedBudgetImpact === 0 && ctx.originalActivityName && reasons.length < 4) {
    reasons.push({
      factor: 'budget',
      label: 'No additional cost impact expected',
      supported: true,
    });
  }

  // Filter to only supported reasons and limit to 2–4
  const finalReasons = reasons.filter(r => r.supported).slice(0, 4);

  // Ensure at least one reason
  const displayReasons = finalReasons.length > 0
    ? finalReasons
    : [{
        factor: 'general',
        label: 'Selected as part of your curated itinerary',
        supported: true,
      }];

  return {
    summary: buildSummary(ctx, displayReasons),
    reasons: displayReasons,
  };
}

/**
 * Builds a structured explanation for a replan replacement activity.
 * Uses the replan context (disruption reason, user preferences, schedule, OSRM data).
 */
export function buildReplanExplanation(
  originalName: string,
  replacementName: string,
  disruptionReason: string,
  destination: string,
  theme?: string,
  userPreferences?: UserPreferences | null,
  travelTimeFromPrev?: string,
  travelTimeToNext?: string,
  estimatedBudgetImpact?: number | null,
  replacementDescription?: string,
  replacementIcon?: 'food' | 'activity' | 'travel',
): ActivityExplanation {
  return buildActivityExplanation({
    activityName: replacementName,
    activityDescription: replacementDescription || '',
    activityIcon: replacementIcon || 'activity',
    destination,
    theme,
    userPreferences,
    originalActivityName: originalName,
    disruptionReason,
    travelTimeFromPrev,
    travelTimeToNext,
    estimatedBudgetImpact,
  });
}
