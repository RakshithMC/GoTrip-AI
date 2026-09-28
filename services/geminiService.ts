import { ChatMessage, Source, GeneratedPlace } from '../types';
import { AIService } from './ai/aiService';

export const generateAttractionSummary = async (
  attractionName: string,
  cityName: string,
  language: string = 'English'
): Promise<string> => {
  try {
    return await AIService.generateAttractionSummary(attractionName, cityName, language);
  } catch (error: any) {
    console.error("Gemini Summary Error:", error);
    return error?.userMessage || "AI is temporarily unavailable. Please try again later!";
  }
};

export const generateCityGuide = async (
  city: string,
  country: string,
  language: string = 'English'
): Promise<GeneratedPlace[]> => {
  try {
    return await AIService.generateCityGuide(city, country, language);
  } catch (error: any) {
    console.error("City Guide Generation Error:", error);
    return [];
  }
};

export const generateCountryDatabase = async (
  country: string,
  language: string = 'English'
): Promise<GeneratedPlace[]> => {
  try {
    return await AIService.generateCountryDatabase(country, language);
  } catch (error: any) {
    console.error("Country DB Generation Error:", error);
    return [];
  }
};

export const getTravelChatResponse = async (
  history: ChatMessage[],
  userMessage: string,
  imageBase64?: string,
  location?: { lat: number; lng: number },
  language: string = 'English'
): Promise<{ text: string; sources: Source[]; relatedQuestions: string[] }> => {
  try {
    return await AIService.getTravelChatResponse(history, userMessage, imageBase64, location, language);
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return {
      text: error?.userMessage || "Error connecting to AI service. Please try again later.",
      sources: [],
      relatedQuestions: []
    };
  }
};

export const fetchRouteData = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distanceText: string; durationText: string; distanceValue: number } | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0];
      const durMins = Math.round(route.duration / 60 * 1.5);
      const h = Math.floor(durMins / 60);
      const m = durMins % 60;
      return {
        distanceText: `${(route.distance / 1000).toFixed(1)} km`,
        durationText: h > 0 ? `${h} hr ${m} min` : `${m} min`,
        distanceValue: route.distance
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getTravelChatStream = async (
  history: ChatMessage[],
  userMessage: string,
  imageBase64?: string,
  location?: { lat: number; lng: number },
  language: string = 'English',
  onChunk?: (text: string) => void
): Promise<{ text: string; sources: Source[]; relatedQuestions: string[] }> => {
  return await getTravelChatResponse(history, userMessage, imageBase64, location, language);
};

export const generateDayTripItinerary = async (
  city: string,
  places: any,
  language: string = 'English'
): Promise<{ time: string; placeName: string; activity: string }[]> => {
  try {
    return await AIService.generateDayTripItinerary(city, places, language);
  } catch (error: any) {
    console.error("Day Trip Itinerary Error:", error);
    return [];
  }
};