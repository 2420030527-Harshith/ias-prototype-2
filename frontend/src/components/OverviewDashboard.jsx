import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Flame, 
  Shield, 
  ArrowRight, 
  Lock, 
  FileText, 
  Network, 
  Activity, 
  Terminal, 
  BookOpen, 
  CheckCircle2,
  Cpu,
  Sparkles,
  Server,
  Layers,
  Zap,
  Play,
  Compass
} from 'lucide-react';

export default function OverviewDashboard({ onSelectModule, onOpenTour }) {
  // Live aggregate stats
  const [stats, setStats] = useState({
    handshakesSimulated: 89,
    packetsInspected: 1250,
    threatsMitigated: 38,
    activeRules: 7
  });

  useEffect(() => {
    // Dynamic slight increment simulation for live feel
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        packetsInspected: prev.packetsInspected + Math.floor(Math.random() * 3 + 1)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const projects = [
    {
      id: 'securetunnel',
      subTab: 'tls',
      title: 'Project 1: SecureTunnel',
      subtitle: 'Transport Layer Security (TLS/SSH) Visualizer',
      badge: 'Transport & Protocol Security',
      accent: 'purple',
      borderColor: 'border-purple-500/30 hover:border-purple-400/80',
      glowColor: 'hover:shadow-purple-500/20',
      icon: Radio,
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      description: 'Step-by-step visualizers demystifying how asymmetric key exchange bootstraps symmetric AES session keys in TLS 1.2 and SSH-2, accompanied by an interactive IPsec ESP packet inspector.',
      topics: [
        'Transport Level Security Concepts',
        'TLS 1.2 Handshake (Client Hello to Finished)',
        'Symmetric Key Distribution via Asymmetric RSA',
        'PRF Master Secret & Key Expansion',
        'SSH Connection Protocol & KEXINIT Exchange',
        'Host Authentication (TOFU) & User Auth',
        'IPsec Architecture: ESP vs AH & Tunnel vs Transport'
      ],
      modules: [
        { label: 'Step-by-Step TLS 1.2 Handshake Simulation', sub: 'tls' },
        { label: 'Live Encrypted AES-GCM Transmission', sub: 'tls' },
        { label: 'SSH-2 Connection & Interactive PTY Shell', sub: 'ssh' },
        { label: 'IPsec ESP Packet Layer & Mode Inspector', sub: 'ipsec' }
      ]
    },
    {
      id: 'sentinel',
      subTab: 'firewall',
      title: 'Project 2: Sentinel',
      subtitle: 'Intrusion Detection & Firewall Defense Simulator',
      badge: 'Perimeter Defense & Anomaly IDS',
      accent: 'rose',
      borderColor: 'border-rose-500/30 hover:border-rose-400/80',
      glowColor: 'hover:shadow-rose-500/20',
      icon: Flame,
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      description: 'Full-stack perimeter defense simulator featuring a priority firewall rule engine, Bastion Host DMZ topology, Snort-style rule signatures, and real-time NumPy Z-Score statistical anomaly detection.',
      topics: [
        'Packet-Filtering Firewalls & Priority Ordering',
        'Bastion Host Isolation & DMZ Segmentation',
        'Rule-Based Intrusion Detection (Signatures)',
        'Statistical Anomaly Detection (NumPy Z-Score)',
        'Attack Traffic Simulator (7 Realistic Scenarios)',
        'Threat Encyclopedia (Viruses, Worms & Defense)'
      ],
      modules: [
        { label: 'Firewall Rule Manager & Packet Sandbox', sub: 'firewall' },
        { label: 'Live IDS Alert Feed with Severity Tags', sub: 'ids' },
        { label: 'Real-Time Anomaly Dashboard with Thresholds', sub: 'ids' },
        { label: 'Threat Encyclopedia & Interactive Security Quiz', sub: 'threats' }
      ]
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Negotiate Session Keys',
      desc: 'Simulate TLS 1.2 and SSH-2 handshakes to exchange pre-master secrets and derive symmetric AES-GCM session keys.',
      project: 'securetunnel',
      tab: 'tls',
      color: 'text-purple-400 border-purple-500/40'
    },
    {
      step: '02',
      title: 'Encapsulate & Shield',
      desc: 'Inspect IPsec ESP tunnel mode packets shielding internal subnet IPs from external sniffers with outer IP headers.',
      project: 'securetunnel',
      tab: 'ipsec',
      color: 'text-indigo-400 border-indigo-500/40'
    },
    {
      step: '03',
      title: 'Filter & Restrict',
      desc: 'Apply first-match priority firewall ACL rules, test packets against DMZ Bastion Host, and drop unauthorized traffic.',
      project: 'sentinel',
      tab: 'firewall',
      color: 'text-rose-400 border-rose-500/40'
    },
    {
      step: '04',
      title: 'Detect Anomalies & Threats',
      desc: 'Generate live attack bursts (DoS, Brute Force, Port Scan) and flag anomalous spikes using NumPy Z-Score modeling.',
      project: 'sentinel',
      tab: 'ids',
      color: 'text-amber-400 border-amber-500/40'
    }
  ];

  return (
    <div className="space-y-12 pb-10">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-[450px] h-[450px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-indigo-950/80 text-cyan-400 border border-indigo-800/80 shadow-inner">
            <Cpu className="w-3.5 h-3.5" />
            <span>Active Learning Security Engineering Platform • Stallings Reference</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            CyberLab <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">Suite</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-3xl">
            A unified, full-stack cybersecurity engineering platform consolidating 
            <strong className="text-purple-400"> SecureTunnel</strong> (TLS, SSH & IPsec Handshake Visualizers) and 
            <strong className="text-rose-400"> Sentinel</strong> (Firewall Manager & Statistical Anomaly IDS) into an intuitive, demo-ready educational laboratory.
          </p>

          {/* Quick Launch Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectModule('securetunnel', 'tls')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Launch SecureTunnel</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectModule('sentinel', 'firewall')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Launch Sentinel IDS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTour}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Start Guided Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Handshakes Simulated</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.handshakesSimulated}+</div>
          <p className="text-[10px] text-purple-400 font-mono">TLS 1.2, SSH & Diffie-Hellman</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Packets Inspected</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.packetsInspected.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-400 font-mono">IPsec ESP & Firewall ACL</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Anomalies Detected</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.threatsMitigated}</div>
          <p className="text-[10px] text-rose-400 font-mono">NumPy Z-Score & Snort Rules</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Security Rules</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.activeRules} Active</div>
          <p className="text-[10px] text-amber-400 font-mono">First-Match Priority ACL</p>
        </div>
      </div>

      {/* Curriculum Project Modules Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-mono tracking-tight">Curriculum Project Modules</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Click any card to launch</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const Icon = proj.icon;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectModule(proj.id, proj.subTab)}
                className={`group relative rounded-2xl bg-slate-900/80 border ${proj.borderColor} p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 ${proj.glowColor} cursor-pointer flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${proj.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                      {proj.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-mono">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{proj.subtitle}</p>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">{proj.description}</p>
                  </div>

                  {/* Core Topics Covered */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                      Core Topics Covered (Stallings):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
                      {proj.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submodule Jump Buttons */}
                <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {proj.modules.length} interactive modules
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Stage Security Architecture Pipeline */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono">End-to-End Security Architecture Pipeline</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              How protocols interlock across Transport, Network, and Perimeter Defense layers
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 text-indigo-400 border border-slate-800">
            Defense-in-Depth Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((ws) => (
            <div
              key={ws.step}
              onClick={() => onSelectModule(ws.project, ws.tab)}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all hover:-translate-y-0.5 cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${ws.color}`}>
                  Step {ws.step}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                {ws.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {ws.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Layer Reference Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">Curricular Standard Alignment</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Strict compliance with William Stallings "Cryptography and Network Security" (Chapters 16, 17, 20, 21, 22)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">RFC 5246 (TLS 1.2)</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">RFC 4253 (SSH-2)</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">RFC 4303 (IPsec ESP)</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">NIST SP 800-94 (IDS)</span>
        </div>
      </div>

    </div>
  );
}
