const fs = require('fs');
const path = require('path');

const smartPlanPath = path.join(__dirname, '..', 'components', 'SmartPlan.tsx');
let content = fs.readFileSync(smartPlanPath, 'utf8');

const isCRLF = content.includes('\r\n');
const lines = content.split(/\r?\n/);

const mapStartIdx = lines.findIndex(l => l.includes('tripResult.route && tripResult.route.length > 0'));
console.log('mapStartIdx:', mapStartIdx);

let mapEndIdx = -1;
for (let i = mapStartIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('})}')) {
    mapEndIdx = i;
    break;
  }
}
console.log('mapEndIdx:', mapEndIdx);

if (mapEndIdx !== -1) {
  const fallbackLines = [
    '                                                         })',
    '                                                     ) : (',
    '                                                         <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">',
    '                                                             <Compass size={24} className="text-blue-500 mx-auto mb-1.5 opacity-60" />',
    '                                                             <p className="font-bold text-xs text-slate-700 dark:text-slate-300">Route segments are calculated automatically from itinerary waypoints.</p>',
    '                                                             <p className="text-[10px] text-slate-400 mt-0.5">Use "View Full Route in Google Maps" below for live turn-by-turn navigation.</p>',
    '                                                         </div>',
    '                                                     )}'
  ];

  lines.splice(mapEndIdx, 1, ...fallbackLines);
  content = lines.join(isCRLF ? '\r\n' : '\n');
  fs.writeFileSync(smartPlanPath, content, 'utf8');
  console.log('Successfully updated ternary closing in SmartPlan.tsx');
}
