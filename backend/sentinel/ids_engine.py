import time
import datetime
import random
import re
import numpy as np
from ..database import get_db

# In-memory tracking for stateful rule detection
failed_ssh_attempts = {} # ip -> [timestamps]
port_scan_attempts = {}  # ip -> set(ports)

# Historical metric buffers for Statistical Anomaly Detection
MAX_HISTORY_POINTS = 30
metric_history = {
    "timestamps": [],
    "packets_per_sec": [],
    "failed_logins_per_min": [],
    "bytes_transferred_kb": []
}

def init_baseline_metrics():
    """Initializes realistic baseline traffic data"""
    if len(metric_history["timestamps"]) == 0:
        base_time = time.time() - 300
        for i in range(MAX_HISTORY_POINTS):
            t_str = datetime.datetime.fromtimestamp(base_time + (i * 10)).strftime("%H:%M:%S")
            metric_history["timestamps"].append(t_str)
            # Normal baseline distributions
            metric_history["packets_per_sec"].append(round(random.normalvariate(18.0, 3.5), 1))
            metric_history["failed_logins_per_min"].append(random.choice([0, 0, 1, 0, 1, 0]))
            metric_history["bytes_transferred_kb"].append(round(random.normalvariate(120.0, 25.0), 1))

init_baseline_metrics()

def record_alert(severity: str, rule_name: str, src_ip: str, dst_ip: str, port: int, description: str, raw_data: str = ""):
    conn = get_db()
    cursor = conn.cursor()
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO ids_alerts (timestamp, severity, rule_name, source_ip, dest_ip, port, description, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (now_str, severity, rule_name, src_ip, dst_ip, port, description, raw_data))
    alert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": alert_id,
        "timestamp": now_str,
        "severity": severity,
        "rule_name": rule_name,
        "source_ip": src_ip,
        "dest_ip": dst_ip,
        "port": port,
        "description": description,
        "raw_data": raw_data
    }

def get_recent_alerts(limit: int = 50):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ids_alerts ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def clear_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ids_alerts")
    conn.commit()
    conn.close()
    return {"message": "All IDS alerts cleared"}

def evaluate_packet_rules(packet: dict):
    """
    Rule-Based IDS: Matches packet against security signatures.
    """
    src_ip = packet.get("src_ip", "192.168.1.100")
    dst_ip = packet.get("dst_ip", "192.168.1.10")
    port = int(packet.get("port", 80))
    protocol = packet.get("protocol", "TCP").upper()
    payload = str(packet.get("payload", ""))
    event_type = packet.get("event_type", "normal")
    now = time.time()

    alerts_generated = []

    # Rule 1: Telnet Usage (Port 23)
    if port == 23 or protocol == "TELNET":
        alert = record_alert(
            severity="HIGH",
            rule_name="RULE-101: Insecure Telnet Protocol Usage",
            src_ip=src_ip,
            dst_ip=dst_ip,
            port=port,
            description="Cleartext Telnet traffic detected on port 23. Credentials and communications vulnerable to eavesdropping.",
            raw_data=f"Proto: {protocol}, Port: {port}, Payload: {payload[:50]}"
        )
        alerts_generated.append(alert)

    # Rule 2: Failed SSH Login Burst (Brute Force Detection)
    if port == 22 and ("fail" in payload.lower() or event_type == "ssh_failed_login"):
        if src_ip not in failed_ssh_attempts:
            failed_ssh_attempts[src_ip] = []
        failed_ssh_attempts[src_ip].append(now)
        # Keep only attempts within last 60 seconds
        failed_ssh_attempts[src_ip] = [t for t in failed_ssh_attempts[src_ip] if now - t <= 60]

        if len(failed_ssh_attempts[src_ip]) >= 5:
            alert = record_alert(
                severity="CRITICAL",
                rule_name="RULE-102: SSH Authentication Brute Force Attack",
                src_ip=src_ip,
                dst_ip=dst_ip,
                port=port,
                description=f"Detected {len(failed_ssh_attempts[src_ip])} failed SSH login attempts from {src_ip} within 60 seconds.",
                raw_data=f"Target: {dst_ip}:22, Attempts in window: {len(failed_ssh_attempts[src_ip])}"
            )
            alerts_generated.append(alert)

    # Rule 3: Port Scan Detection
    if event_type == "port_scan" or port not in [80, 443]:
        if src_ip not in port_scan_attempts:
            port_scan_attempts[src_ip] = set()
        port_scan_attempts[src_ip].add(port)

        if len(port_scan_attempts[src_ip]) >= 4:
            alert = record_alert(
                severity="MEDIUM",
                rule_name="RULE-103: Horizontal Port Reconnaissance",
                src_ip=src_ip,
                dst_ip=dst_ip,
                port=port,
                description=f"Host {src_ip} probed {len(port_scan_attempts[src_ip])} distinct ports ({list(port_scan_attempts[src_ip])[-5:]}). Suspected Nmap/SYN scan.",
                raw_data=f"Distinct Ports: {list(port_scan_attempts[src_ip])}"
            )
            alerts_generated.append(alert)

    # Rule 4: SQL Injection Signature
    sqli_patterns = [r"(\%27)|(\')|(\-\-)|(\%23)|(#)", r"\b(select|union|insert|delete|drop|update)\b", r"1=1"]
    if any(re.search(pat, payload, re.IGNORECASE) for pat in sqli_patterns):
        alert = record_alert(
            severity="CRITICAL",
            rule_name="RULE-104: SQL Injection Pattern in Payload",
            src_ip=src_ip,
            dst_ip=dst_ip,
            port=port,
            description=f"SQL injection heuristics detected in application payload from {src_ip}.",
            raw_data=f"Payload snippet: {payload[:80]}"
        )
        alerts_generated.append(alert)

    # Rule 5: Directory Traversal
    if "../" in payload or "..%2F" in payload.lower() or "/etc/passwd" in payload:
        alert = record_alert(
            severity="HIGH",
            rule_name="RULE-105: Path / Directory Traversal Attempt",
            src_ip=src_ip,
            dst_ip=dst_ip,
            port=port,
            description=f"Directory traversal signature ('../') targeting file system resources.",
            raw_data=f"Payload snippet: {payload[:80]}"
        )
        alerts_generated.append(alert)

    return alerts_generated

