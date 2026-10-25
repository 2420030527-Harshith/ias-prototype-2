import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Shield, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  Globe, 
  Network, 
  Cpu,
  Play
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function IpsecVisualizer({ demoTrigger, onNavigateNext }) {
  const [mode, setMode] = useState('tunnel'); // 'tunnel' or 'transport'
  const [protocol, setProtocol] = useState('esp'); // 'esp' or 'ah'
  const [srcIp, setSrcIp] = useState('192.168.1.100');
  const [dstIp, setDstIp] = useState('10.0.0.50');
  const [gatewaySrc, setGatewaySrc] = useState('198.51.100.1');
  const [gatewayDst, setGatewayDst] = useState('203.0.113.1');
  const [payloadText, setPayloadText] = useState('DATABASE_CONFIDENTIAL_QUERY_CUSTOMER_RECORDS');

  const [packetData, setPacketData] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [loading, setLoading] = useState(false);

  const { success, info } = useToast();

  // Demo Mode Effect
  useEffect(() => {
    if (demoTrigger > 0) {
      info('Demo Mode: Simulating Site-to-Site VPN ESP Tunnel encapsulation...');
      setMode('tunnel');
      setProtocol('esp');
      setPayloadText('CONFIDENTIAL_HEALTHCARE_RECORD_TRANSFER_TRANSACTION_#890');
      success('IPsec ESP Tunnel Mode active: Inner IP & payload encrypted under outer IP header.');
    }
  }, [demoTrigger]);

  const fetchPacketStructure = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ipsec/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          protocol,
          src_ip: srcIp,
          dst_ip: dstIp,
          gateway_src: gatewaySrc,
          gateway_dst: gatewayDst,
          payload: payloadText
        })
      });
      const data = await res.json();
      setPacketData(data);
      if (data.layers && data.layers.length > 0) {
        setSelectedLayer(data.layers[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacketStructure();
  }, [mode, protocol, payloadText]);

  return (
    <div className="space-y-8">
      {/* Concept Banner */}
      <ConceptBanner
        title="IP Security (IPsec) Architecture & Encapsulating Security Payload (ESP)"
        reference="Stallings Cryptography & Network Security, Chapter 16"
        badge="Layer 3 Security Protocol"
        accentColor="purple"
        icon={Network}
        concept="IPsec operates at Network Layer 3, securing all higher-level protocols (TCP, UDP, HTTP). Encapsulating Security Payload (ESP, Protocol 50) provides confidentiality, origin authentication, and anti-replay protection. In Tunnel Mode (VPNs), the entire original IP packet is encrypted and wrapped in a new outer IP header."
        whyItMatters="Tunnel Mode hides internal subnet IP addresses from public network routers. Authentication Header (AH) validates headers without encryption, while ESP encrypts the transport header and payload and appends an Integrity Check Value (ICV)."
      />

      {/* Mode & Protocol Selectors */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* Mode Switcher */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
              IPsec Operating Mode:
            </span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setMode('tunnel')}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'tunnel' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tunnel Mode (VPN Gateway)
              </button>
              <button
                onClick={() => setMode('transport')}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'transport' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Transport Mode (Host-to-Host)
              </button>
            </div>
          </div>

          {/* Protocol Switcher */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
              Security Protocol:
            </span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setProtocol('esp')}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  protocol === 'esp' 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ESP (Encryption + Integrity)
              </button>
              <button
                onClick={() => setProtocol('ah')}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  protocol === 'ah' 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AH (Integrity Only)
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
              <span className="text-slate-300">Plaintext Routable</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-purple-500 inline-block" />
              <span className="text-slate-300">Authenticated Header</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300">Encrypted + Authenticated</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-pink-500 inline-block" />
              <span className="text-slate-300">Integrity ICV</span>
            </div>
          </div>

        </div>

        {/* Mode Summary Card */}
        {packetData?.summary && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Use Case:</span>
              <span className="text-white">{packetData.summary.use_case}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Confidentiality Zone:</span>
              <span className="text-emerald-400">{packetData.summary.encryption_scope}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Authentication Scope:</span>
              <span className="text-purple-400">{packetData.summary.authentication_scope}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Packet Diagram Breakdown */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-mono">
              IPsec Packet Frame Anatomy ({packetData?.total_packet_size_bytes} Total Bytes)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any layer block to inspect its header fields & security role
          </span>
        </div>

        {/* Visual Layer Blocks Bar */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch min-w-[700px] h-20 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 p-1 gap-1">
            {packetData?.layers.map((layer) => {
              const isSelected = selectedLayer?.id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer)}
                  style={{
                    backgroundColor: `${layer.color}22`,
                    borderColor: layer.color
                  }}
                  className={`flex-1 flex flex-col justify-center items-center p-2 rounded-lg border cursor-pointer transition-all hover:brightness-125 ${
                    isSelected ? 'ring-2 ring-white shadow-lg' : 'opacity-85'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-white text-center leading-tight truncate w-full">
                    {layer.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 mt-1">
                    {layer.bytes} B
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Field Inspector */}
        {selectedLayer && (
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full inline-block" 
                  style={{ backgroundColor: selectedLayer.color }} 
                />
                <h4 className="text-sm font-bold text-white font-mono">{selectedLayer.name}</h4>
                <span className="text-xs font-mono text-slate-400">({selectedLayer.bytes} Bytes)</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                Security Role: {selectedLayer.security_status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {selectedLayer.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {Object.entries(selectedLayer.fields).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">{k}:</span>
                  <span className="text-cyan-300 font-semibold truncate block mt-0.5" title={v}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Network Topology Simulation */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Site-to-Site Encapsulation Simulation</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Host A (Protected LAN)</span>
            <span className="text-white font-bold">{srcIp}</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Cleartext TCP Traffic</span>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800">
            <span className="text-[10px] text-indigo-400 uppercase font-bold block">VPN Gateway 1</span>
            <span className="text-white font-bold">{gatewaySrc}</span>
            <span className="text-[10px] text-indigo-300 block mt-1">Encapsulates with ESP & New IP</span>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800">
            <span className="text-[10px] text-indigo-400 uppercase font-bold block">VPN Gateway 2</span>
            <span className="text-white font-bold">{gatewayDst}</span>
            <span className="text-[10px] text-indigo-300 block mt-1">Authenticates & Decrypts to Host B</span>
          </div>
        </div>
      </div>

      {/* Learning Outcome Box */}
      <LearningOutcome
        title="IPsec Protocol & Packet Encapsulation Competencies"
        outcomes={[
          "Distinguish Transport Mode (host-to-host) from Tunnel Mode (gateway-to-gateway VPN)",
          "Inspect ESP packet segments: SPI, Sequence Number, IV, Encrypted Inner IP/Payload, Padding, and ICV",
          "Explain why outer IP routing headers must remain plaintext while inner addresses are shielded"
        ]}
        nextModuleSuggestion="Firewall Rule Manager & Bastion Host (Project 2)"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
