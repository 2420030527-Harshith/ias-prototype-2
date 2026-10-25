# CyberLab Suite: SecureTunnel & Sentinel Engineering Platform

A unified, full-stack cybersecurity laboratory consolidating two core security projects into one modern, demo-ready educational platform:
1. **SecureTunnel**: Transport Layer Security (TLS/SSH) Visualizer & IPsec Architecture
2. **Sentinel**: Intrusion Detection & Firewall Simulator with Statistical Anomaly Engine

Developed for university active learning in Network and System Security (referencing *William Stallings: Cryptography and Network Security*).

---

## 🏗️ Architecture & Project Structure

```
.
├── backend/
│   ├── main.py                  # FastAPI unified router & OpenAPI schemas
│   ├── database.py              # SQLite storage for firewall rules & IDS alerts
│   ├── secure_tunnel/
│   │   ├── tls_sim.py           # 5-step TLS 1.2 handshake, PRF master secret derivation, live AES-GCM record transit
│   │   ├── ssh_sim.py           # SSH-2 protocol version exchange, DH KEXINIT, TOFU host auth, interactive shell
│   │   └── ipsec_sim.py         # IPsec Tunnel vs Transport mode, ESP vs AH header breakdowns & encapsulation
│   └── sentinel/
│       ├── firewall.py          # Priority-based packet filtering, Bastion Host DMZ isolation, packet sandbox
│       ├── ids_engine.py        # Rule-based Snort signatures, NumPy Z-score statistical anomaly detection
│       └── threat_data.py       # Threat Encyclopedia (Viruses, Worms, Defenses, Interactive Mastery Quiz)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx              # Persistent navigation sidebar with collapsible module accordions
│   │   │   │   └── TopBar.jsx               # Breadcrumbs, Demo Mode launcher, Guided Tour, theme switcher
│   │   │   ├── ui/
│   │   │   │   ├── ConceptBanner.jsx        # Academic reference banner (What it is / Why it matters)
│   │   │   │   ├── LearningOutcome.jsx      # Student competency takeaways & next module navigation
│   │   │   │   ├── CodeBlock.jsx            # Monospace PEM/packet viewer with copy-to-clipboard
│   │   │   │   ├── ToastContext.jsx         # Non-blocking contextual alert toast system
│   │   │   │   └── TourModal.jsx            # Interactive guided walkthrough modal
│   │   │   ├── tunnel/                      # Project 1: TlsVisualizer, SshVisualizer, IpsecVisualizer
│   │   │   ├── sentinel/                    # Project 2: FirewallManager, IdsDashboard, ThreatEncyclopedia
│   │   │   ├── ErrorBoundary.jsx            # React error containment boundary
│   │   │   └── OverviewDashboard.jsx        # Mission control & defense-in-depth telemetry
│   │   ├── App.jsx                          # Main state machine & routing
│   │   ├── index.css                        # Cyber glassmorphism styling & dark/light theme variables
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js                       # Proxy configuration routing /api to port 8000
├── test_suite.py                            # Automated end-to-end test suite
├── start.bat                                # Windows quick-launch script
├── run.ps1                                  # PowerShell launch script
└── README.md
```

---

## 🛠️ Features & Project Modules

### Project 1: SecureTunnel (Transport Layer Security)
* **TLS 1.2 Handshake Visualizer (RFC 5246):**
  * 5-step stateful negotiation: Client Hello, Server Hello & Certificate, Client Key Exchange (Pre-Master Secret RSA encryption), Session Key PRF derivation (HMAC-SHA256), and Finished confirmation.
  * Live encrypted application data transit with authenticated AES-128-GCM.
* **SSH-2 Connection Protocol & Remote Terminal (RFC 4253):**
  * Protocol version exchange, Diffie-Hellman Key Exchange (KEXINIT), Server Host Authentication (TOFU), and User Password Authentication.
  * Interactive encrypted shell emulator supporting remote system commands (`whoami`, `uname -a`, `uptime`, `ls -la`, `netstat -tuln`).
