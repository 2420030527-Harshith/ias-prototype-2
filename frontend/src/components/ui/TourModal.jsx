import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Radio, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  Rocket, 
  BookOpen 
} from 'lucide-react';

export default function TourModal({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to CyberLab Suite",
      badge: "Platform Overview",
      icon: Shield,
      color: "from-purple-500 to-indigo-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>CyberLab Suite</strong> is an interactive engineering platform designed for university students to master transport layer protocols and network security through visual simulation.
          </p>
          <p>
            It consolidates <strong>two core projects</strong> from your curriculum into one unified dashboard with zero external mock services — every handshake, encryption step, packet inspection, and anomaly calculation is performed live by a native FastAPI engine.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono text-center">
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 text-purple-400">
              <span className="block font-bold">Project 1</span>
              <span>SecureTunnel</span>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-400">
              <span className="block font-bold">Project 2</span>
              <span>Sentinel</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Project 1: SecureTunnel Visualizer",
      badge: "Transport Security",
      icon: Radio,
      color: "from-purple-500 to-pink-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Covers Chapter 16–17 of Stallings: how secure channels are established over untrusted transport networks.
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-300">
            <li><strong>TLS 1.2 Handshake:</strong> Follow all 5 steps from Client Hello to Session Key PRF derivation and transmit live AES-GCM encrypted HTTP packets.</li>
            <li><strong>SSH-2 Connection & Shell:</strong> Simulate version exchange, server host authentication, and execute real terminal commands over an encrypted PTY channel.</li>
            <li><strong>IPsec Architecture & ESP:</strong> Toggle between Tunnel Mode and Transport Mode to see packet encapsulation with new outer IP headers and authentication trailers.</li>
          </ul>
        </div>
      ),
      action: { label: "Go to SecureTunnel", project: "securetunnel", tab: "tls" }
    },
    {
      title: "Project 2: Sentinel Defense Suite",
      badge: "Perimeter & Host Defense",
      icon: Flame,
      color: "from-amber-500 to-rose-600",
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Covers Chapter 20–22 of Stallings: firewalls, intrusion detection architectures, and malware countermeasures.
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-300">
            <li><strong>Firewall & Bastion Host:</strong> Configure first-match priority rules, test arbitrary TCP/UDP packets, and shield internal subnets behind a hardened DMZ Bastion Host.</li>
            <li><strong>IDS & Anomaly Engine:</strong> Generate 7 realistic attack bursts (SSH brute force, volumetric DoS, port scans) and watch real-time statistical NumPy Z-score triggers.</li>
            <li><strong>Threat Encyclopedia:</strong> Explore viruses, worms, evasion engines (polymorphic/metamorphic), real-world CVE case studies, and test mastery with an interactive quiz.</li>
          </ul>
        </div>
      ),
      action: { label: "Go to Sentinel", project: "sentinel", tab: "firewall" }
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    if (current.action) {
      onNavigate(current.action.project, current.action.tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header Ribbon */}
        <div className={`p-6 bg-gradient-to-r ${current.color} text-white flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                {current.badge}
              </span>
              <h3 className="text-lg font-bold font-mono mt-1">{current.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {current.content}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {/* Step Dots */}
          <div className="flex items-center space-x-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {current.action && (
              <button
                onClick={handleAction}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-300 border border-slate-700 cursor-pointer transition-colors"
              >
                {current.action.label}
              </button>
            )}

            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-mono font-bold text-white shadow-md shadow-cyan-600/30 cursor-pointer transition-all"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