def update_anomaly_metrics(new_pps: float, new_failed_logins: int, new_bytes_kb: float):
    """
    Statistical Anomaly Detection: updates rolling buffer and calculates z-scores against baseline.
    """
    now_str = datetime.datetime.now().strftime("%H:%M:%S")

    # Shift history
    if len(metric_history["timestamps"]) >= MAX_HISTORY_POINTS:
        metric_history["timestamps"].pop(0)
        metric_history["packets_per_sec"].pop(0)
        metric_history["failed_logins_per_min"].pop(0)
        metric_history["bytes_transferred_kb"].pop(0)

    metric_history["timestamps"].append(now_str)
    metric_history["packets_per_sec"].append(new_pps)
    metric_history["failed_logins_per_min"].append(new_failed_logins)
    metric_history["bytes_transferred_kb"].append(new_bytes_kb)

    # Statistical baseline analysis using NumPy
    pps_arr = np.array(metric_history["packets_per_sec"][:-1])
    pps_mean = float(np.mean(pps_arr))
    pps_std = float(np.std(pps_arr)) if float(np.std(pps_arr)) > 0 else 1.0
    pps_zscore = (new_pps - pps_mean) / pps_std
    pps_threshold = round(pps_mean + 2.5 * pps_std, 1)

    bytes_arr = np.array(metric_history["bytes_transferred_kb"][:-1])
    bytes_mean = float(np.mean(bytes_arr))
    bytes_std = float(np.std(bytes_arr)) if float(np.std(bytes_arr)) > 0 else 1.0
    bytes_zscore = (new_bytes_kb - bytes_mean) / bytes_std
    bytes_threshold = round(bytes_mean + 2.5 * bytes_std, 1)

    logins_threshold = 5

    anomalies = []
    if pps_zscore > 2.5:
        anom = record_alert(
            severity="CRITICAL",
            rule_name="ANOMALY-STAT: Volumetric Packet Spike",
            src_ip="Dynamic Fleet",
            dst_ip="Core Switch",
            port=0,
            description=f"Traffic reached {new_pps} pps (Baseline Mean: {round(pps_mean,1)}, Threshold: {pps_threshold}, Z-Score: +{round(pps_zscore, 2)}σ). Potential DoS flood!",
            raw_data=f"Current: {new_pps} pps, Threshold: {pps_threshold}"
        )
        anomalies.append(anom)

    if bytes_zscore > 2.5:
        anom = record_alert(
            severity="HIGH",
            rule_name="ANOMALY-STAT: Data Exfiltration Spike",
            src_ip="Internal Server",
            dst_ip="External Host",
            port=443,
            description=f"Outbound transfer rate surged to {new_bytes_kb} KB/s (Baseline Mean: {round(bytes_mean,1)}, Threshold: {bytes_threshold}, Z-Score: +{round(bytes_zscore, 2)}σ). Potential data theft!",
            raw_data=f"Current: {new_bytes_kb} KB/s, Threshold: {bytes_threshold}"
        )
        anomalies.append(anom)

    if new_failed_logins >= logins_threshold:
        anom = record_alert(
            severity="HIGH",
            rule_name="ANOMALY-STAT: High Auth Failure Rate",
            src_ip="Multiple IPs",
            dst_ip="Bastion/SSH",
            port=22,
            description=f"Auth failures reached {new_failed_logins} / min (Exceeded threshold of {logins_threshold}).",
            raw_data=f"Failures: {new_failed_logins}"
        )
        anomalies.append(anom)

    return {
        "history": metric_history,
        "stats": {
            "packets_per_sec": {
                "current": new_pps,
                "mean": round(pps_mean, 1),
                "std": round(pps_std, 1),
                "z_score": round(pps_zscore, 2),
                "threshold": pps_threshold,
                "is_anomaly": pps_zscore > 2.5
            },
            "bytes_transferred_kb": {
                "current": new_bytes_kb,
                "mean": round(bytes_mean, 1),
                "std": round(bytes_std, 1),
                "z_score": round(bytes_zscore, 2),
                "threshold": bytes_threshold,
                "is_anomaly": bytes_zscore > 2.5
            },
            "failed_logins_per_min": {
                "current": new_failed_logins,
                "threshold": logins_threshold,
                "is_anomaly": new_failed_logins >= logins_threshold
            }
        },
        "anomalies_triggered": anomalies
    }

