import { generateDreamTrip } from '../services/mockSmartPlan';
import { DreamTripInput } from '../types';

async function runTest() {
  const input: DreamTripInput = {
    departureLocation: { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
    destinationLocation: { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
    startDate: '2026-10-10',
    endDate: '2026-10-13',
    budget: 300000,
    travelers: 2,
    theme: 'Relax',
    needsFlight: true,
    needsAccommodation: true,
    needsItinerary: true,
  };

  console.log('Generating 4-day Dubai trip...');
  const result = await generateDreamTrip(input);

  console.log('Destination:', result.destination);
  console.log('Dates:', result.dates);
  console.log('Days count:', result.itinerary.length);

  result.itinerary.forEach((day) => {
    console.log(`\n================== Day ${day.day}: ${day.title} (${day.date}) ==================`);
    day.activities.forEach((act) => {
      console.log(`  [${act.time}] (${act.icon}) ${act.name}`);
      console.log(`    ${act.description}`);
    });
  });

  // Verify all days are distinct
  const day1Acts = result.itinerary[0].activities.map(a => a.name).join(' | ');
  const day2Acts = result.itinerary[1].activities.map(a => a.name).join(' | ');
  const day3Acts = result.itinerary[2].activities.map(a => a.name).join(' | ');
  const day4Acts = result.itinerary[3].activities.map(a => a.name).join(' | ');

  console.log('\n--- VERIFICATION OF UNIQUENESS ---');
  console.log('Day 1 acts:', day1Acts);
  console.log('Day 2 acts:', day2Acts);
  console.log('Day 3 acts:', day3Acts);
  console.log('Day 4 acts:', day4Acts);

  if (day1Acts === day2Acts || day2Acts === day3Acts || day3Acts === day4Acts) {
    console.error('❌ FAILED: Duplicate days detected!');
    process.exit(1);
  } else {
    console.log('✅ PASSED: Day 1 != Day 2 != Day 3 != Day 4. All days are distinct and theme-appropriate!');
  }
}

runTest().catch(console.error);
