# ALSKINCARE AI 🌿✨
### Vision Transformer Skin Analysis & Sephora Catalog Recommendation Engine

ALSKINCARE AI is an end-to-end full-stack web application designed for objective facial skin concern analysis and personalized AM/PM skincare routine recommendation. Built strictly with **verified public datasets and models**, avoiding synthetic or fabricated outputs.

---

## 🔬 Core Innovations & Verified Architecture

1. **Authentic AI Vision Transformer Pipeline**:
   - Model: [`varun1505/face-characteristics`](https://huggingface.co/varun1505/face-characteristics) (`google/vit-base-patch16-224` fine-tuned).
   - 7 Classified Facial Characteristics: `Acne`, `Eyes Dark Circles`, `Puffy Eyes`, `Skin Pigmentation`, `Skin Redness`, `Skin Texture`, `Wrinkled Face`.
   - Real-time softmax probability distribution with secondary concern detection.

2. **Real-World Product Dataset (1,472 Products)**:
   - Source: Authentic Sephora commercial skincare catalog benchmark (`cosmetics.csv`).
   - Categorized across 6 standard classes: Moisturizer, Cleanser, Treatment, Face Mask, Eye Cream, Sunscreen.
   - Comprehensive INCI ingredients with dermatologically mapped active ingredients.

3. **Active Ingredient Matching & AM/PM Regimen Assembly**:
   - Algorithmic matching between detected concerns and proven topical actives (Salicylic Acid, Niacinamide, Vitamin C, Retinoids, Centella, Caffeine, Peptides, Hyaluronic Acid).
   - Structured 3-step Morning (Cleanser/Treatment, Moisturizer, Sunscreen) and Evening (Cleanser, Targeted Treatment, Night Barrier Cream) routines.

4. **Security & Data Persistence**:
   - SQLite relational storage with user authentication via Bcrypt + JWT access tokens.
   - History logging allowing users to track skin metrics over time.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start FastAPI server on port 8000
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI\frontend

# Install dependencies if not already done
npm install

# Run Vite development server (proxies /api to 127.0.0.1:8000)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing
Run automated backend integration tests:
```bash
pytest -v
```

---

## ⚠️ Cosmetic Guidance Disclaimer
ALSKINCARE AI provides general cosmetic and cosmetic-ingredient educational recommendations. It is **not** a clinical diagnostic medical device and does not diagnose dermatological pathologies (such as melanoma, severe cystic rosacea, or infections). Consult a board-certified dermatologist for medical diagnosis and treatment.