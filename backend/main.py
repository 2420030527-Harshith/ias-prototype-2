import os
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from .database import init_db, get_db
from .secure_tunnel import tls_sim, ssh_sim, ipsec_sim
from .sentinel import firewall, ids_engine, threat_data

# Initialize SQLite database on startup
init_db()

app = FastAPI(
    title="CyberLab Suite API",
    description="Unified Backend for SecureTunnel and Sentinel",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 / any local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# PROJECT 1: SECURETUNNEL ENDPOINTS
# ============================================================================

class TlsStepRequest(BaseModel):
    session_id: str

class TlsTransmitRequest(BaseModel):
    session_id: str
    plaintext: str

class SshStepRequest(BaseModel):
    session_id: str
    auth_user: str = "student"
    auth_password: str = "cyber123"

class SshCommandRequest(BaseModel):
    session_id: str
    command: str

class IpsecInspectRequest(BaseModel):
    mode: str = "tunnel"
    protocol: str = "esp"
    src_ip: str = "192.168.1.100"
    dst_ip: str = "10.0.0.50"
    gateway_src: str = "198.51.100.1"
    gateway_dst: str = "203.0.113.1"
    payload: str = "CONFIDENTIAL_FINANCIAL_RECORDS_TRANSFER"

@app.post("/api/tls/init")
def tls_init():
    return tls_sim.init_tls_handshake()

@app.post("/api/tls/step")
def tls_advance_step(req: TlsStepRequest):
    try:
        return tls_sim.next_tls_step(req.session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/tls/transmit")
def tls_transmit(req: TlsTransmitRequest):
    try:
        return tls_sim.transmit_tls_payload(req.session_id, req.plaintext)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ssh/init")
def ssh_init():
    return ssh_sim.init_ssh_session()

@app.post("/api/ssh/step")
def ssh_advance_step(req: SshStepRequest):
    try:
        return ssh_sim.next_ssh_step(req.session_id, req.auth_user, req.auth_password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ssh/execute")
def ssh_execute(req: SshCommandRequest):
    try:
        return ssh_sim.execute_ssh_command(req.session_id, req.command)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ipsec/inspect")
def ipsec_inspect(req: IpsecInspectRequest):
    return ipsec_sim.get_ipsec_packet_structure(
        mode=req.mode,
        protocol=req.protocol,
        src_ip=req.src_ip,
        dst_ip=req.dst_ip,
        gateway_src=req.gateway_src,
        gateway_dst=req.gateway_dst,
        payload=req.payload
    )

# ============================================================================
# PROJECT 2: SENTINEL ENDPOINTS
# ============================================================================

class FirewallRuleCreate(BaseModel):
    name: str
    priority: int
    direction: str = "INBOUND"
    protocol: str = "TCP"
    source_ip: str = "ANY"
    dest_ip: str = "ANY"
    port: str = "ANY"
    action: str = "DROP"
    enabled: bool = True

class BastionConfigRequest(BaseModel):
    ip: Optional[str] = None
    hostname: Optional[str] = None
    allowed_admin_ip: Optional[str] = None
    dmz_subnet: Optional[str] = None
    internal_subnet: Optional[str] = None
    description: Optional[str] = None

class PacketEvalRequest(BaseModel):
    direction: str = "INBOUND"
    protocol: str = "TCP"
    src_ip: str = "192.168.1.100"
    dst_ip: str = "192.168.1.10"
    port: int = 80
    payload: str = "GET /index.html"

class TrafficScenarioRequest(BaseModel):
    scenario: str = "normal"

class AnomalyMetricUpdate(BaseModel):
    packets_per_sec: float
    failed_logins_per_min: int
    bytes_transferred_kb: float

@app.get("/api/firewall/rules")
def get_rules():
    return firewall.get_firewall_rules()

@app.post("/api/firewall/rules")
def create_rule(rule: FirewallRuleCreate):
    return firewall.add_firewall_rule(rule.model_dump())

@app.put("/api/firewall/rules/{rule_id}")
def update_rule(rule_id: int, rule: FirewallRuleCreate):
    return firewall.update_firewall_rule(rule_id, rule.model_dump())

@app.delete("/api/firewall/rules/{rule_id}")
def delete_rule(rule_id: int):
    return firewall.delete_firewall_rule(rule_id)

@app.get("/api/firewall/bastion")
def get_bastion():
    return firewall.get_bastion_host()

@app.post("/api/firewall/bastion")
def update_bastion(req: BastionConfigRequest):
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    return firewall.set_bastion_host(update_data)

@app.post("/api/firewall/evaluate")
def evaluate_packet_against_firewall(req: PacketEvalRequest):
    return firewall.evaluate_packet(req.model_dump())

@app.get("/api/ids/alerts")
def get_alerts(limit: int = 50):
    return ids_engine.get_recent_alerts(limit)

@app.delete("/api/ids/alerts")
def clear_all_alerts():
    return ids_engine.clear_alerts()

@app.post("/api/ids/process-packet")
def ids_process_packet(req: PacketEvalRequest):
    alerts = ids_engine.evaluate_packet_rules(req.model_dump())
    return {"alerts": alerts, "packet": req.model_dump()}

@app.post("/api/ids/generate-traffic")
def ids_generate_traffic(req: TrafficScenarioRequest):
    return ids_engine.generate_traffic_scenario(req.scenario)

@app.post("/api/ids/update-metrics")
def ids_update_metrics(req: AnomalyMetricUpdate):
    return ids_engine.update_anomaly_metrics(
        req.packets_per_sec,
        req.failed_logins_per_min,
        req.bytes_transferred_kb
    )

@app.get("/api/threats/encyclopedia")
def get_threats():
    return threat_data.get_threat_encyclopedia()

# ============================================================================
# SYSTEM HEALTH ENDPOINT
# ============================================================================

@app.get("/api/system/health")
def health_check():
    return {
        "status": "healthy",
        "system": "CyberLab Suite Unified API",
        "modules": {
            "securetunnel": "online",
            "sentinel": "online"
        }
    }
