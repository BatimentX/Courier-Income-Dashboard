'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TableProperties, 
  Calculator, 
  Zap, 
  Award, 
  Briefcase, 
  ListTodo,
  PlusCircle,
  MapPin
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Compare', href: '/comparison', icon: TableProperties },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Combo', href: '/optimizer', icon: Zap },
  { name: 'Certs', href: '/certifications', icon: Award },
  { name: 'Tracker', href: '/applications', icon: Briefcase },
  { name: 'Plan', href: '/action-plan', icon: ListTodo }
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[rgba(38,56,95,0.4)] bg-[#090d16]/80 backdrop-blur-md px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
              Courier Income
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Decision Dashboard</p>
          </div>
        </div>

        {/* Location Badge */}
        <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1 text-[11px] text-slate-300">
          <MapPin className="h-3 w-3 text-cyan-400" />
          <span className="font-semibold text-slate-200">ZIP 21237</span>
          <span className="text-slate-500">|</span>
          <span>Laurel, MD</span>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 border-r border-[rgba(38,56,95,0.4)] bg-[#0c1220]/60 backdrop-blur-lg p-4 justify-between">
          <div className="space-y-6">
            <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <Link
              href="/jobs/add"
              className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/10 transition-all glow-btn"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Custom Job</span>
            </Link>
            
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 text-center">
              Target: <span className="text-slate-200 font-semibold">Non-CDL</span> • W-2 / stable 1099. No app-based gigs.
            </div>
          </div>
        </aside>

        {/* Core Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {pathname !== '/jobs/add' && (
            <div className="md:hidden mb-4 flex justify-end">
              <Link
                href="/jobs/add"
                className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Job</span>
              </Link>
            </div>
          )}
          {/* Main page content injection */}
          <div className="max-w-7xl mx-auto space-y-6">
            {pathname !== '/' && (
              <div className="text-xs text-slate-500 mb-2">
                <Link href="/" className="hover:text-slate-300">Courier Dashboard</Link>
                <span className="mx-1.5">/</span>
                <span className="text-indigo-400 font-medium capitalize">
                  {pathname.split('/')[1] === 'jobs' ? 'Job Detail' : pathname.split('/')[1]}
                </span>
              </div>
            )}
            {/* Page content */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(38,56,95,0.4)] bg-[#090d16]/90 backdrop-blur-xl px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] font-medium transition-all ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
