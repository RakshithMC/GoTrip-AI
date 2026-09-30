import { supabase } from './supabaseClient';
import { UserPreferences } from '../types';

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  interests: {
    'Nature': 1,
    'History': 1,
    'Culture': 1,
    'Food': 1,
  },
  dislikedInterests: [],
  travelStyle: 'Balanced',
  activityPreferences: ['Museums', 'Parks', 'Historical sites'],
  budgetMin: 10000,
  budgetMax: 50000,
  preferredTransport: 'Transit',
  tripPace: 'Moderate',
};

export const mapDbToUserPreferences = (data: any, userId: string): UserPreferences => {
  return {
    id: data?.id,
    userId: data?.user_id || userId,
    interests: typeof data?.interests === 'object' && data?.interests ? data.interests : { ...DEFAULT_USER_PREFERENCES.interests },
    dislikedInterests: Array.isArray(data?.disliked_interests) ? data.disliked_interests : [...DEFAULT_USER_PREFERENCES.dislikedInterests],
    travelStyle: data?.travel_style || DEFAULT_USER_PREFERENCES.travelStyle,
    activityPreferences: Array.isArray(data?.activity_preferences) ? data.activity_preferences : [...DEFAULT_USER_PREFERENCES.activityPreferences],
    budgetMin: typeof data?.budget_min === 'number' ? data.budget_min : DEFAULT_USER_PREFERENCES.budgetMin,
    budgetMax: typeof data?.budget_max === 'number' ? data.budget_max : DEFAULT_USER_PREFERENCES.budgetMax,
    preferredTransport: data?.preferred_transport || DEFAULT_USER_PREFERENCES.preferredTransport,
    tripPace: data?.trip_pace || DEFAULT_USER_PREFERENCES.tripPace,
    createdAt: data?.created_at,
    updatedAt: data?.updated_at,
  };
};

export const mapUserPreferencesToDb = (prefs: UserPreferences) => {
  return {
    user_id: prefs.userId,
    interests: prefs.interests || {},
    disliked_interests: prefs.dislikedInterests || [],
    travel_style: prefs.travelStyle || 'Balanced',
    activity_preferences: prefs.activityPreferences || [],
    budget_min: prefs.budgetMin ?? 10000,
    budget_max: prefs.budgetMax ?? 50000,
    preferred_transport: prefs.preferredTransport || 'Transit',
    trip_pace: prefs.tripPace || 'Moderate',
    updated_at: new Date().toISOString(),
  };
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[preferenceService] Error fetching user preferences:', error);
    }

    if (!data) {
      // Initialize default user preferences for new user
      const defaultPrefs: UserPreferences = {
        userId,
        ...DEFAULT_USER_PREFERENCES,
      };
      
      const { data: createdData, error: createError } = await supabase
        .from('user_preferences')
        .upsert(mapUserPreferencesToDb(defaultPrefs), { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('[preferenceService] Error initializing default preferences:', createError);
        return defaultPrefs;
      }

      return createdData ? mapDbToUserPreferences(createdData, userId) : defaultPrefs;
    }

    return mapDbToUserPreferences(data, userId);
  } catch (err) {
    console.error('[preferenceService] Unexpected error getting user preferences:', err);
    return {
      userId,
      ...DEFAULT_USER_PREFERENCES,
    };
  }
};

export const updateUserPreferences = async (
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<{ success: boolean; data?: UserPreferences; error?: string }> => {
  try {
    const current = await getUserPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...prefs,
      userId,
    };

    const dbPayload = mapUserPreferencesToDb(updated);

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(dbPayload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[preferenceService] Error updating user preferences:', error);
      return { success: false, error: 'Unable to save preferences. Please try again.' };
    }

    const verified = data ? mapDbToUserPreferences(data, userId) : updated;
    return { success: true, data: verified };
  } catch (err: any) {
    console.error('[preferenceService] Unexpected error updating user preferences:', err);
    return { success: false, error: 'Unable to save preferences. Please try again.' };
  }
};

export const recordPreferenceFeedback = async (
  userId: string,
  categoryOrInterest: string,
  sentiment: 'like' | 'dislike'
): Promise<{ success: boolean; data?: UserPreferences }> => {
  try {
    if (!userId || !categoryOrInterest) return { success: false };

    const current = await getUserPreferences(userId);
    const interests = { ...(current.interests || {}) };
    let disliked = [...(current.dislikedInterests || [])];

    const normalizedCategory = categoryOrInterest.trim();

    if (sentiment === 'like') {
      const currentScore = interests[normalizedCategory] || 0;
      interests[normalizedCategory] = currentScore + 1;
      disliked = disliked.filter(d => d.toLowerCase() !== normalizedCategory.toLowerCase());
    } else {
      const currentScore = interests[normalizedCategory] || 0;
      interests[normalizedCategory] = currentScore - 1;
      if (interests[normalizedCategory] <= -1 && !disliked.some(d => d.toLowerCase() === normalizedCategory.toLowerCase())) {
        disliked.push(normalizedCategory);
      }
    }

    const res = await updateUserPreferences(userId, {
      interests,
      dislikedInterests: disliked,
    });

    return { success: res.success, data: res.data };
  } catch (err) {
    console.error('[preferenceService] Error recording feedback:', err);
    return { success: false };
  }
};
