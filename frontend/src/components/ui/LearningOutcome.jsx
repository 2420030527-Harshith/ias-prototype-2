import React from 'react';
import { Award, CheckCircle2, GraduationCap, ArrowUpRight } from 'lucide-react';

export default function LearningOutcome({
  title = "Curriculum Learning Outcomes",
  outcomes = [],
  nextModuleSuggestion = null,
  onNavigateNext = null
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white font-mono">
              {title}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Active Learning Competency Verification
            </span>
          </div>
        </div>

        {nextModuleSuggestion && (
          <button
            onClick={onNavigateNext}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-semibold transition-all border border-slate-700 hover:border-cyan-500/40 cursor-pointer"
          >
            <span>Next: {nextModuleSuggestion}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {outcomes.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
