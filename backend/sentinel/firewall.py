import ipaddress
import datetime
from ..database import get_db

BASTION_HOST_CONFIG = {
    "ip": "192.168.1.10",
    "hostname": "bastion-gate-01.corp",
    "status": "active",
    "allowed_admin_ip": "192.168.1.50",
    "dmz_subnet": "192.168.1.0/24",
    "internal_subnet": "10.0.0.0/24",
    "description": "Hardened Bastion Host acting as the single secure gateway into the internal protected subnet. All administrative SSH connections must route through this host."
}

def ip_in_network(ip_str: str, network_str: str) -> bool:
    if network_str.upper() == "ANY" or ip_str.upper() == "ANY":
        return True
    try:
        if "/" in network_str:
            net = ipaddress.ip_network(network_str, strict=False)
            ip = ipaddress.ip_address(ip_str)
            return ip in net
        else:
            return ipaddress.ip_address(ip_str) == ipaddress.ip_address(network_str)
    except Exception:
        return ip_str == network_str

def port_matches(port_int: int, rule_port_str: str) -> bool:
    if rule_port_str.upper() == "ANY":
        return True
    try:
        if "-" in rule_port_str:
            start_p, end_p = map(int, rule_port_str.split("-"))
            return start_p <= port_int <= end_p
        return int(rule_port_str) == port_int
    except Exception:
        return False

def get_firewall_rules():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM firewall_rules ORDER BY priority ASC, id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_firewall_rule(rule_data: dict):
    conn = get_db()
    cursor = conn.cursor()
    now_str = datetime.datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO firewall_rules (name, priority, direction, protocol, source_ip, dest_ip, port, action, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rule_data.get("name", "Custom Rule"),
        int(rule_data.get("priority", 100)),
        rule_data.get("direction", "INBOUND").upper(),
        rule_data.get("protocol", "TCP").upper(),
        rule_data.get("source_ip", "ANY"),
        rule_data.get("dest_ip", "ANY"),
        str(rule_data.get("port", "ANY")),
        rule_data.get("action", "DROP").upper(),
        1 if rule_data.get("enabled", True) else 0,
        now_str
    ))
    rule_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": rule_id, "message": "Firewall rule created successfully"}

def update_firewall_rule(rule_id: int, rule_data: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE firewall_rules
    SET name = ?, priority = ?, direction = ?, protocol = ?, source_ip = ?, dest_ip = ?, port = ?, action = ?, enabled = ?
    WHERE id = ?
    """, (
        rule_data.get("name"),
        int(rule_data.get("priority")),
        rule_data.get("direction").upper(),
        rule_data.get("protocol").upper(),
        rule_data.get("source_ip"),
        rule_data.get("dest_ip"),
        str(rule_data.get("port")),
        rule_data.get("action").upper(),
        1 if rule_data.get("enabled", True) else 0,
        rule_id
    ))
    conn.commit()
    conn.close()
    return {"message": "Rule updated successfully"}

def delete_firewall_rule(rule_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM firewall_rules WHERE id = ?", (rule_id,))
    conn.commit()
    conn.close()
    return {"message": "Rule deleted"}

def set_bastion_host(config: dict):
    global BASTION_HOST_CONFIG
    BASTION_HOST_CONFIG.update(config)
    return BASTION_HOST_CONFIG

def get_bastion_host():
    return BASTION_HOST_CONFIG

def evaluate_packet(packet: dict):
    """
    Evaluates packet against firewall rules in priority order.
    Packet dict: {direction, protocol, src_ip, dst_ip, port, payload}
    """
    rules = get_firewall_rules()
    direction = packet.get("direction", "INBOUND").upper()
    protocol = packet.get("protocol", "TCP").upper()
    src_ip = packet.get("src_ip", "192.168.1.100")
    dst_ip = packet.get("dst_ip", "192.168.1.10")
    port = int(packet.get("port", 80))

    evaluation_trace = []
    matched_rule = None
    final_action = "DROP" # Default deny if no rule matches

    for rule in rules:
        if not rule["enabled"]:
            continue

        match_dir = (rule["direction"] == "ANY" or rule["direction"] == direction)
        match_proto = (rule["protocol"] == "ANY" or rule["protocol"] == protocol)
        match_src = ip_in_network(src_ip, rule["source_ip"])
        match_dst = ip_in_network(dst_ip, rule["dest_ip"])
        match_port = port_matches(port, rule["port"])

        is_match = match_dir and match_proto and match_src and match_dst and match_port

        evaluation_trace.append({
            "rule_id": rule["id"],
            "rule_name": rule["name"],
            "priority": rule["priority"],
            "matched": is_match,
            "action": rule["action"],
            "details": f"Dir: {rule['direction']}, Proto: {rule['protocol']}, Src: {rule['source_ip']}, Dst: {rule['dest_ip']}, Port: {rule['port']}"
        })

        if is_match:
            matched_rule = rule
            final_action = rule["action"]
            break

    # Bastion host inspection note
    bastion_interaction = None
    if dst_ip == BASTION_HOST_CONFIG["ip"]:
        bastion_interaction = {
            "is_bastion_targeted": True,
            "bastion_ip": BASTION_HOST_CONFIG["ip"],
            "note": f"Packet targets Bastion Host. Allowed admin IP: {BASTION_HOST_CONFIG['allowed_admin_ip']}. Source IP: {src_ip}."
        }

    return {
        "packet": packet,
        "final_action": final_action, # "ALLOW", "DROP", "REJECT"
        "matched_rule": matched_rule,
        "bastion_status": bastion_interaction,
        "trace": evaluation_trace,
        "verdict_reason": f"Matched Rule #{matched_rule['priority']} ('{matched_rule['name']}') -> {final_action}" if matched_rule else "No explicit rule matched -> Default Deny (DROP)"
    }
