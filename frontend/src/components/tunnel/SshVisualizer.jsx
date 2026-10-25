import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  RotateCcw, 
  Key, 
  ShieldCheck, 
  Lock, 
  Server, 
  UserCheck, 
  CornerDownLeft, 
  CheckCircle2, 
  Cpu,
  Play
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function SshVisualizer({ demoTrigger, onNavigateNext }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState('student');
  const [authPassword, setAuthPassword] = useState('cyber123');
  const [errorMsg, setErrorMsg] = useState('');

  const { success, info } = useToast();

  // Terminal state
  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: 'CryptoVault Secure Access Node [v2.4]' },
    { type: 'system', text: 'Type "whoami", "uname -a", "ls -la", "netstat -tlpn", "ip a", or "cat /etc/banner"' }
  ]);
  const terminalEndRef = useRef(null);

  // Demo Mode Effect
  useEffect(() => {
    if (demoTrigger > 0) {
      const runDemo = async () => {
        info('Demo Mode: Automatically establishing SSH-2 connection & shell...');
        try {
          const initRes = await fetch('/api/ssh/init', { method: 'POST' });
          let sess = await initRes.json();
          setSession(sess);

          // Steps 1 to 5
          for (let s = 1; s <= 4; s++) {
            await new Promise(r => setTimeout(r, 400));
            const stepRes = await fetch('/api/ssh/step', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sess.session_id,
                auth_user: 'student',
                auth_password: 'cyber123'
              })
            });
            sess = await stepRes.json();
            setSession(sess);
          }

          success('SSH-2 Connection Established! PTY Shell allocated.');

          // Run a demo command
          await new Promise(r => setTimeout(r, 500));
          const cmd = 'uname -a';
          setTerminalHistory(prev => [...prev, { type: 'input', text: `student@node1:~$ ${cmd}` }]);
          const cmdRes = await fetch('/api/ssh/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sess.session_id, command: cmd })
          });
          const cmdData = await cmdRes.json();
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: cmdData.output, encryptedPacket: cmdData.encrypted_packet_hex }
          ]);
          success(`Command '${cmd}' executed securely over SSH tunnel!`);
        } catch (err) {
          console.error(err);
        }
      };
      runDemo();
    }
  }, [demoTrigger]);

  const initSsh = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ssh/init', { method: 'POST' });
      const data = await res.json();
      setSession(data);
      setTerminalHistory([
        { type: 'system', text: 'CryptoVault Secure Access Node [v2.4]' },
        { type: 'system', text: 'Type "whoami", "uname -a", "ls -la", "netstat -tlpn", "ip a", or "cat /etc/banner"' }
      ]);
    } catch (err) {
      setErrorMsg('Failed initializing SSH session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSsh();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const advanceStep = async () => {
    if (!session) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ssh/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          auth_user: authUser,
          auth_password: authPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSession(data);
    } catch (err) {
      setErrorMsg('SSH step error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCommand = async (e) => {
    e.preventDefault();
    if (!commandInput.trim() || !session || !session.terminal_open) return;
    const cmd = commandInput.trim();
    setCommandInput('');

    // Append to terminal history
    setTerminalHistory(prev => [...prev, { type: 'input', text: `student@node1:~$ ${cmd}` }]);

    try {
      const res = await fetch('/api/ssh/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          command: cmd
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setTerminalHistory(prev => [
        ...prev, 
        { type: 'output', text: data.output, encryptedPacket: data.encrypted_packet_hex }
      ]);
    } catch (err) {
      setTerminalHistory(prev => [...prev, { type: 'error', text: 'Command error: ' + err.message }]);
    }
  };

  const steps = [
    { num: 1, title: 'Version Exchange', desc: 'Client & Server exchange SSH-2.0 banner strings.' },
    { num: 2, title: 'DH Key Exchange', desc: 'Diffie-Hellman Group 14 exchange derives shared secret K.' },
    { num: 3, title: 'Server Authentication', desc: 'Server proves identity using Host Key & signed exchange hash H.' },
    { num: 4, title: 'User Authentication', desc: 'Client authenticates via password or SSH public key (authorized_keys).' },
    { num: 5, title: 'Secure Shell Channel', desc: 'Encrypted interactive pty session allocated.' }
  ];

  return (
    <div className="space-y-8">
      {/* Concept Banner */}
      <ConceptBanner
        title="Secure Shell (SSH-2) Handshake & Interactive Terminal"
        reference="Stallings Cryptography & Network Security, Chapter 18"
        badge="Trust On First Use (TOFU)"
        accentColor="purple"
        icon={Terminal}
        concept="SSH provides secure encrypted remote terminal administration. Unlike TLS's CA hierarchy, SSH traditionally relies on Trust On First Use (TOFU) host key pinning in known_hosts. The handshake performs a Diffie-Hellman Group 14 exchange, authenticates the server, then authenticates the user."
        whyItMatters="SSH multiplexes encrypted pseudo-terminals (pty), port-forwarding tunnels, and SFTP over a single encrypted transport session with strong symmetric encryption and HMAC integrity protection."
      />

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Control & Step Progress */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400">
              SSH Session: <code className="text-cyan-400">{session?.session_id || 'Initializing...'}</code>
            </span>
            {session?.terminal_open && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Encrypted Shell Channel Active
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={initSsh}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset SSH</span>
            </button>

            <button
              onClick={advanceStep}
              disabled={loading || !session || session.terminal_open}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>
                {session?.terminal_open ? 'SSH Established ✓' : `Execute Step ${session ? session.step + 1 : 1}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono pt-1">
          {steps.map((s) => {
            const isCurrent = session?.step === s.num;
            const isCompleted = session && (session.step > s.num || (session.step === 5 && s.num === 5));
            return (
              <div
                key={s.num}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-700 text-slate-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Step {s.num}: {s.title}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Handshake Breakdown on Left, Interactive Terminal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Handshake Details & Event Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Host Key & Auth Config Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-white font-bold flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>SSH Server Host Identity</span>
              </span>
              <span className="text-[10px] text-slate-400">Port 22</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Host Key Algorithm:</span>
                <span className="text-cyan-300">rsa-sha2-512 (2048-bit)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">KEX Algorithm:</span>
                <span className="text-indigo-400">diffie-hellman-group14-sha256</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Server Fingerprint (TOFU):</span>
                <span className="text-emerald-400 bg-slate-950 p-1.5 rounded border border-slate-800 block truncate">
                  {session?.server_host_key.fingerprint}
                </span>
              </div>
            </div>

            {/* User Auth inputs before step 4 */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Simulated User Credentials (for Step 4):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={authUser}
                  disabled={session?.step >= 4}
                  onChange={(e) => setAuthUser(e.target.value)}
                  placeholder="Username"
                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none"
                />
                <input
                  type="password"
                  value={authPassword}
                  disabled={session?.step >= 4}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Transcript Logs */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              SSH Handshake Event Log
            </span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs font-mono max-h-56 overflow-y-auto">
              {session?.logs.map((log, idx) => (
                <div key={idx} className="text-slate-300">
                  <span className="text-indigo-400 font-bold">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Embedded SSH Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl flex flex-col h-[520px]">
          {/* Terminal Window Header */}
          <div className="bg-slate-900/90 px-4 py-3 rounded-t-xl border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                student@cryptovault-node1:~ (SSH-2.0 encrypted tunnel)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              {session?.terminal_open ? 'CONNECTED' : 'HANDSHAKE PENDING'}
            </span>
          </div>

          {/* Terminal Screen Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs font-mono text-slate-200">
            {terminalHistory.map((item, idx) => {
              if (item.type === 'system') {
                return <div key={idx} className="text-cyan-400 font-semibold">{item.text}</div>;
              } else if (item.type === 'input') {
                return (
                  <div key={idx} className="text-slate-200 font-bold flex items-center space-x-1">
                    <span>{item.text}</span>
                  </div>
                );
              } else if (item.type === 'output') {
                return (
                  <div key={idx} className="space-y-1">
                    <pre className="text-emerald-300 whitespace-pre-wrap font-mono">{item.text}</pre>
                    {item.encryptedPacket && (
                      <div className="text-[10px] text-slate-500 truncate" title={`Wire ciphertext: ${item.encryptedPacket}`}>
                        [Wire Transit: AES-CTR Ciphertext: {item.encryptedPacket.substring(0, 32)}...]
                      </div>
                    )}
                  </div>
                );
              } else {
                return <div key={idx} className="text-rose-400">{item.text}</div>;
              }
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Command Input Prompt */}
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 rounded-b-xl">
            {session?.terminal_open ? (
              <form onSubmit={handleRunCommand} className="flex items-center space-x-2">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  student@node1:~$
                </span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter command (e.g. whoami, uname -a, ls -la, netstat -tlpn)..."
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder-slate-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="text-center text-xs font-mono text-slate-500 py-1">
                Complete all 5 handshake steps above to open the encrypted SSH shell.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Learning Outcome Box */}
      <LearningOutcome
        title="SSH-2 Architecture & Shell Protocol Competencies"
        outcomes={[
          "Compare SSH host-key TOFU (Trust On First Use) against TLS X.509 CA trust hierarchies",
          "Analyze the 5-step connection negotiation: Version String, DH KEXINIT, Server Signature, User Auth, Channel Allocation",
          "Demonstrate remote command execution and payload encryption over a multiplexed PTY channel"
        ]}
        nextModuleSuggestion="IPsec Architecture & ESP Packet Inspector"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
