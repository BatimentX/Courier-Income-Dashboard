'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { generateCombinations } from '@/lib/optimizer';
import { calculateJobScore } from '@/lib/scoring';
import { Job, ComboRecommendation } from '@/types';
import { 
  Zap, 
  Car, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Flame, 
  Award,
  Sparkles
} from 'lucide-react';

export default function ComboOptimizer() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [combos, setCombos] = useState<ComboRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedJobs = await db.getJobs();
        setJobs(fetchedJobs);
        const compiledCombos = generateCombinations(fetchedJobs);
        setCombos(compiledCombos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Compiling Optimal Combinations...</p>
      </div>
    );
  }

  // Helpers to color code parameters
  const getWearBadgeClass = (wear: string) => {
    if (wear === 'None') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (wear === 'Low') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    if (wear === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  const getRiskBadgeClass = (risk: string) => {
    if (risk === 'Low') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (risk === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  const getStabilityBadgeClass = (stab: string) => {
    if (stab === 'High') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (stab === 'Medium') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header and intro */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Smart Schedule Compiling</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <span>Courier Combo Optimizer</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Suggests high-yield combinations of W-2 daytime stability combined with evening or weekend contracts to maximize weekly revenue while avoiding vehicle wear and scheduling overlaps.
          </p>
        </div>
      </div>

      {/* Grid listing the combinations */}
      <div className="space-y-6">
        {combos.map((combo) => (
          <div 
            key={combo.id} 
            className="glass-panel p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative group border-[rgba(99,102,241,0.15)]"
          >
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none group-hover:from-indigo-500/10 transition-all"></div>
            
            {/* COLUMN 1: COMBO GENERAL INFO (Gross Weekly, Monthly, Rating, Jobs involved) */}
            <div className="space-y-5 lg:border-r lg:border-slate-800/80 lg:pr-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">High Yield Strategy</span>
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <Award className="h-3.5 w-3.5" />
                    <span>{combo.recommendationRating.toFixed(1)} / 10 Rating</span>
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-extrabold text-slate-200 leading-snug group-hover:text-indigo-300 transition-colors">
                  {combo.name}
                </h3>
              </div>

              {/* Weekly/Monthly Earnings box */}
              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Combined Weekly Income</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-sans">${combo.estimatedWeeklyIncome.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">Est Monthly: <span className="text-slate-300 font-bold">${combo.estimatedMonthlyIncome.toLocaleString()}</span></span>
              </div>

              {/* Jobs Involved list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jobs Included in Combo</span>
                <div className="space-y-1.5 text-xs">
                  {combo.jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-[#0a0f1d] border border-slate-850 rounded-lg">
                      <span className="font-semibold text-slate-200 truncate pr-2">{job.job_title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                        ['w2', 'full_time', 'part_time'].includes(job.job_type) 
                          ? 'bg-violet-950/40 text-violet-400 border border-violet-900/20' 
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/20'
                      }`}>
                        {['w2', 'full_time', 'part_time'].includes(job.job_type) ? 'W-2' : '1099'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: ANALYTICS & SCHEDULING (Hours, Risk, Stability, Wear, Schedule Fit) */}
            <div className="space-y-5 lg:border-r lg:border-slate-800/80 lg:pr-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Combination Risk Profile</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">Weekly Hours</span>
                    <div className="flex items-center space-x-1 text-slate-200 font-extrabold text-sm">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>{combo.estimatedHours} Hours</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">Wear & Tear</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getWearBadgeClass(combo.vehicleWearLevel)}`}>
                      {combo.vehicleWearLevel}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">Risk Profile</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadgeClass(combo.riskLevel)}`}>
                      {combo.riskLevel}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">Stability Fit</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStabilityBadgeClass(combo.stabilityLevel)}`}>
                      {combo.stabilityLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Fit Description */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> Optimal Schedule Matrix
                </span>
                <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
                  {combo.bestScheduleFit}
                </p>
              </div>
            </div>

            {/* COLUMN 3: WHY IT WORKS / PROS & CONS */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Operational Analysis</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {combo.whyItWorks}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Potential Bottlenecks</span>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {combo.whyItMayNotWork}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Bottom helper card */}
      <div className="p-4 bg-indigo-950/30 border border-indigo-900/20 rounded-xl flex items-start space-x-3 text-xs text-slate-400 leading-normal">
        <Flame className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="text-slate-200 font-semibold">Fatigue & Safety Alert:</span> Running multiple courier schedules is highly lucrative, but can easily lead to driver fatigue. Always prioritize resting, follow safe driving metrics on Baltimore beltways, and factor in mandatory sleep cycles when structuring your combinations!
        </div>
      </div>
    </div>
  );
}
