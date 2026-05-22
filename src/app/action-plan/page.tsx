'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Certification, Job } from '@/types';
import { calculateJobScore } from '@/lib/scoring';
import {
  ListTodo,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Calendar,
  Briefcase,
  FileText,
  UserCheck,
  Shield,
  Smartphone,
  Info
} from 'lucide-react';

interface ActionStep {
  id: string;
  title: string;
  description: string;
  category: 'prep' | 'cert' | 'apply_w2' | 'apply_contract' | 'followup';
  link?: string;
  linkText?: string;
  isCertSync?: string; // Links to Certification.id for database sync
  isJobSync?: string;  // Links to Job.id for database sync
  targetLocation?: string;
}

interface ActionPhase {
  title: string;
  days: string;
  subtitle: string;
  steps: ActionStep[];
  badgeColor: string;
  bgGradient: string;
}

export default function ActionPlan() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    0: true, // Expand Phase 1 by default
    1: true, // Expand Phase 2 by default
    2: false,
    3: false,
    4: false
  });

  // Action plan data structure
  const phases: ActionPhase[] = [
    {
      title: 'Phase 1: Resume & Vehicle Readiness',
      days: 'Days 1–3',
      subtitle: 'Prepare your courier-specific credentials and configure your delivery rig.',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      bgGradient: 'from-indigo-650/10 to-transparent',
      steps: [
        {
          id: 'step-resume',
          title: 'Draft a Courier-Specific Resume',
          description: 'Rewrite your resume to prioritize safety, vehicle reliability, and cargo security. Emphasize a clean MVR, prompt scheduling, safe driving benchmarks, and physically demanding stamina. Exclude references to gig-app multi-apping.',
          category: 'prep'
        },
        {
          id: 'step-vehicle',
          title: 'Prepare Your Delivery Vehicle & Gear',
          description: 'Organize your trunk/cargo area. Mount a high-durability phone holder near direct eye level. Purchase a thermal insulated delivery tote bag, medical cooler (if doing specimen routes), high-power USB fast-charger, and tire pressure gauge.',
          category: 'prep'
        },
        {
          id: 'step-benchmarks',
          title: 'Establish MD Highway Fuel Benchmarks',
          description: 'Log standard MPG figures on I-95, I-695, and MD-295 routes. Check Laurel MD fuel prices (average around Fort Meade or Rosedale depots) and plug baseline values into the Dashboard Income Calculator.',
          category: 'prep',
          link: '/calculator',
          linkText: 'Go to Income Calculator'
        }
      ]
    },
    {
      title: 'Phase 2: Compliance & "Fast Pass" Certifications',
      days: 'Days 4–6',
      subtitle: 'Acquire high-ROI credentials online to instantly bypass beginner screening blocks.',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      bgGradient: 'from-cyan-650/10 to-transparent',
      steps: [
        {
          id: 'step-hipaa',
          title: 'Complete HIPAA Privacy Training (Fast Pass)',
          description: 'Required by law to handle medical records, specimen charts, and prescriptions. Takes ~2 hours online, costs $29.99, and instantly qualifies you for 4 premium medical/pharmacy routes near Baltimore.',
          category: 'cert',
          link: 'https://www.hipaatraining.com/',
          linkText: 'Take HIPAA Training ($29.99)',
          isCertSync: 'cert-hipaa'
        },
        {
          id: 'step-bbp',
          title: 'Acquire OSHA Bloodborne Pathogens Certification (BBP)',
          description: 'Mandatory OSHA training for handling and transporting biological diagnostic specimens, infectious materials, and lab vials safely. Takes ~1 hour online, costs $19.99.',
          category: 'cert',
          link: 'https://www.redcross.org/take-a-class/osha-bloodborne-pathogens',
          linkText: 'Take Red Cross OSHA BBP ($19.99)',
          isCertSync: 'cert-bbp'
        },
        {
          id: 'step-dot',
          title: 'Schedule a DOT Physical Exam (Non-CDL Box Truck / Sprinter)',
          description: 'Required if operating commercial vehicles over 10,000 lbs (such as FedEx Sprinters or Non-CDL Box Trucks out of Laurel). Book a physical at a local Concentra or Maryland occupational health clinic (costs ~$85).',
          category: 'cert',
          link: 'https://www.fmcsa.dot.gov/medical/driver-medical-requirements/driver-medical-fitness-requirements',
          linkText: 'Find FMCSA Registry',
          isCertSync: 'cert-dot'
        },
        {
          id: 'step-tsa',
          title: 'Submit TSA Security Threat Assessment (STA) Application',
          description: 'Grants secure ramp access at Baltimore/Washington International Airport (BWI) cargo hangars. Crucial for international freight operations like DHL Express or high-priority local messenger routes.',
          category: 'cert',
          link: 'https://www.tsa.gov/for-industry/security-threat-assessment',
          linkText: 'Start TSA STA Filing',
          isCertSync: 'cert-tsa'
        }
      ]
    },
    {
      title: 'Phase 3: High-Match W-2 & Courier Fleet Filings',
      days: 'Days 7–9',
      subtitle: 'Apply directly to stable, localized courier accounts with company-provided assets.',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      bgGradient: 'from-emerald-650/10 to-transparent',
      steps: [
        {
          id: 'step-apply-medical',
          title: 'Apply to W-2 Medical Specimen Courier Networks',
          description: 'Target Mid-Atlantic Specimen Transport (Baltimore, ZIP 21237). Submit resumes showing HIPAA + BBP compliance. This offers corporate Priuses, corporate gas cards, and total W-2 shift stability.',
          category: 'apply_w2',
          isJobSync: 'job-1',
          targetLocation: 'Rosedale / East Baltimore Depot'
        },
        {
          id: 'step-apply-autoparts',
          title: 'Apply to W-2 Auto Parts Route Driving',
          description: 'Perfect beginner role. Apply to National Auto Parts Distributors (Rosedale). Highlights: uses company car (e.g. fleet hatchbacks), stress-free M-F schedules, delivery routes are quick to apply to.',
          category: 'apply_w2',
          isJobSync: 'job-9',
          targetLocation: 'Rosedale Hub (ZIP 21237)'
        },
        {
          id: 'step-apply-boxtruck',
          title: 'Apply to Laurel Non-CDL Box Truck Dedicated Route',
          description: 'Apply to Baltimore Office & Industrial Supply (Laurel, MD depot). Requires your DOT physical card. Monday to Friday 6:00 AM starts delivering commercial workplace supplies.',
          category: 'apply_w2',
          isJobSync: 'job-12',
          targetLocation: 'Laurel Industrial Corridor (20708)'
        }
      ]
    },
    {
      title: 'Phase 4: High-Volume Logistics & 1099 Standby Contracts',
      days: 'Days 10–12',
      subtitle: 'Onboard with regional parcel hubs and on-demand local dispatch grids.',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      bgGradient: 'from-violet-650/10 to-transparent',
      steps: [
        {
          id: 'step-apply-amazon',
          title: 'Onboard with BWI-adjacent Amazon DSP Partners',
          description: 'Apply to Apex Courier Logistics (Hanover, MD near BWI). Incredibly fast application cycle (2-3 days). They supply the corporate delivery van, fuel cards, and structured full-time/part-time shifts.',
          category: 'apply_contract',
          isJobSync: 'job-4',
          targetLocation: 'Hanover MD / BWI Airport Area'
        },
        {
          id: 'step-apply-fedex',
          title: 'Submit Application to FedEx Ground Route Contractor',
          description: 'Apply with Baltimore Ground Delivery LLC (Halethorpe, MD). W-2 daily-paid scheduling. Safe, stable route delivery driving box trucks or sprinter step-vans. Requires DOT health clearance.',
          category: 'apply_contract',
          isJobSync: 'job-5',
          targetLocation: 'Halethorpe / South Baltimore Hub'
        },
        {
          id: 'step-apply-local-courier',
          title: 'Register as Independent Courier Standby Route',
          description: 'Apply to Charm City Courier & Messenger (Baltimore Downtown). Excellent on-demand backup commissions delivering legal paperwork, architectural plans, and corporate correspondence in your own vehicle.',
          category: 'apply_contract',
          isJobSync: 'job-10',
          targetLocation: 'Baltimore City Center'
        }
      ]
    },
    {
      title: 'Phase 5: active Pipeline Tracking & Multi-Job Stacking',
      days: 'Days 13–14',
      subtitle: 'Run outbound follow-ups, lock in contracts, and activate optimized schedule combos.',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      bgGradient: 'from-rose-650/10 to-transparent',
      steps: [
        {
          id: 'step-followup-calls',
          title: 'Perform Outbound Application Follow-Ups',
          description: 'Contact hiring supervisors at Mid-Atlantic Specimen Transport and National Auto Parts. Confirm they received your HIPAA/BBP certifications. A brief phone call on Day 13 boosts your hiring chance by 3x.',
          category: 'followup',
          link: '/applications',
          linkText: 'Review Application Tracker'
        },
        {
          id: 'step-combo-activation',
          title: 'Stack & Activate Your High-Yield Schedule Combo',
          description: 'Use the Combo Optimizer to stack your accepted roles. Recommended target: Full-time stable W-2 day shift (W-2 Medical Courier or Amazon DSP) + part-time evening/weekend specimen routes (Lab Specimen Courier).',
          category: 'followup',
          link: '/optimizer',
          linkText: 'Check Combo Optimizer'
        }
      ]
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCerts = await db.getCertifications();
        setCerts(fetchedCerts);

        const fetchedJobs = await db.getJobs();
        setJobs(fetchedJobs);

        // Load custom step checklist status from localStorage
        const stored = localStorage.getItem('cc_action_steps');
        if (stored) {
          setCompletedSteps(JSON.parse(stored));
        } else {
          // Initialize empty checklist
          const initial: Record<string, boolean> = {};
          localStorage.setItem('cc_action_steps', JSON.stringify(initial));
        }
      } catch (err) {
        console.error('Error loading Action Plan data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Write manual checkboxes updates to localStorage
  const handleToggleStep = (stepId: string) => {
    const nextState = {
      ...completedSteps,
      [stepId]: !completedSteps[stepId]
    };
    setCompletedSteps(nextState);
    localStorage.setItem('cc_action_steps', JSON.stringify(nextState));
  };

  // Sync checklist with database for Certifications
  const handleToggleCertSync = async (certId: string, stepId: string, currentCompleted: boolean) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const updates = {
        completed: !currentCompleted,
        completion_date: !currentCompleted ? todayStr : undefined
      };
      await db.updateCertification(certId, updates);
      
      // Update local certs state
      setCerts(prev => prev.map(c => c.id === certId ? { ...c, ...updates } : c));
      
      // Also update action plan checklist state
      handleToggleStep(stepId);
    } catch (err) {
      console.error('Failed to sync cert update:', err);
    }
  };

  // Sync checklist with database for Job Applications
  const handleToggleJobSync = async (jobId: string, stepId: string, currentStatus: string) => {
    try {
      // Toggle job status between 'saved' and 'applied'
      const nextStatus = currentStatus === 'applied' ? 'saved' : 'applied';
      await db.updateJob(jobId, { status: nextStatus });
      
      // Update local jobs state
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: nextStatus } : j));
      
      // If we are applying, let's check if an application entry needs to be created or deleted in local storage
      const existingApps = await db.getApplications();
      const existingApp = existingApps.find(a => a.job_id === jobId);

      if (nextStatus === 'applied' && !existingApp) {
        await db.addApplication({
          job_id: jobId,
          date_applied: new Date().toISOString().split('T')[0],
          status: 'applied',
          notes: 'Applied from the 7-14 Day Action Plan checkoff.'
        });
      } else if (nextStatus === 'saved' && existingApp) {
        await db.deleteApplication(existingApp.id);
      }

      // Update action plan checklist
      handleToggleStep(stepId);
    } catch (err) {
      console.error('Failed to sync job status update:', err);
    }
  };

  const togglePhaseCollapse = (index: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Customizing Plan for Baltimore ZIP 21237...</p>
      </div>
    );
  }

  // Calculate high value "unlockable" medical jobs
  const medicalJobs = jobs.filter(j => {
    const title = j.job_title.toLowerCase();
    const notes = (j.notes || '').toLowerCase();
    return title.includes('medical') || 
           title.includes('pharmacy') || 
           title.includes('specimen') || 
           title.includes('lab') || 
           title.includes('dme') ||
           notes.includes('specimen');
  });

  // Calculate totals for progress reporting
  let totalStepsCount = 0;
  let completedStepsCount = 0;

  phases.forEach(phase => {
    phase.steps.forEach(step => {
      totalStepsCount++;
      // Determine if completed
      let isDone = false;
      if (step.isCertSync) {
        const matchingCert = certs.find(c => c.id === step.isCertSync);
        isDone = matchingCert ? matchingCert.completed : false;
      } else if (step.isJobSync) {
        const matchingJob = jobs.find(j => j.id === step.isJobSync);
        isDone = matchingJob ? matchingJob.status !== 'saved' : false;
      } else {
        isDone = !!completedSteps[step.id];
      }
      if (isDone) completedStepsCount++;
    });
  });

  const planProgressPct = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  // Check state of the $49 "fast pass"
  const hipaaCert = certs.find(c => c.id === 'cert-hipaa');
  const bbpCert = certs.find(c => c.id === 'cert-bbp');
  const hasFastPass = (hipaaCert?.completed && bbpCert?.completed) || false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <ListTodo className="h-6 w-6 text-indigo-400" />
            <span>7 to 14 Day Action Plan</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A battle-tested checklist mapped out specifically for couriers near **Baltimore, MD** / **Laurel, MD**. Follow this structured schedule to bypass standard app-based gig instability and unlock stable, high-matching W-2 and medical courier opportunities.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px]">
            <span className="flex items-center space-x-1 text-slate-350 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <MapPin className="h-3 w-3 text-cyan-400" />
              <span>Target Radius: 20-40 Miles (Laurel MD)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-350 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <Shield className="h-3 w-3 text-indigo-400" />
              <span>Focus: Stable Non-CDL</span>
            </span>
          </div>
        </div>

        {/* Action Plan Progress Card */}
        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl lg:w-80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Plan Checklist Progress</span>
            <span className="text-2xl font-black text-slate-100">{completedStepsCount} / {totalStepsCount} Done</span>
            <span className="text-[10px] text-indigo-450 block font-semibold">
              {planProgressPct === 100 ? '🎉 Route Completed! Apply now.' : '📈 Stacking steps to launch'}
            </span>
          </div>

          <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-950 border-2 border-slate-800">
            <span className="text-xs font-black text-indigo-400">{planProgressPct}%</span>
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle
                className="text-slate-800"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r="30"
                cx="32"
                cy="32"
              />
              <circle
                className="text-indigo-500 transition-all duration-500"
                strokeWidth="3"
                strokeDasharray={188.4}
                strokeDashoffset={188.4 - (188.4 * planProgressPct) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="30"
                cx="32"
                cy="32"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900/60 border border-slate-850 p-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${planProgressPct}%` }}
        ></div>
      </div>

      {/* FAST PASS ALERT: $49 HIPAA + BBP Compliance Unlock */}
      <div className={`glass-panel p-5 relative overflow-hidden border border-l-4 transition-all ${
        hasFastPass 
          ? 'border-l-emerald-500 bg-emerald-950/5' 
          : 'border-l-rose-500 bg-rose-950/5'
      }`}>
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
        
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 border ${
            hasFastPass 
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-900/20 border-rose-500/30 text-rose-400 animate-pulse'
          }`}>
            <Award className="h-6 w-6" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border mb-1.5 ${
                  hasFastPass 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  {hasFastPass ? 'Compliance Lock Achieved!' : 'Recommended Fast Pass: $49 Compliance Combo'}
                </span>
                <h3 className="text-base font-bold text-slate-150">
                  {hasFastPass 
                    ? 'Compliance Unlock Active: Medical Roles Qualified!' 
                    : 'Get HIPAA & OSHA BBP Online Today to Unlock High-Paid Medical Specimen Jobs'
                  }
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Cost:</span>
                <span className="block text-lg font-black text-slate-100">$49.98</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Medical specimen and pharmacy routes are the most stable, non-CDL options near Baltimore. They offer high stability, consistent runs, and company-provided vehicles (e.g. Priuses with gas cards). Simply spending **$49.98** today for **HIPAA ($29.90)** and **OSHA Bloodborne Pathogens ($19.99)** online certifications instantly qualifies you for 4 of the highest-rated courier roles.
            </p>

            {/* Locked vs Unlocked Specimen Jobs Indicator */}
            <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3.5 space-y-2.5">
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center">
                <Shield className="h-3 w-3 mr-1 text-cyan-400" />
                Your Qualification Impact (Baltimore Medical Directory)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {medicalJobs.map(job => {
                  const score = calculateJobScore(job).total;
                  return (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-indigo-400 font-extrabold group-hover:underline">
                            {job.job_title}
                          </span>
                          <span className={`text-[10px] font-black ${
                            score >= 80 ? 'text-emerald-400' : score >= 70 ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            {score} pts
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-medium block uppercase tracking-tight">
                          {job.company_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850 text-[9px]">
                        <span className="text-slate-400">{job.location.split(' ')[0]}</span>
                        <span className={`font-semibold flex items-center space-x-0.5 ${
                          hasFastPass ? 'text-emerald-400' : 'text-rose-450'
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full fill-current bg-current"></span>
                          <span>{hasFastPass ? 'Qualified' : 'Pending Certs'}</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Certification Quick Actions */}
            {!hasFastPass && (
              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                {hipaaCert && !hipaaCert.completed && (
                  <a
                    href={hipaaCert.training_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 bg-[#0a0f1d] hover:bg-slate-800 border border-slate-700/60 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1"
                  >
                    <span>1. Take HIPAA Course ($29.99)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                  </a>
                )}
                {bbpCert && !bbpCert.completed && (
                  <a
                    href={bbpCert.training_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 bg-[#0a0f1d] hover:bg-slate-800 border border-slate-700/60 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1"
                  >
                    <span>2. Take OSHA BBP Course ($19.99)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                  </a>
                )}
                <Link
                  href="/certifications"
                  className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/20"
                >
                  <span>Go to Compliance Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chronological Action Phases */}
      <div className="space-y-4">
        {phases.map((phase, phaseIdx) => {
          const isExpanded = expandedPhases[phaseIdx];
          
          // Calculate phase completion status
          let phaseSteps = 0;
          let phaseDone = 0;
          phase.steps.forEach(step => {
            phaseSteps++;
            let isDone = false;
            if (step.isCertSync) {
              const matchingCert = certs.find(c => c.id === step.isCertSync);
              isDone = matchingCert ? matchingCert.completed : false;
            } else if (step.isJobSync) {
              const matchingJob = jobs.find(j => j.id === step.isJobSync);
              isDone = matchingJob ? matchingJob.status !== 'saved' : false;
            } else {
              isDone = !!completedSteps[step.id];
            }
            if (isDone) phaseDone++;
          });
          const phaseProgress = phaseSteps > 0 ? Math.round((phaseDone / phaseSteps) * 100) : 0;

          return (
            <div 
              key={phaseIdx} 
              className={`glass-panel overflow-hidden border border-slate-850/50 bg-gradient-to-br ${phase.bgGradient} transition-all`}
            >
              {/* Phase Header (Accordion Toggler) */}
              <button
                onClick={() => togglePhaseCollapse(phaseIdx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-900/20 transition-all border-b border-slate-900/60"
              >
                <div className="flex items-center space-x-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-wider ${phase.badgeColor}`}>
                    {phase.days}
                  </span>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-slate-100 flex items-center space-x-2">
                      <span>{phase.title}</span>
                      {phaseProgress === 100 && (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 fill-emerald-400/10" />
                      )}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-450 mt-0.5">
                      {phase.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col text-right text-[10px] text-slate-500 mr-2">
                    <span className="font-semibold text-slate-350">{phaseDone} / {phaseSteps} Steps Completed</span>
                    <span className="text-[9px] text-slate-550">Progress: {phaseProgress}%</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Phase Steps (Accordion Body) */}
              {isExpanded && (
                <div className="p-5 divide-y divide-slate-850/60 space-y-4">
                  {phase.steps.map((step, stepIdx) => {
                    // Determine status
                    let isStepDone = false;
                    let certSyncItem: Certification | undefined;
                    let jobSyncItem: Job | undefined;

                    if (step.isCertSync) {
                      certSyncItem = certs.find(c => c.id === step.isCertSync);
                      isStepDone = certSyncItem ? certSyncItem.completed : false;
                    } else if (step.isJobSync) {
                      jobSyncItem = jobs.find(j => j.id === step.isJobSync);
                      // Considered done if they changed status from 'saved' (i.e. applied, interview, onboarding, accepted)
                      isStepDone = jobSyncItem ? jobSyncItem.status !== 'saved' : false;
                    } else {
                      isStepDone = !!completedSteps[step.id];
                    }

                    return (
                      <div 
                        key={step.id} 
                        className={`flex items-start space-x-4 pt-4 first:pt-0 ${
                          isStepDone ? 'opacity-60 bg-emerald-950/2' : ''
                        }`}
                      >
                        {/* Interactive Large Checkbox */}
                        {step.isCertSync && certSyncItem ? (
                          <button
                            onClick={() => handleToggleCertSync(certSyncItem!.id, step.id, certSyncItem!.completed)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isStepDone 
                                ? 'bg-emerald-600 border-emerald-500 text-white' 
                                : 'bg-[#0a0f1d] border-slate-700/60 hover:border-indigo-400 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : step.isJobSync && jobSyncItem ? (
                          <button
                            onClick={() => handleToggleJobSync(jobSyncItem!.id, step.id, jobSyncItem!.status)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isStepDone 
                                ? 'bg-emerald-600 border-emerald-500 text-white' 
                                : 'bg-[#0a0f1d] border-slate-700/60 hover:border-indigo-400 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStep(step.id)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isStepDone 
                                ? 'bg-emerald-600 border-emerald-500 text-white' 
                                : 'bg-[#0a0f1d] border-slate-700/60 hover:border-indigo-400 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`text-xs font-bold leading-none ${
                              isStepDone ? 'text-slate-400 line-through' : 'text-slate-200'
                            }`}>
                              {step.title}
                            </span>
                            
                            {step.targetLocation && (
                              <span className="inline-flex items-center text-[9px] font-semibold text-cyan-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                <MapPin className="h-2.5 w-2.5 mr-0.5" />
                                {step.targetLocation}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Quick details / Callouts / Dynamic synchronizations logs */}
                          {step.isCertSync && certSyncItem && (
                            <div className="flex items-center space-x-2 text-[9px] font-semibold">
                              <span className="text-slate-500">Sync:</span>
                              <span className={certSyncItem.completed ? 'text-emerald-400' : 'text-slate-400'}>
                                {certSyncItem.name} • {certSyncItem.completed ? 'Acquired ✅' : 'Pending Cost: $' + certSyncItem.estimated_cost.toFixed(0)}
                              </span>
                            </div>
                          )}

                          {step.isJobSync && jobSyncItem && (
                            <div className="flex items-center space-x-2 text-[9px] font-semibold">
                              <span className="text-slate-500">Sync:</span>
                              <span className={jobSyncItem.status !== 'saved' ? 'text-emerald-400' : 'text-slate-400'}>
                                {jobSyncItem.company_name} • Application State: <span className="uppercase text-indigo-400">{jobSyncItem.status}</span>
                              </span>
                            </div>
                          )}

                          {/* Action Link */}
                          {step.link && !isStepDone && (
                            <div className="pt-1">
                              <a 
                                href={step.link}
                                target={step.link.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-350 hover:underline transition-all"
                              >
                                <span>{step.linkText || 'Execute Task'}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Regional Courier Depot Information Card */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <MapPin className="h-4.5 w-4.5 text-cyan-400" />
          <span>Key Baltimore / Laurel MD Courier Hubs Reference</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl space-y-1.5">
            <span className="font-extrabold text-indigo-400 uppercase text-[9px] tracking-wider block">BWI Cargo Corridor</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Located around **Hanover, Linthicum, and Glen Burnie**. Heavy staging for **DHL Express, UPS Air Cargo, and Amazon DSP** warehouses. Ideal for stable W-2 courier routes and high-volume delivery.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl space-y-1.5">
            <span className="font-extrabold text-cyan-400 uppercase text-[9px] tracking-wider block">Elkridge / Jessup Depots</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Major terminal yards for **Lasership/OnTrac, FedEx Ground, and commercial freight lines**. Located directly off I-95 South, easily within 25 miles of Laurel and Baltimore City.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl space-y-1.5">
            <span className="font-extrabold text-emerald-400 uppercase text-[9px] tracking-wider block">Rosedale Specimen Labs</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              East Baltimore / Rosedale area hosts multiple regional lab diagnostic centers and auto supply warehouses (advance auto yards). Primary hiring grounds for **W-2 Medical Courier** specimen runners.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-400 leading-relaxed">
          <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Local Pro-Tip:</span> Baltimore W-2 courier recruiters prioritize drivers who hold a **clean 3-year motor vehicle record (MVR)** and a **pre-certified HIPAA/OSHA certification**. Presenting these qualifications in your interview demonstrates professional operational maturity.
          </div>
        </div>
      </div>
    </div>
  );
}
