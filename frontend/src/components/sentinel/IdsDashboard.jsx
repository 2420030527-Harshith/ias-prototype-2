import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Radio, 
  Bug, 
  Database, 
  Terminal, 
  Cpu,
  Network,
  Server,
  Globe,
  Play
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function IdsDashboard({ demoTrigger, onNavigateNext }) {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [trafficResult, setTrafficResult] = useState(null);
  const [generatingScenario, setGeneratingScenario] = useState('');
  
  // Statistical Anomaly State
  const [metricsData, setMetricsData] = useState(null);
  const [autoPoll, setAutoPoll] = useState(false);

  const { warning, error, success, info } = useToast();

  // Demo Mode Effect
  useEffect(() => {
    if (demoTrigger > 0) {
      info('Demo Mode: Simulating volumetric DoS flood & SSH brute force intrusion...');
      handleGenerate('dos_flood').then(() => {
        setTimeout(() => {
          handleGenerate('ssh_brute_force');
          warning('IDS Rule Alert Triggered: 5+ failed logins detected within 60s window!');
        }, 600);
      });
    }
  }, [demoTrigger]);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch('/api/ids/alerts?limit=50');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/ids/update-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packets_per_sec: Number((18.0 + (Math.random() * 4 - 2)).toFixed(1)),
          failed_logins_per_min: Math.random() > 0.8 ? 1 : 0,
          bytes_transferred_kb: Number((120.0 + (Math.random() * 20 - 10)).toFixed(1))
        })
      });
      const data = await res.json();
      setMetricsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchMetrics();
  }, []);

  useEffect(() => {
    let interval = null;
    if (autoPoll) {
      interval = setInterval(() => {
        fetchMetrics();
        fetchAlerts();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoPoll]);

  const handleGenerate = async (scenario) => {
    setGeneratingScenario(scenario);
    try {
      const res = await fetch('/api/ids/generate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      setTrafficResult(data);
      if (data.anomaly_update) {
        setMetricsData(data.anomaly_update);
      }
      fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingScenario('');
    }
  };

  const handleClearAlerts = async () => {
    try {
      await fetch('/api/ids/alerts', { method: 'DELETE' });
      setAlerts([]);
    } catch (err) {
      console.error(err);
    }
  };

  const scenarios = [
    { id: 'normal', label: 'Normal Web Traffic', icon: CheckCircle, color: 'hover:border-emerald-500 text-emerald-400', desc: 'Legitimate HTTP/HTTPS GET requests' },
    { id: 'ssh_brute_force', label: 'SSH Brute Force Attack', icon: Terminal, color: 'hover:border-rose-500 text-rose-400', desc: 'Rapid burst of 6 failed logins on port 22' },
    { id: 'port_scan', label: 'Horizontal Port Scan', icon: Radio, color: 'hover:border-amber-500 text-amber-400', desc: 'Probing ports 21, 22, 23, 25, 80...' },
    { id: 'telnet_probe', label: 'Telnet Access Attempt', icon: AlertTriangle, color: 'hover:border-orange-500 text-orange-400', desc: 'Insecure cleartext probe on port 23' },
    { id: 'sqli', label: 'SQL Injection Attack', icon: Database, color: 'hover:border-purple-500 text-purple-400', desc: "' UNION SELECT credentials payload" },
    { id: 'dos_flood', label: 'Volumetric DoS Flood', icon: Zap, color: 'hover:border-red-500 text-red-400', desc: 'Surge to 95 packets/sec (crosses +2.5σ threshold)' },
    { id: 'data_exfil', label: 'Data Exfiltration Spike', icon: TrendingUp, color: 'hover:border-pink-500 text-pink-400', desc: 'Sudden 2,450 KB/s outbound egress spike' }
  ];

  // Helper for simple responsive SVG line chart
  const renderSvgChart = (values, threshold, unit, label, isAnomaly) => {
    if (!values || values.length === 0) return null;
    const maxVal = Math.max(...values, threshold * 1.2, 30);
    const minVal = 0;
    const width = 300;
    const height = 90;
    const padding = 15;

    const points = values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const thresholdY = height - padding - ((threshold - minVal) / (maxVal - minVal)) * (height - 2 * padding);

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-400">{label}</span>
          <span className={isAnomaly ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
            Current: {values[values.length - 1]} {unit}
          </span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
            {/* Threshold dashed line */}
            <line
              x1={padding}
              y1={thresholdY}
              x2={width - padding}
              y2={thresholdY}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text x={width - padding} y={thresholdY - 3} fill="#f43f5e" fontSize="9" textAnchor="end" fontFamily="monospace">
              Threshold: {threshold} {unit}
            </text>

            {/* Metric line */}
            <polyline
              fill="none"
              stroke={isAnomaly ? '#f43f5e' : '#06b6d4'}
              strokeWidth="2.5"
              points={points}
            />

            {/* Current point */}
            {values.length > 0 && (
              <circle
                cx={width - padding}
                cy={height - padding - ((values[values.length - 1] - minVal) / (maxVal - minVal)) * (height - 2 * padding)}
                r="4"
                fill={isAnomaly ? '#f43f5e' : '#06b6d4'}
                className={isAnomaly ? 'animate-ping' : ''}
              />
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Concept Banner */}
      <ConceptBanner
        title="Intrusion Detection Systems: Signature Rules vs. Statistical Anomaly Detection"
        reference="Stallings Cryptography & Network Security, Chapter 20"
        badge="Adaptive Security Engine"
        accentColor="rose"
        icon={Activity}
        concept="Rule-Based (Signature) IDS matches incoming packets and event sequences against known attack patterns (e.g. 5 failed logins within 60s, port 23 probes). Statistical Anomaly IDS models historical baseline parameters (mean μ, standard deviation σ using NumPy) and flags observations where Z = (x - μ) / σ exceeds the threshold (e.g. +2.5σ)."
        whyItMatters="Signature IDS detects known CVE exploits with zero false positives, while Anomaly IDS detects novel zero-day attacks, stealthy port scans, volumetric DoS surges, and data exfiltration spikes that lack predefined signatures."
      />

      {/* Network Topology Architecture Diagram */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Network Topology & Sensor Telemetry Pipeline
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Defense-in-Depth Segment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-800/60 space-y-1">
            <Globe className="w-5 h-5 text-rose-400 mx-auto" />
            <span className="text-[10px] uppercase font-bold text-rose-400 block">External Internet</span>
            <span className="text-white font-bold text-[11px] block">Simulated Threat Actors</span>
            <span className="text-[9px] text-slate-400 block">Port Scans, DoS Floods, SSH Bursts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <ShieldAlert className="w-5 h-5 text-amber-400 mx-auto" />
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Perimeter Firewall</span>
            <span className="text-white font-bold text-[11px] block">Stateless Packet ACL</span>
            <span className="text-[9px] text-emerald-400 block">First-Match Priority Rules</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-800 space-y-1">
            <Server className="w-5 h-5 text-indigo-400 mx-auto" />
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">DMZ Bastion Host</span>
            <span className="text-white font-bold text-[11px] block">192.168.1.10 (Jump Node)</span>
            <span className="text-[9px] text-cyan-400 block">Snort Sensor & Z-Score Engine</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-1">
            <Database className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Protected Core LAN</span>
            <span className="text-white font-bold text-[11px] block">10.0.0.0/24 Subnet</span>
            <span className="text-[9px] text-slate-400 block">Internal Database & Production API</span>
          </div>
        </div>
      </div>

      {/* Traffic Simulator Command Buttons */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Network Traffic Generator & Threat Simulator
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoPoll(!autoPoll)}
              className={`px-3 py-1 rounded text-xs font-mono border cursor-pointer transition-colors ${
                autoPoll 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {autoPoll ? 'Auto-Polling Active (3s)' : 'Enable Live Stream'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Click any scenario button to transmit simulated packets into the packet inspection pipeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isRunning = generatingScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleGenerate(sc.id)}
                disabled={isRunning}
                className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group cursor-pointer ${sc.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    {isRunning && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                  </div>
                  <span className="text-xs font-bold font-mono text-white block leading-snug group-hover:text-cyan-300">
                    {sc.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                  {sc.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistical Anomaly Detection Panel (Live Charts) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Statistical Anomaly Detector (NumPy Z-Score Engine)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Threshold Formula: <code className="text-rose-400 font-bold">Threshold = μ + 2.5σ</code>
          </span>
        </div>

        {metricsData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Packets / Sec */}
            <div className={`p-4 rounded-xl border ${
              metricsData.stats.packets_per_sec.is_anomaly 
                ? 'bg-rose-950/30 border-rose-500' 
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              {renderSvgChart(
                metricsData.history.packets_per_sec,
                metricsData.stats.packets_per_sec.threshold,
                'pps',
                'Packets per Second (PPS)',
                metricsData.stats.packets_per_sec.is_anomaly
              )}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                <span>Mean (μ): {metricsData.stats.packets_per_sec.mean}</span>
                <span>Std (σ): {metricsData.stats.packets_per_sec.std}</span>
                <span className={metricsData.stats.packets_per_sec.is_anomaly ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  Z-Score: +{metricsData.stats.packets_per_sec.z_score}σ
                </span>
              </div>
            </div>

            {/* Chart 2: Outbound Bytes / Sec */}
            <div className={`p-4 rounded-xl border ${
              metricsData.stats.bytes_transferred_kb.is_anomaly 
                ? 'bg-rose-950/30 border-rose-500' 
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              {renderSvgChart(
                metricsData.history.bytes_transferred_kb,
                metricsData.stats.bytes_transferred_kb.threshold,
                'KB/s',
                'Outbound Transfer Rate (KB/s)',
                metricsData.stats.bytes_transferred_kb.is_anomaly
              )}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                <span>Mean (μ): {metricsData.stats.bytes_transferred_kb.mean}</span>
                <span>Std (σ): {metricsData.stats.bytes_transferred_kb.std}</span>
                <span className={metricsData.stats.bytes_transferred_kb.is_anomaly ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  Z-Score: +{metricsData.stats.bytes_transferred_kb.z_score}σ
                </span>
              </div>
            </div>

            {/* Gauge 3: Auth Failures / Min */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              metricsData.stats.failed_logins_per_min.is_anomaly 
                ? 'bg-rose-950/30 border-rose-500' 
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Failed Auth Rate / Min</span>
                  <span className={metricsData.stats.failed_logins_per_min.is_anomaly ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {metricsData.stats.failed_logins_per_min.current} failures
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden mt-3">
                  <div 
                    className={`h-full transition-all ${
                      metricsData.stats.failed_logins_per_min.is_anomaly ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, (metricsData.stats.failed_logins_per_min.current / 10) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-xs font-mono space-y-1 pt-3 border-t border-slate-800/80">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Threshold Limit:</span>
                  <span className="text-rose-400 font-bold">≥ 5 attempts/min</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Anomaly Status:</span>
                  <span className={metricsData.stats.failed_logins_per_min.is_anomaly ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {metricsData.stats.failed_logins_per_min.is_anomaly ? 'ANOMALY DETECTED' : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Real-Time IDS Alert Feed */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Real-Time IDS Alert Feed ({alerts.length} Total Alerts)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAlerts}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? 'animate-spin' : ''}`} />
              <span>Refresh Alerts</span>
            </button>
            <button
              onClick={handleClearAlerts}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Feed</span>
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-400">All clear! No security violations or anomalies detected.</p>
            <p className="text-xs font-mono text-slate-500 mt-1">Use the Traffic Generator above to simulate attacks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Rule / Signature</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Description & Payload Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{al.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        al.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        al.severity === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        al.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {al.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-bold whitespace-nowrap">{al.rule_name}</td>
                    <td className="py-3 px-3 text-cyan-300">{al.source_ip}</td>
                    <td className="py-3 px-3 text-slate-300">{al.dest_ip}:{al.port}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={al.description}>
                      {al.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Learning Outcome Box */}
      <LearningOutcome
        title="Intrusion Detection & Anomaly Analysis Competencies"
        outcomes={[
          "Compare Signature matching against Statistical Anomaly metrics (packets/sec, login failures, byte spikes)",
          "Understand how NumPy Z-scores model baseline Gaussian distributions to flag zero-day outliers",
          "Analyze the real-time sensor pipeline from perimeter ingress down to host log inspection"
        ]}
        nextModuleSuggestion="Threat Encyclopedia & Malware Taxonomy"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