def generate_traffic_scenario(scenario_type: str):
    """
    Generates simulated network traffic batches for demonstration.
    """
    scenario_type = scenario_type.lower()
    packets = []
    alerts = []

    if scenario_type == "normal":
        for _ in range(5):
            pkt = {
                "src_ip": f"192.168.1.{random.randint(20, 99)}",
                "dst_ip": "192.168.1.100",
                "protocol": "TCP",
                "port": random.choice([80, 443]),
                "payload": "GET /api/v1/status HTTP/1.1\r\nHost: portal.corp\r\n\r\n",
                "event_type": "normal"
            }
            packets.append(pkt)
            evaluate_packet_rules(pkt)
        stat_update = update_anomaly_metrics(round(random.normalvariate(20.0, 3.0), 1), 0, round(random.normalvariate(115.0, 15.0), 1))

    elif scenario_type == "ssh_brute_force":
        attacker_ip = "185.220.101.5"
        for i in range(6):
            pkt = {
                "src_ip": attacker_ip,
                "dst_ip": "192.168.1.10",
                "protocol": "TCP",
                "port": 22,
                "payload": f"SSH-2.0-OpenSSH_7.4 | FAILED LOGIN user=root attempt={i+1}",
                "event_type": "ssh_failed_login"
            }
            packets.append(pkt)
            al = evaluate_packet_rules(pkt)
            alerts.extend(al)
        stat_update = update_anomaly_metrics(24.0, 7, 140.0)

    elif scenario_type == "port_scan":
        attacker_ip = "45.143.203.18"
        ports = [21, 22, 23, 25, 80, 139, 443, 445, 1433, 3306, 8080]
        for p in ports[:6]:
            pkt = {
                "src_ip": attacker_ip,
                "dst_ip": "192.168.1.10",
                "protocol": "TCP",
                "port": p,
                "payload": "TCP SYN [Seq=0 Win=1024 Len=0 MSS=1460]",
                "event_type": "port_scan"
            }
            packets.append(pkt)
            al = evaluate_packet_rules(pkt)
            alerts.extend(al)
        stat_update = update_anomaly_metrics(35.0, 0, 95.0)

    elif scenario_type == "telnet_probe":
        pkt = {
            "src_ip": "192.168.1.175",
            "dst_ip": "192.168.1.10",
            "protocol": "TELNET",
            "port": 23,
            "payload": "\xff\xfb\x01\xff\xfb\x03\xff\xfd\x18 (Telnet IAC DO TERMINAL-TYPE) login: admin password: password123",
            "event_type": "telnet_probe"
        }
        packets.append(pkt)
        al = evaluate_packet_rules(pkt)
        alerts.extend(al)
        stat_update = update_anomaly_metrics(19.0, 1, 110.0)

    elif scenario_type == "sqli":
        pkt = {
            "src_ip": "198.51.100.42",
            "dst_ip": "192.168.1.80",
            "protocol": "TCP",
            "port": 80,
            "payload": "GET /products.php?id=1' UNION SELECT null,username,password_hash FROM users -- HTTP/1.1",
            "event_type": "sqli"
        }
        packets.append(pkt)
        al = evaluate_packet_rules(pkt)
        alerts.extend(al)
        stat_update = update_anomaly_metrics(22.0, 0, 130.0)

    elif scenario_type == "dos_flood":
        # Sudden massive volumetric surge
        stat_update = update_anomaly_metrics(94.5, 0, 310.0)
        packets.append({
            "src_ip": "Botnet (256 hosts)",
            "dst_ip": "192.168.1.10",
            "protocol": "UDP",
            "port": 80,
            "payload": "UDP FLOOD VOLUMETRIC SURGE [94.5 pkts/sec]",
            "event_type": "dos"
        })

    elif scenario_type == "data_exfil":
        # Massive outbound data surge
        stat_update = update_anomaly_metrics(28.0, 0, 2450.0)
        packets.append({
            "src_ip": "192.168.1.45 (Database Node)",
            "dst_ip": "198.51.100.99 (Offshore Drop Server)",
            "protocol": "TCP",
            "port": 443,
            "payload": "TLS RECORD Encrypted Stream [2,450 KB/sec]",
            "event_type": "exfil"
        })

    return {
        "scenario": scenario_type,
        "packets_sent": len(packets),
        "packets": packets,
        "rule_alerts": alerts,
        "anomaly_update": stat_update
    }
