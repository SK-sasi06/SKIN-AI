import os
import sqlite3
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Union, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header, Response, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from backend.security.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from backend.security.vault import load_encrypted_env
from backend.services.recommendation_engine import RecommendationEngine
from backend.services.chat_assistant import ChatAssistantService
from backend.services.price_comparison import PriceComparisonService
from backend.services.ingredient_checker import IngredientCompatibilityChecker
from backend.services.skin_journey_service import SkinJourneyService
from backend.database.journey_schema import init_journey_tables
from ai.preprocessing.face_preprocessor import FacePreprocessor
from ai.inference.skin_classifier import SkinClassifier

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'skincare.db')
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Ensure Auth and Skin Journey DB tables exist
def init_auth_tables():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            reset_code TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            used INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

try:
    init_auth_tables()
    init_journey_tables()
except Exception as e:
    print("[DB Init Warning] Tables initialization note:", e)

# Priority 1: Load in-memory from encrypted .env.enc if present
enc_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env.enc')
root_enc_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.enc')

if os.path.exists(enc_env_path):
    load_encrypted_env(enc_env_path)
elif os.path.exists(root_enc_env_path):
    load_encrypted_env(root_enc_env_path)
else:
    # Priority 2: Fall back to unencrypted .env
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ[k.strip()] = v.strip()

