'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Job, Application, JobStatus } from '@/types';
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  FileEdit
} from 'lucide-react';

export default function ApplicationTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pipeline filter tab
  const [activeTab, setActiveTab] = useState<'saved' | 'active' | 'closed'>('active');

  // Contact form input states (for editing follow-up / contacts in card)
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedJobs = await db.getJobs();
        const fetchedApps = await db.getApplications();
        setJobs(fetchedJobs);
        setApps(fetchedApps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (jobId: string, appId: string | undefined, newStatus: JobStatus) => {
    try {
      if (appId) {
        // Update existing application status
        await db.updateApplication(appId, { status: newStatus });
      } else {
        // If there's no application record (e.g. job was just "saved"), create one!
        await db.addApplication({
          job_id: jobId,
          date_applied: new Date().toISOString().split('T')[0],
          status: newStatus,
          notes: 'Status initialized from Application Pipeline tracker.'
        });
      }
      
      // Refresh state
      const fetchedJobs = await db.getJobs();
      const fetchedApps = await db.getApplications();
      setJobs(fetchedJobs);
      setApps(fetchedApps);
      alert(`Pipeline updated! Job advanced to "${newStatus.toUpperCase()}".`);
    } catch (err) {
      console.error(err);
      alert('Failed to update pipeline stage.');
    }
  };

  const handleStartEditing = (app: Application) => {
    setEditingAppId(app.id);
    setEditContactName(app.contact_name || '');
    setEditContactEmail(app.contact_email || '');
    setEditContactPhone(app.contact_phone || '');
    setEditFollowUp(app.follow_up_date || '');
    setEditNotes(app.notes || '');
  };

  const handleSaveAppEdit = async (appId: string) => {
    try {
      await db.updateApplication(appId, {
        contact_name: editContactName || undefined,
        contact_email: editContactEmail || undefined,
        contact_phone: editContactPhone || undefined,
        follow_up_date: editFollowUp || undefined,
        notes: editNotes || undefined
      });
      
      setEditingAppId(null);
      
      // Refresh state
      const fetchedJobs = await db.getJobs();
      const fetchedApps = await db.getApplications();
      setJobs(fetchedJobs);
      setApps(fetchedApps);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Loading Application Pipeline...</p>
      </div>
    );
  }

  // Filter jobs based on the active pipeline tab
  const getFilteredJobs = () => {
    if (activeTab === 'saved') {
      return jobs.filter(j => j.status === 'saved');
    }
    if (activeTab === 'active') {
      return jobs.filter(j => j.status === 'applied' || j.status === 'interview');
    }
    return jobs.filter(j => j.status === 'onboarding' || j.status === 'accepted' || j.status === 'rejected');
  };

  const filteredJobs = getFilteredJobs();

  // Helper to find matching Application details for a Job
  const getAppForJob = (jobId: string): Application | undefined => {
    return apps.find(a => a.job_id === jobId);
  };

  // Stats calculation
  const statsSavedCount = jobs.filter(j => j.status === 'saved').length;
  const statsActiveCount = jobs.filter(j => j.status === 'applied' || j.status === 'interview').length;
  const statsClosedCount = jobs.filter(j => j.status === 'onboarding' || j.status === 'accepted' || j.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            <span>Courier Application Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400">Track contact details, schedule callbacks, and advance hiring stages for all stable jobs.</p>
        </div>
      </div>

      {/* Stats and Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0c1220]/80 border border-slate-850 rounded-2xl">
        <button
          onClick={() => setActiveTab('saved')}
          className={`py-3 px-2 rounded-xl text-center transition-all ${
            activeTab === 'saved'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-bold">Saved</div>
          <div className="text-lg font-black mt-0.5">{statsSavedCount}</div>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-2 rounded-xl text-center transition-all ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-bold">Active</div>
          <div className="text-lg font-black mt-0.5">{statsActiveCount}</div>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`py-3 px-2 rounded-xl text-center transition-all ${
            activeTab === 'closed'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-xs font-bold">Closed</div>
          <div className="text-lg font-black mt-0.5">{statsClosedCount}</div>
        </button>
      </div>

      {/* Main pipeline list display */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-4">
            <HelpCircle className="h-12 w-12 text-indigo-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No Jobs in this Stage</h3>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
              {activeTab === 'saved' 
                ? 'Search and save opportunities from the job matrix to consider them later.'
                : activeTab === 'active'
                ? 'Advance saved jobs to "Applied" or "Interview" to track your outreach.'
                : 'Jobs that are offered, onboarding, or rejected will gather here.'}
            </p>
            {activeTab === 'saved' && (
              <Link
                href="/comparison"
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-colors"
              >
                <span>Browse Stored Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredJobs.map((job) => {
              const app = getAppForJob(job.id);
              const isEditing = app && editingAppId === app.id;

              return (
                <div 
                  key={job.id} 
                  className="glass-panel p-5 grid grid-cols-1 md:grid-cols-3 gap-5 relative overflow-hidden group border-indigo-500/10"
                >
                  {/* Left Column: Job detail card summary */}
                  <div className="space-y-3 md:border-r md:border-slate-800/80 md:pr-5">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Opportunity</span>
                      <h3 className="text-base font-extrabold text-slate-200 mt-0.5">{job.job_title}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{job.company_name} • {job.location}</p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-850">
                      <div className="flex justify-between">
                        <span>Pay:</span>
                        <span className="text-slate-200 font-bold">
                          ${job.pay_min.toFixed(0)}-${job.pay_max.toFixed(0)}/{job.pay_type === 'hourly' ? 'hr' : 'day'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="text-slate-200 font-medium">{job.distance_from_21237} miles</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link 
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>Analyze Requirements</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Middle Column: Application details & Callback/Contact tracker */}
                  <div className="space-y-3 md:border-r md:border-slate-800/80 md:px-5 flex flex-col justify-between">
                    {app ? (
                      isEditing ? (
                        /* Editing Sub-Form inside Card */
                        <div className="space-y-3 text-xs">
                          <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block">Edit Contact Details</span>
                          
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={editContactName}
                            onChange={(e) => setEditContactName(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-850 rounded-lg py-1.5 px-2 text-[11px] text-slate-200 focus:outline-none"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="email"
                              placeholder="Email"
                              value={editContactEmail}
                              onChange={(e) => setEditContactEmail(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-850 rounded-lg py-1.5 px-2 text-[11px] text-slate-200 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Phone"
                              value={editContactPhone}
                              onChange={(e) => setEditContactPhone(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-850 rounded-lg py-1.5 px-2 text-[11px] text-slate-200 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Follow-up Date</label>
                            <input
                              type="date"
                              value={editFollowUp}
                              onChange={(e) => setEditFollowUp(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-850 rounded-lg py-1 px-2 text-[11px] text-slate-200 focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleSaveAppEdit(app.id)}
                            className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-colors"
                          >
                            Save Details
                          </button>
                        </div>
                      ) : (
                        /* Read-only Contact Details */
                        <div className="space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Contact & Dates</span>
                              <button
                                onClick={() => handleStartEditing(app)}
                                className="inline-flex items-center space-x-1 text-slate-400 hover:text-indigo-400 text-[10px] font-bold"
                              >
                                <FileEdit className="h-3 w-3" />
                                <span>Edit Contacts</span>
                              </button>
                            </div>
                            
                            <div className="space-y-1 text-xs text-slate-350">
                              <p className="flex items-center">
                                <User className="h-3.5 w-3.5 text-cyan-400 mr-1.5 flex-shrink-0" />
                                <span className="font-semibold">{app.contact_name || 'No contact name recorded'}</span>
                              </p>
                              {app.contact_phone && (
                                <p className="flex items-center">
                                  <Phone className="h-3.5 w-3.5 text-emerald-400 mr-1.5 flex-shrink-0" />
                                  <span>{app.contact_phone}</span>
                                </p>
                              )}
                              {app.contact_email && (
                                <p className="flex items-center">
                                  <Mail className="h-3.5 w-3.5 text-indigo-400 mr-1.5 flex-shrink-0 animate-pulse" />
                                  <span className="truncate">{app.contact_email}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1.5 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Date Applied:</span>
                              <span className="text-slate-300 font-bold">{app.date_applied}</span>
                            </div>
                            {app.follow_up_date && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Follow-up:</span>
                                <span className="text-indigo-400 font-bold">{app.follow_up_date}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      /* If W-2 / saved is not applied yet, show reminder button */
                      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center text-xs space-y-2">
                        <Clock className="h-8 w-8 text-slate-600" />
                        <p className="text-slate-500 text-[11px]">This opportunity is currently saved. Mark applied to start tracking followups.</p>
                        <button
                          onClick={() => handleUpdateStatus(job.id, undefined, 'applied')}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg font-semibold text-[10px]"
                        >
                          Mark Applied Today
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Pipeline Actions (Change status, add notes) */}
                  <div className="space-y-4 md:pl-5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Hiring Pipeline Stage</span>
                      
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-300">
                        <button
                          onClick={() => handleUpdateStatus(job.id, app?.id, 'applied')}
                          className={`py-1.5 rounded-lg border transition-all ${
                            job.status === 'applied'
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                              : 'bg-slate-900/60 border-slate-850 hover:bg-slate-850'
                          }`}
                        >
                          Applied
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(job.id, app?.id, 'interview')}
                          className={`py-1.5 rounded-lg border transition-all ${
                            job.status === 'interview'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                              : 'bg-slate-900/60 border-slate-850 hover:bg-slate-850'
                          }`}
                        >
                          Interview
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(job.id, app?.id, 'onboarding')}
                          className={`py-1.5 rounded-lg border transition-all ${
                            job.status === 'onboarding'
                              ? 'bg-violet-500/10 border-violet-500/40 text-violet-400'
                              : 'bg-slate-900/60 border-slate-850 hover:bg-slate-850'
                          }`}
                        >
                          Onboarding
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(job.id, app?.id, 'accepted')}
                          className={`py-1.5 rounded-lg border transition-all ${
                            job.status === 'accepted'
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                              : 'bg-slate-900/60 border-slate-850 hover:bg-slate-850'
                          }`}
                        >
                          Accepted
                        </button>
                      </div>
                    </div>

                    {/* Quick status progress visualization */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-850">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Internal Action notes</span>
                      {isEditing ? (
                        <textarea
                          placeholder="Application notes, interview tips, callback responses..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-lg py-1.5 px-2 text-[10px] text-slate-350 focus:outline-none"
                        />
                      ) : (
                        <p className="text-[10px] text-slate-450 leading-relaxed line-clamp-2 italic">
                          {app?.notes || 'No active notes entered. Click "Edit Contacts" to write a follow-up log.'}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom checklist advice */}
      <div className="p-4 bg-indigo-950/30 border border-indigo-900/20 rounded-xl flex items-start space-x-3 text-xs text-slate-400 leading-normal">
        <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">Proactive Follow-up Advice:</span> Recruiters in regional medical transportation and package shipping are flooded with applications. Call their dispatch center exactly **72 hours** after submitting your application to confirm they received your HIPAA/DOT health documentation. This simple call boosts hiring conversion rates by over 40%!
        </div>
      </div>
    </div>
  );
}
