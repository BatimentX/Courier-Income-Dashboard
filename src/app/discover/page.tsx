'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { searchJobs, getRapidApiKey, saveRapidApiKey } from '@/lib/jobSearch';
import { calculateJobScore } from '@/lib/scoring';
import { Job, VehicleType, JobType, PayType } from '@/types';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  Car, 
  ShieldCheck, 
  ExternalLink, 
  PlusCircle, 
  Check, 
  Key, 
  DollarSign, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DiscoverJobsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Medical Courier');
  const [locationQuery, setLocationQuery] = useState('Baltimore, MD 21237');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Job[]>([]);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  // Load API key from storage
  useEffect(() => {
    const key = getRapidApiKey();
    setApiKey(key);
    if (!key) {
      setShowKeyPanel(true);
    }
  }, []);

  // Pre-seed some default results when page mounts
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const initial = await searchJobs({ query: 'Medical Courier', location: 'Baltimore, MD 21237' });
        setResults(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveRapidApiKey(apiKey);
    setShowKeyPanel(false);
    alert('RapidAPI Key successfully saved in local secure storage!');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const searchResults = await searchJobs({
        query: searchQuery,
        location: locationQuery
      });
      setResults(searchResults);
    } catch (err) {
      console.error(err);
      alert('Error searching for jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category: string) => {
    setSearchQuery(category);
    setLoading(true);
    setSearched(true);
    try {
      const searchResults = await searchJobs({
        query: category,
        location: locationQuery
      });
      setResults(searchResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportJob = async (job: Job) => {
    try {
      // Strips "mock-" or "api-" to make a clean dashboard entry
      const cleanJob: Omit<Job, 'id'> = {
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        distance_from_21237: job.distance_from_21237,
        application_link: job.application_link,
        pay_min: job.pay_min,
        pay_max: job.pay_max,
        pay_type: job.pay_type,
        job_type: job.job_type,
        vehicle_type: job.vehicle_type,
        cdl_required: job.cdl_required,
        stability_score: job.stability_score,
        income_potential_score: job.income_potential_score,
        beginner_friendly_score: job.beginner_friendly_score,
        quick_apply_score: job.quick_apply_score,
        certification_difficulty_score: job.certification_difficulty_score,
        background_check_required: job.background_check_required,
        drug_test_required: job.drug_test_required,
        mvr_check_required: job.mvr_check_required,
        insurance_requirements: job.insurance_requirements,
        experience_requirements: job.experience_requirements,
        required_certifications: job.required_certifications,
        notes: job.notes,
        status: 'saved'
      };

      const added = await db.addJob(cleanJob);
      setImportedIds([...importedIds, job.id]);
      alert(`Imported "${job.job_title}" from ${job.company_name}! It is now auto-scored in your Comparison Matrix.`);
    } catch (err) {
      console.error(err);
      alert('Failed to import job.');
    }
  };

  // Helper to color scores
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 70) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10';
    if (score >= 55) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  };

  const getVehicleLabel = (type: VehicleType) => {
    switch (type) {
      case 'company_vehicle': return 'Company Car';
      case 'own_vehicle': return 'Personal Car';
      case 'sprinter_van': return 'Sprinter Van';
      case 'cargo_van': return 'Cargo Van';
      case 'box_truck': return 'Box Truck';
      default: return 'Vehicle Needed';
    }
  };

  const getJobTypeLabel = (type: JobType) => {
    switch (type) {
      case 'w2': return 'W-2 Route';
      case 'full_time': return 'W-2 Full-Time';
      case 'part_time': return 'W-2 Part-Time';
      case '1099': return '1099 Contractor';
      case 'contract': return 'Stable Contract';
      default: return 'Delivery Driver';
    }
  };

  const categories = [
    'Medical Courier',
    'Pharmacy Delivery',
    'Amazon DSP Driver',
    'FedEx Ground Route',
    'Auto Parts Delivery',
    'Box Truck Route',
    'Office Courier'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 border border-indigo-500/10 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-full inline-flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Live Job Aggregator</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              Discover Courier Routes
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Scan active job posts near Zip 21237. Instantly import roles to auto-score compatibility based on your exact vehicle, pay, and stability settings.
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowKeyPanel(!showKeyPanel)}
              className="inline-flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 px-4 py-2.5 rounded-2xl transition-all"
            >
              <Key className="h-4 w-4 text-cyan-400" />
              <span>{apiKey ? 'Manage API Key' : 'Configure API Key'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Config Panel (Collapsible) */}
      {showKeyPanel && (
        <div className="glass-panel p-5 space-y-4 border-cyan-500/20">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">How to unlock Live Job Discovery?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We use the **JSearch API** via RapidAPI to scan Indeed, LinkedIn, ZipRecruiter, and Glassdoor. You can sign up for a **100% free Basic Plan (200 searches/mo, no card required)** at <a href="https://rapidapi.com/letscrape-6b7ScP7qa/api/jsearch" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-bold">RapidAPI JSearch</a>. 
                Enter your key below. If you don't have a key, the engine automatically falls back to high-fidelity mock results near Baltimore!
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your RapidAPI Key (e.g. 8d39e...)"
              className="flex-1 bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:brightness-110 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
            >
              Save Key
            </button>
          </form>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        <SlidersHorizontal className="h-4 w-4 text-slate-550 flex-shrink-0" />
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => handleCategoryClick(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border flex-shrink-0 transition-all ${
              searchQuery === cat 
                ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-300' 
                : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/90'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-2xl">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g. pharmacy courier, Amazon DSP...)"
            required
            className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={locationQuery}
            onChange={e => setLocationQuery(e.target.value)}
            placeholder="Baltimore, MD"
            required
            className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search Routes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Key Indicator */}
      {!apiKey && (
        <div className="bg-amber-950/20 border border-amber-900/25 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-300">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-bold block">Preview Mode Enabled</span>
            <span>You are viewing high-fidelity mock courier routes near Baltimore. Click "Configure API Key" above to integrate live results.</span>
          </div>
        </div>
      )}

      {/* Search results list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-medium">Scanning delivery portals in Baltimore corridor...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-2">
            <AlertCircle className="h-10 w-10 text-slate-550 mx-auto" />
            <h4 className="text-slate-350 font-bold text-sm">No Results Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your keyword filter or check your internet connection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((job) => {
              // Calculate real-time dynamic score based on client settings
              const dynamicScore = calculateJobScore(job);
              const isImported = importedIds.includes(job.id);

              return (
                <div key={job.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/20 transition-all">
                  
                  {/* Top info and score */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{job.job_title}</h3>
                      <p className="text-xs text-indigo-400 font-bold">{job.company_name}</p>
                      
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                        <span className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 mr-1" />
                          {job.location} ({job.distance_from_21237.toFixed(1)} mi)
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3.5 w-3.5 text-slate-500 mr-0.5" />
                          {job.pay_min} - {job.pay_max} / {job.pay_type}
                        </span>
                      </div>
                    </div>

                    {/* Circular Score Badge */}
                    <div className={`h-11 w-11 flex flex-col items-center justify-center rounded-full border text-[13px] font-black ${getScoreColor(dynamicScore.total)}`}>
                      <span>{dynamicScore.total}</span>
                      <span className="text-[7px] text-slate-500 font-bold -mt-0.5">FIT</span>
                    </div>
                  </div>

                  {/* Summary notes */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-slate-950/20 p-2.5 rounded-xl border border-slate-850/40">
                    {job.notes}
                  </p>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400">
                      {getJobTypeLabel(job.job_type)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400 flex items-center space-x-1">
                      <Car className="h-3 w-3 text-cyan-400 mr-1" />
                      <span>{getVehicleLabel(job.vehicle_type)}</span>
                    </span>
                    {job.required_certifications.map((cert, index) => (
                      <span key={index} className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-900/35 rounded text-indigo-300 font-semibold">
                        {cert.split(' ')[0]} Required
                      </span>
                    ))}
                    {job.cdl_required && (
                      <span className="px-2 py-0.5 bg-rose-950/20 border border-rose-900/30 rounded text-rose-300 font-bold">
                        Requires CDL
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-850/50">
                    {isImported ? (
                      <button
                        disabled
                        className="flex-1 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-1.5"
                      >
                        <Check className="h-4 w-4" />
                        <span>Added to Matrix</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleImportJob(job)}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <PlusCircle className="h-4 w-4 text-cyan-400" />
                        <span>Add to Compare</span>
                      </button>
                    )}

                    <a
                      href={job.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 p-2 rounded-xl inline-flex items-center justify-center transition-all"
                      title="Quick Apply"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
