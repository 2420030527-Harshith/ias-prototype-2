import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Play, 
  Sparkles, 
  HelpCircle, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Compass, 
  Terminal,
  LogOut,
  Flame,
  Radio
} from 'lucide-react';

export default function TopBar({
  activeProject,
  activeSubTab,
  onOpenMobileSidebar,
  onOpenTour,
  onRunDemo,
  isDemoRunning,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onLogout,
  onOpenAuth,
  backendOnline
}) {
  const getBreadcrumbs = () => {
    if (activeProject === 'overview') {
      return { project: 'CyberLab Suite', module: 'Unified Dashboard Overview' };
    }

    const projectLabels = {
      securetunnel: { name: 'Project 1: SecureTunnel', icon: Radio },
      sentinel: { name: 'Project 2: Sentinel', icon: Flame }
    };

    const moduleLabels = {
      tls: 'TLS 1.2 Handshake & Session Keys',
      ssh: 'SSH-2 Connection & Terminal Emulator',
      ipsec: 'IPsec Architecture & ESP Encapsulation',
      firewall: 'Firewall Rule Manager & Bastion Sandbox',
      ids: 'Intrusion Detection System & Z-Score Engine',
      threats: 'Threat Encyclopedia & Security Taxonomy'
    };

    const currentProj = projectLabels[activeProject] || { name: activeProject };
    const currentMod = moduleLabels[activeSubTab] || activeSubTab;

    return {
      project: currentProj.name,
      module: currentMod
    };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b14]/90 dark:bg-[#070b14]/90 border-b border-slate-800/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400 font-medium">
            {breadcrumbs.project}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
            {breadcrumbs.module}
          </span>
        </div>

        <div className="sm:hidden font-mono text-xs font-bold text-white truncate max-w-[150px]">
          {breadcrumbs.module}
        </div>
      </div>

      {/* Right Actions: Demo Mode, Tour, Theme, Backend Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Guided Tour "Start Here" */}
        <button
          onClick={onOpenTour}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
          title="Open interactive curriculum walkthrough"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Guided Tour</span>
        </button>

        {/* Presenter "Demo Mode" Button */}
        <button
          onClick={onRunDemo}
          disabled={isDemoRunning}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
          title="Auto-run demo workflow for the active view"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isDemoRunning ? 'animate-pulse' : ''}`} />
          <span>{isDemoRunning ? 'Running Demo...' : 'Demo Mode'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Backend Online Pill */}
        <div 
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono"
          title={backendOnline ? "FastAPI backend running on port 8000" : "FastAPI backend unreachable"}
        >
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className={backendOnline ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
            {backendOnline ? '8000 OK' : 'OFFLINE'}
          </span>
        </div>

        {/* Active Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-[11px] font-mono text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Active Lab</span>
        </div>

      </div>
    </header>
  );
}
