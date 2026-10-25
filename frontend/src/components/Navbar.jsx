import React from 'react';
import { 
  Shield, 
  Key, 
  Radio, 
  Flame, 
  Layers, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Terminal,
  Activity,
  BookOpen
} from 'lucide-react';

export default function Navbar({ 
  activeProject, 
  setActiveProject, 
  activeSubTab, 
  setActiveSubTab,
  currentUser,
  onLogout,
  backendOnline
}) {
  const projects = [
    {
      id: 'overview',
      label: 'Suite Overview',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Home'
    },
    {
      id: 'cryptovault',
      label: 'CryptoVault',
      subtitle: 'Public-Key & Signatures',
      icon: Key,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Project 1',
      subTabs: [
        { id: 'pki', label: '1. PKI & X.509 Certs', icon: User },
        { id: 'rsa', label: '2. Interactive RSA', icon: Lock },
        { id: 'dh', label: '3. Diffie-Hellman Key Exchange', icon: Radio },
        { id: 'elgamal', label: '4. Elgamal & SHA-512', icon: Key }
      ]
    },
    {
      id: 'securetunnel',
      label: 'SecureTunnel',
      subtitle: 'TLS, SSH & IPsec',
      icon: Radio,
      color: 'from-purple-500 to-pink-600',
      badge: 'Project 2',
      subTabs: [
        { id: 'tls', label: '1. TLS 1.2 Handshake Visualizer', icon: Lock },
        { id: 'ssh', label: '2. SSH Connection & Terminal', icon: Terminal },
        { id: 'ipsec', label: '3. IPsec Architecture & ESP', icon: Layers }
      ]
    },
    {
      id: 'sentinel',
      label: 'Sentinel',
      subtitle: 'Firewall & IDS Simulator',
      icon: Flame,
      color: 'from-amber-500 to-red-600',
      badge: 'Project 3',
      subTabs: [
        { id: 'firewall', label: '1. Firewall & Bastion Host', icon: Flame },
        { id: 'ids', label: '2. IDS & Anomaly Detection', icon: Activity },
        { id: 'threats', label: '3. Threat Encyclopedia', icon: BookOpen }
      ]
    }
  ];

  const currentProjectObj = projects.find(p => p.id === activeProject);

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveProject('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  CYBER<span className="text-cyan-400">LAB</span>.SUITE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Applied Cybersecurity & Cryptographic Engineering Toolkit
              </p>
            </div>
          </div>

          {/* Project Switcher Pills */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            {projects.map((proj) => {
              const Icon = proj.icon;
              const isActive = activeProject === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProject(proj.id);
                    if (proj.subTabs && proj.subTabs.length > 0) {
                      setActiveSubTab(proj.subTabs[0].id);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r ' + proj.color + ' text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{proj.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & User Indicator */}
          <div className="flex items-center space-x-3">
            {/* Backend status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800">
              <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className={backendOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {backendOnline ? 'API 8000 OK' : 'API Offline'}
              </span>
            </div>

            {/* Current User */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-cyan-950/40 border border-cyan-800/50 rounded-lg px-2.5 py-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-300 font-mono">{currentUser.username}</span>
                <button 
                  onClick={onLogout}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline ml-1 cursor-pointer"
                  title="Log out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveProject('cryptovault');
                  setActiveSubTab('pki');
                }}
                className="text-xs font-medium text-slate-300 hover:text-cyan-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                Sign In / PKI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation (if active project has subtabs) */}
      {currentProjectObj?.subTabs && (
        <div className="bg-[#0b1120] border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto py-2">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider mr-2 hidden sm:inline">
              Module:
            </span>
            {currentProjectObj.subTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
