import os
import sqlite3
import hashlib
from typing import Optional, Dict
from backend.security.vault import encrypt_file, decrypt_file, get_or_create_vault_key

def get_file_sha256(filepath: str) -> str:
    """Calculates SHA256 checksum of a file."""
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def encrypt_database(db_path: str, target_enc_path: Optional[str] = None, key: Optional[bytes] = None) -> Dict[str, str]:
    """
    Creates an encrypted production snapshot of the SQLite database.
    Performs VACUUM INTO a temporary snapshot to guarantee ACID consistency before encrypting.
    """
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    target_enc = target_enc_path or f"{db_path}.enc"
    temp_snapshot = f"{db_path}.tmp_snapshot"

    try:
        # Create consistent snapshot via SQLite VACUUM INTO
        conn = sqlite3.connect(db_path)
        if os.path.exists(temp_snapshot):
            os.remove(temp_snapshot)
        conn.execute(f"VACUUM INTO '{temp_snapshot}'")
        conn.close()

        source_hash = get_file_sha256(temp_snapshot)
        encrypt_file(temp_snapshot, target_enc, key)
        enc_size = os.path.getsize(target_enc)

        return {
            "status": "encrypted",
            "source_db": db_path,
            "encrypted_db": target_enc,
            "sha256_checksum": source_hash,
            "encrypted_bytes": enc_size
        }
    finally:
        if os.path.exists(temp_snapshot):
            os.remove(temp_snapshot)

def restore_encrypted_database(encrypted_path: str, target_db_path: str, key: Optional[bytes] = None) -> Dict[str, str]:
    """Restores an encrypted database snapshot back to active SQLite database."""
    if not os.path.exists(encrypted_path):
        raise FileNotFoundError(f"Encrypted database file not found at {encrypted_path}")

    decrypt_file(encrypted_path, target_db_path, key)
    restored_hash = get_file_sha256(target_db_path)

    # Verify SQLite readability
    conn = sqlite3.connect(target_db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA integrity_check")
    status = cur.fetchone()[0]
    conn.close()

    if status.lower() != 'ok':
        raise ValueError(f"SQLite integrity check failed after decryption: {status}")

    return {
        "status": "restored",
        "target_db": target_db_path,
        "integrity": status,
        "sha256_checksum": restored_hash
    }
