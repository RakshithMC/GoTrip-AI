const path = require('path');

// Simulate the logic from mockSmartPlan
const { MOCK_DB } = require('../services/data');

function getThematicExperience(theme, dest, slot) {
  if (theme === 'Adventure') {
    if (slot === 'morning') return `High-Adrenaline Desert Safari & Dune Bashing in ${dest}`;
    if (slot === 'afternoon') return `Coastal Watersports & Speedboat Excursion in ${dest}`;
    if (slot === 'nature') return `Guided Mountain Trail & Ridge Viewpoint in ${dest}`;
    return `Outdoor Gear & Extreme Adventure Outlets in ${dest}`;
  }
  if (theme === 'Relax') {
    if (slot === 'morning') return `Luxury Thermal Spa & Mineral Bath Wellness in ${dest}`;
    if (slot === 'afternoon') return `Tranquil Sunset Catamaran Cruise along ${dest} Coast`;
    if (slot === 'nature') return `Botanical Gardens & Serenity Park Walk in ${dest}`;
    return `Artisan Wellness Boutiques & Essential Oils Market`;
  }
  if (theme === 'Foodie') {
    if (slot === 'morning') return `Chef-Led Street Food & Spice Market Tour in ${dest}`;
    if (slot === 'afternoon') return `Hands-on Culinary Masterclass & Wine Tasting in ${dest}`;
    if (slot === 'nature') return `Organic Farm & Vineyard Excursion in ${dest}`;
    return `Gourmet Food Hall & Delicacy Curation in ${dest}`;
  }
  if (theme === 'Cultural') {
    if (slot === 'morning') return `Ancient Temples & Sacred Heritage Architecture Tour in ${dest}`;
    if (slot === 'afternoon') return `Traditional Artisan Workshop & Folk Craft Demonstration`;
    if (slot === 'nature') return `Historic Canal Walk & Monument Gardens in ${dest}`;
    return `Old Quarter Souk & Antique Curation in ${dest}`;
  }
  if (theme === 'Luxury') {
    if (slot === 'morning') return `Private Helicopter Skyline Tour of ${dest}`;
    if (slot === 'afternoon') return `VIP Yacht Cruise with Champagne & Ocean Breeze in ${dest}`;
    if (slot === 'nature') return `Exclusive Private Beach & Island Lounge`;
    return `Haute Couture & Designer Boulevard Shopping in ${dest}`;
  }
  if (theme === 'Business') {
    if (slot === 'morning') return `Modern Financial District & Innovation Hub Tour in ${dest}`;
    if (slot === 'afternoon') return `Executive Lounge & High-Rise Networking Session`;
    if (slot === 'nature') return `Urban Waterfront Boardwalk & Green Promenade in ${dest}`;
    return `Premium Tech & Business Shopping Galleria in ${dest}`;
  }
  if (slot === 'morning') return `Panoramic City Tour & Iconic Neighborhood Walk in ${dest}`;
  if (slot === 'afternoon') return `Scenic River Cruise & Historical Harbor Discovery in ${dest}`;
  if (slot === 'nature') return `Central Park & Botanical Conservatory in ${dest}`;
  return `Local Crafts Market & Vibrant Shopping Quarter in ${dest}`;
}

