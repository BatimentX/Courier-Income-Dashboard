'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { calculateJobScore, ScoreDetails } from '@/lib/scoring';
import { Job, JobStatus } from '@/types';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Car, 
  PlusCircle,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToTracker, setAddingToTracker] = useState(false);
  const [mvrMatch, setMvrMatch] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        const fetched = await db.getJobById(id);
        setJob(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${job?.job_title} from your comparison list?`)) {
      try {
        await db.deleteJob(id);
        router.push('/comparison');
      } catch (err) {
        console.error(err);
        alert('Failed to delete job.');
      }
    }
  };

  const handleApplyTracker = async () => {
    if (!job) return;
    setAddingToTracker(true);
    try {
      // Create new application
      await db.addApplication({
        job_id: job.id,
        date_applied: new Date().toISOString().split('T')[0],
        status: 'applied' as JobStatus,
        notes: 'Application started from Courier Income Decision Dashboard detail page.'
      });
      // Refresh job state to show applied status
      const updatedJob = await db.getJobById(job.id);
      setJob(updatedJob);
      alert(`Successfully added ${job.job_title} to your Application Tracker! Status updated to "Applied".`);
    } catch (err) {
      console.error(err);
      alert('Failed to update tracker.');
    } finally {
      setAddingToTracker(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Loading Job Specification...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="glass-panel p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200 font-sans">Job Specification Not Found</h3>
        <p className="text-xs text-slate-400">This job may have been deleted or the ID in the URL is incorrect.</p>
        <Link
          href="/comparison"
          className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          Return to Matrix
        </Link>
      </div>
    );
  }

  const scores = calculateJobScore(job);

  // Helper to render score badge colors
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/comparison"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Matrix</span>
        </Link>
        <div className="flex space-x-2">
          <Link
            href={`/jobs/edit/${job.id}`}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Entry</span>
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center space-x-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SCORE SUMMARY CARD (1/3 cols) */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-6 border-indigo-500/20">
          <div className="text-center space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Preference Match Score</h3>
            
            {/* Massive Circular score indicator */}
            <div className="relative h-36 w-36 mx-auto flex items-center justify-center rounded-full border-4 border-slate-800/80 bg-slate-900/40 shadow-inner">
              <div className="absolute inset-0.5 rounded-full border border-slate-800 pointer-events-none"></div>
              <div className="text-center">
                <span className="text-4xl font-extrabold tracking-tight text-indigo-300 font-sans">{scores.total}</span>
                <span className="text-xs font-medium text-slate-500 block">/ 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-200">{job.job_title}</h4>
              <p className="text-xs text-slate-400 font-semibold">{job.company_name}</p>
            </div>
            
            <div className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border capitalize ${
              job.status === 'applied' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
              job.status === 'interview' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
              job.status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              job.status === 'rejected' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
              'text-slate-400 bg-slate-500/10 border-slate-500/20'
            }`}>
              Status: {job.status}
            </div>
          </div>

          <div className="space-y-3">
            {job.status === 'saved' ? (
              <button
                onClick={handleApplyTracker}
                disabled={addingToTracker}
                className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 hover:brightness-110 transition-all glow-btn"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add to Application Tracker</span>
              </button>
            ) : (
              <Link
                href="/applications"
                className="flex items-center justify-center space-x-1.5 w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>View in Application Pipeline</span>
              </Link>
            )}

            {job.application_link && (
              <a
                href={job.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 w-full border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <span>Quick Apply External</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* METRICS & SCORE BREAKDOWN (2/3 cols) */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Algorithmic Weightings Breakdown</h3>
            <p className="text-xs text-slate-400">See how this role matches the specific parameters of your search profile.</p>
          </div>

          <div className="space-y-4">
            {/* Stability */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400 font-semibold">Stability Fit (25% Weight)</span>
                <span className="text-slate-200 font-bold">{job.stability_score}/10</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${job.stability_score * 10}%` }}></div>
              </div>
            </div>

            {/* Income Potential */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400 font-semibold">Pay Potential Fit (20% Weight)</span>
                <span className="text-slate-200 font-bold">{job.income_potential_score}/10</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${job.income_potential_score * 10}%` }}></div>
              </div>
            </div>

            {/* Non-CDL Fit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400 font-semibold">Non-CDL Fit (15% Weight)</span>
                <span className="text-slate-200 font-bold">{job.cdl_required ? '0/15' : '15/15'}</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: job.cdl_required ? '0%' : '100%' }}></div>
              </div>
            </div>

            {/* Vehicle Fits */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400 font-semibold">Vehicle Matches (20% Combined Weight)</span>
                <span className="text-slate-200 font-bold">
                  {job.vehicle_type === 'company_vehicle' ? 'Company Provided (Active)' : 'Personal Vehicle (Active)'}
                </span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div className="bg-violet-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Beginner Friendly */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400 font-semibold">Beginner Friendly Index (10% Weight)</span>
                <span className="text-slate-200 font-bold">{job.beginner_friendly_score}/10</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${job.beginner_friendly_score * 10}%` }}></div>
              </div>
            </div>

            {/* Onboarding Speed & Cert Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quick Apply Speed</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">{job.quick_apply_score}/10</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {job.quick_apply_score >= 8 ? 'Fast Hiring' : job.quick_apply_score >= 6 ? 'Average' : 'Slow process'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Low Certification Threshold</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">{11 - job.certification_difficulty_score}/10</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {job.certification_difficulty_score <= 3 ? 'No Certs' : job.certification_difficulty_score <= 5 ? 'Standard BBP/HIPAA' : 'Requires DOT/STA'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* JOB SPECIFICATION & REQUIREMENTS CARD */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COMPLIANCE CHECK PANEL (1/3 cols) */}
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2">
            Compliance Requirements
          </div>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-900/35 border border-slate-850 rounded-xl">
              <span className="text-slate-400 font-medium">Background Check</span>
              {job.background_check_required ? (
                <span className="flex items-center text-rose-400 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Required
                </span>
              ) : (
                <span className="flex items-center text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Not Required
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-900/35 border border-slate-850 rounded-xl">
              <span className="text-slate-400 font-medium">Drug Screen</span>
              {job.drug_test_required ? (
                <span className="flex items-center text-rose-400 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Required
                </span>
              ) : (
                <span className="flex items-center text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Not Required
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-900/35 border border-slate-850 rounded-xl">
              <span className="text-slate-400 font-medium">Motor Vehicle (MVR)</span>
              {job.mvr_check_required ? (
                <span className="flex items-center text-rose-400 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Clean MVR
                </span>
              ) : (
                <span className="flex items-center text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> No checks
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS PANEL (2/3 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2">
            Position Specification & Work Scope
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Income Framework</span>
              <div className="p-2.5 bg-[#0a0f1d] border border-slate-850 rounded-xl font-semibold text-slate-200">
                ${job.pay_min.toFixed(2)} - ${job.pay_max.toFixed(2)} / {job.pay_type}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Vehicle Logistics</span>
              <div className="p-2.5 bg-[#0a0f1d] border border-slate-850 rounded-xl font-semibold text-slate-200 flex items-center space-x-1.5">
                <Car className="h-4 w-4 text-cyan-400" />
                <span className="capitalize">{job.vehicle_type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Distance from Hub (Baltimore / 21237)</span>
              <div className="p-2.5 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300">
                Job operates approximately <span className="font-bold text-slate-250">{job.distance_from_21237} miles</span> from ZIP 21237.
              </div>
            </div>

            {job.insurance_requirements && (
              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Auto Liability / Insurance Guidelines</span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300 leading-relaxed">
                  {job.insurance_requirements}
                </div>
              </div>
            )}

            {job.experience_requirements && (
              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Logistics / Experience Requirements</span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300 leading-relaxed">
                  {job.experience_requirements}
                </div>
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Compliance Certifications Required</span>
              <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300">
                {job.required_certifications && job.required_certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.required_certifications.map((cert, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[10px] font-semibold rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-550">No certifications are required for immediate application.</span>
                )}
              </div>
            </div>

            {job.notes && (
              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">Operational Notes & Route Specifications</span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300 leading-relaxed">
                  {job.notes}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
