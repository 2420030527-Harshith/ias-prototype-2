import React from 'react';
import { BookOpen, Sparkles, Shield, Cpu } from 'lucide-react';

export default function ConceptBanner({
  title,
  concept,
  whyItMatters,
  reference,
  badge = 'Core Theoretical Concept',
  accentColor = 'cyan', // cyan | purple | rose | emerald | amber
  icon: Icon = BookOpen
}) {
  const accentStyles = {
    cyan: {
      badgeBg: 'bg-cyan-950/70 border-cyan-800 text-cyan-400',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      border: 'border-cyan-500/30',
      titleGlow: 'from-cyan-400 to-blue-400'
    },
    purple: {
      badgeBg: 'bg-purple-950/70 border-purple-800 text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      border: 'border-purple-500/30',
      titleGlow: 'from-purple-400 to-pink-400'
    },
    rose: {
      badgeBg: 'bg-rose-950/70 border-rose-800 text-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      border: 'border-rose-500/30',
      titleGlow: 'from-rose-400 to-orange-400'
    },
    emerald: {
      badgeBg: 'bg-emerald-950/70 border-emerald-800 text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'border-emerald-500/30',
      titleGlow: 'from-emerald-400 to-teal-400'
    },
    amber: {
      badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      border: 'border-amber-500/30',
      titleGlow: 'from-amber-400 to-yellow-400'
    }
  }[accentColor] || {
    badgeBg: 'bg-cyan-950/70 border-cyan-800 text-cyan-400',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    border: 'border-cyan-500/30',
    titleGlow: 'from-cyan-400 to-blue-400'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border ${accentStyles.border} p-5 sm:p-6 shadow-xl backdrop-blur-md`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border ${accentStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
              {title}
            </h3>
            {reference && (
              <p className="text-[11px] text-slate-400 font-mono">
                Academic Reference: <span className="text-slate-300 font-semibold">{reference}</span>
              </p>
            )}
          </div>
        </div>

        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border ${accentStyles.badgeBg}`}>
          <Sparkles className="w-3 h-3" />
          <span>{badge}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed pt-1">
        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            What It Is:
          </span>
          <p className="text-slate-300">
            {concept}
          </p>
        </div>

        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Why It Matters:
          </span>
          <p className="text-slate-300">
            {whyItMatters}
          </p>
        </div>
      </div>
    </div>
  );
}