function buildDestinationItinerary(destName, theme, daysCount, startDate) {
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

    if (dayNum === 1) {
      const topAttraction = cityAttractions[0]?.name || `${destName} Skyline & City Center`;
      const welcomeRest = cityRestaurants[0]?.name || `${destName} Local Cuisine Bistro`;
      return {
        day: dayNum,
        date: dateStr,
        title: 'Arrival, Check-in & City Orientation',
        activities: [
          { time: '09:00 AM', name: 'Airport Arrival & Hotel Check-in', description: `Land in ${destName}, private transfer to accommodation, and settle in.`, icon: 'travel' },
          { time: '01:00 PM', name: `Welcome Lunch at ${welcomeRest}`, description: `Enjoy an authentic first taste of local cuisine and regional specialties.`, icon: 'food' },
          { time: '04:00 PM', name: `Sunset Exploration at ${topAttraction}`, description: `Leisurely evening stroll and panoramic introductory views of ${destName}.`, icon: 'activity' },
        ],
      };
    }

    if (dayNum === 2) {
      const landmark = cityAttractions[1]?.name || cityAttractions[0]?.name || `${destName} Historic Heritage Quarter`;
      const lunchSpot = cityRestaurants[1]?.name || cityRestaurants[0]?.name || `${destName} Traditional Eatery`;
      const afternoonSite = cityAttractions[2]?.name || `${destName} Cultural Museum & Arts Plaza`;
      return {
        day: dayNum,
        date: dateStr,
        title: 'Iconic Landmarks & Heritage Exploration',
        activities: [
          { time: '09:00 AM', name: `Guided Tour of ${landmark}`, description: `Discover the rich history, iconic architecture, and celebrated landmarks of ${destName}.`, icon: 'activity' },
          { time: '01:00 PM', name: `Artisanal Lunch at ${lunchSpot}`, description: `Savor signature regional dishes, fresh local ingredients, and local culinary culture.`, icon: 'food' },
          { time: '03:30 PM', name: `Afternoon Immersion at ${afternoonSite}`, description: `Explore renowned galleries, historical exhibits, and vibrant heritage streets.`, icon: 'activity' },
        ],
      };
    }

    if (dayNum === 3) {
      const expName = cityExperiences[0] || getThematicExperience(theme, destName, 'morning');
      const lunchSpot = cityRestaurants[2]?.name || cityRestaurants[0]?.name || `${destName} Waterfront Terrace`;
      const afternoonExp = cityExperiences[1] || getThematicExperience(theme, destName, 'afternoon');
      return {
        day: dayNum,
        date: dateStr,
        title: `${theme} Immersion & Hidden Gems`,
        activities: [
          { time: '09:30 AM', name: `${expName}`, description: `Handpicked immersive experience tailored to your ${theme.toLowerCase()} travel style.`, icon: 'activity' },
          { time: '01:00 PM', name: `Scenic Lunch at ${lunchSpot}`, description: `Relaxed dining with panoramic views and regional gastronomy.`, icon: 'food' },
          { time: '04:00 PM', name: `${afternoonExp}`, description: `Discover vibrant artisan markets, scenic viewpoints, and local favorite spots.`, icon: 'activity' },
        ],
      };
    }

    if (dayNum === 4) {
      const morningExp = getThematicExperience(theme, destName, 'nature');
      const lunchSpot = cityRestaurants[3]?.name || cityRestaurants[1]?.name || `${destName} Old Town Cafe`;
      const afternoonSite = getThematicExperience(theme, destName, 'shopping');
      return {
        day: dayNum,
        date: dateStr,
        title: 'Scenic Views, Local Markets & Leisure',
        activities: [
          { time: '09:30 AM', name: `${morningExp}`, description: `Enjoy scenic natural landscapes, botanical gardens, and fresh morning atmosphere.`, icon: 'activity' },
          { time: '01:00 PM', name: `Lunch & Pastry Tasting at ${lunchSpot}`, description: `Taste local artisanal desserts, specialties, and specialty tea/coffee.`, icon: 'food' },
          { time: '03:30 PM', name: `${afternoonSite}`, description: `Explore boutique lanes, craft markets, and unique cultural souvenirs in ${destName}.`, icon: 'activity' },
        ],
      };
    }

    return {
      day: dayNum,
      date: dateStr,
      title: `Final Sights & Departure`,
      activities: [
        { time: '09:30 AM', name: `Morning Promenade & Last Sightseeing`, description: `Capture final scenic photos and take a tranquil morning walk.`, icon: 'activity' },
        { time: '12:30 PM', name: `Farewell Feast at Viewpoint`, description: `A memorable concluding meal celebrating the journey.`, icon: 'food' },
        { time: '03:30 PM', name: `Airport Transfer`, description: `Transfer to departure terminal.`, icon: 'travel' },
      ]
    };
  });
}

// Test Dubai 4-day Relax Trip
console.log('=== TESTING 4-DAY DUBAI RELAX TRIP ===');
const dubaiItin = buildDestinationItinerary('Dubai', 'Relax', 4, '2026-10-10');

dubaiItin.forEach(day => {
  console.log(`\n--- Day ${day.day}: ${day.title} (${day.date}) ---`);
  day.activities.forEach(act => {
    console.log(`  [${act.time}] (${act.icon.toUpperCase()}) ${act.name}`);
    console.log(`    ${act.description}`);
  });
});

// Assertions
const day1Acts = dubaiItin[0].activities.map(a => a.name).join(' | ');
const day2Acts = dubaiItin[1].activities.map(a => a.name).join(' | ');
const day3Acts = dubaiItin[2].activities.map(a => a.name).join(' | ');
const day4Acts = dubaiItin[3].activities.map(a => a.name).join(' | ');

if (day1Acts === day2Acts || day2Acts === day3Acts || day3Acts === day4Acts) {
  console.error('\n❌ FAILED: Duplicate day activities detected!');
  process.exit(1);
} else {
  console.log('\n✅ PASSED: All 4 days have unique and distinct activities!');
}
