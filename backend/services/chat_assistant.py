import os
import sqlite3
import json
import re
import requests
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'skincare.db')

def _load_env_file():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    candidates = [
        os.path.join(backend_dir, '.env'),
        os.path.join(os.path.dirname(backend_dir), '.env')
    ]
    for p in candidates:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        if k.strip() not in os.environ:
                            os.environ[k.strip()] = v.strip()

_load_env_file()

INGREDIENT_KNOWLEDGE = {
    'salicylic acid': {
        'name': 'Salicylic Acid (BHA)',
        'benefits': 'Oil-soluble beta hydroxy acid that penetrates pores deeply to dissolve sebum, clear dead skin cells, and calm acne blemishes.',
        'best_for': 'Acne, blackheads, enlarged pores, and oily skin.',
        'caution': 'Can cause dryness or mild peeling initially. Always wear daily SPF 30+ sun protection.'
    },
    'niacinamide': {
        'name': 'Niacinamide (Vitamin B3)',
        'benefits': 'Multitasking antioxidant that strengthens the lipid barrier, regulates sebum production, visibly minimizes enlarged pores, and evens out post-inflammatory erythema.',
        'best_for': 'Uneven tone, redness, barrier repair, and oil regulation.',
        'caution': 'Very well tolerated. Concentrations above 10% may cause mild flushing in sensitive skin.'
    },
    'vitamin c': {
        'name': 'Vitamin C (L-Ascorbic Acid / Derivatives)',
        'benefits': 'Potent antioxidant that neutralizes free radicals, stimulates collagen synthesis, and inhibits tyrosinase to fade dark spots and hyperpigmentation.',
        'best_for': 'Dullness, sun spots, post-acne marks, and photoaging.',
        'caution': 'Can oxidize quickly if exposed to light/air. Best used in the morning under sunscreen.'
    },
    'retinol': {
        'name': 'Retinol & Retinoids (Vitamin A)',
        'benefits': 'Gold standard active for accelerating cellular turnover, boosting collagen, smoothing fine lines, and clearing stubborn congestion.',
        'best_for': 'Fine lines, wrinkles, uneven texture, and adult acne.',
        'caution': 'Introduce gradually (1-2 nights/week). Use only at night. Daily broad-spectrum SPF is non-negotiable. Avoid combining with strong exfoliating acids in the same routine.'
    },
    'hyaluronic acid': {
        'name': 'Hyaluronic Acid',
        'benefits': 'Humectant capable of binding up to 1,000 times its weight in water, drawing hydration into the epidermis for a plump, supple barrier.',
        'best_for': 'Dehydration, fine surface lines, and all skin types.',
        'caution': 'Apply onto damp skin and follow with an occlusive moisturizer to lock in moisture.'
    },
    'ceramides': {
        'name': 'Ceramides',
        'benefits': 'Essential epidermal lipids that reinforce the stratum corneum, prevent transepidermal water loss (TEWL), and defend against irritants.',
        'best_for': 'Dryness, sensitized skin, compromised barriers, and redness.',
        'caution': 'Universal compatibility; excellent when paired with exfoliating treatments.'
    },
    'centella asiatica': {
        'name': 'Centella Asiatica (Cica / Madecassoside)',
        'benefits': 'Medicinal botanical rich in triterpenoids that rapidly calms redness, accelerates wound healing, and reduces irritation.',
        'best_for': 'Sensitive skin, skin redness, rosacea tendencies, and post-procedure care.',
        'caution': 'Extremely gentle with virtually zero irritation potential.'
    },
    'caffeine': {
        'name': 'Caffeine',
        'benefits': 'Vasoconstrictor and antioxidant that improves microcirculation to temporarily depuff eye contours and reduce dark shadows.',
        'best_for': 'Puffy eyes and periorbital dark circles.',
        'caution': 'Hydrate well; topical caffeine works best alongside moisturizing peptides.'
    }
}

