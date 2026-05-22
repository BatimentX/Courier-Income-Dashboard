'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Job, PayType, JobType } from '@/types';
import { 
  Calculator, 
  Car, 
  HelpCircle, 
  Coins, 
  Info,
  TrendingDown,
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';

export default function IncomeCalculator() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('custom');

  // Input States
  const [hourlyPay, setHourlyPay] = useState<number>(20);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [perRoutePay, setPerRoutePay] = useState<number>(0);
  const [routesPerWeek, setRoutesPerWeek] = useState<number>(0);
  
  // Expenses
  const [milesPerWeek, setMilesPerWeek] = useState<number>(250);
  const [fuelCost, setFuelCost] = useState<number>(3.35);
  const [mpg, setMpg] = useState<number>(25);
  const [maintenancePerMile, setMaintenancePerMile] = useState<number>(0.12);
  const [insuranceCost, setInsuranceCost] = useState<number>(120); // monthly
  const [insurancePeriod, setInsurancePeriod] = useState<'monthly' | 'weekly'>('monthly');

  // Tax Settings
  const [is1099, setIs1099] = useState<boolean>(false);
  const [taxRate, setTaxRate] = useState<number>(15.3); // standard self-employment tax rate

  useEffect(() => {
    async function loadJobs() {
      try {
        const fetched = await db.getJobs();
        setJobs(fetched);
      } catch (err) {
        console.error(err);
      }
    }
    loadJobs();
  }, []);

  // Handle Quick Load
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === 'custom') return;

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const avgPay = (job.pay_min + job.pay_max) / 2;
    const isW2 = ['w2', 'full_time', 'part_time'].includes(job.job_type);
    
    // Set Job Pay
    if (job.pay_type === 'hourly') {
      setHourlyPay(avgPay);
      setHoursPerWeek(job.job_type === 'full_time' ? 40 : 20);
      setPerRoutePay(0);
      setRoutesPerWeek(0);
    } else if (job.pay_type === 'per_route') {
      setHourlyPay(0);
      setHoursPerWeek(0);
      setPerRoutePay(avgPay);
      setRoutesPerWeek(5);
    } else if (job.pay_type === 'daily') {
      // daily as rough 8 hour day
      setHourlyPay(avgPay / 8);
      setHoursPerWeek(job.job_type === 'full_time' ? 40 : 24);
      setPerRoutePay(0);
      setRoutesPerWeek(0);
    } else if (job.pay_type === 'weekly') {
      setHourlyPay(0);
      setHoursPerWeek(40);
      setPerRoutePay(avgPay);
      setRoutesPerWeek(1);
    } else {
      setHourlyPay(avgPay);
      setHoursPerWeek(40);
      setPerRoutePay(0);
      setRoutesPerWeek(0);
    }

    // Set Expenses
    if (job.vehicle_type === 'company_vehicle' || job.vehicle_type === 'box_truck') {
      setMilesPerWeek(0);
      setFuelCost(0);
      setMaintenancePerMile(0);
    } else {
      setMilesPerWeek(350); // assume average 1099 mileage
      setFuelCost(3.35);
      setMaintenancePerMile(0.12);
    }

    // Set Tax
    setIs1099(!isW2);
    setTaxRate(isW2 ? 0 : 15.3);
  };

  // Perform Calculations
  const grossWeekly = (hourlyPay * hoursPerWeek) + (perRoutePay * routesPerWeek);
  
  // Fuel expense = (miles / MPG) * fuelCost
  const fuelExpense = mpg > 0 ? (milesPerWeek / mpg) * fuelCost : 0;
  // Maintenance expense = miles * costPerMile
  const maintExpense = milesPerWeek * maintenancePerMile;
  // Insurance weekly expense
  const weeklyInsurance = insurancePeriod === 'monthly' ? insuranceCost / 4.33 : insuranceCost;

  const totalExpenses = fuelExpense + maintExpense + weeklyInsurance;
  
  // 1099 Tax reserve = (Gross - Expenses) * taxRate
  const taxableIncome = Math.max(0, grossWeekly - totalExpenses);
  const taxWeekly = is1099 ? taxableIncome * (taxRate / 100) : 0;

  const netWeekly = Math.max(0, grossWeekly - totalExpenses - taxWeekly);
  const netMonthly = netWeekly * 4.33;

  // Effective hourly rate
  const totalHours = hoursPerWeek > 0 ? hoursPerWeek : (routesPerWeek * 5); // assume 5 hrs per route if unspecified
  const effectiveHourly = totalHours > 0 ? netWeekly / totalHours : 0;

  const handleReset = () => {
    setSelectedJobId('custom');
    setHourlyPay(20);
    setHoursPerWeek(40);
    setPerRoutePay(0);
    setRoutesPerWeek(0);
    setMilesPerWeek(250);
    setFuelCost(3.35);
    setMpg(25);
    setMaintenancePerMile(0.12);
    setInsuranceCost(120);
    setInsurancePeriod('monthly');
    setIs1099(false);
    setTaxRate(15.3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-indigo-400" />
            <span>Courier Net Income Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">Estimate your actual net earnings after vehicle depreciation, fuel costs, and 1099 self-employment taxes.</p>
        </div>
        
        {/* Quick Preload Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Fill:</span>
          <select
            value={selectedJobId}
            onChange={(e) => handleJobSelect(e.target.value)}
            className="bg-[#0c1220] border border-[rgba(38,56,95,0.5)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="custom">Custom Settings (Manual)</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.job_title} ({job.company_name})
              </option>
            ))}
          </select>
          
          <button
            onClick={handleReset}
            className="p-2 border border-slate-700 bg-slate-800/80 rounded-xl hover:bg-slate-750 text-slate-300 transition-colors"
            title="Reset to Custom defaults"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Splits: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUTS COLUMN (2/3 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Earnings Setup */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
              1. Gross Income Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hourly Section */}
              <div className="space-y-3 p-3.5 bg-slate-900/30 border border-slate-850 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Hourly Pay Framework</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Hourly Pay Rate</span>
                    <span className="text-slate-200 font-bold">${hourlyPay.toFixed(2)} / hr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="0.5"
                    value={hourlyPay}
                    onChange={(e) => {
                      setHourlyPay(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Hours Per Week</span>
                    <span className="text-slate-200 font-bold">{hoursPerWeek} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="70"
                    value={hoursPerWeek}
                    onChange={(e) => {
                      setHoursPerWeek(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              {/* Route Section */}
              <div className="space-y-3 p-3.5 bg-slate-900/30 border border-slate-850 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Per Route / Commission</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Pay Per Route</span>
                    <span className="text-slate-200 font-bold">${perRoutePay.toFixed(0)} / route</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="5"
                    value={perRoutePay}
                    onChange={(e) => {
                      setPerRoutePay(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Routes Per Week</span>
                    <span className="text-slate-200 font-bold">{routesPerWeek} Routes</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={routesPerWeek}
                    onChange={(e) => {
                      setRoutesPerWeek(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Expenses Setup */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200">
                2. Vehicle Expense Setup
              </h3>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-bold">
                <Car className="h-3.5 w-3.5 text-cyan-400" />
                <span>Zero this out if using Company Vehicles</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Miles Driven Per Week</span>
                  <span className="text-slate-200 font-bold">{milesPerWeek} mi / wk</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="25"
                  value={milesPerWeek}
                  onChange={(e) => {
                    setMilesPerWeek(Number(e.target.value));
                    setSelectedJobId('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Average Fuel Cost (Per Gal)</span>
                  <span className="text-slate-200 font-bold">${fuelCost.toFixed(2)} / gal</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="6.00"
                  step="0.05"
                  value={fuelCost}
                  onChange={(e) => {
                    setFuelCost(Number(e.target.value));
                    setSelectedJobId('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Vehicle Fuel Economy (MPG)</span>
                  <span className="text-slate-200 font-bold">{mpg} MPG</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={mpg}
                  onChange={(e) => {
                    setMpg(Number(e.target.value));
                    setSelectedJobId('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Maintenance & Depreciation (Per Mile)</span>
                  <span className="text-slate-200 font-bold">${maintenancePerMile.toFixed(2)} / mi</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.40"
                  step="0.01"
                  value={maintenancePerMile}
                  onChange={(e) => {
                    setMaintenancePerMile(Number(e.target.value));
                    setSelectedJobId('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-3 gap-2 items-end">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Insurance Premium Cost</label>
                  <input
                    type="number"
                    value={insuranceCost}
                    onChange={(e) => {
                      setInsuranceCost(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={insurancePeriod}
                    onChange={(e) => setInsurancePeriod(e.target.value as 'monthly' | 'weekly')}
                    className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-2 px-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tax reserves */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
              3. Tax Planning Settings
            </h3>

            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={is1099}
                  onChange={(e) => {
                    setIs1099(e.target.checked);
                    setTaxRate(e.target.checked ? 15.3 : 0);
                    setSelectedJobId('custom');
                  }}
                  className="rounded border-[rgba(38,56,95,0.4)] bg-[#0a0f1d] text-indigo-600 focus:ring-indigo-500"
                />
                <span>This is a 1099 Job (Reserve Self-Employment Tax)</span>
              </label>

              {is1099 && (
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Self-Employment Reserve Rate</span>
                    <span className="text-indigo-400 font-bold">{taxRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => {
                      setTaxRate(Number(e.target.value));
                      setSelectedJobId('custom');
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN (1/3 cols) */}
        <div className="space-y-6">
          <div className="glass-panel p-5 bg-gradient-to-b from-[#151c2e] to-[#0c1220] border-indigo-500/20 text-center space-y-6">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Estimated Net Yields</h3>
            
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Net Weekly Revenue</h4>
              <p className="text-4xl font-extrabold text-emerald-400 font-sans">
                ${Math.round(netWeekly).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500 block">After expenses & tax reserve</span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-y border-slate-800/80 py-4 text-xs">
              <div className="text-center border-r border-slate-800/50">
                <span className="text-slate-500 block mb-0.5">Net Monthly</span>
                <span className="text-slate-200 font-extrabold text-sm">${Math.round(netMonthly).toLocaleString()}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block mb-0.5">Effective Hourly</span>
                <span className="text-indigo-300 font-extrabold text-sm">${effectiveHourly.toFixed(2)}/hr</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-left">
              <div className="flex justify-between pb-1.5 border-b border-slate-850">
                <span className="text-slate-400">Gross Weekly Pay</span>
                <span className="text-slate-200 font-bold">${grossWeekly.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between pb-1.5 border-b border-slate-850">
                <span className="text-slate-400 flex items-center">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400 mr-1" />
                  Vehicle Fuel Expense
                </span>
                <span className="text-rose-300 font-medium">-${fuelExpense.toFixed(0)}</span>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-850">
                <span className="text-slate-400 flex items-center">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400 mr-1" />
                  Maint & Depreciation
                </span>
                <span className="text-rose-300 font-medium">-${maintExpense.toFixed(0)}</span>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-850">
                <span className="text-slate-400">Auto Insurance Offset</span>
                <span className="text-rose-300 font-medium">-${weeklyInsurance.toFixed(0)}</span>
              </div>

              <div className="flex justify-between pb-1.5 border-b border-slate-850">
                <span className="text-slate-400 flex items-center">
                  <Percent className="h-3.5 w-3.5 text-rose-400 mr-1" />
                  SE Tax Reserve (1099)
                </span>
                <span className="text-rose-300 font-medium">-${taxWeekly.toFixed(0)}</span>
              </div>

              <div className="flex justify-between text-emerald-400 font-bold pt-1">
                <span>Total Net Profit Margin</span>
                <span>
                  {grossWeekly > 0 ? Math.round((netWeekly / grossWeekly) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Helper Card */}
          <div className="glass-panel p-4 flex items-start space-x-3 text-xs leading-relaxed text-slate-400">
            <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Did you know?</span> Tax laws permit writing off a standard mileage deduction (typically around 67¢/mile) on your 1099 independent courier routes. This significantly reduces your overall taxable income reserve, saving you massive amounts of cash during tax season!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
