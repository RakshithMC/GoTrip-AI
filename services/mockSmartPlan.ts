import { DreamTripInput, DreamTripResult, HotelOption, FlightOption, TripTheme } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_DB } from './data';

// --- Helper Data & Functions ---

const AIRLINES = [
  { name: 'Emirates', code: 'EK', logo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=100&q=80' },
  { name: 'Qatar Airways', code: 'QR', logo: 'https://images.unsplash.com/photo-1610427958925-562752174620?auto=format&fit=crop&w=100&q=80' },
  { name: 'Singapore Airlines', code: 'SQ', logo: 'https://images.unsplash.com/photo-1559628236-40755eb13576?auto=format&fit=crop&w=100&q=80' },
  { name: 'British Airways', code: 'BA', logo: 'https://images.unsplash.com/photo-1542296332-2e44a996aaad?auto=format&fit=crop&w=100&q=80' },
  { name: 'Lufthansa', code: 'LH', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=100&q=80' },
  { name: 'Air France', code: 'AF', logo: 'https://images.unsplash.com/photo-1559519529-26b9246466c8?auto=format&fit=crop&w=100&q=80' },
  { name: 'Delta', code: 'DL', logo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=100&q=80' },
  { name: 'United', code: 'UA', logo: 'https://images.unsplash.com/photo-1610427958925-562752174620?auto=format&fit=crop&w=100&q=80' },
  { name: 'American Airlines', code: 'AA', logo: 'https://images.unsplash.com/photo-1542296332-2e44a996aaad?auto=format&fit=crop&w=100&q=80' },
  { name: 'Etihad', code: 'EY', logo: 'https://images.unsplash.com/photo-1559628236-40755eb13576?auto=format&fit=crop&w=100&q=80' },
  { name: 'Turkish Airlines', code: 'TK', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=100&q=80' },
  { name: 'Qantas', code: 'QF', logo: 'https://images.unsplash.com/photo-1559519529-26b9246466c8?auto=format&fit=crop&w=100&q=80' },
  { name: 'Cathay Pacific', code: 'CX', logo: 'https://images.unsplash.com/photo-1542296332-2e44a996aaad?auto=format&fit=crop&w=100&q=80' },
  { name: 'ANA', code: 'NH', logo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=100&q=80' },
  { name: 'KLM', code: 'KL', logo: 'https://images.unsplash.com/photo-1559519529-26b9246466c8?auto=format&fit=crop&w=100&q=80' },
  { name: 'Swiss', code: 'LX', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=100&q=80' }
];

const AIRPORT_CODES: Record<string, string> = {
  'New York': 'JFK', 'London': 'LHR', 'Paris': 'CDG', 'Tokyo': 'HND', 'Haneda': 'HND', 'Narita': 'NRT',
  'Dubai': 'DXB', 'Singapore': 'SIN', 'Los Angeles': 'LAX', 'Sydney': 'SYD',
  'Rome': 'FCO', 'Berlin': 'BER', 'Mumbai': 'BOM', 'Delhi': 'DEL',
  'Bangkok': 'BKK', 'Toronto': 'YYZ', 'Barcelona': 'BCN', 'Madrid': 'MAD',
  'Istanbul': 'IST', 'Amsterdam': 'AMS', 'San Francisco': 'SFO', 'Chicago': 'ORD',
  'Miami': 'MIA', 'Orlando': 'MCO', 'Las Vegas': 'LAS', 'Seattle': 'SEA',
  'Beijing': 'PEK', 'Shanghai': 'PVG', 'Hong Kong': 'HKG', 'Seoul': 'ICN',
  'Cairo': 'CAI', 'Rio de Janeiro': 'GIG', 'Sao Paulo': 'GRU', 'Mexico City': 'MEX'
};

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getRandomItems<T>(arr: T[], n: number): T[] {
  // Fisher-Yates Shuffle
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, n);
}

function generateTime(startHour: number, endHour: number): string {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.random() < 0.5 ? '00' : '30';
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute} ${ampm}`;
}

function addDuration(startTime: string, durationTotalMins: number): string {
  // Format "10:00 AM"
  let [time, modifier] = startTime.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  let totalMinutes = hours * 60 + minutes + durationTotalMins;
  
  // Normalize to 24h
  totalMinutes = totalMinutes % (24 * 60);
  
  let newHours = Math.floor(totalMinutes / 60);
  let newMinutes = Math.floor(totalMinutes % 60);
  
  const newModifier = newHours >= 12 ? 'PM' : 'AM';
  newHours = newHours % 12;
  if (newHours === 0) newHours = 12;
  
  const newMinutesStr = newMinutes < 10 ? `0${newMinutes}` : newMinutes;
  
  return `${newHours}:${newMinutesStr} ${newModifier}`;
}

function getAirportCode(locationName: string): string {
  if (!locationName) return 'XXX';
  // Take the city name part (before first comma)
  const city = locationName.split(',')[0].trim();
  
  // Check dictionary
  if (AIRPORT_CODES[city]) return AIRPORT_CODES[city];
  
  // Fallback: generate 3 letter code from name
  const clean = city.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return clean.substring(0, 3) || 'XXX';
}

// --- Main Generation Logic ---

export const generateDreamTrip = async (input: DreamTripInput): Promise<DreamTripResult> => {
  // Simulate API Latency
  await new Promise(resolve => setTimeout(resolve, 3000));

  const destName = input.destinationLocation?.name || "Unknown Destination";
  const depName = input.departureLocation?.name || "Unknown Departure";
  const days = Math.ceil((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // 1. Calculate Flight Details based on Real Coordinates
  const depLat = input.departureLocation?.lat || 40.7128; // Default NYC
  const depLng = input.departureLocation?.lng || -74.0060;
  const destLat = input.destinationLocation?.lat || 48.8566; // Default Paris
  const destLng = input.destinationLocation?.lng || 2.3522;

  const distanceKm = getDistanceFromLatLonInKm(depLat, depLng, destLat, destLng);
  
  // Base time ~800km/h + 45mins takeoff/landing taxi
  const baseFlightHours = (distanceKm / 800) + 0.75; 
  
  // Directional wind bias (West->East is typically faster due to jet streams)
  const isEastBound = destLng > depLng;
  const windFactor = distanceKm > 3000 ? (isEastBound ? -0.5 : 0.5) : 0;

  // Random variation +/- 15 mins
  const randomVar1 = (Math.random() * 0.5) - 0.25;
  const randomVar2 = (Math.random() * 0.5) - 0.25;

  const outboundDurationTotal = baseFlightHours + windFactor + randomVar1;
  const returnDurationTotal = baseFlightHours - windFactor + randomVar2; // Return is opposite direction

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return { str: `${h}h ${m}m`, totalMins: h * 60 + m };
  };

  const outboundInfo = formatDuration(outboundDurationTotal);
  const returnInfo = formatDuration(returnDurationTotal);

  // Airport Codes
  const originCode = getAirportCode(depName);
  const destCode = getAirportCode(destName);

  // Cost Calculation
  const baseFlightCost = 150 + (distanceKm * 0.12); 
  const priceVariation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
  const estimatedFlightCost = Math.round(baseFlightCost * priceVariation);
  
  const estimatedHotelCost = (150 * days) * input.travelers; 
  const totalCost = Math.round((estimatedFlightCost * input.travelers) + estimatedHotelCost + (days * 100 * input.travelers));

  // Generate Flights
  // Get 2 distinct airlines for variety
  const selectedAirlines = getRandomItems(AIRLINES, 4); 
  
  // Outbound Flights
  const outboundFlights: FlightOption[] = [0, 1].map((idx) => {
    const airline = selectedAirlines[idx];
    const depTime = generateTime(6 + idx * 3, 10 + idx * 3); 
    return {
      id: `out_${idx}`,
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 899) + 100}`,
      departureTime: depTime,
      arrivalTime: addDuration(depTime, outboundInfo.totalMins),
      duration: outboundInfo.str,
      price: Math.round(estimatedFlightCost * (1 + (idx * 0.1))),
      logo: airline.logo,
      origin: originCode,
      destination: destCode
    };
  });

  // Return Flights (Swap Origin/Dest)
  const returnFlights: FlightOption[] = [2, 3].map((idx) => {
    const airline = selectedAirlines[idx];
    const depTime = generateTime(10 + (idx-2) * 3, 16 + (idx-2) * 3);
    return {
      id: `ret_${idx}`,
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 899) + 100}`,
      departureTime: depTime,
      arrivalTime: addDuration(depTime, returnInfo.totalMins),
      duration: returnInfo.str,
      price: Math.round(estimatedFlightCost * (1 + ((idx-2) * 0.05))),
      logo: airline.logo,
      origin: destCode,
      destination: originCode
    };
  });

  // 2. Hotel Selection
  let selectedHotel: HotelOption | null = null;
  const normalizedDest = destName.toLowerCase();
  
  // Try to find a real hotel from MOCK_DB
  const realCity = MOCK_DB.cities.find(c => 
    c.name.toLowerCase().includes(normalizedDest) || normalizedDest.includes(c.name.toLowerCase())
  );
  
  if (realCity) {
     const cityHotels = MOCK_DB.accommodations.filter(a => a.cityId === realCity.id);
     if (cityHotels.length > 0) {
        const randomHotel = cityHotels[Math.floor(Math.random() * cityHotels.length)];
        selectedHotel = {
            id: randomHotel.id,
            name: randomHotel.name,
            image: randomHotel.image,
            rating: randomHotel.rating,
            pricePerNight: randomHotel.priceValue,
            address: `${randomHotel.name}, ${realCity.name}`,
            amenities: randomHotel.amenities,
            website: randomHotel.website
        };
     }
  }

  // Fallback Hotel
  if (!selectedHotel) {
     const fallbackName = `Grand ${destName} Resort`;
     selectedHotel = {
        id: 'ht_generated',
        name: fallbackName,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        pricePerNight: 180,
        address: `123 Main Boulevard, ${destName}`,
        amenities: ['Pool', 'Spa', 'Free Wifi', 'Breakfast'],
        website: `https://www.google.com/search?q=${encodeURIComponent(fallbackName + " official website")}`
     }
  }

  // 3. Visa Logic based on Destination
  const visaFree = ['France', 'Italy', 'Germany', 'Spain', 'UK', 'USA', 'Japan'].some(c => normalizedDest.includes(c.toLowerCase()) || realCity?.country.toLowerCase().includes(c.toLowerCase())); 
  
  // Thematic activity names
  // CRITICAL: Type 'TripTheme' imported from '../types'
  const getActivityName = (theme: TripTheme, type: 'morning' | 'evening') => {
    if (theme === 'Business') return type === 'morning' ? 'Networking Breakfast' : 'Co-working Session';
    if (theme === 'Foodie') return type === 'morning' ? 'Local Market Tour' : 'Street Food Adventure';
    if (theme === 'Luxury') return type === 'morning' ? 'Private Yacht Tour' : 'Michelin Star Dining';
    if (theme === 'Cultural') return type === 'morning' ? 'Historical Walking Tour' : 'Museum Exploration';
    if (theme === 'Adventure') return type === 'morning' ? 'Hiking Expedition' : 'Outdoor Activity';
    if (theme === 'Relax') return type === 'morning' ? 'Late Breakfast' : 'Spa Treatment';
    return type === 'morning' ? 'Guided City Tour' : 'Evening Leisure';
  };

  return {
    id: uuidv4(),
    destination: destName,
    dates: `${new Date(input.startDate).toLocaleDateString()} - ${new Date(input.endDate).toLocaleDateString()}`,
    travelers: input.travelers,
    totalEstimatedCost: input.budget > 0 ? Math.min(input.budget, totalCost) : totalCost,
    highlights: [
      `Sunset at ${destName} Skyline`,
      `Exclusive ${input.theme} Focus`,
      `Curated Culinary Tour in ${destName}`
    ],
    flights: {
      outbound: outboundFlights,
      return: returnFlights
    },
    hotel: selectedHotel,
    visa: {
      type: visaFree ? 'Visa Not Required' : 'Tourist Visa',
      required: !visaFree,
      processingTime: visaFree ? 'N/A' : '5-7 Business Days',
      checklist: visaFree 
        ? ['Valid Passport'] 
        : ['Valid Passport (6 months validity)', 'Proof of Accommodation', 'Return Flight Tickets', 'Bank Statement']
    },
    itinerary: Array.from({ length: days }).map((_, i) => ({
      day: i + 1,
      date: new Date(new Date(input.startDate).getTime() + i * 86400000).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'}),
      title: i === 0 ? 'Arrival & Check-in' : i === days - 1 ? 'Departure' : `${destName} ${input.theme} Experience`,
      activities: [
        {
          time: '09:00 AM',
          name: i === 0 ? 'Airport Pickup' : getActivityName(input.theme, 'morning'),
          description: i === 0 ? 'Transfer to hotel' : `Curated session based on your ${input.theme} preference.`,
          icon: 'travel'
        },
        {
          time: '01:00 PM',
          name: 'Lunch at Local Spot',
          description: 'Enjoy traditional cuisine or local favorites.',
          icon: 'food'
        },
        {
          time: '03:00 PM',
          name: getActivityName(input.theme, 'evening'),
          description: `Afternoon immersion into ${destName}'s best ${input.theme.toLowerCase()} spots.`,
          icon: 'activity'
        }
      ]
    }))
  };
};