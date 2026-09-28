import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const mapDbToUserProfile = (data: any, emailFallback?: string, nameFallback?: string): UserProfile => {
  return {
    displayName: data?.display_name || nameFallback || 'Traveler',
    email: data?.email || emailFallback || '',
    phone: data?.phone || '',
    photoURL: data?.photo_url || '',
    country: data?.country || '',
    currency: data?.currency || 'INR',
    language: data?.language || 'English',
    age: data?.age ? String(data.age) : '',
    gender: data?.gender || '',
    bio: data?.bio || '',
  };
};

export const mapUserProfileToDb = (profile: UserProfile) => {
  return {
    display_name: profile.displayName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    photo_url: profile.photoURL || '',
    country: profile.country || '',
    currency: profile.currency || 'INR',
    language: profile.language || 'English',
    age: profile.age !== undefined && profile.age !== null ? String(profile.age) : '',
    gender: profile.gender || '',
    bio: profile.bio || '',
    updated_at: new Date().toISOString(),
  };
};

export const getCurrentProfile = async (
  userId: string,
  emailFallback?: string,
  nameFallback?: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[profileService] Error fetching profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapDbToUserProfile(data, emailFallback, nameFallback);
  } catch (err) {
    console.error('[profileService] Unexpected error fetching profile:', err);
    return null;
  }
};

export const updateCurrentProfile = async (
  userId: string,
  profile: UserProfile
): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
  try {
    const updateData = mapUserProfileToDb(profile);
    
    // Perform explicit update on public.profiles
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[profileService] Error updating profile:', error);
      return { success: false, error: 'Unable to save your profile. Please try again.' };
    }

    // Verify returned record from database
    const verifiedProfile = data ? mapDbToUserProfile(data, profile.email, profile.displayName) : profile;
    return { success: true, data: verifiedProfile };
  } catch (err: any) {
    console.error('[profileService] Unexpected error updating profile:', err);
    return { success: false, error: 'Unable to save your profile. Please try again.' };
  }
};
