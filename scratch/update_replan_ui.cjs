const fs = require('fs');
const path = require('path');

const smartPlanPath = path.join(__dirname, '..', 'components', 'SmartPlan.tsx');
let content = fs.readFileSync(smartPlanPath, 'utf8');

const isCRLF = content.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

const oldActivityBlock = [
  '                                                    {day.activities.map((act, j) => {',
  '                                                        const isReplanned = !!(act as any).isReplanned;',
  '                                                        return (',
  '                                                            <div key={j} className={`flex gap-4 p-4 rounded-[1rem] group relative ${isReplanned ? \'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30\' : \'bg-slate-50 dark:bg-slate-900\'}`}>',
  '                                                                <div className="text-[#4F46E5] font-black text-[10px] uppercase tracking-widest pt-1 w-16 shrink-0">{act.time}</div>',
  '                                                                <div className="flex-1 min-w-0">',
  '                                                                    <div className="flex items-start justify-between gap-2">',
  '                                                                        <div className="min-w-0">',
  '                                                                            <p className="font-black text-sm text-[#1E293B] dark:text-white mb-0.5">{act.name}</p>',
  '                                                                            {isReplanned && (',
  '                                                                                <span className="inline-block text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded mb-1">',
  '                                                                                    ✓ Replanned',
  '                                                                                </span>',
  '                                                                            )}',
  '                                                                            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">{act.description}</p>',
  '                                                                        </div>',
  '                                                                        {/* Replan button — visible on hover */}',
  '                                                                        <button',
  '                                                                            onClick={() => setReplanTarget({',
  '                                                                                activity: act as ItineraryActivity,',
  '                                                                                activityIndex: j,',
  '                                                                                dayIndex: i,',
  '                                                                            })}',
  '                                                                            className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30"',
  '                                                                            title="Can\'t Visit / Replan"',
  '                                                                        >',
  '                                                                            <RefreshCw size={14} />',
  '                                                                        </button>',
  '                                                                    </div>',
  '                                                                </div>',
  '                                                            </div>',
  '                                                        );',
  '                                                    })}'
].join(eol);

const newActivityBlock = [
  '                                                    {(day.activities || []).map((act, j) => {',
  '                                                        const isReplanned = !!(act as any).isReplanned;',
  '                                                        return (',
  '                                                            <div key={`${day.day || i}-${j}`} className={`flex gap-4 p-4 rounded-[1.25rem] relative transition-all ${isReplanned ? \'bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm\' : \'bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800\'}`}>',
  '                                                                <div className="text-[#4F46E5] font-black text-[10px] uppercase tracking-widest pt-1 w-16 shrink-0">{act.time}</div>',
  '                                                                <div className="flex-1 min-w-0">',
  '                                                                    <div className="flex items-start justify-between gap-3">',
  '                                                                        <div className="min-w-0 flex-1">',
  '                                                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">',
  '                                                                                <p className="font-black text-sm text-[#1E293B] dark:text-white leading-snug">{act.name}</p>',
  '                                                                                {isReplanned && (',
  '                                                                                    <span className="inline-block text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">',
  '                                                                                        ✓ Replanned',
  '                                                                                    </span>',
  '                                                                                )}',
  '                                                                            </div>',
  '                                                                            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed mt-0.5">{act.description}</p>',
  '                                                                        </div>',
  '                                                                        {/* Clear, always-visible Replan action button for EVERY activity */}',
  '                                                                        <button',
  '                                                                            onClick={() => setReplanTarget({',
  '                                                                                activity: act as ItineraryActivity,',
  '                                                                                activityIndex: j,',
  '                                                                                dayIndex: i,',
  '                                                                            })}',
  '                                                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/25 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700/60 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"',
  '                                                                            title="Can\'t visit this stop? Click to replan with AI"',
  '                                                                        >',
  '                                                                            <RefreshCw size={13} className="text-amber-600 dark:text-amber-400" />',
  '                                                                            <span>Replan</span>',
  '                                                                        </button>',
  '                                                                    </div>',
  '                                                                </div>',
  '                                                            </div>',
  '                                                        );',
  '                                                    })}'
].join(eol);

if (content.includes(oldActivityBlock)) {
  content = content.replace(oldActivityBlock, newActivityBlock);
  fs.writeFileSync(smartPlanPath, content, 'utf8');
  console.log('Successfully updated Replan UI in SmartPlan.tsx');
} else {
  console.log('Warning: oldActivityBlock not found, trying line-by-line replace...');
  // Fallback replace using regex
  const regex = /\{day\.activities\.map\(\(act, j\) => \{[\s\S]*?<\/[a-zA-Z]+>\s*\}\)\}/;
  content = content.replace(regex, newActivityBlock.trim());
  fs.writeFileSync(smartPlanPath, content, 'utf8');
  console.log('Successfully updated Replan UI via fallback.');
}
