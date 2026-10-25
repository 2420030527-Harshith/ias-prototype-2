import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Server, 
  Globe, 
  Send, 
  Layers, 
  ShieldCheck, 
  KeyRound, 
  FileCode, 
  Activity,
  Play
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function TlsVisualizer({ demoTrigger, onNavigateNext }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { success, info } = useToast();

  // Data transmission over established tunnel
  const [appPayload, setAppPayload] = useState('GET /api/user/financial-records HTTP/1.1\r\nHost: secure.vault\r\n\r\n');
  const [transmissionResult, setTransmissionResult] = useState(null);
  const [loadingTransmit, setLoadingTransmit] = useState(false);

  // Demo Mode Effect
  useEffect(() => {
    if (demoTrigger > 0) {
      const runDemo = async () => {
        info('Demo Mode: Automatically running TLS 1.2 handshake simulation...');
        try {
          const initRes = await fetch('/api/tls/init', { method: 'POST' });
          let sess = await initRes.json();
          setSession(sess);

          // Step 1 to 5
          for (let step = 1; step <= 4; step++) {
            await new Promise(r => setTimeout(r, 400));
            const stepRes = await fetch('/api/tls/step', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sess.session_id })
            });
            sess = await stepRes.json();
            setSession(sess);
          }

          success('TLS 1.2 Handshake Completed! Session AES-128-GCM established.');
          // Auto-transmit
          await new Promise(r => setTimeout(r, 400));
          const txRes = await fetch('/api/tls/transmit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sess.session_id,
              plaintext: 'GET /api/user/financial-records HTTP/1.1\r\nHost: secure.vault\r\nAuthorization: Bearer tls_token_9021\r\n\r\n'
            })
          });
          const txData = await txRes.json();
          setTransmissionResult(txData);
          success('Application data encrypted with AES-GCM and transmitted!');
        } catch (err) {
          console.error(err);
        }
      };
      runDemo();
    }
  }, [demoTrigger]);

  const initHandshake = async () => {
    setLoading(true);
    setErrorMsg('');
    setTransmissionResult(null);
    try {
      const res = await fetch('/api/tls/init', { method: 'POST' });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      setErrorMsg('Failed to initialize TLS handshake: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initHandshake();
  }, []);

  const advanceStep = async () => {
    if (!session) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/tls/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSession(data);
    } catch (err) {
      setErrorMsg('Failed advancing TLS step: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const transmitData = async () => {
    if (!session || !session.handshake_completed) return;
    setLoadingTransmit(true);
    try {
      const res = await fetch('/api/tls/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          plaintext: appPayload
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setTransmissionResult(data);
    } catch (err) {
      setErrorMsg('Transmission failed: ' + err.message);
    } finally {
      setLoadingTransmit(false);
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Client Hello', sender: 'Client', desc: 'Proposes TLS 1.2, sends Client Random & supported cipher suites.' },
    { num: 2, title: 'Server Hello & Cert', sender: 'Server', desc: 'Selects cipher suite, sends Server Random & X.509 Certificate with RSA Public Key.' },
    { num: 3, title: 'Client Key Exchange', sender: 'Client', desc: 'Client generates Pre-Master Secret, encrypts it with Server RSA Key.' },
    { num: 4, title: 'Session Key PRF', sender: 'Both', desc: 'Both independently derive Master Secret & AES-GCM session keys via PRF.' },
    { num: 5, title: 'Finished & Established', sender: 'Both', desc: 'Encrypted Finished hashes exchanged. Symmetric TLS tunnel is active.' }
  ];

  return (
    <div className="space-y-8">
      {/* Concept Banner */}
      <ConceptBanner
        title="Transport Layer Security (TLS 1.2) Handshake & Session Key PRF"
        reference="Stallings Cryptography & Network Security, Chapter 17"
        badge="Session Key Bootstrapping"
        accentColor="purple"
        icon={Lock}
        concept="TLS resolves the fundamental dilemma: asymmetric encryption is too slow for high-throughput data transfer, but symmetric encryption requires a secure pre-shared key. The TLS handshake uses asymmetric RSA to authenticate the server and encrypt a 48-byte Pre-Master Secret."
        whyItMatters="Both endpoints feed the Pre-Master Secret, Client Random, and Server Random into a Pseudo-Random Function (PRF) using HMAC-SHA256. This derives symmetric session keys (AES-128-GCM write keys and IVs) that encrypt all subsequent application HTTP packets at line-rate speed."
      />

      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Control & Progress Steps Bar */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400">
              Session ID: <code className="text-cyan-400">{session?.session_id || 'Initializing...'}</code>
            </span>
            {session?.handshake_completed && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Tunnel Active (AES-128-GCM)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={initHandshake}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Handshake</span>
            </button>

            <button
              onClick={advanceStep}
              disabled={loading || !session || session.handshake_completed}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>
                {session?.handshake_completed ? 'Handshake Complete ✓' : `Execute Step ${session ? session.step + 1 : 1}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono pt-2">
          {stepsInfo.map((s) => {
            const isCurrent = session?.step === s.num;
            const isCompleted = session && (session.step > s.num || (session.step === 5 && s.num === 5));
            return (
              <div
                key={s.num}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-700 text-slate-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Step {s.num}: {s.title}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-purple-300 block mt-0.5">{s.sender}</span>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Panel Visualizer: Client Browser vs Server */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Client Side (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-blue-900/50 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white font-mono">Client (Browser)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              IP: 198.51.100.24
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Client Random */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Client Random (32 bytes nonce):</span>
              <span className="text-blue-300 break-all select-all">
                {session?.client_random || 'Generating...'}
              </span>
            </div>

            {/* Offered Cipher Suites */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-[11px]">Supported Cipher Suites Offered:</span>
              <ul className="space-y-1 text-[11px]">
                {session?.supported_ciphers.map((c, i) => (
                  <li key={i} className={`flex items-center justify-between ${c.name === session.selected_cipher ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    <span>{c.name}</span>
                    {c.name === session.selected_cipher && <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">Selected</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pre-Master Secret (Step 3+) */}
            {session?.step >= 3 && (
              <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/60 space-y-1">
                <div className="flex items-center justify-between text-cyan-400 text-[11px] font-bold">
                  <span>Pre-Master Secret (48 bytes):</span>
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Client generated 48 random bytes and encrypted it with Server's RSA Public Key.
                </p>
                <div className="text-[10px] text-slate-500 break-all pt-1">
                  Raw: {session.pre_master_secret_hex.substring(0, 32)}...
                </div>
              </div>
            )}

            {/* Derived Session Keys (Step 4+) */}
            {session?.session_keys && (
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-800/60 space-y-1.5">
                <span className="text-emerald-400 text-[11px] font-bold block">
                  Derived Client Write Key (AES-128):
                </span>
                <span className="text-white font-mono text-[11px] break-all select-all">
                  {session.session_keys.client_write_key_hex}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  IV: {session.session_keys.client_iv_hex}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Central Wire & Exchange Logs (2 cols) */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center p-3 text-center space-y-3">
          <div className="w-full border-t-2 border-dashed border-purple-500/50 relative py-2">
            <span className="bg-slate-900 px-2 text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
              TLS Wire
            </span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1 w-full">
            <Activity className="w-4 h-4 text-purple-400 mx-auto" />
            <div className="font-bold text-white">Record Layer</div>
            <div>TLS 1.2 Protocol</div>
            <div className="text-emerald-400">Port 443 (HTTPS)</div>
          </div>
        </div>

        {/* Server Side (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-purple-900/50 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white font-mono">Server (CryptoVault CA)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              IP: 203.0.113.88
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Server Random */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Server Random (32 bytes nonce):</span>
              <span className="text-purple-300 break-all select-all">
                {session?.server_random || 'Pending Server Hello (Step 2)...'}
              </span>
            </div>

            {/* Selected Cipher Suite */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Selected Cipher Suite:</span>
              <span className="text-white font-bold">
                {session?.selected_cipher || 'Pending negotiation...'}
              </span>
            </div>

            {/* Server Certificate & Decrypted Pre-Master */}
            {session?.step >= 3 && (
              <div className="p-3 bg-slate-950 rounded-lg border border-purple-800/60 space-y-1">
                <div className="flex items-center justify-between text-purple-400 text-[11px] font-bold">
                  <span>Server Decrypted Pre-Master Secret:</span>
                  <Unlock className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Decrypted using Server's RSA Private Key. Now both parties possess the identical Pre-Master Secret!
                </p>
              </div>
            )}

            {/* Master Secret Derivation (Step 4+) */}
            {session?.master_secret_hex && (
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-800/60 space-y-1.5">
                <span className="text-emerald-400 text-[11px] font-bold block">
                  Computed Master Secret (PRF-SHA256 48 bytes):
                </span>
                <span className="text-white font-mono text-[11px] break-all select-all">
                  {session.master_secret_hex}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  Expanded: Server Write Key: {session.session_keys.server_write_key_hex.substring(0, 16)}...
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Handshake Transcript Logs */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-purple-400" />
          <span>Handshake Protocol Transcript & Cryptographic Events</span>
        </h4>
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
          {session?.logs.map((log, idx) => (
            <div key={idx} className="text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-bold">&gt;&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>

      {/* Live Application Data Transmission over Active TLS Tunnel */}
      {session?.handshake_completed && (
        <div className="bg-slate-900 rounded-xl border border-emerald-800/60 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-bold text-white font-mono">
                Step 6: Live Data Transmission Over Established TLS Tunnel
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              AES-128-GCM Authenticated Encryption
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The handshake successfully agreed upon symmetric session keys. Type any application request below; it will be framed into a <strong>TLS Record (Type 0x17)</strong>, encrypted using <strong>AES-128-GCM</strong> with an AEAD authentication tag, transmitted across the wire, and verified and decrypted by the server!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Input payload */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase block">
                Application Data (HTTP / JSON / Text):
              </label>
              <textarea
                value={appPayload}
                onChange={(e) => setAppPayload(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={transmitData}
                disabled={loadingTransmit}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loadingTransmit ? 'Encrypting & Transmitting...' : 'Send Over TLS Tunnel'}</span>
              </button>
            </div>

            {/* Wire & Decryption Inspection */}
            <div className="md:col-span-7 space-y-3">
              {transmissionResult ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">TLS Record Header:</span>
                    <span className="text-cyan-400">{transmissionResult.tls_record_header_hex} ({transmissionResult.record_type})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">AEAD 12-byte Nonce:</span>
                    <span className="text-purple-400">{transmissionResult.nonce_hex}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">Wire Frame (AES-GCM Ciphertext + Tag):</span>
                    <pre className="p-2 bg-slate-900 rounded text-amber-300 text-[10px] break-all border border-slate-800 select-all">
                      {transmissionResult.wire_payload_hex}
                    </pre>
                  </div>
                  <div className="p-2.5 bg-emerald-950/40 rounded border border-emerald-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Decrypted & Verified by Server:
                    </span>
                    <pre className="text-white text-xs font-mono whitespace-pre-wrap">
                      {transmissionResult.decrypted_by_server}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
                  Click "Send Over TLS Tunnel" to inspect the encrypted wire frame and server decryption.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learning Outcome Box */}
      <LearningOutcome
        title="TLS 1.2 Protocol Competencies"
        outcomes={[
          "Trace the 5-step handshake: Client Hello, Server Hello & Certificate, Client Key Exchange, PRF Derivation, Finished",
          "Understand how asymmetric RSA solves key distribution for high-speed symmetric AES-GCM",
          "Analyze the role of client/server nonces in defending against replay and downgrade attacks"
        ]}
        nextModuleSuggestion="SSH-2 Connection Protocol & Remote Shell"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
