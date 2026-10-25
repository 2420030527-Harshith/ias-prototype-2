import React, { useState } from 'react';
import { 
  Shield, 
  Radio, 
  Flame, 
  Layers, 
  User, 
  Lock, 
  Terminal, 
  Activity, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({
  activeProject,
  setActiveProject,
  activeSubTab,
  setActiveSubTab,
  currentUser,
  backendOnline,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const [openSections, setOpenSections] = useState({
    securetunnel: true,
    sentinel: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups = [
    {
      id: 'securetunnel',
      title: 'Project 1: SecureTunnel',
      subtitle: 'Transport Security',
      icon: Radio,
      color: 'text-purple-400',
      activeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      glow: 'shadow-purple-500/10',
      subTabs: [
        { id: 'tls', label: 'TLS 1.2 Handshake', icon: Lock, code: 'TLS 1.2' },
        { id: 'ssh', label: 'SSH-2 Connection & Shell', icon: Terminal, code: 'SSH-2' },
        { id: 'ipsec', label: 'IPsec Architecture & ESP', icon: Layers, code: 'ESP/AH' }
      ]
    },
    {
      id: 'sentinel',
      title: 'Project 2: Sentinel',
      subtitle: 'Firewall & IDS',
      icon: Flame,
      color: 'text-rose-400',
      activeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'shadow-rose-500/10',
      subTabs: [
        { id: 'firewall', label: 'Firewall & Bastion Host', icon: Flame, code: 'Packet ACL' },
        { id: 'ids', label: 'IDS & Anomaly Engine', icon: Activity, code: 'Z-Score' },
        { id: 'threats', label: 'Threat Encyclopedia', icon: BookOpen, code: 'Taxonomy' }
      ]
    }
  ];

  const handleSubTabClick = (projectId, subTabId) => {
    setActiveProject(projectId);
    setActiveSubTab(subTabId);
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const handleOverviewClick = () => {
    setActiveProject('overview');
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#070b14]/95 dark:bg-[#070b14]/95 border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div 
            onClick={handleOverviewClick}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white font-mono">
                    CYBER<span className="text-cyan-400">LAB</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  Active Learning Security Suite
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview / Home Button */}
        <div className="p-3 border-b border-slate-800/60">
          <button
            onClick={handleOverviewClick}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeProject === 'overview'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white border border-blue-500/50 shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Suite Overview (Home)</span>
                <span className="text-[10px] text-slate-500 font-mono">HUB</span>
              </div>
            )}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openSections[group.id];
            const isGroupActive = activeProject === group.id;

            return (
              <div key={group.id} className="space-y-1">
                {/* Section Header Button */}
                <button
                  onClick={() => toggleSection(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer select-none ${
                    isGroupActive
                      ? 'text-white bg-slate-900/80 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <GroupIcon className={`w-4 h-4 shrink-0 ${group.color}`} />
                    {!collapsed && (
                      <span className="truncate">{group.title}</span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="text-slate-500">
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>

                {/* Sub-tabs List */}
                {!collapsed && isOpen && (
                  <div className="pl-3 space-y-1 border-l-2 border-slate-800/80 ml-4 py-1">
                    {group.subTabs.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeProject === group.id && activeSubTab === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSubTabClick(group.id, sub.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                            isSubActive
                              ? `${group.activeColor} border font-semibold shadow-sm`
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="truncate text-[11px]">{sub.label}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                            {sub.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Engine & Status Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Engine API (8000):</span>
                <span className={`inline-flex items-center space-x-1 ${backendOnline ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{backendOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>FastAPI + PyCryptodome</span>
                <span className="text-cyan-400">v2.0</span>
              </div>
            </div>
          )}

          {/* User Account / Active Student Status */}
          {!collapsed && (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/50 text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
                  {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'SEC'}
                </div>
                <div className="truncate text-[11px] font-mono">
                  <span className="text-white block truncate">{currentUser ? currentUser.username : 'Cyber Student'}</span>
                  <span className="text-[9px] text-emerald-400 block truncate">Active Session</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
