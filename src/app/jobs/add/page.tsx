'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Job, JobType, VehicleType, PayType, JobStatus } from '@/types';
import { ArrowLeft, Save, Briefcase, DollarSign, Sliders, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AddJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(10);
  const [appLink, setAppLink] = useState('');
  
  const [payMin, setPayMin] = useState(20);
  const [payMax, setPayMax] = useState(25);
  const [payType, setPayType] = useState<PayType>('hourly');
  const [jobType, setJobType] = useState<JobType>('w2');
  const [vehicleType, setVehicleType] = useState<VehicleType>('company_vehicle');
  const [cdlRequired, setCdlRequired] = useState(false);

  // Score metrics (1-10)
  const [stabilityScore, setStabilityScore] = useState(7);
  const [incomeScore, setIncomeScore] = useState(6);
  const [beginnerScore, setBeginnerScore] = useState(8);
  const [quickApplyScore, setQuickApplyScore] = useState(7);
  const [certDifficulty, setCertDifficulty] = useState(3);

  // Requirements
  const [backgroundCheck, setBackgroundCheck] = useState(true);
  const [drugTest, setDrugTest] = useState(true);
  const [mvrCheck, setMvrCheck] = useState(true);
  const [insurance, setInsurance] = useState('');
  const [experience, setExperience] = useState('');
  const [certInput, setCertInput] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName || !location) {
      alert('Please fill out Job Title, Company Name, and Location.');
      return;
    }

    setLoading(true);
    try {
      const requiredCerts = certInput 
        ? certInput.split(',').map(s => s.trim()).filter(s => s !== '') 
        : [];

      const newJob: Omit<Job, 'id'> = {
        job_title: jobTitle,
        company_name: companyName,
        location,
        distance_from_21237: Number(distance),
        application_link: appLink,
        pay_min: Number(payMin),
        pay_max: Number(payMax),
        pay_type: payType,
        job_type: jobType,
        vehicle_type: vehicleType,
        cdl_required: cdlRequired,
        stability_score: Number(stabilityScore),
        income_potential_score: Number(incomeScore),
        beginner_friendly_score: Number(beginnerScore),
        quick_apply_score: Number(quickApplyScore),
        certification_difficulty_score: Number(certDifficulty),
        background_check_required: backgroundCheck,
        drug_test_required: drugTest,
        mvr_check_required: mvrCheck,
        insurance_requirements: insurance || undefined,
        experience_requirements: experience || undefined,
        required_certifications: requiredCerts,
        notes: notes || undefined,
        status: 'saved' as JobStatus
      };

      await db.addJob(newJob);
      router.push('/comparison');
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/comparison"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Comparison Matrix</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-100">Add New Courier Job</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core details card */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 text-slate-200 font-bold text-sm">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            <span>1. Core Position Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Job Title *</label>
              <input
                type="text"
                placeholder="e.g. W-2 Medical Courier Route"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company / Contractor Name *</label>
              <input
                type="text"
                placeholder="e.g. Mid-Atlantic Logistics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location *</label>
              <input
                type="text"
                placeholder="e.g. Glen Burnie, MD"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Distance from ZIP 21237 (mi)</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                min="0"
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Application URL</label>
              <input
                type="url"
                placeholder="https://example.com/careers"
                value={appLink}
                onChange={(e) => setAppLink(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pay & Scheduling */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 text-slate-200 font-bold text-sm">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span>2. Pay Rate & Employment Type</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pay Range (Min)</label>
              <input
                type="number"
                placeholder="Min Pay"
                value={payMin}
                onChange={(e) => setPayMin(Number(e.target.value))}
                min="0"
                required
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pay Range (Max)</label>
              <input
                type="number"
                placeholder="Max Pay"
                value={payMax}
                onChange={(e) => setPayMax(Number(e.target.value))}
                min="0"
                required
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pay Period</label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="hourly">Hourly Pay</option>
                <option value="daily">Daily Pay</option>
                <option value="weekly">Weekly Flat Rate</option>
                <option value="per_route">Per Route Flat Rate</option>
                <option value="per_delivery">Per Delivery Commission</option>
                <option value="salary">Yearly Salary</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Job Classification</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="w2">W-2 Full-Time / Part-Time</option>
                <option value="1099">1099 Contractor</option>
                <option value="contract">Consistent Route Contract</option>
                <option value="full_time">Standard W-2 Full-Time</option>
                <option value="part_time">Standard W-2 Part-Time</option>
                <option value="seasonal">Seasonal Role</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vehicle Classification</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="company_vehicle">Company Vehicle Provided</option>
                <option value="own_vehicle">Own Vehicle Required (Car/SUV)</option>
                <option value="sprinter_van">Own Sprinter Van Required</option>
                <option value="cargo_van">Own Cargo Van Required</option>
                <option value="box_truck">Company Box Truck</option>
                <option value="car">Small Hatchback/Car</option>
                <option value="suv">Medium SUV/Crossover</option>
                <option value="unknown">Other / Unspecified</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cdlRequired}
                  onChange={(e) => setCdlRequired(e.target.checked)}
                  className="rounded border-[rgba(38,56,95,0.4)] bg-[#0a0f1d] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Requires CDL License</span>
              </label>
            </div>
          </div>
        </div>

        {/* Quality Scores */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 text-slate-200 font-bold text-sm">
            <Sliders className="h-4 w-4 text-violet-400" />
            <span>3. Scoring Parameters (Rank 1 to 10)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Stability Score ({stabilityScore}/10)</span>
                <span className="text-indigo-400">W-2/Contract Security</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stabilityScore}
                onChange={(e) => setStabilityScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Income Potential Score ({incomeScore}/10)</span>
                <span className="text-indigo-400">Hourly Revenue Cap</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={incomeScore}
                onChange={(e) => setIncomeScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Beginner Friendly Score ({beginnerScore}/10)</span>
                <span className="text-indigo-400">Entry Level Ease</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={beginnerScore}
                onChange={(e) => setBeginnerScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Quick Apply Score ({quickApplyScore}/10)</span>
                <span className="text-indigo-400">Onboarding Simplicity</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={quickApplyScore}
                onChange={(e) => setQuickApplyScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Certification Difficulty Score ({certDifficulty}/10)</span>
                <span className="text-rose-400">Lower = Easier to Qualify</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={certDifficulty}
                onChange={(e) => setCertDifficulty(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Credentials & Screening */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 text-slate-200 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>4. Screening & Compliance Criteria</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-800/50 pb-4">
            <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={backgroundCheck}
                onChange={(e) => setBackgroundCheck(e.target.checked)}
                className="rounded border-[rgba(38,56,95,0.4)] bg-[#0a0f1d] text-indigo-600 focus:ring-indigo-500"
              />
              <span>Criminal Background Check Required</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={drugTest}
                onChange={(e) => setDrugTest(e.target.checked)}
                className="rounded border-[rgba(38,56,95,0.4)] bg-[#0a0f1d] text-indigo-600 focus:ring-indigo-500"
              />
              <span>Drug Screening Required</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={mvrCheck}
                onChange={(e) => setMvrCheck(e.target.checked)}
                className="rounded border-[rgba(38,56,95,0.4)] bg-[#0a0f1d] text-indigo-600 focus:ring-indigo-500"
              />
              <span>Clean Motor Vehicle Record (MVR) Required</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Insurance Guidelines</label>
              <input
                type="text"
                placeholder="e.g. 100k/300k auto liability"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prior Experience Guidelines</label>
              <input
                type="text"
                placeholder="e.g. 1 year delivery experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required Certifications (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. HIPAA Certification, OSHA Bloodborne Pathogens (BBP)"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Internal Notes & Operations details</label>
              <textarea
                placeholder="Provide a short description of the routes, schedules, vehicle configurations, and delivery processes."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/comparison"
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 transition-all"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving Job...' : 'Save Job Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
