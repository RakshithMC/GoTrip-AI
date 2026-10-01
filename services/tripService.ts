/**
 * GoTrip AI — Trip & Itinerary Persistence Service (Feature 2)
 *
 * Integrates directly with Supabase public tables:
 * - public.trips
 * - public.trip_itineraries
 *
 * SECURITY & CONSTRAINTS:
 * - Uses client Supabase instance (browser session JWT).
 * - Never uses service_role key.
 * - Adheres strictly to Row Level Security (RLS):
 *     auth.uid() = trips.user_id
 *     EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_itineraries.trip_id AND trips.user_id = auth.uid())
 * - Multi-user isolated: User A cannot see or modify User B's trips or itineraries.
 * - Target update: Can update ONLY the affected day's itinerary record upon "Apply Changes".
 */

import { supabase } from './supabaseClient';
import { DreamTripResult, DailyItinerary } from '../types';

const STORAGE_KEY_PREFIX = 'gotrip_trip_meta_';

/**
 * Helper to store non-catalog client metadata (hotel, flights, visa, route)
 * in browser storage to complement the core trips and trip_itineraries tables.
 */
function cacheTripMeta(userId: string, trip: DreamTripResult) {
  try {
    const meta = {
      hotel: trip.hotel,
      flights: trip.flights,
      visa: trip.visa,
      route: trip.route,
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}_${trip.id}`, JSON.stringify(meta));
  } catch (err) {
    console.warn('[tripService] Could not cache trip metadata:', err);
  }
}

function getTripMeta(userId: string, tripId: string): Partial<DreamTripResult> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}_${tripId}`);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

/**
 * Saves a full trip and its daily itineraries to Supabase.
 * Enforces RLS: trips.user_id = auth.uid()
 */
export async function saveTripToDatabase(
  userId: string,
  plan: DreamTripResult
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    // 1. Insert or Upsert into trips
    const { error: tripError } = await supabase
      .from('trips')
      .upsert({
        id: plan.id,
        user_id: userId,
        destination: plan.destination,
        dates: plan.dates,
        travelers: plan.travelers,
        total_estimated_cost: plan.totalEstimatedCost,
        highlights: plan.highlights || [],
        status: 'saved',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (tripError) {
      console.error('[tripService] Error saving trip:', tripError);
      return { success: false, error: tripError.message };
    }

    // 2. Insert or Upsert each day into trip_itineraries
    if (plan.itinerary && plan.itinerary.length > 0) {
      const itineraryRows = plan.itinerary.map((day) => ({
        trip_id: plan.id,
        day: day.day,
        date: day.date,
        title: day.title,
        activities: day.activities,
      }));

      const { error: itinError } = await supabase
        .from('trip_itineraries')
        .upsert(itineraryRows, { onConflict: 'trip_id,day' });

      if (itinError) {
        console.error('[tripService] Error saving itineraries:', itinError);
        return { success: false, error: itinError.message };
      }
    }

    // 3. Cache client metadata
    cacheTripMeta(userId, plan);

    return { success: true };
  } catch (err: any) {
    console.error('[tripService] Unexpected error saving trip:', err);
    return { success: false, error: err?.message || 'Failed to save trip' };
  }
}

/**
 * Fetches all trips owned by the authenticated user from Supabase.
 * Respects RLS: auth.uid() = trips.user_id
 */
export async function fetchUserTrips(userId: string): Promise<DreamTripResult[]> {
  try {
    if (!userId) return [];

    const { data: tripRows, error } = await supabase
      .from('trips')
      .select(`
        id,
        destination,
        dates,
        travelers,
        total_estimated_cost,
        highlights,
        status,
        trip_itineraries (
          id,
          day,
          date,
          title,
          activities
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[tripService] Error fetching user trips:', error);
      return [];
    }

    if (!tripRows || tripRows.length === 0) return [];

    return tripRows.map((row: any) => {
      const meta = getTripMeta(userId, row.id);

      // Sort itineraries by day ascending
      const rawItins = Array.isArray(row.trip_itineraries) ? row.trip_itineraries : [];
      const sortedItins: DailyItinerary[] = rawItins
        .sort((a: any, b: any) => a.day - b.day)
        .map((it: any) => ({
          day: it.day,
          date: it.date || '',
          title: it.title || `Day ${it.day}`,
          activities: Array.isArray(it.activities) ? it.activities : [],
        }));

      return {
        id: row.id,
        destination: row.destination,
        dates: row.dates || '',
        travelers: row.travelers || 1,
        totalEstimatedCost: Number(row.total_estimated_cost) || 0,
        highlights: Array.isArray(row.highlights) ? row.highlights : [],
        flights: meta.flights || { outbound: [], return: [] },
        hotel: meta.hotel || {
          id: 'ht_default',
          name: `${row.destination} Hotel`,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          rating: 4.5,
          pricePerNight: 150,
          address: row.destination,
          amenities: ['Free Wifi', 'Breakfast'],
          website: '',
        },
        visa: meta.visa || {
          type: 'Tourist Visa',
          required: false,
          checklist: [],
          processingTime: 'N/A',
        },
        route: meta.route || [],
        itinerary: sortedItins,
      };
    });
  } catch (err) {
    console.error('[tripService] Unexpected error fetching trips:', err);
    return [];
  }
}

/**
 * Updates a single day's activities in trip_itineraries.
 * Called strictly AFTER the user clicks "Apply Changes".
 * Does NOT touch unaffected days or recreate the itinerary.
 * RLS enforces that only the trip owner can update this record.
 */
export async function updateItineraryInDatabase(
  userId: string,
  tripId: string,
  dayNumber: number,
  updatedActivities: any[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !tripId) {
      return { success: false, error: 'Missing userId or tripId' };
    }

    // Direct update to trip_itineraries matching trip_id and day
    const { data, error } = await supabase
      .from('trip_itineraries')
      .update({
        activities: updatedActivities,
      })
      .eq('trip_id', tripId)
      .eq('day', dayNumber)
      .select();

    if (error) {
      console.error('[tripService] Error updating itinerary in DB:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[tripService] Unexpected error updating itinerary:', err);
    return { success: false, error: err?.message || 'Failed to update itinerary' };
  }
}