CONCERN_MAPPINGS = {
    'acne': ('Acne', 'Salicylic Acid', 'Cleanser'),
    'breakout': ('Acne', 'Salicylic Acid', 'Treatment'),
    'pimple': ('Acne', 'Salicylic Acid', 'Treatment'),
    'blemish': ('Acne', 'Salicylic Acid', 'Treatment'),
    'dark spot': ('Skin Pigmentation', 'Vitamin C', 'Treatment'),
    'pigmentation': ('Skin Pigmentation', 'Vitamin C', 'Treatment'),
    'hyperpigmentation': ('Skin Pigmentation', 'Niacinamide', 'Treatment'),
    'sun spot': ('Skin Pigmentation', 'Vitamin C', 'Treatment'),
    'redness': ('Skin Redness', 'Centella Asiatica', 'Moisturizer'),
    'rosacea': ('Skin Redness', 'Centella Asiatica', 'Moisturizer'),
    'irritat': ('Skin Redness', 'Ceramides', 'Moisturizer'),
    'texture': ('Skin Texture', 'Salicylic Acid', 'Treatment'),
    'pore': ('Skin Texture', 'Niacinamide', 'Treatment'),
    'wrinkle': ('Wrinkled Face', 'Retinoids', 'Treatment'),
    'fine line': ('Wrinkled Face', 'Peptides', 'Moisturizer'),
    'aging': ('Wrinkled Face', 'Retinoids', 'Treatment'),
    'dark circle': ('Eyes Dark Circles', 'Caffeine', 'Eye Cream'),
    'puffy': ('Puffy Eyes', 'Caffeine', 'Eye Cream'),
    'dry': ('Skin Texture', 'Hyaluronic Acid', 'Moisturizer'),
    'dehydrat': ('Skin Texture', 'Hyaluronic Acid', 'Moisturizer')
}

