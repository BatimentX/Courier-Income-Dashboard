'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  db, 
  isSupabaseConfigured 
} from '@/lib/db';
import { 
  calculateJobScore, 
  getRecommendations, 
  ScoreDetails 
} from '@/lib/scoring';
import { 
  getEstimatedWeeklyIncome 
} from '@/lib/optimizer';
import { Job } from '@/types';
import { 
  TrendingUp, 
  AlertTriangle, 
  Coins, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  Car, 
  Building2, 
  HeartPulse, 
  Package, 
  Compass, 
  Gauge, 
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadJobs() {
      try {
        const fetched = await db.getJobs();
        setJobs(fetched);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleResetSeeds = async () => {
    if (confirm('Are you sure you want to reset all jobs to default seed data? Any custom entries will be lost.')) {
      await db.resetToSeeds();
      const fetched = await db.getJobs();
      setJobs(fetched);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Loading Courier Decision Intelligence...</p>
      </div>
    );
  }

  const recommendations = getRecommendations(jobs);

  // Stats calculation
  const totalCompared = jobs.length;
  
  const w2Jobs = jobs.filter(j => j.job_type === 'w2' || j.job_type === 'full_time' || j.job_type === 'part_time');
  const avgHourly = jobs.length > 0 
    ? Math.round(
        jobs.reduce((acc, job) => {
          if (job.pay_type === 'hourly') {
            return acc + (job.pay_min + job.pay_max) / 2;
          }
          // Convert daily/weekly to rough hourly
          if (job.pay_type === 'daily') {
            return acc + ((job.pay_min + job.pay_max) / 2) / 8;
          }
          if (job.pay_type === 'weekly') {
            return acc + ((job.pay_min + job.pay_max) / 2) / 40;
          }
          return acc + 20; // default average fallback
        }, 0) / jobs.length
      )
    : 0;

  const maxWeekly = jobs.length > 0
    ? Math.max(...jobs.map(j => getEstimatedWeeklyIncome(j)))
    : 0;

  // Chart data
  const chartData = jobs
    .map(j => {
      const weeklyIncome = getEstimatedWeeklyIncome(j);
      // Rough expenses estimate
      let expenses = 0;
      if (j.vehicle_type !== 'company_vehicle' && j.vehicle_type !== 'unknown') {
        expenses = weeklyIncome * 0.22; // rough 22% expenses for fuel/wear
      }
      const netPay = weeklyIncome - expenses;

      return {
        name: j.job_title.substring(0, 18) + (j.job_title.length > 18 ? '..' : ''),
        Gross: Math.round(weeklyIncome),
        Net: Math.round(netPay),
        Expenses: Math.round(expenses),
      };
    })
    .sort((a, b) => b.Net - a.Net)
    .slice(0, 7); // Show top 7 for readability

  // Helpers to render score colors
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const renderRecommendationCard = (title: string, job: Job | null, badgeIcon: React.ReactNode, description: string) => {
    if (!job) return null;
    const scores = calculateJobScore(job);

    return (
      <div className="glass-card p-5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-slate-400">
              {badgeIcon}
              <span className="text-xs font-semibold tracking-wider uppercase">{title}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(scores.total)}`}>
              {scores.total}/100 Match
            </div>
          </div>
          
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            {job.job_title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-2">{job.company_name} • {job.location}</p>
          
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {job.notes || description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs mb-3">
            <div>
              <span className="text-slate-500">Pay Est:</span>
              <span className="ml-1 text-slate-200 font-bold">
                ${job.pay_min.toFixed(0)}-${job.pay_max.toFixed(0)}/{job.pay_type === 'hourly' ? 'hr' : job.pay_type === 'daily' ? 'day' : 'wk'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Vehicle:</span>
              <span className="ml-1 text-indigo-400 font-semibold capitalize">
                {job.vehicle_type.replace('_', ' ')}
              </span>
            </div>
          </div>

          <Link 
            href={`/jobs/${job.id}`}
            className="flex items-center justify-center space-x-1.5 w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 text-slate-200 py-1.5 rounded-lg text-xs font-semibold hover:border-slate-600 transition-all"
          >
            <span>Analyze Match & Apply</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome banner */}
      <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 rounded-bl-full pointer-events-none"></div>
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Coins className="h-3.5 w-3.5 text-cyan-400" />
            <span>Curated Baltimore / Laurel Region Data</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
            Compare & Optimize Your Courier Revenue
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Analyze W-2 medical couriers, FedEx, DHL, and local box truck contracts. Maximize income, estimate exact fuel overheads, and map out perfect schedule combinations.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/comparison"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Gauge className="h-4 w-4" />
            <span>Run Comparison Table</span>
          </Link>
          <button
            onClick={handleResetSeeds}
            className="flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Demo Seeds</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center space-x-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jobs Evaluated</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalCompared} Opportunities</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Est Hourly Pay</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">${avgHourly}.00 / hr</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Weekly Potential</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">${maxWeekly.toLocaleString()} / wk</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart & Quick Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Comparison Chart */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Revenue Comparison Chart</h3>
              <p className="text-xs text-slate-400">Weekly Gross vs Net Potential (after standard vehicle expense)</p>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 border border-slate-800 rounded bg-slate-900/50">
              TOP 7 HIGHEST EARNERS
            </div>
          </div>
          
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,56,95,0.2)" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(38,56,95,0.6)', color: '#f8fafc' }}
                  formatter={(value) => [`$${value}`, '']}
                />
                <Legend />
                <Bar dataKey="Gross" fill="#6366f1" name="Gross Pay" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net" fill="#10b981" name="Net (After Expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database Mode Summary Card */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200">Engine Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our active multi-variable scoring model weighs jobs based on your preference structure:
            </p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Stability & W-2</span>
                <span className="text-indigo-400 font-bold">25% weight</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Pay Potential</span>
                <span className="text-indigo-400 font-bold">20% weight</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Non-CDL Fit</span>
                <span className="text-indigo-400 font-bold">15% weight</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Vehicle Match & Bonus</span>
                <span className="text-indigo-400 font-bold">20% weight</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Beginner Friendly</span>
                <span className="text-indigo-400 font-bold">10% weight</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quick Apply & Low Certs</span>
                <span className="text-indigo-400 font-bold">10% weight</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/30 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Database Connection</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {isSupabaseConfigured 
                ? 'Production Mode: Supabase live database sync enabled.'
                : 'Sandbox Mode: Live Client localStorage enabled. All changes persist locally.'}
            </p>
          </div>
        </div>
      </div>

      {/* Curated Recommendations Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-200">Recommended Match Classes</h3>
          <p className="text-xs text-slate-400">Best scoring categories dynamically compiled from analyzed jobs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {renderRecommendationCard(
            'Best Overall Job',
            recommendations.bestOverall,
            <Award className="h-4 w-4 text-amber-400" />,
            'Top rated courier opportunity factoring in stability, hours, pay rate, and zero vehicle wear.'
          )}

          {renderRecommendationCard(
            'Best Stable W-2',
            recommendations.bestStableW2,
            <Building2 className="h-4 w-4 text-violet-400" />,
            'High scoring W-2 employee position with guaranteed hourly pay, benefits, and schedule stability.'
          )}

          {renderRecommendationCard(
            'Best Own-Vehicle',
            recommendations.bestOwnVehicle,
            <Car className="h-4 w-4 text-cyan-400" />,
            'High yield independent contractor route optimized for drivers using personal fuel-efficient vehicles.'
          )}

          {renderRecommendationCard(
            'Best Company-Vehicle',
            recommendations.bestCompanyVehicle,
            <Building2 className="h-4 w-4 text-emerald-400" />,
            'Excellent fleet driver role where vehicles, fuel cards, and insurance are 100% provided by employer.'
          )}

          {renderRecommendationCard(
            'Best Medical/Pharmacy',
            recommendations.bestMedicalPharmacy,
            <HeartPulse className="h-4 w-4 text-rose-400" />,
            'Top specimen or prescription route. Usually requires HIPAA certification, yielding high compliance pay.'
          )}

          {renderRecommendationCard(
            'Best Package Delivery',
            recommendations.bestPackageDelivery,
            <Package className="h-4 w-4 text-indigo-400" />,
            'Top tier high-volume package delivery. Great W-2 options with DHL, UPS, or certified Amazon DSP networks.'
          )}
        </div>
      </div>

      {/* Jobs to Avoid or Verify section */}
      {recommendations.jobsToAvoid.length > 0 && (
        <div className="glass-panel border-rose-500/20 bg-rose-950/5 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 border-b border-rose-950/40 pb-3">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-base">Caution: Jobs to Avoid or Verify Before Applying</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.jobsToAvoid.map((job) => {
              const scores = calculateJobScore(job);
              return (
                <div key={job.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-200">{job.job_title}</h4>
                      <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded-full">
                        Score: {scores.total}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mb-2">{job.company_name} • {job.location}</p>
                    
                    <div className="space-y-1.5 my-3 text-[11px] text-slate-400">
                      {job.cdl_required && (
                        <p className="flex items-center text-rose-300 font-semibold">
                          <span className="h-1.5 w-1.5 bg-rose-400 rounded-full mr-2"></span>
                          Requires CDL (Violates primary Non-CDL rule)
                        </p>
                      )}
                      {job.stability_score <= 5 && (
                        <p className="flex items-center text-amber-300">
                          <span className="h-1.5 w-1.5 bg-amber-400 rounded-full mr-2"></span>
                          Low Stability Index: {job.stability_score}/10 (Highly volatile gig or seasonal)
                        </p>
                      )}
                      {scores.total < 60 && (
                        <p className="flex items-center text-slate-400">
                          <span className="h-1.5 w-1.5 bg-slate-500 rounded-full mr-2"></span>
                          Low overall compatibility fit for your criteria
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-2 text-center text-slate-400 hover:text-slate-200 text-xs border border-slate-800 hover:border-slate-700 py-1 rounded bg-slate-900/40 transition-all"
                  >
                    View Details & Verify Requirements
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
