import secrets
import hashlib
import time
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

# Server Host Key (RSA 2048)
_ssh_host_private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_ssh_host_public = _ssh_host_private.public_key()
_ssh_host_pub_pem = _ssh_host_public.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
).decode("utf-8")
_ssh_host_fingerprint = hashlib.sha256(_ssh_host_public.public_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)).hexdigest()
_ssh_host_fingerprint_formatted = "SHA256:" + hashlib.sha256(_ssh_host_fingerprint.encode()).hexdigest()[:43]

ssh_sessions = {}

def init_ssh_session():
    session_id = secrets.token_hex(12)
    session = {
        "session_id": session_id,
        "step": 1,
        "client_version": "SSH-2.0-OpenSSH_9.3p1 Debian-1ubuntu3",
        "server_version": "SSH-2.0-CryptoVault_SecureHost_2.4",
        "kex_algorithm": "diffie-hellman-group14-sha256",
        "cipher": "chacha20-poly1305@openssh.com / aes256-gcm",
        "server_host_key": {
            "type": "ssh-rsa 2048",
            "fingerprint": _ssh_host_fingerprint_formatted,
            "pem": _ssh_host_pub_pem
        },
        "dh_details": None,
        "user_auth": {
            "authenticated": False,
            "method": None,
            "user": None
        },
        "session_key": None,
        "terminal_open": False,
        "logs": [
            "Step 1: Protocol Version Exchange initiated.",
            "Client sends: 'SSH-2.0-OpenSSH_9.3p1 Debian-1ubuntu3'",
            "Server responds: 'SSH-2.0-CryptoVault_SecureHost_2.4'"
        ]
    }
    ssh_sessions[session_id] = session
    return session

def next_ssh_step(session_id: str, auth_user: str = "student", auth_password: str = "cyber123"):
    if session_id not in ssh_sessions:
        raise ValueError("SSH session not found.")
    session = ssh_sessions[session_id]
    current_step = session["step"]

    if current_step == 1:
        # Step 2: Key Exchange (Diffie-Hellman)
        # RFC 3526 MODP 14 parameters
        p = 2688280370044558509015949667794301552554784918731336494799 # illustrative safe prime
        g = 2
        x = secrets.randbelow(10000000) + 1000
        y = secrets.randbelow(10000000) + 1000
        e = pow(g, x, p) # client public DH
        f = pow(g, y, p) # server public DH
        shared_K = pow(f, x, p) # shared secret K

        # Exchange Hash H = SHA256(Client_Version || Server_Version || e || f || K)
        h_data = f"{session['client_version']}:{session['server_version']}:{e}:{f}:{shared_K}".encode("utf-8")
        exchange_hash = hashlib.sha256(h_data).hexdigest()

        session["dh_details"] = {
            "prime_p": str(p),
            "generator_g": str(g),
            "client_dh_e": str(e),
            "server_dh_f": str(f),
            "shared_secret_K": str(shared_K),
            "exchange_hash_H": exchange_hash
        }
        session["step"] = 2
        session["logs"].append(
            f"Step 2: Key Exchange (KEXINIT). Client and Server agreed on 'diffie-hellman-group14-sha256'. Shared secret K derived ({str(shared_K)[:16]}...). Exchange Hash H computed."
        )

    elif current_step == 2:
        # Step 3: Server Authentication
        exchange_hash_bytes = session["dh_details"]["exchange_hash_H"].encode("utf-8")
        signature = _ssh_host_private.sign(
            exchange_hash_bytes,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        session["server_signature_hex"] = signature.hex()
        session["step"] = 3
        session["logs"].append(
            f"Step 3: Server Authentication. Server signed exchange hash H with its Host Private Key. Client verifies server fingerprint ({_ssh_host_fingerprint_formatted}) against ~/.ssh/known_hosts. Host identity confirmed!"
        )

    elif current_step == 3:
        # Step 4: User Authentication
        session["user_auth"] = {
            "authenticated": True,
            "method": "publickey/password",
            "user": auth_user
        }
        # Derive symmetric encryption key
        session_key = hashlib.sha256(f"{session['dh_details']['shared_secret_K']}:key".encode()).hexdigest()
        session["session_key"] = session_key
        session["step"] = 4
        session["logs"].append(
            f"Step 4: User Authentication. User '{auth_user}' authenticated successfully via interactive challenge. Symmetric encryption channel active."
        )

    elif current_step == 4:
        # Step 5: Secure Channel Established
        session["step"] = 5
        session["terminal_open"] = True
        session["logs"].append(
            "Step 5: Shell channel (pty-req & shell) allocated over encrypted transport. Interactive terminal session ready."
        )

    return session

def execute_ssh_command(session_id: str, command: str):
    if session_id not in ssh_sessions:
        raise ValueError("SSH session not found.")
    session = ssh_sessions[session_id]
    if not session.get("terminal_open"):
        raise ValueError("SSH channel is not yet open. Complete the handshake first.")

    cmd = command.strip().lower()
    user = session["user_auth"].get("user", "student")

    responses = {
        "whoami": user,
        "uname -a": "Linux cryptovault-node1 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux",
        "pwd": f"/home/{user}",
        "ls -la": "drwxr-xr-x 4 student student 4096 Oct  5 10:00 .\ndrwxr-xr-x 3 root    root    4096 Oct  5 09:30 ..\n-rw------- 1 student student  412 Oct  5 09:45 .bash_history\n-rw-r--r-- 1 student student 3771 Oct  5 09:30 .bashrc\ndrwx------ 2 student student 4096 Oct  5 09:35 .ssh\n-rw-r--r-- 1 student student  807 Oct  5 09:30 .profile\n-rw-r--r-- 1 student student 1024 Oct  5 10:15 network_capture.pcap",
        "cat /etc/banner": "=====================================================\n  WELCOME TO CRYPTOVAULT SECURE ACCESS NODE (SENTINEL)\n  Unauthorized access is strictly prohibited.\n  All activities are monitored and logged to SIEM.\n=====================================================",
        "uptime": " 11:20:14 up 14 days,  3:12,  2 users,  load average: 0.12, 0.08, 0.05",
        "netstat -tlpn": "Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      842/sshd: /usr/sbin\ntcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1120/nginx: master\ntcp        0      0 127.0.0.1:8000          0.0.0.0:*               LISTEN      1450/fastapi-app",
        "cat /etc/shadow": "cat: /etc/shadow: Permission denied (Requires root privileges)",
        "ip a": "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0"
    }

    output = responses.get(cmd, f"bash: {command}: command not found (Try 'whoami', 'uname -a', 'ls -la', 'uptime', 'netstat -tlpn', 'ip a', 'cat /etc/banner')")
    
    return {
        "command": command,
        "output": output,
        "encrypted_packet_hex": hashlib.sha256(command.encode()).hexdigest() + hashlib.sha256(output.encode()).hexdigest()[:32],
        "channel_id": 0,
        "time": time.strftime("%H:%M:%S")
    }