class ChatAssistantService:
    @staticmethod
    def _clean_text(text: str) -> str:
        if not text:
            return ""
        text = text.replace("Crme", "Crème").replace("Protini", "Protini™")
        text = text.replace("", "")
        return text.strip()

    @classmethod
    def search_catalog_products(
        cls,
        query: str = "",
        concern: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        conditions = []
        params = []

        if concern:
            conditions.append("target_concerns LIKE ?")
            params.append(f"%{concern}%")

        if category:
            conditions.append("category LIKE ?")
            params.append(f"%{category}%")

        if brand:
            conditions.append("brand LIKE ?")
            params.append(f"%{brand}%")

        if query:
            clean_q = f"%{query.strip()}%"
            conditions.append("(name LIKE ? OR brand LIKE ? OR ingredients LIKE ? OR target_concerns LIKE ?)")
            params.extend([clean_q, clean_q, clean_q, clean_q])

        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT id, name, brand, category, price, price_inr, rating, ingredients, target_skin_types, target_concerns, official_url, image_url FROM products WHERE {where_clause} ORDER BY rating DESC, price ASC LIMIT ?"
        params.append(limit)

        cur.execute(sql, params)
        rows = cur.fetchall()
        conn.close()

        results = []
        for r in rows:
            concerns = json.loads(r['target_concerns']) if r['target_concerns'] else []
            skin_types = json.loads(r['target_skin_types']) if r['target_skin_types'] else []
            
            ing_text = r['ingredients'] or ""
            matched_actives = []
            for active_name, info in INGREDIENT_KNOWLEDGE.items():
                if active_name in ing_text.lower():
                    matched_actives.append(info['name'].split('(')[0].strip())

            results.append({
                'id': r['id'],
                'name': cls._clean_text(r['name']),
                'brand': cls._clean_text(r['brand']),
                'category': r['category'],
                'price': r['price'],
                'price_inr': r['price_inr'] or int(round((r['price'] * 83.5) / 50) * 50 - 1),
                'rating': r['rating'],
                'ingredients': r['ingredients'],
                'active_matches': matched_actives[:3],
                'target_skin_types': skin_types,
                'target_concerns': concerns,
                'official_url': r['official_url'] or f"https://www.sephora.com/search?keyword={r['brand']}+{r['name']}",
                'image_url': r['image_url'],
                'match_reason': f"Top rated {r['category']} formulated for {', '.join(concerns[:2]) or 'balanced skin'}."
            })
        return results

    @classmethod
    def get_user_latest_report(cls, user_id: int) -> Optional[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(
            "SELECT id, dominant_concern, confidence_score, all_predictions, recommended_products, routine_am, routine_pm, created_at FROM analysis_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,)
        )
        row = cur.fetchone()
        conn.close()

        if not row:
            return None

        return {
            'id': row['id'],
            'dominant_concern': row['dominant_concern'],
            'confidence_score': row['confidence_score'],
            'percentage': round(row['confidence_score'] * 100, 1),
            'all_predictions': json.loads(row['all_predictions']),
            'recommended_products': json.loads(row['recommended_products']),
            'morning_routine': json.loads(row['routine_am']),
            'evening_routine': json.loads(row['routine_pm']),
            'created_at': row['created_at']
        }

    @classmethod
    def generate_chat_response(
        cls,
        user_message: str,
        user_id: Optional[int] = None,
        current_page: Optional[str] = None,
        latest_analysis: Optional[dict] = None
    ) -> Dict[str, Any]:
        msg_lower = user_message.strip().lower()

        if not os.getenv("GROQ_API_KEY"):
            _load_env_file()

        groq_key = os.getenv("GROQ_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        user_report = None
        if user_id:
            user_report = cls.get_user_latest_report(user_id)
        elif latest_analysis:
            user_report = latest_analysis

        target_concern = None
        target_category = None
        for keyword, mapping in CONCERN_MAPPINGS.items():
            if keyword in msg_lower:
                target_concern = mapping[0]
                target_category = mapping[2]
                break

        for cat in ['Cleanser', 'Moisturizer', 'Treatment', 'Eye Cream', 'Sunscreen', 'Face Mask']:
            if cat.lower() in msg_lower:
                target_category = cat
                break

        recommended_products = []
        if target_concern or target_category or any(w in msg_lower for w in ['product', 'recommend', 'serum', 'cream', 'find', 'buy', 'routine', 'care', 'dark spot', 'acne', 'wrinkle']):
            recommended_products = cls.search_catalog_products(
                query="",
                concern=target_concern,
                category=target_category,
                limit=3
            )
            if not recommended_products:
                recommended_products = cls.search_catalog_products(query="", limit=3)

        if groq_key:
            try:
                llm_res = cls._call_groq(user_message, groq_key, recommended_products, user_report, current_page)
                if llm_res:
                    return {
                        'response': llm_res,
                        'recommended_products': recommended_products,
                        'provider': 'Groq LPU (Grounded Catalog)',
                        'provider_configured': True,
                        'disclaimer': 'General skincare guidance; not a medical diagnosis.'
                    }
            except Exception as e:
                print("Groq API error fallback:", e)

        if gemini_key:
            try:
                llm_res = cls._call_gemini(user_message, gemini_key, recommended_products, user_report, current_page)
                if llm_res:
                    return {
                        'response': llm_res,
                        'recommended_products': recommended_products,
                        'provider': 'Google Gemini 1.5 Flash (Grounded Catalog)',
                        'provider_configured': True,
                        'disclaimer': 'General skincare guidance; not a medical diagnosis.'
                    }
            except Exception as e:
                print("Gemini API error fallback:", e)

        if openai_key:
            try:
                llm_res = cls._call_openai(user_message, openai_key, recommended_products, user_report, current_page)
                if llm_res:
                    return {
                        'response': llm_res,
                        'recommended_products': recommended_products,
                        'provider': 'OpenAI GPT-4o mini (Grounded Catalog)',
                        'provider_configured': True,
                        'disclaimer': 'General skincare guidance; not a medical diagnosis.'
                    }
            except Exception as e:
                print("OpenAI API error fallback:", e)

        response_text = cls._build_clinical_response(user_message, target_concern, recommended_products, user_report, user_id)

        has_external_llm = bool(groq_key or gemini_key or openai_key)
        provider_name = "ALSKINCARE Clinical Catalog Intelligence"
        provider_note = None
        if not has_external_llm:
            provider_note = "Local Engine Active (Configure GEMINI_API_KEY in environment for free-form LLM dialogue)."

        return {
            'response': response_text,
            'recommended_products': recommended_products,
            'provider': provider_name,
            'provider_configured': has_external_llm,
            'provider_note': provider_note,
            'disclaimer': 'General cosmetic skincare guidance; not a medical diagnosis.'
        }

    @classmethod
    def _build_clinical_response(
        cls,
        user_message: str,
        target_concern: Optional[str],
        products: List[Dict[str, Any]],
        user_report: Optional[Dict[str, Any]],
        user_id: Optional[int]
    ) -> str:
        msg = user_message.lower().strip()

        # A. Past Reports & Skin Analysis inquiry
        if any(w in msg for w in ['past report', 'my report', 'my scan', 'my analysis', 'my result', 'last scan', 'last analysis', 'explain my', 'understand my', 'skin analysis']):
            if not user_id and not user_report:
                return (
                    "To access your personalized past reports, please **Sign In** to your ALSKINCARE AI account. "
                    "Once authenticated, I can review your Vision Transformer diagnostic findings, dominant concerns, "
                    "and tailored AM/PM routine histories directly from your encrypted clinical profile."
                )
            if user_report:
                concern = user_report.get('dominant_concern', 'Skin Redness')
                pct = user_report.get('percentage') or round(user_report.get('confidence_score', 0.8) * 100, 1)
                date_str = user_report.get('created_at', 'recent scan')
                preds = user_report.get('all_predictions', [])
                top_preds_str = ", ".join([f"{p['label']} ({round(p['confidence']*100, 1)}%)" for p in preds[:3]]) if preds else ""

                return (
                    f"### Summary of Your Latest Assessment\n\n"
                    f"- **Assessment Date**: {date_str}\n"
                    f"- **Primary Visual Concern**: **{concern}** ({pct}% neural match)\n"
                    f"- **Softmax Distribution**: {top_preds_str}\n\n"
                    f"**Clinical Interpretation**:\n"
                    f"Your facial analysis reflects prominent indicators for {concern}. "
                    f"For this profile, our recommendation pipeline emphasizes targeted active formulations below "
                    f"to stabilize the epidermal barrier and restore equilibrium without inducing irritation."
                )

        # Specific Active Ingredient Guides
        if 'salicylic' in msg or 'bha' in msg:
            return (
                "**Salicylic Acid: Skincare Guide**\n\n"
                "Salicylic acid is a beta hydroxy acid (BHA) commonly used to help unclog pores and manage acne-prone skin.\n\n"
                "**Why it may help**\n"
                "- Helps remove dead skin cells and buildup from deep inside pores.\n"
                "- Can help reduce the formation of blackheads and whiteheads.\n"
                "- May help improve the appearance of oily and congested skin.\n\n"
                "**How to use it**\n"
                "1. Start with a low concentration (0.5% to 2%) suitable for your skin tolerance.\n"
                "2. Introduce it gradually (2 to 3 times per week) before increasing frequency.\n"
                "3. Apply to clean, dry skin, followed by a non-comedogenic moisturizer.\n"
                "4. Always use broad-spectrum sunscreen (SPF 30+) during the day, as exfoliating acids can increase sun sensitivity.\n"
                "5. Pause use if noticeable peeling, stinging, or redness occurs.\n\n"
                "**Important precautions**\n"
                "- It may cause initial dryness, flaking, or mild irritation.\n"
                "- Avoid combining with other potent exfoliating acids (like Glycolic Acid) or Retinol in the same application.\n"
                "- Seek professional dermatological evaluation if acne lesions are painful, deep, or persistent.\n\n"
                "**Personalization**\n"
                "Your suitability depends on your skin type, moisture barrier health, and current routine. Share these details for more tailored guidance.\n\n"
                "*This information is for general skincare education and is not a medical diagnosis.*"
            )

        if 'niacinamide' in msg or 'vitamin b3' in msg:
            return (
                "**Niacinamide: Skincare Guide**\n\n"
                "Niacinamide is a water-soluble form of Vitamin B3 that supports barrier resilience, balances oiliness, and soothes redness.\n\n"
                "**Why it may help**\n"
                "- Helps balance excess sebum output in oily and combination skin.\n"
                "- Calms visible redness and soothes irritated, blemish-prone areas.\n"
                "- Strengthens the skin's moisture barrier by supporting natural ceramide production.\n"
                "- Helps visibly improve skin texture and minimize the appearance of enlarged pores.\n\n"
                "**How to use it**\n"
                "1. Look for concentrations between 2% and 5% for optimal tolerance and efficacy.\n"
                "2. Can be applied once or twice daily during both morning and evening routines.\n"
                "3. Pairs exceptionally well with hydrating ingredients like Hyaluronic Acid.\n"
                "4. Follow with your preferred daily moisturizer and daytime SPF.\n\n"
                "**Important precautions**\n"
                "- High concentrations (10% or more) may cause temporary flushing or tingling in sensitive skin.\n"
                "- Always conduct a quick patch test on your inner arm or jawline when trying a new product.\n\n"
                "**Personalization**\n"
                "Niacinamide is gentle and suitable for most skin types, including sensitive and blemish-prone skin.\n\n"
                "*This information is for general skincare education and is not a medical diagnosis.*"
            )

        if 'retinol' in msg or 'retinoid' in msg:
            return (
                "**Retinol: Skincare Guide**\n\n"
                "Retinol is a Vitamin A derivative that encourages cellular renewal and helps smooth uneven skin texture and fine lines.\n\n"
                "**Why it may help**\n"
                "- Promotes healthy epidermal cell turnover to reveal smoother skin.\n"
                "- Helps diminish the appearance of fine lines, wrinkles, and surface discoloration.\n"
                "- Can aid in refining congested pores and persistent texture.\n\n"
                "**How to use it**\n"
                "1. Apply only during your evening (PM) routine on clean, completely dry skin.\n"
                "2. Begin slowly: 1 to 2 nights per week, gradually increasing as tolerated.\n"
                "3. Use a pea-sized amount for the entire face, avoiding the immediate eye and lip contours.\n"
                "4. Buffer with a ceramide-rich moisturizer to prevent excessive dryness.\n"
                "5. Strict daily broad-spectrum SPF 30+ is mandatory the following morning.\n\n"
                "**Important precautions**\n"
                "- Expect possible mild flaking or purging during the initial 2 to 4 weeks of use.\n"
                "- Do not layer with exfoliating acids (AHAs/BHAs) on the same evening.\n"
                "- Not recommended for use during pregnancy or breastfeeding without physician clearance.\n\n"
                "**Personalization**\n"
                "If your barrier is currently sensitized or dry, prioritize barrier hydration before introducing retinol.\n\n"
                "*This information is for general skincare education and is not a medical diagnosis.*"
            )

        if 'hyaluronic' in msg:
            return (
                "**Hyaluronic Acid: Skincare Guide**\n\n"
                "Hyaluronic Acid is a humectant naturally found in the skin that attracts and holds moisture in surface layers.\n\n"
                "**Why it may help**\n"
                "- Binds water to dehydrated skin cells to deliver a plump, supple finish.\n"
                "- Relieves tightness and surface dryness without adding heaviness or clogging pores.\n"
                "- Supports the natural recovery and elasticity of the skin barrier.\n\n"
                "**How to use it**\n"
                "1. Apply onto slightly damp skin immediately after cleansing.\n"
                "2. Gently pat in a few drops across the face and neck.\n"
                "3. Crucial step: Always seal it in with a moisturizer while skin is still damp to lock the moisture inside.\n"
                "4. Suitable for daily use in both morning and evening routines.\n\n"
                "**Important precautions**\n"
                "- Applying hyaluronic acid to bone-dry skin in arid environments can draw moisture outward if not sealed with an emollient cream.\n\n"
                "**Personalization**\n"
                "Compatible with virtually every skin type and active ingredient, making it an easy addition to any routine.\n\n"
                "*This information is for general skincare education and is not a medical diagnosis.*"
            )

        # B. Acne / Breakout guidance
        if 'acne' in msg or 'breakout' in msg or 'pimple' in msg:
            return (
                "**Acne & Blemish Care: Practical Guide**\n\n"
                "Acne develops from a combination of excess sebum, trapped dead skin cells in the pores, and surface bacteria.\n\n"
                "**Why targeted care helps**\n"
                "- Gently removes excess oil without stripping the skin's moisture barrier.\n"
                "- Reduces pore congestion and helps prevent recurring breakouts.\n"
                "- Calms the redness and sensitivity associated with active blemishes.\n\n"
                "**How to build your acne routine**\n"
                "1. Cleanse gently twice daily with a non-stripping cleanser. Avoid harsh physical scrubbing.\n"
                "2. Apply a targeted beta hydroxy acid (Salicylic Acid) 2 to 3 times weekly to clear follicular pores.\n"
                "3. Use Niacinamide (2%–5%) to regulate sebum production and soothe post-blemish redness.\n"
                "4. Seal with a lightweight, non-comedogenic gel-cream moisturizer.\n"
                "5. Apply broad-spectrum sunscreen every morning to protect healing skin from dark spots.\n\n"
                "**Important precautions**\n"
                "- Avoid overloading multiple strong active treatments at once, which can compromise your skin barrier.\n"
                "- Discontinue any product that causes severe stinging, peeling, or persistent discomfort.\n"
                "- Consult a board-certified dermatologist for cystic, painful, or scarring acne.\n\n"
                "*This information is for general skincare education and is not a medical diagnosis.*"
            )

        # C. Dark spots / Pigmentation guidance
        if 'dark spot' in msg or 'pigment' in msg or 'hyperpigment' in msg or 'sun spot' in msg:
            return (
                "### Evidence-Based Care for Dark Spots & Hyperpigmentation\n\n"
                "Hyperpigmentation occurs when melanocytes overproduce melanin triggered by UV radiation or post-acne inflammation (PIH).\n\n"
                "1. **Morning Antioxidant Defense**: Apply **Vitamin C** (L-Ascorbic Acid or stable derivatives) every morning. It inhibits the tyrosinase enzyme responsible for melanin synthesis while neutralizing free radicals.\n"
                "2. **Melanin Transfer Inhibitor**: Use **Niacinamide** (2–5%) to prevent synthesized pigment from transferring to upper skin cells.\n"
                "3. **Cellular Renewal**: In the evening, incorporate gentle exfoliating AHAs (Glycolic/Lactic Acid) or **Retinoids** to accelerate the turnover of pigmented epidermal cells.\n"
                "4. **Strict Daily SPF**: UV exposure immediately darkens existing pigment. Broad-spectrum SPF 30+ is essential every day, even when indoors.\n\n"
                "Explore these clinically verified brightening products from our catalog:"
            )

        # D. Evening Protocol
        if 'evening' in msg or 'night' in msg or 'pm' in msg:
            return (
                "### Personalized Evening Skincare Routine (Repair & Renew)\n\n"
                "Your evening protocol is dedicated to cellular recovery, texture refinement, and moisture barrier replenishment:\n\n"
                "1. **Double Cleanse**: Dissolve sunscreen, pollutants, and excess sebum with an oil cleanser/balm, followed by a gentle low-pH cleanser.\n"
                "2. **Targeted Active Treatment**: Apply your PM corrective active—such as Retinol (for cellular renewal), Salicylic Acid (BHA for congestion), or Peptides (for barrier support). *Note: Avoid layering strong exfoliating acids and retinol together on the same night.*\n"
                "3. **Periorbital Eye Care**: Gently tap a nourishing eye cream around the orbital bone to support delicate skin.\n"
                "4. **Barrier Recovery Moisturizer**: Seal in hydration with a ceramide-rich cream to prevent transepidermal water loss (TEWL) during sleep.\n\n"
                "Here are curated evening formulations from our catalog to anchor this regimen:"
            )

        # E. Morning Protocol
        if 'morning' in msg or 'am' in msg:
            return (
                "### Personalized Morning Skincare Routine (Defend & Protect)\n\n"
                "Your morning protocol shields your skin from environmental oxidative stress, urban pollution, and UV radiation:\n\n"
                "1. **Gentle Cleanser**: Lukewarm water or a mild hydrating gel cleanser to remove overnight secretions without stripping lipids.\n"
                "2. **Antioxidant Defense**: Apply Vitamin C (L-Ascorbic Acid) or Niacinamide serum to neutralize environmental free radicals.\n"
                "3. **Lightweight Hydrating Lotion**: A humectant moisturizer with Hyaluronic Acid or Ceramides to keep the stratum corneum supple.\n"
                "4. **Broad-Spectrum Sunscreen (SPF 30–50)**: The foundation of dermatological care. Defends against photoaging, pigment darkening, and UV damage.\n\n"
                "Here are verified morning formulations from our catalog to complete this routine:"
            )

        # F. General Routine
        if 'routine' in msg or 'regimen' in msg:
            return (
                "### Personalized Daily Skincare Routine Structure\n\n"
                "A balanced, non-conflicting skincare routine follows the golden rule of **thinnest to thickest texture**:\n\n"
                "#### 🌅 Morning Protocol (Defend & Protect)\n"
                "1. **Cleanse**: Lukewarm water or a gentle hydrating gel cleanser.\n"
                "2. **Antioxidant Serum**: Vitamin C or Niacinamide to defend against environmental oxidative stress.\n"
                "3. **Lightweight Moisturizer**: Ceramide or Hyaluronic Acid lotion to lock in hydration.\n"
                "4. **Broad-Spectrum Sunscreen (SPF 30–50)**: Shield against UVA/UVB damage.\n\n"
                "#### 🌙 Evening Protocol (Repair & Renew)\n"
                "1. **Double Cleanse**: Oil balm followed by water-based cleanser.\n"
                "2. **Active Treatment**: Salicylic Acid (BHA), Retinoid, or Peptides.\n"
                "3. **Barrier Repair Moisturizer**: Rich cream with Ceramides and Centella Asiatica.\n\n"
                "Here are complementary formulations from our catalog to anchor this regimen:"
            )

        # E. Comparing products or ingredients
        if 'compare' in msg or 'difference' in msg or 'versus' in msg or 'vs' in msg:
            return (
                "### Skincare Actives Comparison\n\n"
                "When selecting between skincare actives, understanding their mechanism of action helps avoid routine conflicts:\n\n"
                "- **BHA (Salicylic Acid) vs. AHA (Glycolic / Lactic Acid)**:\n"
                "  - *BHA* is oil-soluble: penetrates inside pores to clear acne, blackheads, and congestion.\n"
                "  - *AHA* is water-soluble: works on the skin surface to buff away dead cells and brighten uneven texture.\n\n"
                "- **Niacinamide vs. Vitamin C**:\n"
                "  - *Niacinamide* calms redness, restores barrier lipids, and regulates oil. Very gentle and stable.\n"
                "  - *Vitamin C* is a potent antioxidant targeted primarily at fading stubborn sun spots and boosting collagen.\n\n"
                "- **Retinoids vs. Peptides**:\n"
                "  - *Retinoids* reprogram cellular renewal for wrinkles and congestion (use PM only, introduces peeling).\n"
                "  - *Peptides* act as signaling messengers for collagen without irritation, ideal for sensitive skin.\n\n"
                "Here are verified formulations highlighting these key active categories from our catalog:"
            )

        concern_str = f" addressing **{target_concern}**" if target_concern else ""
        return (
            f"### ALSKINCARE AI Clinical Recommendation\n\n"
            f"Based on your query{concern_str}, the most effective approach combines **barrier integrity** with **targeted biocompatible actives**.\n\n"
            f"- **Prioritize Barrier Health**: Avoid over-exfoliating or combining multiple active acids simultaneously.\n"
            f"- **Patch Test**: Always patch-test new formulations on your inner forearm or jawline for 24 hours prior to full facial application.\n"
            f"- **Consistency**: Skin cell turnover cycles typically span 28–40 days; allow 4 to 6 weeks of consistent usage to observe true visible results.\n\n"
            f"Here are top-performing, authentic formulations matched directly from our verified catalog:"
        )

    @classmethod
    def _call_gemini(
        cls,
        user_message: str,
        api_key: str,
        products: List[Dict[str, Any]],
        user_report: Optional[Dict[str, Any]],
        current_page: Optional[str]
    ) -> Optional[str]:
        catalog_summary = ""
        if products:
            catalog_summary = "GROUNDED CATALOG PRODUCTS:\n" + "\n".join([
                f"- Brand: {p['brand']}, Name: {p['name']}, Category: {p['category']}, Price: ₹{p['price_inr']}, "
                f"Actives: {', '.join(p['active_matches'])}, URL: {p['official_url']}"
                for p in products
            ])

        report_summary = ""
        if user_report:
            report_summary = f"USER RECENT REPORT: Dominant Concern: {user_report.get('dominant_concern')}, Confidence: {user_report.get('percentage')}%"

        prompt = f'''You are the ALSKINCARE AI Skincare Assistant.
Start directly with the answer or practical skincare advice without generic greetings or repeating the question.
Use clear headings, concise paragraphs, and bullet points or numbered steps.
Use simple, accessible language.
Ground product recommendations ONLY in the provided catalog with prices in INR (₹).
Do not claim medical diagnosis.

{report_summary}
{catalog_summary}
Current User Page: {current_page or 'General'}

User Message: {user_message}'''

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 600}
        }
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        return None

    @classmethod
    def _call_openai(
        cls,
        user_message: str,
        api_key: str,
        products: List[Dict[str, Any]],
        user_report: Optional[Dict[str, Any]],
        current_page: Optional[str]
    ) -> Optional[str]:
        catalog_summary = ""
        if products:
            catalog_summary = "GROUNDED CATALOG PRODUCTS:\n" + "\n".join([
                f"- Brand: {p['brand']}, Name: {p['name']}, Category: {p['category']}, Price: ₹{p['price_inr']}, "
                f"Actives: {', '.join(p['active_matches'])}, URL: {p['official_url']}"
                for p in products
            ])

        system_msg = f'''You are the ALSKINCARE AI Skincare Assistant.
Start directly with the answer or practical skincare advice without generic greetings or repeating the question.
Use clear headings, concise paragraphs, and bullet points or numbered steps.
Ground recommendations in authentic dermatological science and the following catalog data:
{catalog_summary}
Prices must be in INR (₹). Provide structured skincare advice without claiming medical diagnosis.'''

        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.4,
            "max_tokens": 600
        }
        headers = {"Authorization": f"Bearer {api_key}"}
        res = requests.post(url, json=payload, headers=headers, timeout=8)
        if res.status_code == 200:
            data = res.json()
            return data['choices'][0]['message']['content']
        return None

    @classmethod
    def _call_groq(
        cls,
        user_message: str,
        api_key: str,
        products: List[Dict[str, Any]],
        user_report: Optional[Dict[str, Any]],
        current_page: Optional[str]
    ) -> Optional[str]:
        catalog_summary = ""
        if products:
            catalog_summary = "GROUNDED CATALOG PRODUCTS (Curated authentic items with verified INR pricing):\n" + "\n".join([
                f"- Brand: {p['brand']}, Name: {p['name']}, Category: {p['category']}, Price: ₹{p['price_inr']}, "
                f"Actives: {', '.join(p['active_matches'])}, URL: {p['official_url']}"
                for p in products
            ])

        report_summary = ""
        if user_report:
            report_summary = (
                f"CUSTOMER'S RECENT SKIN ANALYSIS FINDINGS:\n"
                f"- Assessment Date: {user_report.get('created_at', 'Recent')}\n"
                f"- Primary Detected Concern: {user_report.get('dominant_concern')}\n"
                f"- Model Confidence: {user_report.get('percentage')}%\n"
            )

        system_msg = f"""You are the ALSKINCARE AI Skincare Assistant.

Core Principles:
1. Start directly with the answer or practical skincare advice. Do NOT begin with generic or repetitive greetings (such as "Hello, and welcome") and do NOT repeat the user's question back to them.
2. Structure responses cleanly using Markdown:
   - Meaningful headings (e.g., **Salicylic Acid: Skincare Guide** or ### Recommended Morning Routine).
   - Short, readable paragraphs in simple, accessible language.
   - Bullet points for benefits, active ingredients, and precautions.
   - Numbered lists for sequential routine steps.
3. For ingredient questions, format with relevant sections:
   - Brief intro explaining what the ingredient is in simple terms.
   - **Why it may help** (bullet points on visible benefits).
   - **How to use it** (numbered steps: concentration, frequency, layering, SPF).
   - **Important precautions** (bullet points: irritation, patch-testing, combining actives, when to consult a dermatologist).
   - **Personalization** (tailoring to skin type/routine, mentioning verified scan results if provided below).
   - Closing note: *This information is for general skincare education and is not a medical diagnosis.*
4. Adaptive response length: Simple or conversational questions should receive short, direct answers. Do not force every response into a long template.
5. Safety & Scientific Grounding:
   - Do NOT make unsupported claims or claim medical diagnosis.
   - Do NOT present model confidence percentages as medical certainty.
   - Ground all product recommendations ONLY in the provided catalog with prices in Indian Rupees (₹). Never invent products or external URLs.

{report_summary}
{catalog_summary}
Current User Page: {current_page or 'General'}"""

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Available fast & capable text models on this Groq account
        candidate_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
        for model in candidate_models:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.4,
                "max_tokens": 500
            }
            try:
                res = requests.post(url, json=payload, headers=headers, timeout=8)
                if res.status_code == 200:
                    data = res.json()
                    return data['choices'][0]['message']['content'].strip()
                else:
                    print(f"Groq API {model} status {res.status_code}: {res.text}")
            except Exception as e:
                print(f"Groq API call exception on {model}:", e)
        return None
