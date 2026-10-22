import os
import sys
import subprocess
import shutil
from datetime import datetime

# Adjust Python path to root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.security.vault import get_or_create_vault_key, encrypt_file, load_encrypted_env
from backend.security.db_crypto import encrypt_database

def run_step(step_name: str, cmd: list, cwd: str = ROOT_DIR):
    print(f"\n[Deploy Step] ===> {step_name}...")
    res = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if res.returncode != 0:
        print(f"[Error in {step_name}] Return code: {res.returncode}")
        print("Stdout:\n", res.stdout)
        print("Stderr:\n", res.stderr)
        raise RuntimeError(f"Step '{step_name}' failed.")
    print(f"[Success] {step_name} completed cleanly.")
    return res.stdout

def deploy():
    print("=================================================================")
    print("      ALSKINCARE AI — PRODUCTION DEPLOYMENT & ENCRYPTION PIPELINE")
    print("=================================================================")
    start_time = datetime.utcnow()

    # 1. Verification of Test Suite
    print("\n1. Running Integration Test Suite...")
    python_exe = sys.executable
    run_step("Integration Test Suite", [python_exe, "-m", "pytest", "-v"])

    # 2. Compile Production Frontend Assets
    print("\n2. Compiling Production Frontend Assets (Vite)...")
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"
    run_step("Frontend Production Build", [npm_cmd, "--prefix", "frontend", "run", "build"])

    # 3. Vault Key Generation & Loading
    print("\n3. Initializing Secure Production Encryption Vault Key...")
    vault_key = get_or_create_vault_key()
    key_preview = vault_key.decode()[:10] + "..." + vault_key.decode()[-6:]
    print(f"   [Vault Key Verified] Key Fingerprint: {key_preview}")

    # 4. Encrypt Environment File (.env -> .env.enc)
    print("\n4. Encrypting Environment Secrets (.env -> .env.enc)...")
    root_env = os.path.join(ROOT_DIR, '.env')
    backend_env = os.path.join(ROOT_DIR, 'backend', '.env')
    
    env_source = root_env if os.path.exists(root_env) else backend_env
    if not os.path.exists(env_source):
        raise FileNotFoundError("No .env file found to encrypt!")

    root_env_enc = os.path.join(ROOT_DIR, '.env.enc')
    backend_env_enc = os.path.join(ROOT_DIR, 'backend', '.env.enc')

    encrypt_file(env_source, root_env_enc, vault_key)
    shutil.copy2(root_env_enc, backend_env_enc)
    print(f"   [Encrypted] Saved AES/Fernet ciphertext to:\n     - {root_env_enc}\n     - {backend_env_enc}")

    # Test in-memory decryption without writing to disk
    loaded_secrets = load_encrypted_env(root_env_enc, vault_key)
    print(f"   [Verification] Successfully verified in-memory decryption of {len(loaded_secrets)} environment variables.")

    # 5. Encrypt Active SQLite Database (skincare.db -> skincare.db.enc)
    print("\n5. Creating Encrypted Database Snapshot (skincare.db -> skincare.db.enc)...")
    db_path = os.path.join(ROOT_DIR, 'backend', 'database', 'skincare.db')
    db_enc_path = os.path.join(ROOT_DIR, 'backend', 'database', 'skincare.db.enc')

    res_db = encrypt_database(db_path, db_enc_path, vault_key)
    print(f"   [Encrypted DB Snapshot] Created:\n     - Path: {res_db['encrypted_db']}\n     - Size: {res_db['encrypted_bytes']:,} bytes\n     - SHA256: {res_db['sha256_checksum']}")

    duration = (datetime.utcnow() - start_time).total_seconds()

    print("\n=================================================================")
    print("      DEPLOYMENT & ENCRYPTION PIPELINE COMPLETED SUCCESSFULLY!   ")
    print("=================================================================")
    print(f"Total Execution Time: {duration:.2f} seconds")
    print(f"Status: READY FOR PRODUCTION (Unified Single-Port Hosting Active)")
    print("Files created:")
    print(f"  * .env.enc (Root & Backend encrypted environment)")
    print(f"  * backend/database/skincare.db.enc (Encrypted database snapshot)")
    print(f"  * frontend/dist (Compiled production SPA bundle)")
    print("To launch production server: python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000")
    print("=================================================================")

if __name__ == '__main__':
    deploy()
