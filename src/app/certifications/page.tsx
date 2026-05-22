'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Certification } from '@/types';
import { 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Info,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';

export default function CertificationTracker() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        const fetched = await db.getCertifications();
        setCerts(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const updates: Partial<Certification> = {
        completed: !currentStatus,
        completion_date: !currentStatus ? todayStr : undefined
      };
      
      const updated = await db.updateCertification(id, updates);
      
      // Update local state
      setCerts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      console.error(err);
      alert('Failed to update certification.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Loading Compliance Directory...</p>
      </div>
    );
  }

  // Calculate Progress Stats
  const totalCerts = certs.length;
  const completedCerts = certs.filter(c => c.completed).length;
  const percentComplete = totalCerts > 0 ? Math.round((completedCerts / totalCerts) * 100) : 0;
  const totalCostEstimate = certs.reduce((acc, c) => acc + (c.completed ? 0 : c.estimated_cost), 0);

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
        
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Award className="h-6 w-6 text-indigo-400" />
            <span>Courier Compliance & Certifications</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Manage industry-standard compliance courses (HIPAA, blood pathogens, DOT physical, and TSA threat clearings). Mark items complete as you acquire them to unlock high-paying medical and freight jobs.
          </p>
        </div>

        {/* Dynamic progress wheel/indicator */}
        <div className="flex items-center space-x-4 bg-slate-900/60 border border-slate-850 p-4 rounded-2xl md:w-80 justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Overall Completion</span>
            <span className="text-2xl font-black text-slate-100">{completedCerts} / {totalCerts} Done</span>
            <span className="text-[10px] text-slate-500 block">Pending Cost: <span className="text-rose-400 font-bold">${totalCostEstimate.toFixed(0)}</span></span>
          </div>

          <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-950 border-2 border-slate-800">
            <span className="text-xs font-bold text-indigo-400">{percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
      </div>

      {/* Grid mapping out certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certs.map((cert) => (
          <div 
            key={cert.id} 
            className={`glass-panel p-5 flex flex-col justify-between relative overflow-hidden group border-l-4 transition-all ${
              cert.completed 
                ? 'border-l-emerald-500 bg-emerald-950/5' 
                : 'border-l-indigo-500'
            }`}
          >
            <div>
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                    cert.required_or_optional === 'required'
                      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                      : 'text-slate-400 bg-slate-500/10 border-slate-550/20'
                  }`}>
                    {cert.required_or_optional}
                  </span>
                  
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {cert.name}
                  </h3>
                </div>

                {/* Completed Toggle Button */}
                <button
                  onClick={() => handleToggleComplete(cert.id, cert.completed)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    cert.completed
                      ? 'bg-emerald-600/10 hover:bg-emerald-600/25 border-emerald-500/35 text-emerald-400'
                      : 'bg-[#0a0f1d] hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${cert.completed ? 'fill-current text-emerald-400' : 'text-slate-400'}`} />
                  <span>{cert.completed ? 'Acquired' : 'Mark Completed'}</span>
                </button>
              </div>

              {/* Specs boxes */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-850 text-[10px] my-3">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold tracking-wider">Duration</span>
                    <span className="font-semibold text-slate-250">{cert.time_to_complete}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold tracking-wider">Cost Est</span>
                    <span className="font-semibold text-slate-250">${cert.estimated_cost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold tracking-wider">Scope</span>
                    <span className="font-semibold text-slate-250">{cert.national_or_state_specific}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-450 leading-relaxed mb-4">
                {cert.notes}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              {/* Applies to list */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block flex items-center">
                  <Layers className="h-3 w-3 mr-1 text-indigo-400" />
                  Applies to Job Categories
                </span>
                <div className="flex flex-wrap gap-1 text-[9px] font-semibold text-indigo-300">
                  {cert.applies_to.map((cat, idx) => (
                    <span key={idx} className="bg-slate-900/50 border border-slate-850 px-1.5 py-0.5 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom completed status or training links */}
              {cert.completed ? (
                <div className="flex items-center space-x-1.5 p-2 bg-emerald-950/20 border border-emerald-900/10 text-emerald-400 text-[10px] font-bold rounded-lg">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Acquired on: {cert.completion_date || 'Approved Record'}</span>
                </div>
              ) : cert.training_link ? (
                <a
                  href={cert.training_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-350 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <span>Register & Take Course</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

          </div>
        ))}
      </div>

      {/* Quick compliance help card */}
      <div className="glass-panel p-4 flex items-start space-x-3 text-xs leading-relaxed text-slate-400">
        <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Compliance Priority:</span> The easiest way to start is to get your **HIPAA Certification ($29)** and **OSHA Bloodborne Pathogens ($19)** done today. They both can be finished online in under 3 hours combined, and will instantly qualify you for 4 of the highest paying medical and pharmacy specimen routes in Baltimore!
        </div>
      </div>
    </div>
  );
}
