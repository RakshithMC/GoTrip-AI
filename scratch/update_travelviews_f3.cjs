const fs = require('fs');
let code = fs.readFileSync('components/TravelViews.tsx', 'utf8');

// 1. Add imports if not present
if (!code.includes('ExplanationModal')) {
  code = code.replace(
    "import { recordPreferenceFeedback } from '../services/preferenceService';",
    "import { recordPreferenceFeedback } from '../services/preferenceService';\nimport { ExplanationModal } from './ExplanationModal';\nimport { buildActivityExplanation } from '../services/explanationService';"
  );
}

// 2. Add state inside AttractionDetailView
const attrViewStart = "const [showAllAccommodations, setShowAllAccommodations] = useState(false);";
if (code.includes(attrViewStart) && !code.includes('showWhyThis')) {
  code = code.replace(
    attrViewStart,
    attrViewStart + `\n    const [showWhyThis, setShowWhyThis] = useState(false);\n    const [loadedPrefs, setLoadedPrefs] = useState<UserPreferences | null>(null);\n\n    useEffect(() => {\n      supabase.auth.getSession().then(({ data: { session } }) => {\n        if (session?.user?.id) {\n          import('../services/preferenceService').then(({ getUserPreferences }) => {\n            getUserPreferences(session.user.id).then(prefs => setLoadedPrefs(prefs)).catch(() => {});\n          });\n        }\n      });\n    }, []);`
  );
}

// 3. Add Why this? button in AI insight section
const aiSummaryBtn = `<button onClick={handleGenerate} disabled={loading} className="text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full font-black shadow-sm hover:shadow-md transition-all border border-indigo-100 dark:border-indigo-900 active:scale-95 whitespace-nowrap uppercase tracking-wider">{loading ? t('thinking') : t('ai_summary')}</button>`;

const aiSummaryWithWhyThis = `<div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowWhyThis(true)} 
                  className="text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-full font-black shadow-sm hover:shadow-md transition-all border border-indigo-100 dark:border-indigo-900 active:scale-95 whitespace-nowrap uppercase tracking-wider flex items-center gap-1"
                  title="Why this attraction was recommended"
                >
                  <Sparkles size={12} /> Why this?
                </button>
                ${aiSummaryBtn}
              </div>`;

if (code.includes(aiSummaryBtn) && !code.includes('setShowWhyThis(true)')) {
  code = code.replace(aiSummaryBtn, aiSummaryWithWhyThis);
}

// 4. Render ExplanationModal at bottom of AttractionDetailView
const attrViewEnd = `            <div className="space-y-12">
                {nearbyAccommodations.length > 0 && (`;

if (code.includes(attrViewEnd) && !code.includes('itemName={attr.name}')) {
  code = code.replace(
    attrViewEnd,
    `{/* Feature 3: Why this attraction was recommended modal */}
        <ExplanationModal
          isOpen={showWhyThis}
          onClose={() => setShowWhyThis(false)}
          itemName={attr.name}
          itemIcon="activity"
          explanation={buildActivityExplanation({
            activityName: attr.name,
            activityDescription: attr.description,
            activityIcon: 'activity',
            destination: city?.name || '',
            userPreferences: loadedPrefs,
            fromDatabase: true,
          })}
          title="Why this was recommended"
        />

` + attrViewEnd
  );
}

fs.writeFileSync('components/TravelViews.tsx', code, 'utf8');
console.log('TravelViews.tsx updated successfully');
