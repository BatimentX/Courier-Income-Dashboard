'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { calculateJobScore } from '@/lib/scoring';
import { Job, JobType, VehicleType } from '@/types';
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Eye,
  PlusCircle
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';

export default function JobComparisonTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'score', desc: true } // default sorting by score
  ]);
  
  // Custom Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [cdlFilter, setCdlFilter] = useState<string>('all');

  useEffect(() => {
    async function loadJobs() {
      try {
        const fetched = await db.getJobs();
        setJobs(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Compute table data (injecting compatibility scores for filtering & sorting)
  const data = useMemo(() => {
    return jobs.map(job => {
      const scoreDetails = calculateJobScore(job);
      return {
        ...job,
        score: scoreDetails.total,
        payRate: (job.pay_min + job.pay_max) / 2
      };
    });
  }, [jobs]);

  // Apply custom filters on the data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesJobType = 
        jobTypeFilter === 'all' || 
        (jobTypeFilter === 'w2' && ['w2', 'full_time', 'part_time'].includes(item.job_type)) ||
        (jobTypeFilter === '1099' && ['1099', 'contract'].includes(item.job_type));

      const matchesVehicle = 
        vehicleTypeFilter === 'all' || 
        (vehicleTypeFilter === 'own_vehicle' && ['own_vehicle', 'car', 'suv', 'sprinter_van', 'cargo_van'].includes(item.vehicle_type)) ||
        (vehicleTypeFilter === 'company_vehicle' && item.vehicle_type === 'company_vehicle');

      const matchesCdl = 
        cdlFilter === 'all' ||
        (cdlFilter === 'no_cdl' && !item.cdl_required) ||
        (cdlFilter === 'cdl' && item.cdl_required);

      return matchesSearch && matchesJobType && matchesVehicle && matchesCdl;
    });
  }, [data, searchTerm, jobTypeFilter, vehicleTypeFilter, cdlFilter]);

  // Define Columns
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'score',
      accessorKey: 'score',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
        >
          <span>Score</span>
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const score = row.getValue('score') as number;
        let color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        if (score >= 85) color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        else if (score >= 70) color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        else if (score >= 55) color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
            {score}/100
          </span>
        );
      }
    },
    {
      id: 'job_title',
      accessorKey: 'job_title',
      header: 'Job Title',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-200 text-sm md:text-base">
            {row.original.job_title}
          </div>
          <div className="text-xs text-slate-400">
            {row.original.company_name}
          </div>
        </div>
      )
    },
    {
      id: 'pay',
      accessorKey: 'payRate',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
        >
          <span>Est Pay</span>
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const min = row.original.pay_min;
        const max = row.original.pay_max;
        const type = row.original.pay_type;
        const rateLabel = type === 'hourly' ? '/hr' : type === 'daily' ? '/day' : type === 'weekly' ? '/wk' : '/route';
        
        return (
          <div>
            <div className="font-semibold text-slate-200 text-sm">
              ${min.toFixed(0)}-${max.toFixed(0)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium capitalize">{rateLabel}</span>
          </div>
        );
      }
    },
    {
      id: 'job_type',
      accessorKey: 'job_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('job_type') as string;
        const isW2 = ['w2', 'full_time', 'part_time'].includes(type);
        return (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            isW2 
              ? 'bg-violet-950/50 text-violet-400 border border-violet-800/40' 
              : 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
          }`}>
            {isW2 ? 'W-2' : '1099'}
          </span>
        );
      }
    },
    {
      id: 'vehicle_type',
      accessorKey: 'vehicle_type',
      header: 'Vehicle',
      cell: ({ row }) => {
        const type = row.getValue('vehicle_type') as string;
        const isCompany = type === 'company_vehicle';
        return (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
            isCompany
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' 
              : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/30'
          }`}>
            {isCompany ? 'Company Provided' : 'Own Vehicle'}
          </span>
        );
      }
    },
    {
      id: 'distance',
      accessorKey: 'distance_from_21237',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
        >
          <span>Distance</span>
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-slate-300">
          <span className="font-bold text-slate-200">{row.original.distance_from_21237}</span> mi
          <div className="text-[10px] text-slate-500">from 21237</div>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <Link
          href={`/jobs/${row.original.id}`}
          className="inline-flex items-center space-x-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded text-xs font-semibold transition-all"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">View</span>
        </Link>
      )
    }
  ], []);

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Job Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Job Comparison Matrix</h2>
          <p className="text-xs text-slate-400">Perform multi-attribute searches and filter opportunities based on your parameters.</p>
        </div>
        <Link
          href="/jobs/add"
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition-all self-start sm:self-center"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Custom Job</span>
        </Link>
      </div>

      {/* Interactive Filters Panel */}
      <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. Medical, FedEx, W-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Job Type Filter */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Contract Class</label>
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">Show All Types</option>
            <option value="w2">W-2 Employees Only</option>
            <option value="1099">1099 Contractors Only</option>
          </select>
        </div>

        {/* Vehicle Filter */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Vehicle Requirement</label>
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">Show All Vehicles</option>
            <option value="company_vehicle">Company Vehicle Provided</option>
            <option value="own_vehicle">Own Vehicle Required</option>
          </select>
        </div>

        {/* CDL Filter */}
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">CDL Licensing</label>
          <select
            value={cdlFilter}
            onChange={(e) => setCdlFilter(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-[rgba(38,56,95,0.4)] rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">Show All Licensing</option>
            <option value="no_cdl">Non-CDL Roles (Prioritized)</option>
            <option value="cdl">CDL Required Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid Container */}
      <div className="glass-panel overflow-hidden border-[rgba(38,56,95,0.3)]">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading Job Matrix...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No jobs match your search parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-[rgba(38,56,95,0.4)] bg-[#0d1527]/80">
                    {headerGroup.headers.map(header => {
                      // Custom responsive cell hiding for cleaner mobile view
                      const isMobileHidden = ['job_type', 'vehicle_type', 'distance'].includes(header.column.id);
                      return (
                        <th
                          key={header.id}
                          className={`p-4 text-xs font-bold uppercase tracking-wider text-slate-400 ${
                            isMobileHidden ? 'hidden md:table-cell' : ''
                          }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-slate-900/35 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      // Only trigger navigation if they did not click the view button itself (avoid duplicate routing)
                      if ((e.target as HTMLElement).closest('a')) return;
                      window.location.href = `/jobs/${row.original.id}`;
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      const isMobileHidden = ['job_type', 'vehicle_type', 'distance'].includes(cell.column.id);
                      return (
                        <td
                          key={cell.id}
                          className={`p-4 text-sm align-middle ${
                            isMobileHidden ? 'hidden md:table-cell' : ''
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom helper tip */}
      <div className="p-4 bg-indigo-950/30 border border-indigo-900/20 rounded-xl flex items-start space-x-3 text-xs text-slate-400 leading-normal">
        <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">Comparison Matrix Insights:</span> Jobs are ranked based on the custom 100-point algorithm. Click on any job row to view detailed score breakdowns, license details, background check rules, and direct application routes.
        </div>
      </div>
    </div>
  );
}
