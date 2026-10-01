const fs = require('fs');
const path = require('path');

// 1. Update services/mockSmartPlan.ts
const mockPlanPath = path.join(__dirname, '..', 'services', 'mockSmartPlan.ts');
let mockContent = fs.readFileSync(mockPlanPath, 'utf8');

// Replace the entire itinerary generation logic with rich multi-day engine
const newMockContent = `import { DreamTripInput, DreamTripResult, HotelOption, FlightOption, TripTheme, DailyItinerary } from '../types';
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

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getRandomItems<T>(arr: T[], n: number): T[] {
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
  return \`\${displayHour}:\${minute} \${ampm}\`;
}

function addDuration(startTime: string, durationTotalMins: number): string {
  let [time, modifier] = startTime.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  let totalMinutes = hours * 60 + minutes + durationTotalMins;
  totalMinutes = totalMinutes % (24 * 60);
  
  let newHours = Math.floor(totalMinutes / 60);
  let newMinutes = Math.floor(totalMinutes % 60);
  
  const newModifier = newHours >= 12 ? 'PM' : 'AM';
  newHours = newHours % 12;
  if (newHours === 0) newHours = 12;
  
  const newMinutesStr = newMinutes < 10 ? \`0\${newMinutes}\` : newMinutes;
  return \`\${newHours}:\${newMinutesStr} \${newModifier}\`;
}

function getAirportCode(locationName: string): string {
  if (!locationName) return 'XXX';
  const city = locationName.split(',')[0].trim();
  if (AIRPORT_CODES[city]) return AIRPORT_CODES[city];
  const clean = city.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return clean.substring(0, 3) || 'XXX';
}

function getThematicExperience(theme: TripTheme, dest: string, slot: 'morning' | 'afternoon' | 'nature' | 'shopping'): string {
  if (theme === 'Adventure') {
    if (slot === 'morning') return \`High-Adrenaline Desert Safari & Dune Bashing in \${dest}\`;
    if (slot === 'afternoon') return \`Coastal Watersports & Speedboat Excursion in \${dest}\`;
    if (slot === 'nature') return \`Guided Mountain Trail & Ridge Viewpoint in \${dest}\`;
    return \`Outdoor Gear & Extreme Adventure Outlets in \${dest}\`;
  }
  if (theme === 'Relax') {
    if (slot === 'morning') return \`Luxury Thermal Spa & Mineral Bath Wellness in \${dest}\`;
    if (slot === 'afternoon') return \`Tranquil Sunset Catamaran Cruise along \${dest} Coast\`;
    if (slot === 'nature') return \`Botanical Gardens & Serenity Park Walk in \${dest}\`;
    return \`Artisan Wellness Boutiques & Essential Oils Market\`;
  }
  if (theme === 'Foodie') {
    if (slot === 'morning') return \`Chef-Led Street Food & Spice Market Tour in \${dest}\`;
    if (slot === 'afternoon') return \`Hands-on Culinary Masterclass & Wine Tasting in \${dest}\`;
    if (slot === 'nature') return \`Organic Farm & Vineyard Excursion in \${dest}\`;
    return \`Gourmet Food Hall & Delicacy Curation in \${dest}\`;
  }
  if (theme === 'Cultural') {
    if (slot === 'morning') return \`Ancient Temples & Sacred Heritage Architecture Tour in \${dest}\`;
    if (slot === 'afternoon') return \`Traditional Artisan Workshop & Folk Craft Demonstration\`;
    if (slot === 'nature') return \`Historic Canal Walk & Monument Gardens in \${dest}\`;
    return \`Old Quarter Souk & Antique Curation in \${dest}\`;
  }
  if (theme === 'Luxury') {
    if (slot === 'morning') return \`Private Helicopter Skyline Tour of \${dest}\`;
    if (slot === 'afternoon') return \`VIP Yacht Cruise with Champagne & Ocean Breeze in \${dest}\`;
    if (slot === 'nature') return \`Exclusive Private Beach & Island Lounge\`;
    return \`Haute Couture & Designer Boulevard Shopping in \${dest}\`;
  }
  if (theme === 'Business') {
    if (slot === 'morning') return \`Modern Financial District & Innovation Hub Tour in \${dest}\`;
    if (slot === 'afternoon') return \`Executive Lounge & High-Rise Networking Session\`;
    if (slot === 'nature') return \`Urban Waterfront Boardwalk & Green Promenade in \${dest}\`;
    return \`Premium Tech & Business Shopping Galleria in \${dest}\`;
  }
  if (slot === 'morning') return \`Panoramic City Tour & Iconic Neighborhood Walk in \${dest}\`;
  if (slot === 'afternoon') return \`Scenic River Cruise & Historical Harbor Discovery in \${dest}\`;
  if (slot === 'nature') return \`Central Park & Botanical Conservatory in \${dest}\`;
  return \`Local Crafts Market & Vibrant Shopping Quarter in \${dest}\`;
}

function buildDestinationItinerary(
  destName: string,
  theme: TripTheme,
  daysCount: number,
  startDate: string
): DailyItinerary[] {
  const normalizedDest = destName.toLowerCase();
  const realCity = MOCK_DB.cities.find(c => 
    c.name.toLowerCase().includes(normalizedDest) || normalizedDest.includes(c.name.toLowerCase())
  );

  const cityAttractions = realCity ? MOCK_DB.attractions.filter(a => a.cityId === realCity.id) : [];
  const cityRestaurants = realCity ? MOCK_DB.restaurants.filter(r => r.cityId === realCity.id) : [];
  const cityExperiences = realCity ? (realCity.experiences || []) : [];

  return Array.from({ length: daysCount }).map((_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(new Date(startDate).getTime() + i * 86400000);
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    // Day 1: Arrival & Orientation
    if (dayNum === 1) {
      const topAttraction = cityAttractions[0]?.name || \`\${destName} Skyline & City Center\`;
      const welcomeRest = cityRestaurants[0]?.name || \`\${destName} Local Cuisine Bistro\`;
      return {
        day: dayNum,
        date: dateStr,
        title: 'Arrival, Check-in & City Orientation',
        activities: [
          {
            time: '09:00 AM',
            name: 'Airport Arrival & Hotel Check-in',
            description: \`Land in \${destName}, private transfer to accommodation, and settle in.\`,
            icon: 'travel' as const,
          },
          {
            time: '01:00 PM',
            name: \`Welcome Lunch at \${welcomeRest}\`,
            description: \`Enjoy an authentic first taste of local cuisine and regional specialties.\`,
            icon: 'food' as const,
          },
          {
            time: '04:00 PM',
            name: \`Sunset Exploration at \${topAttraction}\`,
            description: \`Leisurely evening stroll and panoramic introductory views of \${destName}.\`,
            icon: 'activity' as const,
          },
        ],
      };
    }

    // Day 2: Iconic Landmarks & Culture
    if (dayNum === 2) {
      const landmark = cityAttractions[1]?.name || cityAttractions[0]?.name || \`\${destName} Historic Heritage Quarter\`;
      const lunchSpot = cityRestaurants[1]?.name || cityRestaurants[0]?.name || \`\${destName} Traditional Eatery\`;
      const afternoonSite = cityAttractions[2]?.name || \`\${destName} Cultural Museum & Arts Plaza\`;
      return {
        day: dayNum,
        date: dateStr,
        title: 'Iconic Landmarks & Heritage Exploration',
        activities: [
          {
            time: '09:00 AM',
            name: \`Guided Tour of \${landmark}\`,
            description: \`Discover the rich history, iconic architecture, and celebrated landmarks of \${destName}.\`,
            icon: 'activity' as const,
          },
          {
            time: '01:00 PM',
            name: \`Artisanal Lunch at \${lunchSpot}\`,
            description: \`Savor signature regional dishes, fresh local ingredients, and local culinary culture.\`,
            icon: 'food' as const,
          },
          {
            time: '03:30 PM',
            name: \`Afternoon Immersion at \${afternoonSite}\`,
            description: \`Explore renowned galleries, historical exhibits, and vibrant heritage streets.\`,
            icon: 'activity' as const,
          },
        ],
      };
    }

    // Day 3: Thematic Immersion & Local Experiences
    if (dayNum === 3) {
      const expName = cityExperiences[0] || getThematicExperience(theme, destName, 'morning');
      const lunchSpot = cityRestaurants[2]?.name || cityRestaurants[0]?.name || \`\${destName} Waterfront Terrace\`;
      const afternoonExp = cityExperiences[1] || getThematicExperience(theme, destName, 'afternoon');
      return {
        day: dayNum,
        date: dateStr,
        title: \`\${theme} Immersion & Hidden Gems\`,
        activities: [
          {
            time: '09:30 AM',
            name: \`\${expName}\`,
            description: \`Handpicked immersive experience tailored to your \${theme.toLowerCase()} travel style.\`,
            icon: 'activity' as const,
          },
          {
            time: '01:00 PM',
            name: \`Scenic Lunch at \${lunchSpot}\`,
            description: \`Relaxed dining with panoramic views and regional gastronomy.\`,
            icon: 'food' as const,
          },
          {
            time: '04:00 PM',
            name: \`\${afternoonExp}\`,
            description: \`Discover vibrant artisan markets, scenic viewpoints, and local favorite spots.\`,
            icon: 'activity' as const,
          },
        ],
      };
    }

    // Day 4: Scenic Views, Markets & Leisure
    if (dayNum === 4) {
      const morningExp = getThematicExperience(theme, destName, 'nature');
      const lunchSpot = cityRestaurants[3]?.name || cityRestaurants[1]?.name || \`\${destName} Old Town Cafe\`;
      const afternoonSite = getThematicExperience(theme, destName, 'shopping');
      return {
        day: dayNum,
        date: dateStr,
        title: 'Scenic Views, Local Markets & Leisure',
        activities: [
          {
            time: '09:30 AM',
            name: \`\${morningExp}\`,
            description: \`Enjoy scenic natural landscapes, botanical gardens, and fresh morning atmosphere.\`,
            icon: 'activity' as const,
          },
          {
            time: '01:00 PM',
            name: \`Lunch & Pastry Tasting at \${lunchSpot}\`,
            description: \`Taste local artisanal desserts, specialties, and specialty tea/coffee.\`,
            icon: 'food' as const,
          },
          {
            time: '03:30 PM',
            name: \`\${afternoonSite}\`,
            description: \`Explore boutique lanes, craft markets, and unique cultural souvenirs in \${destName}.\`,
            icon: 'activity' as const,
          },
        ],
      };
    }

    // Day 5+: Extended / Departure
    const isLastDay = dayNum === daysCount;
    if (isLastDay) {
      return {
        day: dayNum,
        date: dateStr,
        title: 'Final Sights, Souvenirs & Departure',
        activities: [
          {
            time: '09:30 AM',
            name: \`Morning Promenade & Last Sightseeing in \${destName}\`,
            description: \`Capture final scenic photos and take a tranquil morning walk through \${destName}.\`,
            icon: 'activity' as const,
          },
          {
            time: '12:30 PM',
            name: \`Farewell Feast at \${destName} Viewpoint\`,
            description: \`A memorable concluding meal celebrating the best flavours of the journey.\`,
            icon: 'food' as const,
          },
          {
            time: '03:30 PM',
            name: 'Hotel Check-out & Airport Transfer',
            description: 'Pack memories, check out from accommodation, and transfer to departure terminal.',
            icon: 'travel' as const,
          },
        ],
      };
    }

    // Generic Day 5, 6, etc.
    return {
      day: dayNum,
      date: dateStr,
      title: \`Regional Excursion & Natural Heritage - Day \${dayNum}\`,
      activities: [
        {
          time: '09:00 AM',
          name: \`Day Excursion to Surrounding \${destName} Countryside\`,
          description: \`Full morning excursion exploring scenic valleys, historic hamlets, and nature sanctuaries.\`,
          icon: 'travel' as const,
        },
        {
          time: '01:00 PM',
          name: \`Country Tavern Feast & Regional Tasting\`,
          description: \`Rustic farm-to-table lunch highlighting seasonal harvests and local vintage.\`,
          icon: 'food' as const,
        },
        {
          time: '04:00 PM',
          name: \`Artisan Village Walk & Scenic Lookout\`,
          description: \`Stroll through peaceful cobblestone villages with breathtaking sunset panoramas.\`,
          icon: 'activity' as const,
        },
      ],
    };
  });
}

// --- Main Generation Logic ---

export const generateDreamTrip = async (input: DreamTripInput): Promise<DreamTripResult> => {
  // Simulate API Latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  const destName = input.destinationLocation?.name || "Unknown Destination";
  const depName = input.departureLocation?.name || "Unknown Departure";
  const days = Math.max(1, Math.ceil((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // 1. Calculate Flight Details based on Real Coordinates
  const depLat = input.departureLocation?.lat || 40.7128;
  const depLng = input.departureLocation?.lng || -74.0060;
  const destLat = input.destinationLocation?.lat || 48.8566;
  const destLng = input.destinationLocation?.lng || 2.3522;

  const distanceKm = getDistanceFromLatLonInKm(depLat, depLng, destLat, destLng);
  
  const baseFlightHours = (distanceKm / 800) + 0.75; 
  const isEastBound = destLng > depLng;
  const windFactor = distanceKm > 3000 ? (isEastBound ? -0.5 : 0.5) : 0;

  const randomVar1 = (Math.random() * 0.5) - 0.25;
  const randomVar2 = (Math.random() * 0.5) - 0.25;

  const outboundDurationTotal = baseFlightHours + windFactor + randomVar1;
  const returnDurationTotal = baseFlightHours - windFactor + randomVar2;

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return { str: \`\${h}h \${m}m\`, totalMins: h * 60 + m };
  };

  const outboundInfo = formatDuration(outboundDurationTotal);
  const returnInfo = formatDuration(returnDurationTotal);

  const originCode = getAirportCode(depName);
  const destCode = getAirportCode(destName);

  const baseFlightCost = 150 + (distanceKm * 0.12); 
  const priceVariation = Math.random() * 0.4 + 0.8;
  const estimatedFlightCost = Math.round(baseFlightCost * priceVariation);
  
  const estimatedHotelCost = (150 * days) * input.travelers; 
  const totalCost = Math.round((estimatedFlightCost * input.travelers) + estimatedHotelCost + (days * 100 * input.travelers));

  const selectedAirlines = getRandomItems(AIRLINES, 4); 
  
  const outboundFlights: FlightOption[] = [0, 1].map((idx) => {
    const airline = selectedAirlines[idx];
    const depTime = generateTime(6 + idx * 3, 10 + idx * 3); 
    return {
      id: \`out_\${idx}\`,
      airline: airline.name,
      flightNumber: \`\${airline.code}\${Math.floor(Math.random() * 899) + 100}\`,
      departureTime: depTime,
      arrivalTime: addDuration(depTime, outboundInfo.totalMins),
      duration: outboundInfo.str,
      price: Math.round(estimatedFlightCost * (1 + (idx * 0.1))),
      logo: airline.logo,
      origin: originCode,
      destination: destCode
    };
  });

  const returnFlights: FlightOption[] = [2, 3].map((idx) => {
    const airline = selectedAirlines[idx];
    const depTime = generateTime(10 + (idx-2) * 3, 16 + (idx-2) * 3);
    return {
      id: \`ret_\${idx}\`,
      airline: airline.name,
      flightNumber: \`\${airline.code}\${Math.floor(Math.random() * 899) + 100}\`,
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
            address: \`\${randomHotel.name}, \${realCity.name}\`,
            amenities: randomHotel.amenities,
            website: randomHotel.website
        };
     }
  }

  if (!selectedHotel) {
     const fallbackName = \`Grand \${destName} Resort\`;
     selectedHotel = {
        id: 'ht_generated',
        name: fallbackName,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        pricePerNight: 180,
        address: \`123 Main Boulevard, \${destName}\`,
        amenities: ['Pool', 'Spa', 'Free Wifi', 'Breakfast'],
        website: \`https://www.google.com/search?q=\${encodeURIComponent(fallbackName + " official website")}\`
     };
  }

  const visaFree = ['France', 'Italy', 'Germany', 'Spain', 'UK', 'USA', 'Japan'].some(c => normalizedDest.includes(c.toLowerCase()) || realCity?.country.toLowerCase().includes(c.toLowerCase())); 

  return {
    id: uuidv4(),
    destination: destName,
    dates: \`\${new Date(input.startDate).toLocaleDateString()} - \${new Date(input.endDate).toLocaleDateString()}\`,
    travelers: input.travelers,
    totalEstimatedCost: input.budget > 0 ? Math.min(input.budget, totalCost) : totalCost,
    highlights: [
      \`Sunset at \${destName} Skyline\`,
      \`Exclusive \${input.theme} Highlights & Local Culture\`,
      \`Curated Culinary Journey across \${destName}\`
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
    itinerary: buildDestinationItinerary(destName, input.theme, days, input.startDate),
    route: [
      {
        from: depName,
        to: destName,
        coords: [
          [depLat, depLng],
          [destLat, destLng]
        ],
        mode: 'Flight',
        duration: outboundInfo.str,
        distance: \`\${Math.round(distanceKm)} km\`,
        durationText: outboundInfo.str,
        distanceText: \`\${Math.round(distanceKm)} km\`,
      }
    ]
  };
};
`;

fs.writeFileSync(mockPlanPath, newMockContent, 'utf8');
console.log('Successfully upgraded mockSmartPlan.ts with multi-day distinct itinerary engine.');
