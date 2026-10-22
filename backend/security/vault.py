import os
import sys
import hashlib
from typing import Optional, Tuple
from cryptography.fernet import Fernet

DEFAULT_VAULT_KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.vault_key')

def get_or_create_vault_key(key_file: str = DEFAULT_VAULT_KEY_PATH) -> bytes:
    """
    Retrieves the vault encryption key from:
    1. Environment variable ALSKINCARE_VAULT_KEY
    2. Local key file .vault_key
    3. Generates a new secure Fernet key and persists to key_file
    """
    env_key = os.environ.get('ALSKINCARE_VAULT_KEY')
    if env_key:
        return env_key.strip().encode('utf-8')

    if os.path.exists(key_file):
        with open(key_file, 'rb') as f:
            key = f.read().strip()
            if key:
                return key

    # Generate new key
    new_key = Fernet.generate_key()
    with open(key_file, 'wb') as f:
        f.write(new_key)
    return new_key

def encrypt_data(data: bytes, key: Optional[bytes] = None) -> bytes:
    """Encrypts raw bytes using Fernet (AES-128-CBC + HMAC-SHA256)."""
    cipher = Fernet(key or get_or_create_vault_key())
    return cipher.encrypt(data)

def decrypt_data(token: bytes, key: Optional[bytes] = None) -> bytes:
    """Decrypts ciphertext using Fernet."""
    cipher = Fernet(key or get_or_create_vault_key())
    return cipher.decrypt(token)

def encrypt_file(source_path: str, target_path: Optional[str] = None, key: Optional[bytes] = None) -> str:
    """Encrypts a file on disk into an encrypted .enc file."""
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")

    out_path = target_path or f"{source_path}.enc"
    with open(source_path, 'rb') as f:
        content = f.read()

    encrypted = encrypt_data(content, key)
    with open(out_path, 'wb') as f:
        f.write(encrypted)

    return out_path

def decrypt_file(encrypted_path: str, target_path: Optional[str] = None, key: Optional[bytes] = None) -> str:
    """Decrypts an encrypted file back to plaintext."""
    if not os.path.exists(encrypted_path):
        raise FileNotFoundError(f"Encrypted file not found: {encrypted_path}")

    out_path = target_path or encrypted_path.replace('.enc', '.dec')
    with open(encrypted_path, 'rb') as f:
        content = f.read()

    decrypted = decrypt_data(content, key)
    with open(out_path, 'wb') as f:
        f.write(decrypted)

    return out_path

def load_encrypted_env(env_enc_path: str, key: Optional[bytes] = None) -> dict:
    """
    Decrypts .env.enc in-memory and injects variables directly into os.environ.
    Ensures plaintext secrets are never written back to disk during deployment.
    """
    if not os.path.exists(env_enc_path):
        return {}

    with open(env_enc_path, 'rb') as f:
        encrypted_content = f.read()

    decrypted_bytes = decrypt_data(encrypted_content, key)
    text = decrypted_bytes.decode('utf-8')
    loaded = {}

    for line in text.splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip().strip("'\"")
            os.environ[k] = v
            loaded[k] = v

    return loaded
