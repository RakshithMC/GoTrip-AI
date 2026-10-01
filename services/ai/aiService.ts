import { ChatMessage, Source, GeneratedPlace } from '../../types';
import { supabase } from '../supabaseClient';
import { AIError } from './aiErrors';
import { AICache } from './aiCache';
import { AIDeduplicator } from './aiDeduplicate';
import { executeWithRetry } from './aiRetry';
import { ChatResponseData, AIRequestOptions } from './aiTypes';

/**
 * Invokes a Supabase Edge Function securely from the browser.
 * The browser NEVER calls generativelanguage.googleapis.com directly and NEVER holds Gemini secrets.
 */
async function invokeEdgeFunction<T>(functionName: string, body: any, options?: AIRequestOptions): Promise<T> {
  const fetchOptions: any = {};
  if (options?.signal) {
    fetchOptions.signal = options.signal;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    // Safe debug logging: log session status without exposing sensitive token strings
    console.log(`[AIService] ${functionName} auth check:`, {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id ?? null,
    });

    if (!session || !session.access_token) {
      throw new AIError('UNAUTHORIZED', 'Please log in to use GoTrip AI.', 401);
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.access_token}`,
    };

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers,
    });

    if (error) {
      let responseBody = '';
      if ((error as any).context) {
        try {
          const ctxResponse = (error as any).context;
          const cloned = ctxResponse.clone ? ctxResponse.clone() : ctxResponse;
          responseBody = await cloned.text();
        } catch (e) {
          responseBody = `[Failed to read response body: ${e}]`;
        }
      }

      console.error(`[AIService] ${functionName} HTTP error inspection:`, {
        errorName: error.name,
        errorMessage: error.message,
        status: (error as any).status,
        responseBody,
      });

      const status = (error as any).status || 500;
      const message = error.message || 'Error communicating with Supabase Edge Function';

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(responseBody);
      } catch (_e) {
        // Not JSON
      }

      if (parsedJson?.error?.userMessage) {
        throw new AIError(
          parsedJson.error.code || 'UNAUTHORIZED',
          parsedJson.error.userMessage,
          status,
          parsedJson.error
        );
      }

      if (status === 401 || message.includes('401') || message.includes('Unauthorized') || message.includes('Invalid JWT') || responseBody.includes('Invalid JWT')) {
        throw new AIError('UNAUTHORIZED', 'Your session is no longer valid. Please log in again.', 401, error);
      }
      if (status === 429 || message.includes('429') || message.includes('quota') || message.includes('limit')) {
        throw new AIError('QUOTA_EXHAUSTED', undefined, 429, error);
      }
      throw new AIError('SERVER_ERROR', message, status, error);
    }

    if (data?.error) {
      const errCode = data.error.code === 'UNAUTHORIZED' || data.error.status === 401 ? 'UNAUTHORIZED' : (data.error.code || 'SERVER_ERROR');
      const userMsg = data.error.userMessage || (errCode === 'UNAUTHORIZED' ? 'Please log in to use GoTrip AI.' : 'An error occurred with the AI service.');
      throw new AIError(
        errCode,
        userMsg,
        data.error.status || 500,
        data.error
      );
    }

    return data.data as T;
  } catch (err: any) {
    throw AIError.parse(err);
  }
}

export class AIService {
  /**
   * Generates a 3-sentence attraction summary via Supabase Edge Function with caching & deduplication.
   */
  public static async generateAttractionSummary(
    attractionName: string,
    cityName: string,
    language: string = 'English',
    options?: AIRequestOptions
  ): Promise<string> {
    const cacheKey = `summary:${attractionName}:${cityName}:${language}`;
    if (!options?.skipCache) {
      const cached = AICache.get<string>(cacheKey);
      if (cached) return cached;
    }

    const fingerprint = AIDeduplicator.generateFingerprint('summary', { attractionName, cityName, language });

    return AIDeduplicator.execute(fingerprint, async () => {
      const result = await executeWithRetry(() =>
        invokeEdgeFunction<string>('gemini-plan', {
          action: 'summary',
          payload: { attractionName, cityName, language }
        }, options)
      , { maxRetries: 2 });

      AICache.set(cacheKey, result);
      return result;
    });
  }

  /**
   * Generates structured city guide places via Supabase Edge Function with caching & deduplication.
   */
  public static async generateCityGuide(
    city: string,
    country: string,
    language: string = 'English',
    options?: AIRequestOptions
  ): Promise<GeneratedPlace[]> {
    const cacheKey = `cityGuide:${city}:${country}:${language}`;
    if (!options?.skipCache) {
      const cached = AICache.get<GeneratedPlace[]>(cacheKey);
      if (cached) return cached;
    }

    const fingerprint = AIDeduplicator.generateFingerprint('cityGuide', { city, country, language });

    return AIDeduplicator.execute(fingerprint, async () => {
      const result = await executeWithRetry(() =>
        invokeEdgeFunction<GeneratedPlace[]>('gemini-plan', {
          action: 'cityGuide',
          payload: { city, country, language, preferences: options?.preferences }
        }, options)
      , { maxRetries: 2 });

      AICache.set(cacheKey, result);
      return result;
    });
  }

  /**
   * Generates country database of tourist places via Supabase Edge Function with caching & deduplication.
   */
  public static async generateCountryDatabase(
    country: string,
    language: string = 'English',
    options?: AIRequestOptions
  ): Promise<GeneratedPlace[]> {
    const cacheKey = `countryDB:${country}:${language}`;
    if (!options?.skipCache) {
      const cached = AICache.get<GeneratedPlace[]>(cacheKey);
      if (cached) return cached;
    }

    const fingerprint = AIDeduplicator.generateFingerprint('countryDB', { country, language });

    return AIDeduplicator.execute(fingerprint, async () => {
      const result = await executeWithRetry(() =>
        invokeEdgeFunction<GeneratedPlace[]>('gemini-plan', {
          action: 'countryDatabase',
          payload: { country, language, preferences: options?.preferences }
        }, options)
      , { maxRetries: 2 });

      AICache.set(cacheKey, result);
      return result;
    });
  }

  /**
   * Generates a 1-day trip itinerary via Supabase Edge Function with deduplication.
   */
  public static async generateDayTripItinerary(
    city: string,
    places: any,
    language: string = 'English',
    options?: AIRequestOptions
  ): Promise<{ time: string; placeName: string; activity: string }[]> {
    const placeList = Array.isArray(places) ? places.map((p: any) => p.name || p).join(', ') : String(places);
    const fingerprint = AIDeduplicator.generateFingerprint('dayTrip', { city, placeList, language });

    return AIDeduplicator.execute(fingerprint, async () => {
      return await executeWithRetry(() =>
        invokeEdgeFunction<{ time: string; placeName: string; activity: string }[]>('gemini-plan', {
          action: 'dayTrip',
          payload: { city, places, language, preferences: options?.preferences }
        }, options)
      , { maxRetries: 2 });
    });
  }

  /**
   * Travel chat response handler via Supabase Edge Function supporting multimodal chat & cancellation.
   */
  public static async getTravelChatResponse(
    history: ChatMessage[],
    userMessage: string,
    imageBase64?: string,
    location?: { lat: number; lng: number },
    language: string = 'English',
    options?: AIRequestOptions
  ): Promise<ChatResponseData> {
    return await executeWithRetry(() =>
      invokeEdgeFunction<ChatResponseData>('gemini-chat', {
        history,
        userMessage,
        imageBase64,
        location,
        language,
        preferences: options?.preferences
      }, options)
    , { maxRetries: 2 });
  }

  /**
   * Generates an AI replacement for a single disrupted itinerary activity.
   * Routes through gemini-plan Edge Function with action='replan'.
   * Never exposes GEMINI_API_KEY to the browser.
   */
  public static async replanActivity(
    payload: {
      originalActivity: any;
      prevActivity: any | null;
      nextActivity: any | null;
      destination: string;
      dates: string;
      budget: number;
      dayNumber: number;
      fullReason: string;
      theme?: string;
      preferences?: {
        likes?: string[];
        dislikes?: string[];
        travelStyle?: string;
        tripPace?: string;
        budgetMin?: number;
        budgetMax?: number;
      };
    },
    options?: AIRequestOptions
  ): Promise<any> {
    return await executeWithRetry(() =>
      invokeEdgeFunction<any>('gemini-plan', {
        action: 'replan',
        payload,
      }, options)
    , { maxRetries: 1 });
  }
}
