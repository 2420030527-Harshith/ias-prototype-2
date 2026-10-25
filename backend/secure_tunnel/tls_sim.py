import os
import secrets
import hashlib
import hmac
import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# Simulated server credentials for TLS Handshake
_server_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_server_public_key = _server_private_key.public_key()
_server_pub_pem = _server_public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
).decode("utf-8")

# In-memory handshake sessions
tls_sessions = {}

def prf_sha256(secret: bytes, label: str, seed: bytes, length: int) -> bytes:
    """Pseudo-Random Function (PRF) implementation for TLS 1.2 based on HMAC-SHA256"""
    label_and_seed = label.encode("utf-8") + seed
    out = b""
    a = label_and_seed
    while len(out) < length:
        a = hmac.new(secret, a, hashlib.sha256).digest()
        out += hmac.new(secret, a + label_and_seed, hashlib.sha256).digest()
    return out[:length]

def init_tls_handshake():
    """Initializes a new TLS Handshake session"""
    session_id = secrets.token_hex(16)
    
    # Step 1: Client Hello
    client_random = secrets.token_hex(32)
    cipher_suites = [
        {"id": "0x009C", "name": "TLS_RSA_WITH_AES_128_GCM_SHA256", "recommended": True},
        {"id": "0xC02F", "name": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", "recommended": False},
        {"id": "0x0035", "name": "TLS_RSA_WITH_AES_256_CBC_SHA", "recommended": False},
        {"id": "0x1301", "name": "TLS_AES_128_GCM_SHA256 (TLS 1.3)", "recommended": False}
    ]

    session = {
        "session_id": session_id,
        "step": 1,
        "client_random": client_random,
        "supported_ciphers": cipher_suites,
        "tls_version": "TLSv1.2",
        "server_random": None,
        "selected_cipher": None,
        "pre_master_secret": None,
        "pre_master_secret_encrypted": None,
        "master_secret": None,
        "session_keys": None,
        "handshake_completed": False,
        "logs": [
            f"Step 1 [Client -> Server]: Client Hello sent. TLS Version: TLSv1.2, Client Random: {client_random[:16]}..., Offered {len(cipher_suites)} cipher suites."
        ]
    }
    tls_sessions[session_id] = session
    return session

def next_tls_step(session_id: str):
    if session_id not in tls_sessions:
        raise ValueError("TLS session not found or expired.")

    session = tls_sessions[session_id]
    current_step = session["step"]

    if current_step == 1:
        # Advance to Step 2: Server Hello & Certificate
        server_random = secrets.token_hex(32)
        selected_cipher = "TLS_RSA_WITH_AES_128_GCM_SHA256"
        session["server_random"] = server_random
        session["selected_cipher"] = selected_cipher
        session["server_cert_pem"] = _server_pub_pem
        session["step"] = 2
        session["logs"].append(
            f"Step 2 [Server -> Client]: Server Hello sent. Selected Cipher: {selected_cipher}. Server Random: {server_random[:16]}... Server sent X.509 Certificate with RSA 2048-bit Public Key."
        )

    elif current_step == 2:
        # Advance to Step 3: Client Key Exchange
        # Client generates 48-byte Pre-Master Secret
        # (2 bytes protocol version + 46 random bytes)
        pre_master_raw = b"\x03\x03" + os.urandom(46)
        session["pre_master_secret_hex"] = pre_master_raw.hex()

        # Client encrypts Pre-Master Secret with Server's RSA Public Key
        pad = padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
        encrypted_pre_master = _server_public_key.encrypt(pre_master_raw, pad)
        session["pre_master_secret_encrypted"] = base64.b64encode(encrypted_pre_master).decode("utf-8")
        session["step"] = 3
        session["logs"].append(
            f"Step 3 [Client -> Server]: Client Key Exchange. Client generated 48-byte Pre-Master Secret, encrypted it with Server's RSA Public Key ({len(encrypted_pre_master)} bytes), and sent it across the wire."
        )

    elif current_step == 3:
        # Advance to Step 4: Session Key Generation
        # Server decrypts Pre-Master Secret
        encrypted_bytes = base64.b64decode(session["pre_master_secret_encrypted"])
        pad = padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
        decrypted_pre_master = _server_private_key.decrypt(encrypted_bytes, pad)

        # Both compute Master Secret: PRF(pre_master_secret, "master secret", Client_Random + Server_Random) -> 48 bytes
        seed = bytes.fromhex(session["client_random"]) + bytes.fromhex(session["server_random"])
        master_secret = prf_sha256(decrypted_pre_master, "master secret", seed, 48)
        session["master_secret_hex"] = master_secret.hex()

        # Key expansion: generate symmetric keys (Client Write Key: 16 bytes, Server Write Key: 16 bytes, IVs: 4 bytes each)
        key_block = prf_sha256(master_secret, "key expansion", seed, 40)
        client_write_key = key_block[0:16]
        server_write_key = key_block[16:32]
        client_iv = key_block[32:36]
        server_iv = key_block[36:40]

        session["session_keys"] = {
            "client_write_key_hex": client_write_key.hex(),
            "server_write_key_hex": server_write_key.hex(),
            "client_iv_hex": client_iv.hex(),
            "server_iv_hex": server_iv.hex(),
            "cipher_algorithm": "AES-128-GCM"
        }
        session["step"] = 4
        session["logs"].append(
            f"Step 4 [Independent Computation]: Both Client & Server computed Master Secret ({master_secret.hex()[:16]}...) via PRF-SHA256 and expanded session keys (AES-128-GCM keys & IVs)."
        )

    elif current_step == 4:
        # Advance to Step 5: Finished
        session["step"] = 5
        session["handshake_completed"] = True
        session["logs"].append(
            "Step 5 [Mutual Verification]: Client Finished and Server Finished messages exchanged and authenticated. Symmetric TLS tunnel is active and secure!"
        )

    return session

def transmit_tls_payload(session_id: str, plaintext: str):
    """
    Encrypts application data payload using the established TLS symmetric session key (AES-128-GCM).
    """
    if session_id not in tls_sessions:
        raise ValueError("TLS session not found.")
    session = tls_sessions[session_id]
    if not session.get("handshake_completed"):
        raise ValueError("TLS handshake must be completed before sending encrypted application data.")

    client_key = bytes.fromhex(session["session_keys"]["client_write_key_hex"])
    base_iv = bytes.fromhex(session["session_keys"]["client_iv_hex"])
    nonce = base_iv + os.urandom(8) # 12-byte GCM nonce

    cipher = Cipher(algorithms.AES(client_key), modes.GCM(nonce))
    encryptor = cipher.encryptor()
    
    # Associated Data: TLS Record Header (Type 0x17 for Application Data, Version 0x0303, Length)
    record_header = b"\x17\x03\x03" + len(plaintext.encode("utf-8")).to_bytes(2, byteorder="big")
    encryptor.authenticate_additional_data(record_header)
    
    ciphertext = encryptor.update(plaintext.encode("utf-8")) + encryptor.finalize()
    auth_tag = encryptor.tag

    # Wire frame representation
    wire_bytes = record_header + nonce + ciphertext + auth_tag

    # Server decrypts
    decryptor = Cipher(algorithms.AES(client_key), modes.GCM(nonce, auth_tag)).decryptor()
    decryptor.authenticate_additional_data(record_header)
    decrypted_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    return {
        "plaintext": plaintext,
        "tls_record_header_hex": record_header.hex(),
        "record_type": "0x17 (Application Data)",
        "tls_version": "0x0303 (TLS 1.2)",
        "nonce_hex": nonce.hex(),
        "ciphertext_hex": ciphertext.hex(),
        "auth_tag_hex": auth_tag.hex(),
        "wire_payload_b64": base64.b64encode(wire_bytes).decode("utf-8"),
        "wire_payload_hex": wire_bytes.hex(),
        "decrypted_by_server": decrypted_plaintext.decode("utf-8"),
        "integrity_verified": True
    }
