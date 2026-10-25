import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("STARTING TEST SUITE: SECURETUNNEL & SENTINEL")
    print("=" * 60)

    # 1. Health check
    res = client.get("/api/system/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health = res.json()
    assert health["status"] == "healthy"
    assert "securetunnel" in health["modules"]
    assert "sentinel" in health["modules"]
    print("[PASS] System Health Check:", health)

    # 2. SecureTunnel: TLS 1.2 Handshake & Transmission
    res = client.post("/api/tls/init")
    assert res.status_code == 200
    tls_session = res.json()
    sid = tls_session["session_id"]
    print(f"[PASS] TLS Handshake Initialized: Step 1 Client Hello, Session: {sid}")

    # Steps 2, 3, 4, 5
    for expected_step in [2, 3, 4, 5]:
        res = client.post("/api/tls/step", json={"session_id": sid})
        assert res.status_code == 200
        tls_session = res.json()
        assert tls_session["step"] == expected_step
        print(f"[PASS] TLS Advanced to Step {expected_step}: {tls_session['logs'][-1][:60]}...")

    assert tls_session["handshake_completed"] is True

    # Transmit payload over active TLS tunnel
    res = client.post("/api/tls/transmit", json={"session_id": sid, "plaintext": "GET /accounts HTTP/1.1"})
    assert res.status_code == 200
    trans_data = res.json()
    assert trans_data["decrypted_by_server"] == "GET /accounts HTTP/1.1"
    print(f"[PASS] TLS AES-GCM Application Data Transmission OK. Decrypted: '{trans_data['decrypted_by_server']}'")

    # 3. SecureTunnel: SSH Simulation
    res = client.post("/api/ssh/init")
    assert res.status_code == 200
    ssh_session = res.json()
    ssh_id = ssh_session["session_id"]
    print(f"[PASS] SSH Handshake Initialized: Step 1 Version Exchange, Session: {ssh_id}")

    for expected_step in [2, 3, 4, 5]:
        res = client.post("/api/ssh/step", json={"session_id": ssh_id, "auth_user": "student", "auth_password": "cyber123"})
        assert res.status_code == 200
        ssh_session = res.json()
        assert ssh_session["step"] == expected_step
        print(f"[PASS] SSH Advanced to Step {expected_step}: {ssh_session['logs'][-1][:60]}...")

    assert ssh_session["terminal_open"] is True

    # Execute SSH command
    res = client.post("/api/ssh/execute", json={"session_id": ssh_id, "command": "whoami"})
    assert res.status_code == 200
    assert res.json()["output"] == "student"
    print(f"[PASS] SSH Remote Command Execution: 'whoami' -> '{res.json()['output']}'")

    # 4. SecureTunnel: IPsec Inspector
    res = client.post("/api/ipsec/inspect", json={"mode": "tunnel", "protocol": "esp"})
    assert res.status_code == 200
    ipsec_data = res.json()
    assert len(ipsec_data["layers"]) >= 6
    print(f"[PASS] IPsec Tunnel Mode ESP Structure: {len(ipsec_data['layers'])} layers ({ipsec_data['total_packet_size_bytes']} bytes)")

    # 5. Sentinel: Firewall Rule Manager & Evaluation
    res = client.get("/api/firewall/rules")
    assert res.status_code == 200
    rules = res.json()
    print(f"[PASS] Firewall Rules Base: {len(rules)} active rules")

    # Evaluate Allowed Packet
    res = client.post("/api/firewall/evaluate", json={
        "direction": "INBOUND",
        "protocol": "TCP",
        "src_ip": "10.0.0.1",
        "dst_ip": "192.168.1.100",
        "port": 443,
        "payload": "GET /login"
    })
    assert res.status_code == 200
    assert res.json()["final_action"] == "ALLOW"
    print(f"[PASS] Firewall Allowed HTTPS packet -> ALLOW")

    # Evaluate Blocked Packet (Telnet port 23)
    res = client.post("/api/firewall/evaluate", json={
        "direction": "INBOUND",
        "protocol": "TCP",
        "src_ip": "192.168.1.100",
        "dst_ip": "192.168.1.10",
        "port": 23,
        "payload": "Telnet attempt"
    })
    assert res.status_code == 200
    assert res.json()["final_action"] == "DROP"
    print(f"[PASS] Firewall Blocked Insecure Telnet -> DROP")

    # 6. Sentinel: IDS Dashboard & Traffic Generator
    res = client.post("/api/ids/generate-traffic", json={"scenario": "ssh_brute_force"})
    assert res.status_code == 200
    ids_gen = res.json()
    print(f"[PASS] IDS Attack Generator (SSH Brute Force): {len(ids_gen['rule_alerts'])} alerts triggered")

    # Get Alerts
    res = client.get("/api/ids/alerts?limit=10")
    assert res.status_code == 200
    alerts = res.json()
    print(f"[PASS] IDS Alerts Feed: {len(alerts)} alerts retrieved")

    # Anomaly detector
    res = client.post("/api/ids/update-metrics", json={
        "packets_per_sec": 95.0,
        "failed_logins_per_min": 8,
        "bytes_transferred_kb": 2200.0
    })
    assert res.status_code == 200
    anom_res = res.json()
    assert anom_res["stats"]["packets_per_sec"]["is_anomaly"] is True
    print(f"[PASS] Statistical Anomaly Detection: Z-Score = +{anom_res['stats']['packets_per_sec']['z_score']} sigma -> Flagged Anomaly!")

    # 7. Sentinel: Threat Encyclopedia
    res = client.get("/api/threats/encyclopedia")
    assert res.status_code == 200
    threats = res.json()
    assert len(threats) >= 8
    print(f"[PASS] Threat Encyclopedia: {len(threats)} detailed articles (Viruses, Worms, Defenses)")

    print("=" * 60)
    print("ALL TEST MODULES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
