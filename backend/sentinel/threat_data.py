THREAT_ENCYCLOPEDIA = [
    {
        "id": "file-infector",
        "category": "Viruses",
        "title": "File Infector Virus",
        "aliases": ["Parasitic Virus", "Program Infector"],
        "severity": "HIGH",
        "target": "Executable Binaries (.exe, .com, ELF)",
        "mechanism": "Attaches malicious code to executable programs. When the infected host program is executed, the virus payload runs first, loading itself into RAM, locating uninfected binaries on disk, and appending or prepending its byte pattern to them before transferring control back to the host program.",
        "subtypes": [
            {"name": "Prepending", "desc": "Inserts virus code at the start of the host binary, shifting the original entry point."},
            {"name": "Appending", "desc": "Appends virus code to the end of the binary and modifies the PE header entry point address."},
            {"name": "Cavity / Space-filler", "desc": "Hides within unused padding spaces inside binary sections without expanding file size."}
        ],
        "countermeasures": [
            "Cryptographic file integrity monitoring (Tripwire, AIDE, SHA-256 hashes).",
            "Antivirus heuristic and signature scanning before execution.",
            "OS Application Whitelisting (AppLocker, WDAC)."
        ]
    },
    {
        "id": "boot-sector",
        "category": "Viruses",
        "title": "Boot Sector Virus",
        "aliases": ["MBR Infector", "System Virus"],
        "severity": "CRITICAL",
        "target": "Master Boot Record (MBR) & Partition Boot Sectors",
        "mechanism": "Infects the storage drive's Master Boot Record (Sector 0) or Volume Boot Record. It executes during BIOS POST initialization before the operating system kernel boots up, enabling it to control the entire operating system environment and stay invisible to standard in-OS antivirus scanners.",
        "famous_examples": ["Brain (1986 - First IBM PC virus)", "Stoned", "Michelangelo"],
        "countermeasures": [
            "UEFI Secure Boot with hardware-backed digital signature enforcement.",
            "TPM (Trusted Platform Module) measured boot attestation.",
            "Disabling BIOS legacy boot from external USB drives."
        ]
    },
    {
        "id": "macro-virus",
        "category": "Viruses",
        "title": "Macro Virus",
        "aliases": ["Document Infector", "VBA Virus"],
        "severity": "HIGH",
        "target": "Office Documents (.docm, .xlsm, PDFs)",
        "mechanism": "Written in embedded macro scripting languages such as Visual Basic for Applications (VBA). Exploits auto-run execution triggers (e.g. `AutoOpen()`, `Workbook_Open()`) when a document is opened. Propagates by copying itself to the global document template (`Normal.dotm`).",
        "famous_examples": ["Melissa (1999)", "Concept"],
        "countermeasures": [
            "Disabling macros by default across enterprise group policies.",
            "Mark of the Web (MotW) macro blocking for internet-downloaded files.",
            "Antivirus Antimalware Scan Interface (AMSI) runtime inspection."
        ]
    },
    {
        "id": "polymorphic-metamorphic",
        "category": "Viruses",
        "title": "Polymorphic & Metamorphic Viruses",
        "aliases": ["Mutation Engine", "Oligomorphic"],
        "severity": "CRITICAL",
        "target": "Defeating Traditional Signature-based AV Scanners",
        "mechanism": "Polymorphic viruses use a variable encryption engine: the decryptor routine and encryption key change with each infection, while the internal body stays encrypted. Metamorphic viruses rewrite their own code completely using instruction substitution, register swapping, junk code insertion, and dead-code permutation—producing entirely different machine instructions with identical behavior.",
        "countermeasures": [
            "AV CPU Emulation and Sandbox Execution (letting code decrypt in memory).",
            "Behavioral monitoring and EDR (Endpoint Detection and Response).",
            "Machine-learning based static classification."
        ]
    },
    {
        "id": "email-worm",
        "category": "Worms",
        "title": "Email / Social Engineering Worm",
        "aliases": ["Mass-Mailing Worm"],
        "severity": "HIGH",
        "target": "MAPI, Outlook Address Books, SMTP Relays",
        "mechanism": "Unlike viruses, worms do NOT require a host file or user execution after initial entry; they self-replicate autonomously across networks. Email worms harvest email contacts from local address books, browser caches, and document folders, then forge outgoing emails with enticing subject lines and malicious attachments.",
        "famous_examples": ["ILOVEYOU (2000 - caused $15B damage)", "Mydoom", "Sobig"],
        "countermeasures": [
            "Secure Email Gateways (SEG) with attachment sandboxing and spoofing filters (SPF, DKIM, DMARC).",
            "Blocking executable and script attachments (.exe, .vbs, .js, .bat).",
            "User security awareness phishing drills."
        ]
    },
    {
        "id": "network-worm",
        "category": "Worms",
        "title": "Network Exploitation Worm",
        "aliases": ["Internet Worm", "Zero-Click Worm"],
        "severity": "CRITICAL",
        "target": "Vulnerable Network Daemons (SMB, RPC, RDP, Web Services)",
        "mechanism": "Scans IP address spaces (random or sequential subnet sweeps) for open listening ports with unpatched remote code execution vulnerabilities (e.g. buffer overflows). Once found, it injects shellcode, executes without ANY human interaction, compromises the host, and starts scanning for adjacent targets.",
        "famous_examples": [
            "Morris Worm (1988 - First Internet worm, abused fingerd and sendmail)",
            "Code Red & Nimda (2001 - IIS buffer overflow)",
            "SQL Slammer (2003 - 376-byte UDP packet infected 75,000 servers in 10 minutes)",
            "Conficker (2008 - MS08-067 RPC flaw)",
            "WannaCry & NotPetya (2017 - EternalBlue SMBv1 exploit)"
        ],
        "countermeasures": [
            "Rapid vulnerability patch management.",
            "Network perimeter firewalls blocking SMB (ports 139/445) and RDP (3389) from WAN.",
            "Network microsegmentation to prevent lateral worm propagation."
        ]
    },
    {
        "id": "stuxnet-cyber-weapon",
        "category": "Worms",
        "title": "Industrial SCADA Worm (Stuxnet)",
        "aliases": ["State-Sponsored Cyber Weapon"],
        "severity": "CRITICAL",
        "target": "Siemens Step7 PLC & Air-Gapped Centrifuges",
        "mechanism": "Demonstrated how worms can jump physical air-gaps via infected USB flash drives (using LNK zero-day exploits). It used 4 separate zero-day vulnerabilities, stolen digital certificates from real hardware companies, and altered Siemens PLC frequency inverter drive codes to physically destroy uranium centrifuges while reporting normal telemetry to operators.",
        "famous_examples": ["Stuxnet (2010)", "Industroyer / CrashOverride"],
        "countermeasures": [
            "Strict USB peripheral blocking and kiosk sanitation.",
            "PLC firmware cryptographic attestation.",
            "Deep Packet Inspection (DPI) of industrial protocols (Modbus, Profinet, DNP3)."
        ]
    },
    {
        "id": "countermeasures-suite",
        "category": "Defenses",
        "title": "Comprehensive Defense-in-Depth Architecture",
        "aliases": ["Layered Security", "Zero Trust"],
        "severity": "INFO",
        "target": "Full Enterprise Infrastructure",
        "mechanism": "No single defensive technology is foolproof. Defense-in-depth layers perimeter defenses (Next-Gen Firewalls, DMZ, Bastion Hosts), transport security (TLS/SSH/IPsec), cryptographic integrity (X.509, SHA-512, Digital Signatures), host defenses (EDR, AMSI, AppLocker), and continuous network surveillance (Rule-Based & Statistical Anomaly IDS).",
        "countermeasures": [
            "Perimeter: Next-Gen Firewalls & Bastion Gateways.",
            "Transport: TLS 1.3 / SSH-2 / IPsec ESP.",
            "Identity: PKI / X.509 Certificates & Multi-Factor Authentication.",
            "Detection: Rule-Based Signatures (Snort) + Statistical Anomaly Engine."
        ]
    }
]

def get_threat_encyclopedia():
    return THREAT_ENCYCLOPEDIA