* **IP Security (IPsec) Architecture & ESP (RFC 4303):**
  * Interactive packet diagram comparing **Tunnel Mode** (Site-to-Site VPN) and **Transport Mode** (Host-to-Host).
  * Layer-by-layer inspection: Outer IP Header, ESP Header, Encrypted Original IP Header + Payload, ESP Trailer, and Integrity Check Value (ICV).

### Project 2: Sentinel (Perimeter Defense & IDS)
* **Firewall Rule Base & Bastion Host DMZ:**
  * First-match ordered Access Control List (ACL) manager supporting CRUD operations, priority reordering, and action toggles (`ALLOW` / `DROP`).
  * Hardened DMZ Bastion Host jump-node simulation with IP isolation.
  * Real-time packet evaluation sandbox testing arbitrary protocol packets against active rules.
* **Intrusion Detection System (IDS) & NumPy Z-Score Anomaly Engine:**
  * Interactive 4-stage network topology diagram (External Internet → Perimeter Firewall → DMZ Bastion Host → Protected LAN).
  * 7-scenario attack traffic generator: Normal Web Traffic, SSH Brute Force, Horizontal Port Scan, Telnet Cleartext Probes, SQL Injection, Volumetric DoS Flood, and Data Exfiltration.
  * Live alert feed with severity badges (Low, Medium, High, Critical).
  * Real-time statistical anomaly detection using NumPy to compute moving $Z = \frac{x - \mu}{\sigma}$ scores against baseline thresholds ($+2.5\sigma$).
* **Threat Encyclopedia & Malware Taxonomy:**
  * In-depth classification of parasitic viruses (boot sector, macro, multipartite) and autonomous network worms (Stuxnet, WannaCry, Morris).
  * Analysis of evasion engines: Polymorphic decryptor stubs and metamorphic opcode reordering.
  * Interactive mastery quiz with real-time scoring and comprehensive technical explanations.

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+ (with `fastapi`, `uvicorn`, `cryptography`, `numpy`)
* Node.js 18+ and `npm`

### Quick Launch (Windows)
Double-click `start.bat` or run:
```powershell
.\run.ps1
```
This automatically starts both the backend API and frontend dev server.

---

### Manual Launch

#### 1. Backend Server (FastAPI)
```powershell
# In project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Health Check:** `http://127.0.0.1:8000/api/system/health`
* **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`

#### 2. Frontend Application (Vite + React 19)
```powershell
cd frontend
npm install
npm run dev
```
* **Web Application:** `http://localhost:5173`

---

## 🧪 Automated Verification Suite

Run the end-to-end Python test suite to verify all backend API endpoints and security modules:
```powershell
python test_suite.py
```
**Result:** 100% test pass rate across System Health, TLS Handshake, SSH Terminal, IPsec Framing, Firewall ACLs, IDS Traffic Simulation, NumPy Z-Score Anomaly Detection, and Threat Encyclopedia.

---

## 📚 Curriculum Alignment (William Stallings Reference)

| Module | Stallings Chapter Reference | Core Concepts Covered |
| :--- | :--- | :--- |
| **TLS Visualizer** | Chapter 17: Transport-Level Security | Pre-Master Secret exchange, PRF session key derivation, AES-GCM record protection |
| **SSH Connection** | Chapter 18: Secure Shell (SSH-2) | Diffie-Hellman KEX, Server host fingerprint verification, PTY remote execution |
| **IPsec & ESP** | Chapter 16: IP Security Architecture | Tunnel Mode vs Transport Mode, ESP header encapsulation, anti-replay protection |
| **Firewall Manager** | Chapter 22: Firewalls & Bastion Hosts | First-match packet evaluation, DMZ Bastion Host architecture, default-deny policy |
| **IDS & Anomaly Engine** | Chapter 20: Intrusion Detection Systems | Signature rule matching + NumPy statistical anomaly detection ($Z \ge +2.5\sigma$) |
| **Threat Encyclopedia** | Chapter 21: Malicious Software | Parasitic viruses, autonomous worms, polymorphic/metamorphic evasion engines |
