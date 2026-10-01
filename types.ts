export interface City {
  id: string;
  name: string;
  country: string;
  baseFlight: number;
  avgHotel: number;
  image: string;
  experiences?: string[];
  bestTime?: string;
}

export interface Attraction {
  id: string;
  cityId: string;
  name: string;
  category: string;
  rating: number;
  price: string;
  priceValue: number;
  image: string;
  gallery: string[];
  description: string;
  hours: string;
  address: string;
  website: string;
  mapUri?: string;
}

export interface Accommodation {
  id: string;
  cityId: string;
  name: string;
  type: string;
  rating: number;
  price: string;
  priceValue: number;
  image: string;
  website: string;
  amenities: string[];
}

export interface Restaurant {
  id: string;
  cityId: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  priceValue: number;
  image: string;
  website: string;
}

export interface UserProfile {
  currency: string;
  language: string;
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  country?: string;
  age?: string;
  gender?: string;
  bio?: string;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  interests: Record<string, number>;
  dislikedInterests: string[];
  travelStyle: string;
  activityPreferences: string[];
  budgetMin: number;
  budgetMax: number;
  preferredTransport: string;
  tripPace: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Source {
  title: string;
  uri: string;
  text?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: Source[];
  relatedQuestions?: string[];
  timestamp?: number;
}

export interface AppConfig {
  model: string;
  systemInstruction: string;
  temperature: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

// Updated available models to match Gemini 3 guidelines
export const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Fast and versatile model for scaling across diverse tasks.' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.1 Pro', description: 'Best-in-class model for complex reasoning and coding tasks.' },
];

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Attachment {
  previewUrl: string;
}

export interface Message {
  role: Role | string;
  text: string;
  error?: boolean;
  attachments?: Attachment[];
}

// --- Dream Trip Smart Plan Types ---

export type TripTheme = 'Relax' | 'Adventure' | 'Romantic' | 'Family' | 'Cultural' | 'Business' | 'Foodie' | 'Luxury' | 'Wellness';

export interface RouteSegment {
  from: string;
  to: string;
  distanceText?: string;
  durationText?: string;
  coords?: any[];
  mode?: 'flight' | 'drive' | 'transit' | string;
  duration?: string;
  distance?: string;
}

export interface DreamTripInput {
  departureLocation: { name: string; lat: number; lng: number } | null;
  destinationLocation: { name: string; lat: number; lng: number } | null;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  theme: TripTheme;
  needsItinerary?: boolean;
  needsAccommodation?: boolean;
  needsFlight?: boolean;
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  logo: string;
  origin: string;
  destination: string;
}

export interface HotelOption {
  id: string;
  name: string;
  image: string;
  rating: number;
  pricePerNight: number;
  address: string;
  amenities: string[];
  website: string;
}

export interface DailyItinerary {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    name: string;
    description: string;
    icon: 'food' | 'activity' | 'travel';
    /** Feature 3: Optional pre-computed explanation for this recommendation */
    explanation?: ActivityExplanation;
  }[];
}

// --- Feature 3: Explainable AI Recommendations ---

/** A single factual reason supporting a recommendation */
export interface ExplanationReason {
  /** Factor category: user_preference, theme, schedule, budget, destination, route, category, replan_context */
  factor: string;
  /** Human-readable reason label */
  label: string;
  /** Whether this reason is supported by actual data */
  supported: boolean;
}

/** Structured explanation for a recommended activity */
export interface ActivityExplanation {
  /** Brief summary sentence */
  summary: string;
  /** Structured list of factual reasons (2-4 items) */
  reasons: ExplanationReason[];
}

export interface VisaRequirement {
  type: string;
  required: boolean;
  checklist: string[];
  processingTime: string;
}

export interface DreamTripResult {
  id: string;
  destination: string;
  dates: string;
  travelers: number;
  totalEstimatedCost: number;
  highlights: string[];
  flights: {
    outbound: FlightOption[];
    return: FlightOption[];
  };
  hotel: HotelOption;
  itinerary: DailyItinerary[];
  visa: VisaRequirement;
  route?: RouteSegment[];
}

// --- AI City Guide Types ---

export interface GeneratedPlace {
  id?: string;
  name: string;
  category: string;
  short_description: string;
  approx_visit_time_hours: number | string;
  best_time_to_visit: string;
  ideal_for: string;
  nearby_area: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  address?: string;
  mapUri?: string;
  distance?: number;
  distanceText?: string;
  travelTime?: string;
}