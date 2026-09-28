import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabasePublishableKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error("Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be defined.");
}

export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '');

export const checkAccountRegistration = async (
  email: string
): Promise<{ registered?: boolean; error?: string; serviceUnavailable?: boolean }> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!supabaseUrl) {
      return { serviceUnavailable: true };
    }

    const endpoint = `${supabaseUrl}/functions/v1/check-account`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabasePublishableKey,
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (response.status === 429) {
      return { error: 'Too many login attempts. Please wait a while and try again.' };
    }

    if (!response.ok) {
      return { serviceUnavailable: true };
    }

    const data = await response.json();
    if (typeof data?.registered === 'boolean') {
      return { registered: data.registered };
    }

    return { serviceUnavailable: true };
  } catch (err) {
    console.error('[checkAccountRegistration] Error invoking check-account:', err);
    return { serviceUnavailable: true };
  }
};
