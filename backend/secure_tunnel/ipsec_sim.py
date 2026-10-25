def get_ipsec_packet_structure(
    mode: str = "tunnel", # "transport" or "tunnel"
    protocol: str = "esp", # "esp" or "ah"
    src_ip: str = "192.168.1.100",
    dst_ip: str = "10.0.0.50",
    gateway_src: str = "198.51.100.1",
    gateway_dst: str = "203.0.113.1",
    payload: str = "CONFIDENTIAL_FINANCIAL_RECORDS_TRANSFER"
):
    """
    Constructs an interactive architectural breakdown of an IPsec packet under
    Transport Mode vs Tunnel Mode and ESP vs AH.
    """
    mode = mode.lower()
    protocol = protocol.lower()

    if protocol == "esp" and mode == "tunnel":
        # Tunnel Mode ESP (Standard VPN Site-to-Site or Remote Access)
        layers = [
            {
                "id": "new_ip_header",
                "name": "New IP Header",
                "bytes": 20,
                "fields": {
                    "Source IP": gateway_src + " (VPN Gateway A)",
                    "Destination IP": gateway_dst + " (VPN Gateway B)",
                    "Protocol": "50 (ESP)",
                    "TTL": 64
                },
                "security_status": "plaintext_routable",
                "color": "#3b82f6", # Blue
                "description": "Routable public IP header added by the gateway. Replaces original header to obscure source and destination end hosts across the public Internet."
            },
            {
                "id": "esp_header",
                "name": "ESP Header",
                "bytes": 8,
                "fields": {
                    "SPI (Security Parameter Index)": "0x4A8F9012 (32-bit SA Identifier)",
                    "Sequence Number": "0x00000042 (Anti-Replay Window)"
                },
                "security_status": "authenticated_only",
                "color": "#8b5cf6", # Purple
                "description": "Contains SPI to identify security parameters and sequence number to defend against replay attacks."
            },
            {
                "id": "original_ip_header",
                "name": "Original IP Header (Encrypted)",
                "bytes": 20,
                "fields": {
                    "Source Host": src_ip + " (Internal Workstation)",
                    "Dest Host": dst_ip + " (Internal Database)",
                    "Protocol": "6 (TCP)"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981", # Emerald
                "description": "Completely encrypted! Intermediate eavesdroppers cannot see internal network addresses or routing."
            },
            {
                "id": "transport_header",
                "name": "TCP Header (Encrypted)",
                "bytes": 20,
                "fields": {
                    "Source Port": "49152 (Ephemeral)",
                    "Dest Port": "443 / 80 / Custom",
                    "Flags": "SYN, ACK, PSH"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "Layer 4 transport header encrypted, hiding transport ports."
            },
            {
                "id": "payload_data",
                "name": "Application Payload (Encrypted)",
                "bytes": len(payload.encode("utf-8")),
                "fields": {
                    "Raw Content": payload,
                    "Length": f"{len(payload.encode('utf-8'))} bytes"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "User confidential application data encrypted via AES-256 or ChaCha20."
            },
            {
                "id": "esp_trailer",
                "name": "ESP Trailer",
                "bytes": 4,
                "fields": {
                    "Padding": "0-255 bytes (Aligns to cipher block size)",
                    "Pad Length": "2 bytes",
                    "Next Header": "4 (IPv4 encapsulation)"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "Pad bytes for block cipher boundary alignment and Next Header pointer."
            },
            {
                "id": "esp_icv",
                "name": "ESP ICV (Integrity Check Value)",
                "bytes": 16,
                "fields": {
                    "MAC Digest": "HMAC-SHA256 / AES-GMAC",
                    "Coverage": "Calculated over ESP Header + Encrypted Payload + ESP Trailer"
                },
                "security_status": "integrity_tag",
                "color": "#ec4899", # Pink
                "description": "Authenticates integrity and source origin; prevents packet tampering."
            }
        ]
        summary = {
            "mode": "Tunnel Mode (ESP)",
            "use_case": "Site-to-Site VPN / Gateway-to-Gateway. Shields entire internal packet (headers + data).",
            "encryption_scope": "Original IP Header + TCP Header + Data Payload + ESP Trailer",
            "authentication_scope": "ESP Header + Encrypted Payload + ESP Trailer",
            "unprotected_scope": "New IP Header only (required for public routing)"
        }

    elif protocol == "esp" and mode == "transport":
        # Transport Mode ESP (Host-to-Host)
        layers = [
            {
                "id": "original_ip_header",
                "name": "Original IP Header (Cleartext)",
                "bytes": 20,
                "fields": {
                    "Source IP": src_ip,
                    "Destination IP": dst_ip,
                    "Protocol": "50 (ESP)"
                },
                "security_status": "plaintext_routable",
                "color": "#3b82f6",
                "description": "Original IP header remains unencrypted so intermediate routers can forward it."
            },
            {
                "id": "esp_header",
                "name": "ESP Header",
                "bytes": 8,
                "fields": {
                    "SPI": "0x78B109A2",
                    "Sequence Number": "0x00000007"
                },
                "security_status": "authenticated_only",
                "color": "#8b5cf6",
                "description": "Identifies Security Association and prevents replay attacks."
            },
            {
                "id": "transport_header",
                "name": "TCP Header (Encrypted)",
                "bytes": 20,
                "fields": {
                    "Source Port": "51234",
                    "Dest Port": "22",
                    "Flags": "ACK"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "Layer 4 transport header encrypted."
            },
            {
                "id": "payload_data",
                "name": "Application Data (Encrypted)",
                "bytes": len(payload.encode("utf-8")),
                "fields": {
                    "Content": payload
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "Payload encrypted."
            },
            {
                "id": "esp_trailer",
                "name": "ESP Trailer",
                "bytes": 4,
                "fields": {
                    "Padding": "Aligned",
                    "Next Header": "6 (TCP)"
                },
                "security_status": "encrypted_and_authenticated",
                "color": "#10b981",
                "description": "Padding and next header field."
            },
            {
                "id": "esp_icv",
                "name": "ESP ICV",
                "bytes": 16,
                "fields": {
                    "MAC Digest": "HMAC-SHA256 (128/256-bit)"
                },
                "security_status": "integrity_tag",
                "color": "#ec4899",
                "description": "Authentication check value."
            }
        ]
        summary = {
            "mode": "Transport Mode (ESP)",
            "use_case": "End-to-End host communication (e.g. server to database in same network). Less overhead since no new IP header is added.",
            "encryption_scope": "TCP Header + Data Payload + ESP Trailer",
            "authentication_scope": "ESP Header + Encrypted Payload + ESP Trailer",
            "unprotected_scope": "Original IP Header (source and destination IPs are visible to network observers)"
        }
    else:
        # Authentication Header (AH)
        layers = [
            {
                "id": "ip_header",
                "name": "IP Header",
                "bytes": 20,
                "fields": {"Source IP": src_ip, "Destination IP": dst_ip, "Protocol": "51 (AH)"},
                "security_status": "authenticated_only",
                "color": "#8b5cf6",
                "description": "Mutable fields (TTL, checksum) are zeroed out before computing AH MAC."
            },
            {
                "id": "ah_header",
                "name": "AH Header (Authentication Header)",
                "bytes": 24,
                "fields": {"Next Header": "6 (TCP)", "SPI": "0x33445566", "Sequence Number": "0x0001", "ICV": "HMAC-SHA256 Digest"},
                "security_status": "authenticated_only",
                "color": "#8b5cf6",
                "description": "AH verifies origin and detects tampering of packet and IP headers. NO ENCRYPTION provided!"
            },
            {
                "id": "payload",
                "name": "TCP & Data (Cleartext)",
                "bytes": len(payload.encode("utf-8")) + 20,
                "fields": {"Content": payload, "Encryption": "NONE (Plaintext visible)"},
                "security_status": "plaintext_routable",
                "color": "#f59e0b",
                "description": "Data is readable in cleartext, but any modification will be detected."
            }
        ]
        summary = {
            "mode": "Authentication Header (AH)",
            "use_case": "Integrity and authentication without confidentiality. Rare in modern networks; incompatible with NAT.",
            "encryption_scope": "None (Payload is unencrypted!)",
            "authentication_scope": "Entire packet including immutable IP header fields",
            "unprotected_scope": "Confidentiality (eavesdroppers can read payload)"
        }

    return {
        "mode": mode,
        "protocol": protocol,
        "summary": summary,
        "layers": layers,
        "total_packet_size_bytes": sum(layer["bytes"] for layer in layers)
    }
