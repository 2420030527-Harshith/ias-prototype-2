import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cybersuite.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Firewall Rules table for Sentinel
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS firewall_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        priority INTEGER NOT NULL,
        direction TEXT NOT NULL,
        protocol TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        dest_ip TEXT NOT NULL,
        port TEXT NOT NULL,
        action TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)
    
    # IDS Alerts history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ids_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        severity TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        dest_ip TEXT NOT NULL,
        port INTEGER,
        description TEXT NOT NULL,
        raw_data TEXT
    )
    """)
    
    # Insert default firewall rules if empty
    cursor.execute("SELECT COUNT(*) as count FROM firewall_rules")
    if cursor.fetchone()["count"] == 0:
        default_rules = [
            ("Block Telnet Inbound", 10, "INBOUND", "TCP", "ANY", "ANY", "23", "DROP", 1, datetime.datetime.utcnow().isoformat()),
            ("Allow Bastion SSH Access", 20, "INBOUND", "TCP", "192.168.1.50", "192.168.1.10", "22", "ALLOW", 1, datetime.datetime.utcnow().isoformat()),
            ("Block All Other SSH", 30, "INBOUND", "TCP", "ANY", "192.168.1.10", "22", "DROP", 1, datetime.datetime.utcnow().isoformat()),
            ("Allow Inbound HTTPS", 40, "INBOUND", "TCP", "ANY", "ANY", "443", "ALLOW", 1, datetime.datetime.utcnow().isoformat()),
            ("Allow Inbound HTTP", 50, "INBOUND", "TCP", "ANY", "ANY", "80", "ALLOW", 1, datetime.datetime.utcnow().isoformat()),
            ("Block Suspicious Malicious Subnet", 60, "INBOUND", "ANY", "203.0.113.0/24", "ANY", "ANY", "DROP", 1, datetime.datetime.utcnow().isoformat()),
            ("Default Inbound Drop", 999, "INBOUND", "ANY", "ANY", "ANY", "ANY", "DROP", 1, datetime.datetime.utcnow().isoformat()),
        ]
        cursor.executemany("""
        INSERT INTO firewall_rules (name, priority, direction, protocol, source_ip, dest_ip, port, action, enabled, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_rules)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