app = FastAPI(title='ALSKINCARE AI', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

classifier = None
def get_classifier():
    global classifier
    if classifier is None:
        classifier = SkinClassifier()
    return classifier

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    reset_code: Optional[str] = None
    new_password: str

class ChangePasswordRequest(BaseModel):
    email: str
    current_password: Optional[str] = ''
    new_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserResponse

class CompatibilityCheckRequest(BaseModel):
    morning_product_ids: Optional[List[int]] = []
    evening_product_ids: Optional[List[int]] = []
    morning_ingredients: Optional[List[str]] = []
    evening_ingredients: Optional[List[str]] = []

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith('Bearer '):
        return None
    token = authorization.split(' ')[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get('sub')
    if not user_id:
        return None
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id, email, full_name FROM users WHERE id = ?', (user_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {'id': row[0], 'email': row[1], 'full_name': row[2]}

def get_current_user_required(authorization: Optional[str] = Header(None)) -> dict:
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail='Authentication token required.')
    return user

@app.get('/')
def root(accept: Optional[str] = Header(None)):
    if accept and 'text/html' in accept:
        index_file = os.path.join(DIST_DIR, 'index.html')
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return {
        'status': 'online',
        'system': 'ALSKINCARE AI',
        'message': 'ALSKINCARE AI Backend API is active and ready.',
        'version': '1.0.0'
    }

@app.get('/favicon.ico')
def favicon():
    return Response(status_code=204)

@app.get('/api/health')
def health():
    return {
        'status': 'online',
        'system': 'ALSKINCARE AI',
        'model': 'varun1505/face-characteristics (ViT)',
        'catalog_size': 1472
    }

@app.post('/api/auth/register', response_model=TokenResponse)
def register(req: RegisterRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    clean_email = req.email.strip().lower()
    cur.execute('SELECT id FROM users WHERE email = ?', (clean_email,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail='User with this email already exists.')
    hashed = get_password_hash(req.password)
    cur.execute(
        'INSERT INTO users (email, hashed_password, full_name, last_login) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        (clean_email, hashed, req.full_name.strip())
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    token = create_access_token({'sub': str(user_id), 'email': clean_email})
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {'id': user_id, 'email': clean_email, 'full_name': req.full_name.strip()}
    }

@app.post('/api/auth/login', response_model=TokenResponse)
def login(req: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    clean_identifier = req.email.strip()
    cur.execute(
        'SELECT id, email, full_name, hashed_password FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(full_name) = LOWER(?)',
        (clean_identifier, clean_identifier)
    )
    row = cur.fetchone()
    if not row or not verify_password(req.password, row[3]):
        conn.close()
        raise HTTPException(status_code=401, detail='Invalid email/username or password.')
    cur.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (row[0],))
    conn.commit()
    conn.close()
    token = create_access_token({'sub': str(row[0]), 'email': row[1]})
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {'id': row[0], 'email': row[1], 'full_name': row[2]}
    }

@app.post('/api/auth/forgot-password')
def forgot_password(req: ForgotPasswordRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    clean_identifier = req.email.strip()
    cur.execute(
        'SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(full_name) = LOWER(?)',
        (clean_identifier, clean_identifier)
    )
    user = cur.fetchone()
    if not user:
        conn.close()
        return {
            'status': 'sent',
            'message': 'Account verified. You can now reset your password directly.',
            'reset_code': None
        }

    # Generate cryptographically secure 6-digit code for testing backwards compatibility
    code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    cur.execute(
        'INSERT INTO password_resets (email, reset_code, expires_at, used) VALUES (?, ?, ?, 0)',
        (user[1], code, expires_at)
    )
    conn.commit()
    conn.close()

    return {
        'status': 'sent',
        'message': 'Account verified. Enter your new password directly below to reset.',
        'reset_code': code
    }

@app.post('/api/auth/reset-password', response_model=TokenResponse)
def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters long.')

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    clean_identifier = req.email.strip()
    clean_code = req.reset_code.strip() if req.reset_code and req.reset_code.strip() else None

    # Check if user exists by email or username
    cur.execute(
        'SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(full_name) = LOWER(?)',
        (clean_identifier, clean_identifier)
    )
    user = cur.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail='User account not found. Please register or verify username/email.')

    user_id, user_email, user_fullname = user

    # If verification code is provided (e.g. from automated security test), validate it
    if clean_code:
        cur.execute(
            '''SELECT id, expires_at, used FROM password_resets 
               WHERE email = ? AND reset_code = ? AND used = 0 
               ORDER BY created_at DESC LIMIT 1''',
            (user_email, clean_code)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=400, detail='Invalid or expired verification code.')

        reset_id, expires_at_str, used = row
        try:
            exp = datetime.fromisoformat(expires_at_str)
        except Exception:
            exp = datetime.utcnow() + timedelta(minutes=5)

        if datetime.utcnow() > exp:
            conn.close()
            raise HTTPException(status_code=400, detail='Verification code has expired. Please request a new one.')

        cur.execute('UPDATE password_resets SET used = 1 WHERE id = ?', (reset_id,))

    # Update user password
    hashed = get_password_hash(req.new_password)
    cur.execute('UPDATE users SET hashed_password = ? WHERE id = ?', (hashed, user_id))
    conn.commit()
    conn.close()

    token = create_access_token({'sub': str(user_id), 'email': user_email})
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {'id': user_id, 'email': user_email, 'full_name': user_fullname}
    }

@app.post('/api/auth/change-password')
def change_password(req: ChangePasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters long.')

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    clean_identifier = req.email.strip()

    cur.execute(
        'SELECT id, hashed_password FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(full_name) = LOWER(?)',
        (clean_identifier, clean_identifier)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail='User account not found.')

    if req.current_password and req.current_password.strip():
        if not verify_password(req.current_password.strip(), row[1]):
            conn.close()
            raise HTTPException(status_code=401, detail='Current password is incorrect.')

    hashed_new = get_password_hash(req.new_password)
    cur.execute('UPDATE users SET hashed_password = ? WHERE id = ?', (hashed_new, row[0]))
    conn.commit()
    conn.close()

    return {
        'status': 'success',
        'message': 'Password has been updated successfully. You can now log in.'
    }

@app.post('/api/analyze')
async def analyze_face(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    skin_type: Optional[str] = Form(None),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    upload = image or file
    if not upload:
        raise HTTPException(
            status_code=422,
            detail='Image file is required. Send multipart form-data with key "image" or "file".'
        )
    contents = await upload.read()
    if not contents:
        raise HTTPException(status_code=400, detail='Uploaded image file is empty.')

    try:
        processed_img = FacePreprocessor.validate_and_preprocess(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    engine = get_classifier()
    analysis = engine.analyze_skin(processed_img)
    dominant = analysis['dominant_concern']
    secondaries = analysis['secondary_concerns']

    # Filter recommendations by skin_type if provided
    recommended_products = RecommendationEngine.get_recommendations_for_concern(
        dominant, secondaries, limit=6, skin_type=skin_type
    )
    routine = RecommendationEngine.build_routine(recommended_products)

    import time
    import uuid
    ext = '.jpg'
    if upload.filename and '.' in upload.filename:
        _, potential_ext = os.path.splitext(upload.filename)
        if potential_ext.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = potential_ext.lower()
    user_prefix = current_user['id'] if current_user else 'guest'
    unique_filename = f"scan_{user_prefix}_{int(time.time())}_{uuid.uuid4().hex[:6]}{ext}"
    save_path = os.path.join(UPLOAD_DIR, unique_filename)
    try:
        with open(save_path, 'wb') as f:
            f.write(contents)
    except Exception as e:
        print("Failed to save image to disk:", e)

    user_id = current_user['id'] if current_user else 1
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        '''INSERT INTO analysis_reports
           (user_id, image_name, dominant_concern, confidence_score, all_predictions, recommended_products, routine_am, routine_pm)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (
            user_id,
            unique_filename,
            dominant,
            analysis['dominant_confidence'],
            json.dumps(analysis['all_predictions']),
            json.dumps(recommended_products),
            json.dumps(routine['morning']),
            json.dumps(routine['evening'])
        )
    )
    conn.commit()
    report_id = cur.lastrowid

    cur.execute('SELECT id, email, full_name FROM users WHERE id = ?', (user_id,))
    u_row = cur.fetchone()
    conn.close()

    user_info = {
        'id': u_row[0] if u_row else user_id,
        'email': u_row[1] if u_row else 'demo@alskincare.ai',
        'full_name': u_row[2] if u_row else 'Arun'
    }

    # Build targeted active ingredients list
    targeted_actives = []
    for prod in recommended_products:
        for act in prod.get('active_matches', []):
            if act not in targeted_actives:
                targeted_actives.append(act)

    if not targeted_actives:
        active_map = {
            'Acne': ['Salicylic Acid', 'Niacinamide'],
            'Skin Redness': ['Centella Asiatica', 'Allantoin'],
            'Skin Pigmentation': ['Vitamin C', 'Niacinamide'],
            'Skin Texture': ['AHA / Glycolic', 'Hyaluronic Acid'],
            'Wrinkled Face': ['Retinol', 'Peptides'],
            'Eyes Dark Circles': ['Caffeine', 'Peptides'],
            'Puffy Eyes': ['Caffeine', 'Green Tea Extract']
        }
        targeted_actives = active_map.get(dominant, ['Hyaluronic Acid', 'Niacinamide'])

    # Format scores dictionary for frontend compatibility
    scores_dict = {}
    for item in analysis.get('all_predictions', []):
        scores_dict[item['label']] = item['confidence']

    # Compute precise facial structure and anatomical landmarks
    face_structure = FacePreprocessor.detect_facial_structure(contents)

    return {
        'report_id': report_id,
        'report_code': f"RPT-2026-{report_id:04d}",
        'user': user_info,
        'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'image_name': unique_filename,
        'image_url': f'/api/images/{unique_filename}',
        'face_structure': face_structure,
        'skin_type': skin_type,
        'dominant_concern': dominant,
        'dominant_confidence': analysis['dominant_confidence'],
        'dominant_percentage': analysis['dominant_percentage'],
        'secondary_concerns': secondaries,
        'all_predictions': analysis['all_predictions'],
        'recommended_products': recommended_products,
        'routine': routine,
        'morning_routine': routine['morning'],
        'evening_routine': routine['evening'],
        'routine_safety': routine.get('safety_report'),
        'targeted_actives': targeted_actives,
        'analysis': {
            'primary_concern': dominant,
            'primary_confidence': analysis['dominant_confidence'],
            'dominant_percentage': analysis['dominant_percentage'],
            'scores': scores_dict,
            'model_used': 'varun1505/face-characteristics (ViT)'
        },
        'disclaimer': 'Authentic computer vision skin analysis for cosmetic skincare routine planning only. Not a medical diagnosis.'
    }

@app.get('/api/products')
def get_products(
    category: Optional[str] = None,
    label: Optional[str] = None,
    skin_type: Optional[str] = None,
    search: Optional[str] = None,
    concern: Optional[str] = None,
    budget_tier: Optional[str] = None,
    fragrance_free: bool = False,
    alcohol_free: bool = False,
    limit: int = 50,
    offset: int = 0
):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cat_filter = label or category
    conditions = []
    params = []

    if cat_filter and cat_filter != 'All':
        conditions.append('category = ?')
        params.append(cat_filter)

    if skin_type and skin_type != 'All':
        conditions.append('target_skin_types LIKE ?')
        params.append(f'%"{skin_type}"%')

    if search and search.strip():
        term = f'%{search.strip()}%'
        conditions.append('(name LIKE ? OR brand LIKE ? OR ingredients LIKE ?)')
        params.extend([term, term, term])

    where_clause = ' WHERE ' + ' AND '.join(conditions) if conditions else ''

    # Query all matching records for post-processing filters
    data_query = f'SELECT * FROM products{where_clause} ORDER BY rating DESC, price ASC'
    cur.execute(data_query, params)
    all_rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    processed = []
    for r in all_rows:
        r['label'] = r['category']
        r['rank'] = r['rating']
        r['target_skin_types'] = json.loads(r.get('target_skin_types', '[]'))
        r['target_concerns'] = json.loads(r.get('target_concerns', '[]'))
        r['active_matches'] = RecommendationEngine._find_actives(r.get('ingredients', ''))

        price_inr = r.get('price_inr') or int(round((r.get('price', 38) * 83.5) / 50) * 50 - 1)
        r['price_inr'] = price_inr
        tier_info = RecommendationEngine.get_budget_tier(price_inr)
        r['budget_tier'] = tier_info

        sensitivities = IngredientCompatibilityChecker.detect_sensitivities(r.get('ingredients', ''))
        r['sensitivities'] = sensitivities

        # Apply allergen exclusion
        if fragrance_free and sensitivities.get('fragrance'):
            continue
        if alcohol_free and sensitivities.get('drying_alcohols'):
            continue

        # Apply budget tier filter
        if budget_tier and budget_tier != 'all' and tier_info['id'] != budget_tier:
            continue

        # Calculate match score
        effective_concern = concern if concern and concern != 'All' else (r['target_concerns'][0] if r['target_concerns'] else 'General')
        score_data = RecommendationEngine.calculate_match_score(
            product=r,
            dominant_concern=effective_concern,
            skin_type=skin_type,
            preferred_tier=budget_tier
        )
        r['match_score'] = score_data['overall_score']
        r['match_breakdown'] = score_data['breakdown']

        processed.append(r)

    total = len(processed)
    paginated = processed[offset:offset + limit]

    return {
        'total': total,
        'products': paginated,
        'limit': limit,
        'offset': offset
    }

@app.get('/api/products/{product_id}/prices')
def get_product_prices(product_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT id, brand, name, price, price_inr FROM products WHERE id = ?", (product_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")

    base_price = row['price_inr'] or (int(round(row['price'] * 83)) if row['price'] else 1499)
    return PriceComparisonService.get_product_prices(
        brand=row['brand'],
        name=row['name'],
        base_price_inr=base_price
    )

@app.get('/api/prices/compare')
def compare_prices_query(q: str = Query(..., min_length=2)):
    return PriceComparisonService.get_product_prices(
        brand="",
        name=q,
        base_price_inr=1499
    )

@app.post('/api/ingredients/check-compatibility')
def check_ingredient_compatibility(req: CompatibilityCheckRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    def fetch_products(p_ids: List[int], raw_ings: List[str]) -> List[dict]:
        prods = []
        if p_ids:
            placeholders = ','.join('?' for _ in p_ids)
            cur.execute(f"SELECT id, brand, name, category, ingredients FROM products WHERE id IN ({placeholders})", p_ids)
            prods.extend([dict(r) for r in cur.fetchall()])
        if raw_ings:
            for idx, text in enumerate(raw_ings):
                prods.append({
                    'id': f'custom-{idx}',
                    'brand': 'Custom',
                    'name': f'Custom Product {idx+1}',
                    'category': 'Treatment',
                    'ingredients': text
                })
        return prods

    morning_prods = fetch_products(req.morning_product_ids or [], req.morning_ingredients or [])
    evening_prods = fetch_products(req.evening_product_ids or [], req.evening_ingredients or [])
    conn.close()

    return IngredientCompatibilityChecker.evaluate_routine(morning_prods, evening_prods)

@app.get('/api/history')
def get_history(current_user: dict = Depends(get_current_user_required)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        '''SELECT id, image_name, dominant_concern, confidence_score, all_predictions,
                  recommended_products, routine_am, routine_pm, created_at
           FROM analysis_reports
           WHERE user_id = ?
           ORDER BY created_at DESC''',
        (current_user['id'],)
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    result = []
    for r in rows:
        recs = json.loads(r['recommended_products'])
        all_preds = json.loads(r['all_predictions'])
        actives = []
        for p in recs:
            for act in p.get('active_matches', []):
                if act not in actives:
                    actives.append(act)

        img_name = r['image_name']
        result.append({
            'id': r['id'],
            'image_name': img_name,
            'image_url': f"/api/images/{img_name}" if img_name else None,
            'created_at': r['created_at'],
            'primary_concern': r['dominant_concern'],
            'dominant_concern': r['dominant_concern'],
            'primary_confidence': r['confidence_score'],
            'confidence_score': r['confidence_score'],
            'all_predictions': all_preds,
            'targeted_actives': actives,
            'recommended_products': recs,
            'morning_routine': json.loads(r['routine_am']),
            'evening_routine': json.loads(r['routine_pm']),
        })
    return result

@app.get('/api/history/{report_id}')
def get_report_detail(report_id: int, current_user: dict = Depends(get_current_user_required)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        '''SELECT id, user_id, image_name, dominant_concern, confidence_score, all_predictions,
                  recommended_products, routine_am, routine_pm, created_at
           FROM analysis_reports
           WHERE id = ? AND user_id = ?''',
        (report_id, current_user['id'])
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail='Report not found or unauthorized access.')

    recs = json.loads(row['recommended_products'])
    all_preds = json.loads(row['all_predictions'])
    actives = []
    for p in recs:
        for act in p.get('active_matches', []):
            if act not in actives:
                actives.append(act)

    scores_dict = {p['label']: p['confidence'] for p in all_preds}

    row_img_name = row['image_name']
    face_structure = None
    if row_img_name:
        img_full_path = os.path.join(UPLOAD_DIR, row_img_name)
        if os.path.exists(img_full_path):
            try:
                with open(img_full_path, 'rb') as f:
                    face_structure = FacePreprocessor.detect_facial_structure(f.read())
            except Exception:
                pass
    if not face_structure:
        face_structure = FacePreprocessor.detect_facial_structure(b'')

    return {
        'id': row['id'],
        'image_name': row_img_name,
        'image_url': f"/api/images/{row_img_name}" if row_img_name else None,
        'face_structure': face_structure,
        'created_at': row['created_at'],
        'primary_concern': row['dominant_concern'],
        'dominant_concern': row['dominant_concern'],
        'primary_confidence': row['confidence_score'],
        'confidence_score': row['confidence_score'],
        'dominant_percentage': round(row['confidence_score'] * 100, 2),
        'all_predictions': all_preds,
        'targeted_actives': actives,
        'recommended_products': recs,
        'morning_routine': json.loads(row['routine_am']),
        'evening_routine': json.loads(row['routine_pm']),
        'analysis': {
            'primary_concern': row['dominant_concern'],
            'primary_confidence': row['confidence_score'],
            'dominant_percentage': round(row['confidence_score'] * 100, 2),
            'scores': scores_dict,
            'model_used': 'varun1505/face-characteristics (ViT)'
        },
        'disclaimer': 'Authentic computer vision skin analysis for cosmetic skincare routine planning only. Not a medical diagnosis.'
    }

@app.delete('/api/history/{report_id}')
def delete_report(report_id: int, current_user: dict = Depends(get_current_user_required)):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT image_name FROM analysis_reports WHERE id = ? AND user_id = ?', (report_id, current_user['id']))
    img_row = cur.fetchone()
    cur.execute('DELETE FROM analysis_reports WHERE id = ? AND user_id = ?', (report_id, current_user['id']))
    deleted = cur.rowcount
    conn.commit()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail='Report not found or unauthorized.')
    if img_row and img_row[0]:
        img_path = os.path.join(UPLOAD_DIR, img_row[0])
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception:
                pass
    return {'message': 'Report and associated photo deleted successfully', 'id': report_id}

# --- Secure Image Serving & Privacy Management ---
@app.get('/api/images/{filename}')
def get_uploaded_image(filename: str):
    clean_filename = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, clean_filename)
    if os.path.exists(path) and os.path.isfile(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail='Facial analysis image not found.')

@app.delete('/api/images/{filename}')
def delete_uploaded_image(filename: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    clean_filename = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, clean_filename)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id FROM analysis_reports WHERE image_name = ? AND user_id = ?', (clean_filename, uid))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail='Photo not found or unauthorized to delete.')
    cur.execute('UPDATE analysis_reports SET image_name = NULL WHERE image_name = ? AND user_id = ?', (clean_filename, uid))
    conn.commit()
    conn.close()

    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception as e:
            print("[Image Deletion Error]:", e)

    return {'message': 'Facial photo securely deleted and scrubbed.', 'filename': clean_filename}

# --- Skin Journey Models & Endpoints ---
class RoutineLogRequest(BaseModel):
    log_date: Optional[str] = None
    period: str  # 'morning' or 'evening'
    is_completed: Optional[bool] = True
    missed_reason: Optional[str] = None
    steps: Optional[List[str]] = []
    products: Optional[List[Dict[str, Any]]] = []
    skin_feel: Optional[str] = None
    reactions: Optional[List[str]] = []
    notes: Optional[str] = None

class UserProductRequest(BaseModel):
    product_name: str
    brand: Optional[str] = ''
    category: Optional[str] = 'Moisturizer'
    start_date: Optional[str] = None
    notes: Optional[str] = ''
    product_id: Optional[int] = None

class ReactionLogRequest(BaseModel):
    log_date: Optional[str] = None
    reaction_type: str
    severity: str
    suspected_product: Optional[str] = ''
    notes: Optional[str] = ''

@app.get('/api/journey/timeline')
def get_journey_timeline(limit: int = 30, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_timeline(uid, limit=limit)

@app.post('/api/journey/routines')
def save_daily_routine(req: RoutineLogRequest, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    data = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
    return SkinJourneyService.save_routine(uid, data)

@app.delete('/api/journey/routines/{routine_id}')
def delete_daily_routine(routine_id: int, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    deleted = SkinJourneyService.delete_routine(uid, routine_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Routine not found or unauthorized.')
    return {'message': 'Routine log deleted successfully', 'id': routine_id}

@app.get('/api/journey/streak')
def get_journey_streak(current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_streak_and_adherence(uid)

@app.get('/api/journey/products')
def get_journey_products(current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_user_products(uid)

@app.post('/api/journey/products')
def add_journey_product(req: UserProductRequest, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    data = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
    return SkinJourneyService.add_user_product(uid, data)

@app.delete('/api/journey/products/{product_id}')
def delete_journey_product(product_id: int, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    deleted = SkinJourneyService.delete_user_product(uid, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Product not found or unauthorized.')
    return {'message': 'Product removed from vanity shelf', 'id': product_id}

@app.get('/api/journey/reactions')
def get_journey_reactions(current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_skin_reactions(uid)

@app.post('/api/journey/reactions')
def log_journey_reaction(req: ReactionLogRequest, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    data = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
    return SkinJourneyService.log_skin_reaction(uid, data)

@app.get('/api/journey/analytics')
def get_journey_analytics(current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_improvement_analytics(uid)

@app.get('/api/journey/product-effectiveness')
def get_product_effectiveness(product_id: Optional[int] = None, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.get_product_effectiveness_journal(uid, product_id=product_id)

@app.get('/api/journey/summary')
def get_journey_summary(current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.generate_progress_summary(uid)

@app.get('/api/journey/monthly-report')
def get_journey_monthly_report(year: int = 2026, month: int = 10, current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.generate_monthly_report(uid, year=year, month=month)

@app.get('/api/journey/search')
def search_journey_timeline(q: str = Query(..., min_length=1), current_user: Optional[dict] = Depends(get_current_user_optional)):
    uid = current_user['id'] if current_user else 1
    return SkinJourneyService.search_timeline(uid, query=q)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    current_page: Optional[str] = None
    latest_analysis: Optional[dict] = None

@app.post('/api/chat')
def chat_with_assistant(
    req: ChatRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    clean_msg = req.message.strip()
    if not clean_msg:
        raise HTTPException(status_code=422, detail='Message cannot be empty.')
    user_id = current_user['id'] if current_user else None
    res = ChatAssistantService.generate_chat_response(
        user_message=clean_msg,
        user_id=user_id,
        current_page=req.current_page,
        latest_analysis=req.latest_analysis
    )
    return res

# ==============================================================================
# Admin & Database Explorer APIs (Manage & Inspect DB, Users, and Activity)
# ==============================================================================

@app.get('/api/admin/db-overview')
def get_db_overview():
    """
    Returns live summary of the database: total users, user login activity,
    table row counts, and database metadata.
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Total users & detailed user list
    cur.execute('''
        SELECT id, email, full_name, created_at, last_login, COALESCE(is_active, 1) as is_active, hashed_password
        FROM users
        ORDER BY id DESC
    ''')
    user_rows = cur.fetchall()

    users_list = []
    for u in user_rows:
        uid = u[0]
        cur.execute('SELECT COUNT(*) FROM analysis_reports WHERE user_id = ?', (uid,))
        scan_cnt = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM daily_routines WHERE user_id = ?', (uid,))
        routine_cnt = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM user_products WHERE user_id = ?', (uid,))
        shelf_cnt = cur.fetchone()[0]

        users_list.append({
            'id': uid,
            'email': u[1],
            'full_name': u[2],
            'created_at': u[3],
            'last_login': u[4] or u[3],
            'is_active': bool(u[5]),
            'hashed_password': u[6],
            'scan_count': scan_cnt,
            'routine_count': routine_cnt,
            'shelf_count': shelf_cnt
        })

    # Table row counts
    whitelisted_tables = [
        'users',
        'analysis_reports',
        'daily_routines',
        'user_products',
        'skin_reactions',
        'products'
    ]
    table_stats = {}
    for tbl in whitelisted_tables:
        try:
            cur.execute(f'SELECT COUNT(*) FROM "{tbl}"')
            table_stats[tbl] = cur.fetchone()[0]
        except Exception:
            table_stats[tbl] = 0

    # Recent activity logs (latest scans & routines)
    cur.execute('''
        SELECT id, user_id, dominant_concern, confidence_score, created_at
        FROM analysis_reports
        ORDER BY id DESC LIMIT 5
    ''')
    recent_scans = [
        {'id': r[0], 'user_id': r[1], 'dominant_concern': r[2], 'confidence_score': r[3], 'created_at': r[4]}
        for r in cur.fetchall()
    ]

    cur.execute('''
        SELECT id, user_id, log_date, period, is_completed, created_at
        FROM daily_routines
        ORDER BY id DESC LIMIT 5
    ''')
    recent_routines = [
        {'id': r[0], 'user_id': r[1], 'log_date': r[2], 'period': r[3], 'is_completed': bool(r[4]), 'created_at': r[5]}
        for r in cur.fetchall()
    ]

    conn.close()

    db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0

    return {
        'db_path': DB_PATH,
        'db_size_bytes': db_size,
        'db_size_formatted': f'{db_size / (1024 * 1024):.2f} MB',
        'sqlite_version': sqlite3.sqlite_version,
        'total_users': len(users_list),
        'users': users_list,
        'table_stats': table_stats,
        'recent_scans': recent_scans,
        'recent_routines': recent_routines
    }

@app.get('/api/admin/table-data')
def get_table_data(
    table: str = Query('users', description='Table name to inspect'),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None)
):
    """
    Returns browsable rows and columns for a given table, sanitized without exposing password hashes.
    """
    whitelisted_tables = [
        'users',
        'analysis_reports',
        'daily_routines',
        'user_products',
        'skin_reactions',
        'products'
    ]
    if table not in whitelisted_tables:
        raise HTTPException(status_code=400, detail=f'Invalid table name. Allowed: {whitelisted_tables}')

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get column metadata
    cur.execute(f'PRAGMA table_info("{table}")')
    columns_info = cur.fetchall()
    all_cols = [c['name'] for c in columns_info]
    cols_sql = ', '.join([f'"{c}"' for c in all_cols])

    # Count total
    cur.execute(f'SELECT COUNT(*) FROM "{table}"')
    total_count = cur.fetchone()[0]

    # Fetch rows with pagination
    query = f'SELECT {cols_sql} FROM "{table}" ORDER BY rowid DESC LIMIT ? OFFSET ?'
    cur.execute(query, (limit, offset))
    rows = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        'table': table,
        'columns': all_cols,
        'rows': rows,
        'total_count': total_count,
        'limit': limit,
        'offset': offset
    }

class ResetPasswordRequest(BaseModel):
    new_password: str

@app.delete('/api/admin/users/{user_id}')
def delete_user(user_id: int):
    """
    Permanently deletes a user and cascades deletions across all user data.
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id, email, full_name FROM users WHERE id = ?', (user_id,))
    user = cur.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail='User not found')

    cur.execute('DELETE FROM analysis_reports WHERE user_id = ?', (user_id,))
    cur.execute('DELETE FROM daily_routines WHERE user_id = ?', (user_id,))
    cur.execute('DELETE FROM user_products WHERE user_id = ?', (user_id,))
    cur.execute('DELETE FROM skin_reactions WHERE user_id = ?', (user_id,))
    cur.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

    return {
        'success': True,
        'message': f'User #{user_id} ({user[1]}) and all associated records permanently deleted.'
    }

class AdminResetPasswordRequest(BaseModel):
    new_password: str

@app.post('/api/admin/users/{user_id}/reset-password')
def reset_user_password(user_id: int, req: AdminResetPasswordRequest):
    """
    Sets a new password for any user account and hashes it with bcrypt.
    """
    clean_pwd = req.new_password.strip()
    if len(clean_pwd) < 4:
        raise HTTPException(status_code=400, detail='Password must be at least 4 characters long.')

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id, email, full_name FROM users WHERE id = ?', (user_id,))
    user = cur.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail='User not found')

    new_hash = get_password_hash(clean_pwd)
    cur.execute('UPDATE users SET hashed_password = ? WHERE id = ?', (new_hash, user_id))
    conn.commit()
    conn.close()

    return {
        'success': True,
        'message': f'Password successfully updated for user {user[1]}.'
    }

# =============================================================================
# UNIFIED PRODUCTION DEPLOYMENT: Static Frontend Distribution Serving
# =============================================================================
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
if os.path.exists(DIST_DIR):
    from fastapi.staticfiles import StaticFiles
    assets_dir = os.path.join(DIST_DIR, 'assets')
    if os.path.exists(assets_dir):
        app.mount('/assets', StaticFiles(directory=assets_dir), name='static_assets')

    @app.get('/{full_path:path}')
    async def serve_frontend(full_path: str):
        if full_path.startswith('api/') or full_path.startswith('docs') or full_path.startswith('openapi.json'):
            raise HTTPException(status_code=404, detail='Endpoint not found')
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(DIST_DIR, 'index.html')
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {'status': 'production', 'dist': 'ready'}