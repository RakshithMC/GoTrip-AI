const fs = require('fs');
let code = fs.readFileSync('components/SmartPlan.tsx', 'utf8');

// 1. Add imports if not present
if (!code.includes('ExplanationModal')) {
  code = code.replace(
    "import ReplanModal from './ReplanModal';",
    "import ReplanModal from './ReplanModal';\nimport { ExplanationModal } from './ExplanationModal';\nimport { buildActivityExplanation } from '../services/explanationService';"
  );
  code = code.replace(
    "UserPreferences } from '../types';",
    "UserPreferences, ActivityExplanation } from '../types';"
  );
}

// 2. Add state
if (!code.includes('explanationTarget')) {
  const replanStateMarker = 'const [replanTarget, setReplanTarget] = useState<{';
  code = code.replace(
    replanStateMarker,
    `// ── Feature 3: Explainable AI state ──────────────────────────────────────
  const [explanationTarget, setExplanationTarget] = useState<{
    activity: any;
    explanation: ActivityExplanation | null;
  } | null>(null);

  const handleOpenExplanation = (act: any, dayNumber: number, dayTitle: string) => {
    if (act.explanation) {
      setExplanationTarget({
        activity: act,
        explanation: act.explanation,
      });
      return;
    }
    const explanation = buildActivityExplanation({
      activityName: act.name,
      activityDescription: act.description,
      activityIcon: act.icon,
      destination: tripResult?.destination || '',
      theme: tripInput.theme,
      dayNumber,
      totalDays: tripResult?.itinerary?.length || 1,
      dayTitle,
      userPreferences,
    });
    setExplanationTarget({
      activity: act,
      explanation,
    });
  };

  ` + replanStateMarker
  );
}

// 3. Add Why this? button in activity card next to Replan button
const replanBtnTarget = `{/* Clear, always-visible Replan action button for EVERY activity */}
                                                                        <button
                                                                            onClick={() => setReplanTarget({`;

if (code.includes(replanBtnTarget)) {
  const replacement = `<div className="shrink-0 flex items-center gap-1.5">
                                                                            {/* Feature 3: Why this? action button */}
                                                                            <button
                                                                                onClick={() => handleOpenExplanation(act, day.day || (i + 1), day.title)}
                                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/25 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/60 rounded-xl transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                                                                                title="Understand why this activity was recommended"
                                                                            >
                                                                                <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
                                                                                <span>Why this?</span>
                                                                            </button>

                                                                            {/* Clear, always-visible Replan action button for EVERY activity */}
                                                                            <button
                                                                                onClick={() => setReplanTarget({`;
  code = code.replace(replanBtnTarget, replacement);
  
  // Close the wrapper div after the replan button
  const replanBtnEnd = `<span>Replan</span>
                                                                        </button>`;
  code = code.replace(replanBtnEnd, `<span>Replan</span>
                                                                            </button>
                                                                        </div>`);
}

// 4. Render ExplanationModal
if (!code.includes('<ExplanationModal')) {
  const replanModalEndMarker = `currencySymbol={currency.symbol}
        />
      )}`;
  code = code.replace(
    replanModalEndMarker,
    `currencySymbol={currency.symbol}
        />
      )}

      {/* Feature 3: Explainable AI Recommendations Modal */}
      {explanationTarget && (
        <ExplanationModal
          isOpen={!!explanationTarget}
          onClose={() => setExplanationTarget(null)}
          itemName={explanationTarget.activity.name}
          itemIcon={explanationTarget.activity.icon}
          explanation={explanationTarget.explanation}
          title={explanationTarget.activity.isReplanned ? "Why this replacement?" : "Why this was recommended"}
        />
      )}`
  );
}

fs.writeFileSync('components/SmartPlan.tsx', code, 'utf8');
console.log('SmartPlan.tsx updated successfully');
