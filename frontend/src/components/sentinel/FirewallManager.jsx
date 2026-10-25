import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RefreshCw, 
  Server, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function FirewallManager({ demoTrigger, onNavigateNext }) {
  const [rules, setRules] = useState([]);
  const [bastion, setBastion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { success, warning, error, info } = useToast();

  // Add rule modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: 'Block External Telnet',
    priority: 35,
    direction: 'INBOUND',
    protocol: 'TCP',
    source_ip: 'ANY',
    dest_ip: 'ANY',
    port: '23',
    action: 'DROP',
    enabled: true
  });

  // Packet evaluation sandbox state
  const [evalPacket, setEvalPacket] = useState({
    direction: 'INBOUND',
    protocol: 'TCP',
    src_ip: '198.51.100.42',
    dst_ip: '192.168.1.10',
    port: 22,
    payload: 'SSH connection attempt from external IP'
  });
  const [evalResult, setEvalResult] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);

  // Demo Mode Effect
  useEffect(() => {
    if (demoTrigger > 0) {
      info('Demo Mode: Testing external unauthorized probe against Firewall ACLs...');
      setEvalPacket({
        direction: 'INBOUND',
        protocol: 'TCP',
        src_ip: '203.0.113.66',
        dst_ip: '192.168.1.5',
        port: 23,
        payload: 'UNAUTHORIZED_TELNET_ROOT_SESSION_PROBE'
      });
      setTimeout(() => {
        handleEvaluate();
      }, 300);
    }
  }, [demoTrigger]);

  // Bastion edit state
  const [showBastionModal, setShowBastionModal] = useState(false);
  const [bastionForm, setBastionForm] = useState({
    ip: '192.168.1.10',
    hostname: 'bastion-gate-01.corp',
    allowed_admin_ip: '192.168.1.50'
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/firewall/rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBastion = async () => {
    try {
      const res = await fetch('/api/firewall/bastion');
      const data = await res.json();
      setBastion(data);
      setBastionForm({
        ip: data.ip,
        hostname: data.hostname,
        allowed_admin_ip: data.allowed_admin_ip
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchBastion();
  }, []);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/firewall/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (!res.ok) throw new Error('Failed to create rule');
      setShowAddModal(false);
      fetchRules();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await fetch(`/api/firewall/rules/${ruleId}`, { method: 'DELETE' });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluate = async () => {
    setLoadingEval(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/firewall/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalPacket)
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      setErrorMsg('Packet evaluation failed: ' + err.message);
    } finally {
      setLoadingEval(false);
    }
  };

  const handleSaveBastion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/firewall/bastion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bastionForm)
      });
      const data = await res.json();
      setBastion(data);
      setShowBastionModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Concept Banner */}
      <ConceptBanner
        title="Packet-Filtering Firewalls & Bastion Host DMZ Architecture"
        reference="Stallings Cryptography & Network Security, Chapter 22"
        badge="Perimeter Security"
        accentColor="rose"
        icon={Flame}
        concept="A packet-filtering firewall inspects incoming and outgoing IP packets against ordered access control list (ACL) rules evaluating Source/Destination IP, Protocol (TCP/UDP/ICMP), and Port number using a First-Match policy with Default Deny."
        whyItMatters="A hardened Bastion Host in a screened subnet (DMZ) acts as the sole authorized gateway for inbound administrative sessions, neutralizing direct attacker probes toward sensitive internal database clusters."
      />

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Bastion Host Status Banner */}
      {bastion && (
        <div className="bg-slate-900 rounded-xl border border-indigo-900/50 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-950 rounded-xl border border-indigo-800 text-indigo-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-mono">
                  Designated Bastion Host: {bastion.hostname}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {bastion.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Bastion IP: <code className="text-cyan-400">{bastion.ip}</code> | Allowed Admin Source: <code className="text-emerald-400">{bastion.allowed_admin_ip}</code> | DMZ Subnet: {bastion.dmz_subnet}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBastionModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer"
          >
            Configure Bastion Host
          </button>
        </div>
      )}

      {/* Firewall Rules Manager Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Active Firewall Rule Base (Priority Ordered: First-Match Policy)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchRules}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/20 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Destination IP</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-300">#{r.priority}</td>
                  <td className="py-3 px-3 text-white font-semibold">{r.name}</td>
                  <td className="py-3 px-3 text-slate-400">{r.direction}</td>
                  <td className="py-3 px-3 text-slate-300 font-bold">{r.protocol}</td>
                  <td className="py-3 px-3 text-cyan-300 font-mono">{r.source_ip}</td>
                  <td className="py-3 px-3 text-cyan-300 font-mono">{r.dest_ip}</td>
                  <td className="py-3 px-3 text-amber-300 font-mono">{r.port}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.action === 'ALLOW' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet Evaluation Test Sandbox */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Play className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">
            Interactive Packet Evaluation Sandbox
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Craft a simulated packet and test it against the firewall's rule base to inspect rule matches, action verdicts, and Bastion Host access control:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Direction</label>
            <select
              value={evalPacket.direction}
              onChange={(e) => setEvalPacket({ ...evalPacket, direction: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded p-2"
            >
              <option value="INBOUND">INBOUND</option>
              <option value="OUTBOUND">OUTBOUND</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Protocol</label>
            <select
              value={evalPacket.protocol}
              onChange={(e) => setEvalPacket({ ...evalPacket, protocol: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded p-2"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Source IP</label>
            <input
              type="text"
              value={evalPacket.src_ip}
              onChange={(e) => setEvalPacket({ ...evalPacket, src_ip: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded p-2"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Destination IP</label>
            <input
              type="text"
              value={evalPacket.dst_ip}
              onChange={(e) => setEvalPacket({ ...evalPacket, dst_ip: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded p-2"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Port</label>
            <input
              type="number"
              value={evalPacket.port}
              onChange={(e) => setEvalPacket({ ...evalPacket, port: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded p-2"
            />
          </div>
        </div>

        {/* Preset quick test buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs font-mono text-slate-500 self-center mr-1">Quick Presets:</span>
          <button
            onClick={() => setEvalPacket({ direction: 'INBOUND', protocol: 'TCP', src_ip: '192.168.1.50', dst_ip: '192.168.1.10', port: 22, payload: 'Admin SSH connection' })}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 cursor-pointer"
          >
            Authorized Bastion SSH
          </button>
          <button
            onClick={() => setEvalPacket({ direction: 'INBOUND', protocol: 'TCP', src_ip: '203.0.113.88', dst_ip: '192.168.1.10', port: 22, payload: 'Rogue external SSH' })}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-rose-300 border border-slate-700 cursor-pointer"
          >
            Unauthorized Rogue SSH
          </button>
          <button
            onClick={() => setEvalPacket({ direction: 'INBOUND', protocol: 'TCP', src_ip: '10.0.0.15', dst_ip: '192.168.1.100', port: 443, payload: 'Legitimate HTTPS access' })}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-300 border border-slate-700 cursor-pointer"
          >
            HTTPS Port 443
          </button>
          <button
            onClick={() => setEvalPacket({ direction: 'INBOUND', protocol: 'TCP', src_ip: '192.168.1.77', dst_ip: '192.168.1.10', port: 23, payload: 'Telnet probe' })}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 border border-slate-700 cursor-pointer"
          >
            Insecure Telnet Port 23
          </button>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loadingEval}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 cursor-pointer transition-all"
        >
          {loadingEval ? 'Processing Through Packet Filter...' : 'Evaluate Packet Against Rule Base'}
        </button>

        {/* Evaluation Verdict Result */}
        {evalResult && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                {evalResult.final_action === 'ALLOW' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
                <span className={evalResult.final_action === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}>
                  VERDICT: {evalResult.final_action}
                </span>
              </div>
              <span className="text-slate-400">{evalResult.verdict_reason}</span>
            </div>

            {/* Bastion inspection info */}
            {evalResult.bastion_status && (
              <div className="p-2.5 bg-indigo-950/40 rounded border border-indigo-800 text-indigo-300 text-[11px]">
                <strong>Bastion Host Policy Check:</strong> {evalResult.bastion_status.note}
              </div>
            )}

            {/* Trace of evaluated rules */}
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Rule Evaluation Trace:
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {evalResult.trace.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-1.5 rounded ${
                      t.matched ? 'bg-slate-900 border border-slate-700 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    <span>
                      Priority #{t.priority}: {t.rule_name} ({t.details})
                    </span>
                    <span className={t.matched ? (t.action === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-600'}>
                      {t.matched ? `MATCHED -> ${t.action}` : 'Skip'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white font-mono">Create New Firewall Rule</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Priority (Lower = First)</label>
                  <input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Direction</label>
                  <select
                    value={newRule.direction}
                    onChange={(e) => setNewRule({ ...newRule, direction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="INBOUND">INBOUND</option>
                    <option value="OUTBOUND">OUTBOUND</option>
                    <option value="ANY">ANY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Protocol</label>
                  <select
                    value={newRule.protocol}
                    onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="ANY">ANY</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Port (or Range)</label>
                  <input
                    type="text"
                    value={newRule.port}
                    onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                    placeholder="80 or 1-1024 or ANY"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Source IP (or CIDR)</label>
                  <input
                    type="text"
                    value={newRule.source_ip}
                    onChange={(e) => setNewRule({ ...newRule, source_ip: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination IP</label>
                  <input
                    type="text"
                    value={newRule.dest_ip}
                    onChange={(e) => setNewRule({ ...newRule, dest_ip: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Action</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="DROP">DROP (Silent Discard)</option>
                  <option value="ALLOW">ALLOW (Permit Traffic)</option>
                  <option value="REJECT">REJECT (Send TCP Reset)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bastion Host Modal */}
      {showBastionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white font-mono">Configure Bastion Gateway</h4>
              <button onClick={() => setShowBastionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveBastion} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Bastion IP Address</label>
                <input
                  type="text"
                  value={bastionForm.ip}
                  onChange={(e) => setBastionForm({ ...bastionForm, ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hostname</label>
                <input
                  type="text"
                  value={bastionForm.hostname}
                  onChange={(e) => setBastionForm({ ...bastionForm, hostname: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Allowed Admin Management IP</label>
                <input
                  type="text"
                  value={bastionForm.allowed_admin_ip}
                  onChange={(e) => setBastionForm({ ...bastionForm, allowed_admin_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBastionModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Learning Outcome Box */}
      <LearningOutcome
        title="Firewall Architecture & Packet-Filtering Competencies"
        outcomes={[
          "Understand how ordered firewall rules apply first-match logic with default-deny fallback",
          "Distinguish stateful and stateless packet inspection based on 5-tuple TCP/IP packet headers",
          "Analyze DMZ Bastion Host configurations isolating internal corporate subnets from external networks"
        ]}
        nextModuleSuggestion="Intrusion Detection System (IDS) & Statistical Anomaly Engine"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
