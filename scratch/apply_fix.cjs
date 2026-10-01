const fs = require('fs');
const path = require('path');

// 1. Fix components/SmartPlan.tsx
const smartPlanPath = path.join(__dirname, '..', 'components', 'SmartPlan.tsx');
let smartPlanContent = fs.readFileSync(smartPlanPath, 'utf8');

// Replace RouteMap route prop
smartPlanContent = smartPlanContent.replace(
  '<RouteMap ref={routeMapRef} route={tripResult.route} />',
  '<RouteMap ref={routeMapRef} route={tripResult.route || []} />'
);

// Replace route.map in Route Tab
const oldRouteMapBlock = `{tripResult.route.map((segment, idx) => {`;
const newRouteMapBlock = `{tripResult.route && tripResult.route.length > 0 ? (
                                                          tripResult.route.map((segment, idx) => {`;

if (smartPlanContent.includes(oldRouteMapBlock)) {
  smartPlanContent = smartPlanContent.replace(
    oldRouteMapBlock,
    newRouteMapBlock
  );

  // Normalize line endings for replacement
  const isCRLF = smartPlanContent.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const oldClosing = [
    '                                                              );',
    '                                                          })}',
    '                                                      </div>'
  ].join(eol);

  const newClosing = [
    '                                                              );',
    '                                                          })',
    '                                                      ) : (',
    '                                                          <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">',
    '                                                              <Compass size={24} className="text-blue-500 mx-auto mb-1.5 opacity-60" />',
    '                                                              <p className="font-bold text-xs text-slate-700 dark:text-slate-300">Route segments are calculated automatically from itinerary waypoints.</p>',
    '                                                              <p className="text-[10px] text-slate-400 mt-0.5">Use "View Full Route in Google Maps" below for live turn-by-turn navigation.</p>',
    '                                                          </div>',
    '                                                      )}',
    '                                                      </div>'
  ].join(eol);

  smartPlanContent = smartPlanContent.replace(oldClosing, newClosing);
}

// Protect highlights mapping
smartPlanContent = smartPlanContent.replace(
  '{tripResult.highlights.map((h, i) => (',
  '{(tripResult.highlights || []).map((h, i) => ('
);

// Protect itinerary mapping
smartPlanContent = smartPlanContent.replace(
  '{tripResult.itinerary.map((day, i) => (',
  '{(tripResult.itinerary || []).map((day, i) => ('
);

fs.writeFileSync(smartPlanPath, smartPlanContent, 'utf8');
console.log('Fixed SmartPlan.tsx');

// 2. Fix services/mockSmartPlan.ts
const mockPlanPath = path.join(__dirname, '..', 'services', 'mockSmartPlan.ts');
let mockPlanContent = fs.readFileSync(mockPlanPath, 'utf8');

if (!mockPlanContent.includes('route: [')) {
  const isCRLF = mockPlanContent.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const oldItinEnd = [
    '      ]',
    '    }))',
    '  };'
  ].join(eol);
  
  const newItinEnd = [
    '      ]',
    '    })),',
    '    route: [',
    '      {',
    '        from: depName,',
    '        to: destName,',
    '        coords: [',
    '          [depLat, depLng],',
    '          [destLat, destLng]',
    '        ],',
    '        mode: \'Flight\',',
    '        duration: outboundInfo.str,',
    '        distance: `${Math.round(distanceKm)} km`,',
    '        durationText: outboundInfo.str,',
    '        distanceText: `${Math.round(distanceKm)} km`,',
    '      }',
    '    ]',
    '  };'
  ].join(eol);

  mockPlanContent = mockPlanContent.replace(oldItinEnd, newItinEnd);
  fs.writeFileSync(mockPlanPath, mockPlanContent, 'utf8');
  console.log('Fixed mockSmartPlan.ts');
}

// 3. Fix services/tripService.ts
const tripServicePath = path.join(__dirname, '..', 'services', 'tripService.ts');
let tripServiceContent = fs.readFileSync(tripServicePath, 'utf8');

tripServiceContent = tripServiceContent.replace(
  'route: meta.route,',
  'route: meta.route || [],'
);

fs.writeFileSync(tripServicePath, tripServiceContent, 'utf8');
console.log('Fixed tripService.ts');

// 4. Fix components/TravelViews.tsx
const travelViewsPath = path.join(__dirname, '..', 'components', 'TravelViews.tsx');
let travelViewsContent = fs.readFileSync(travelViewsPath, 'utf8');

travelViewsContent = travelViewsContent.replace(
  '{plan.highlights.slice(0, 2).map((h, i) => (',
  '{(plan.highlights || []).slice(0, 2).map((h, i) => ('
);

travelViewsContent = travelViewsContent.replace(
  'src={plan.hotel.image}',
  'src={plan.hotel?.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}'
);

fs.writeFileSync(travelViewsPath, travelViewsContent, 'utf8');
console.log('Fixed TravelViews.tsx');
