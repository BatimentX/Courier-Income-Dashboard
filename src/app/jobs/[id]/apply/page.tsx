'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { generateTailoredResume, generateCoverLetter, generateSuccessStrategy, SuccessStep } from '@/lib/resumeGenerator';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { CoverLetterTemplate } from '@/components/CoverLetterTemplate';
import { Job, UserProfile } from '@/types';
import { 
  ArrowLeft, 
  Download, 
  Sparkles, 
  FileText, 
  Briefcase, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Edit2
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf components to prevent Next.js SSR hydration errors
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function SmartApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom states for edited resume/cover letter prior to export
  const [tailoredSummary, setTailoredSummary] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingLetter, setEditingLetter] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedJob = await db.getJobById(id);
        const fetchedProfile = await db.getProfile();
        
        if (fetchedJob && fetchedProfile) {
          setJob(fetchedJob);
          setProfile(fetchedProfile);
          
          // Generate initially tailored content
          const resume = generateTailoredResume(fetchedProfile, fetchedJob);
          setTailoredSummary(resume.summary);
          
          const cl = generateCoverLetter(fetchedProfile, fetchedJob);
          setLetterBody(cl);

          if (fetchedJob.status === 'applied' || fetchedJob.status === 'interview') {
            setApplied(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleMarkAsApplied = async () => {
    if (!job) return;
    try {
      await db.addApplication({
        job_id: job.id,
        date_applied: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: 'Applied via Courier Income Decision Dashboard using customized tailored resume and cover letter.'
      });
      setApplied(true);
      alert(`Success! "${job.job_title}" is now marked as "Applied" and synced with your Application Tracker pipeline.`);
    } catch (err) {
      console.error(err);
      alert('Failed to mark as applied.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Tailoring Logistics Documents...</p>
      </div>
    );
  }

  if (!job || !profile) {
    return (
      <div className="glass-panel p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
        <ShieldAlert className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200 font-sans">Required Profiles Missing</h3>
        <p className="text-xs text-slate-400">
          Make sure your profile and the specific job details exist in your local workspace.
        </p>
        <Link
          href="/profile"
          className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Go to Profile Builder
        </Link>
      </div>
    );
  }

  // Final compile tailored resume for PDF component
  const finalTailoredProfile: UserProfile = {
    ...profile,
    summary: tailoredSummary,
    // Reorder work history to put delivery roles first
    work_history: [...profile.work_history].sort((a, b) => {
      if (a.is_delivery_related && !b.is_delivery_related) return -1;
      if (!a.is_delivery_related && b.is_delivery_related) return 1;
      return 0;
    })
  };

  const strategy = generateSuccessStrategy(profile, job);

  // Address assembly for cover letter template
  const senderAddress = `${profile.address || 'Street Address'}, ${profile.city || 'Laurel'}, ${profile.state || 'MD'} ${profile.zip || '20708'}`;
  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Action back row */}
      <div className="flex items-center justify-between">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Job Specification</span>
        </Link>
        
        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-350 text-xs font-bold rounded-full flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Smart Apply Dashboard</span>
        </span>
      </div>

      {/* Hero Banner Grid */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 border border-indigo-500/10 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">{job.job_title}</h2>
            <p className="text-sm text-slate-450 font-semibold">{job.company_name} — {job.location}</p>
            <p className="text-xs text-slate-500 pt-1">
              Apply to W-2 stability or flat rate contracts using auto-crafted professional logistics documentation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:items-center gap-3">
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-indigo-650/15 hover:brightness-110 transition-all glow-btn"
            >
              <span>Launch Careers Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {applied ? (
              <span className="inline-flex items-center justify-center space-x-1.5 bg-emerald-950/20 border border-emerald-900/35 text-emerald-450 px-5 py-3 rounded-2xl text-xs font-bold">
                <CheckCircle className="h-4 w-4" />
                <span>Marked as Applied</span>
              </span>
            ) : (
              <button
                onClick={handleMarkAsApplied}
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 px-5 py-3 rounded-2xl text-xs font-bold transition-all"
              >
                Mark as Applied
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Tailored Documents Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Resume section */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                <span>Tailored Professional Resume</span>
              </h3>
              
              {/* PDF Download link check for SSR */}
              {mounted && (
                <PDFDownloadLink
                  document={<ResumeTemplate profile={finalTailoredProfile} />}
                  fileName={`${job.company_name.replace(/\s+/g, '_')}_Courier_Resume.pdf`}
                  className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 px-2.5 py-1.5 rounded-xl border border-cyan-500/10 transition-all"
                >
                  {/* @ts-ignore */}
                  {({ loading: pdfLoading }) => (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>{pdfLoading ? 'Bundling PDF...' : 'Download Resume PDF'}</span>
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            {/* Resume Summary view / edit */}
            <div className="space-y-3 bg-[#070b14] border border-slate-850 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span>Dynamic Professional Summary</span>
                <button
                  type="button"
                  onClick={() => setEditingSummary(!editingSummary)}
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{editingSummary ? 'Done editing' : 'Edit summary'}</span>
                </button>
              </div>

              {editingSummary ? (
                <textarea
                  value={tailoredSummary}
                  onChange={e => setTailoredSummary(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
              ) : (
                <p className="text-xs text-slate-350 leading-relaxed italic">
                  "{tailoredSummary}"
                </p>
              )}
            </div>

            {/* Profile review details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-550 block">Name & Contact Details</span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300 font-semibold">
                  {profile.full_name || 'No Name'} | {profile.phone} | {profile.email}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-550 block">Active Credentials Exported</span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl text-slate-300">
                  {profile.certifications_held.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.certifications_held.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[9px] rounded font-semibold">
                          {c.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No certs configured.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <FileText className="h-4.5 w-4.5 text-cyan-400" />
                <span>Tailored Cover Letter</span>
              </h3>

              {mounted && (
                <PDFDownloadLink
                  document={
                    <CoverLetterTemplate
                      senderName={profile.full_name || 'Applicant'}
                      senderAddress={senderAddress}
                      senderPhone={profile.phone}
                      senderEmail={profile.email}
                      recipientName="Hiring Coordinator"
                      recipientCompany={job.company_name}
                      recipientLocation={job.location}
                      dateStr={todayStr}
                      subjectLine={`RE: Application for ${job.job_title}`}
                      letterBody={letterBody}
                    />
                  }
                  fileName={`${job.company_name.replace(/\s+/g, '_')}_Cover_Letter.pdf`}
                  className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 px-2.5 py-1.5 rounded-xl border border-cyan-500/10 transition-all"
                >
                  {/* @ts-ignore */}
                  {({ loading: pdfLoading }) => (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>{pdfLoading ? 'Bundling PDF...' : 'Download Letter PDF'}</span>
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            {/* Letter Editor */}
            <div className="space-y-2 bg-[#070b14] border border-slate-850 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span>Professional Cover Letter Body</span>
                <button
                  type="button"
                  onClick={() => setEditingLetter(!editingLetter)}
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{editingLetter ? 'Done editing' : 'Edit letter'}</span>
                </button>
              </div>

              {editingLetter ? (
                <textarea
                  value={letterBody}
                  onChange={e => setLetterBody(e.target.value)}
                  rows={12}
                  className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none"
                />
              ) : (
                <div className="text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                  {letterBody}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column: Hiring Strategy Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Strategy Check list */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 flex items-center space-x-1.5">
              <Briefcase className="h-4.5 w-4.5 text-violet-400" />
              <span>Success Playbook</span>
            </h3>

            <div className="space-y-4">
              {strategy.map((step) => {
                const isWarning = step.type === 'warning';
                const isSuccess = step.type === 'success';

                return (
                  <div 
                    key={step.id} 
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                      isWarning ? 'bg-rose-950/10 border-rose-500/10 text-rose-300' :
                      isSuccess ? 'bg-emerald-950/10 border-emerald-500/10 text-emerald-300' :
                      'bg-slate-900/60 border-slate-850 text-slate-350'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {isWarning ? (
                        <ShieldAlert className="h-4.5 w-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : isSuccess ? (
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div className="space-y-1">
                        <span className="font-bold block text-slate-200">{step.title}</span>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {step.action_link && (
                      <div className="pt-1.5 flex justify-end">
                        <Link
                          href={step.action_link}
                          className="inline-flex items-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          <span>Complete Action</span>
                          <ArrowLeft className="h-3 w-3 rotate-180 ml-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Negotiating helper quick card */}
          <div className="glass-panel p-5 bg-gradient-to-br from-indigo-950/20 to-cyan-950/20 border-cyan-500/15 space-y-3">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-cyan-400" />
              <span>Target Salary range</span>
            </h4>
            <div className="text-lg font-black text-slate-200">
              ${job.pay_min.toFixed(2)} - ${job.pay_max.toFixed(2)} / {job.pay_type}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deducted based on actual Baltimore logistics hiring listings. Highlight any clean medical DOT physical cards or TSA STA clearances to secure the upper bracket.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
