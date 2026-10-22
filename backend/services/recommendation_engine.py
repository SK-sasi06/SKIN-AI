import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from backend.services.ingredient_checker import IngredientCompatibilityChecker

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'skincare.db')

CONCERN_EXPLANATION = {
    'Acne': 'Formulated with BHA / Salicylic Acid and clarifying botanicals to decongest pores and calm active breakouts.',
    'Skin Redness': 'Features barrier-restorative actives (Centella Asiatica, Allantoin, Ceramides) to soothe erythema.',
    'Skin Pigmentation': 'Enriched with clinical brightening agents (Vitamin C, Niacinamide, Licorice) to fade hyperpigmentation.',
    'Skin Texture': 'Combines gentle micro-exfoliating hydroxy acids with deep hydrating Hyaluronic Acid to refine rough skin texture.',
    'Wrinkled Face': 'Packed with multi-peptides, clinical Retinoids, and Adenosine to support cellular renewal and smooth fine lines.',
    'Eyes Dark Circles': 'Features microcirculation boosters (Caffeine, Chrysin, Peptides) to brighten under-eye shadows.',
    'Puffy Eyes': 'Formulated with cooling anti-inflammatory botanicals (Green Tea, Cucumber, Caffeine) to depuff delicate periorbital contours.'
}

ACTIVE_KEYWORDS = {
    'Salicylic Acid': ['salicylic acid', 'willow bark', 'betaine salicylate'],
    'Niacinamide': ['niacinamide', 'nicotinic acid'],
    'Vitamin C': ['ascorbic acid', 'tetrahexyldecyl ascorbate', 'magnesium ascorbyl phosphate', 'sodium ascorbyl phosphate'],
    'Retinoids': ['retinol', 'retinyl', 'bakuchiol'],
    'Centella Asiatica': ['centella', 'madecassoside', 'asiaticoside'],
    'Peptides': ['peptide', 'matrixyl'],
    'Caffeine': ['caffeine', 'green tea'],
    'Hyaluronic Acid': ['hyaluronic acid', 'sodium hyaluronate'],
    'Ceramides': ['ceramide', 'sphingolipid']
}

class RecommendationEngine:
    @staticmethod
    def _find_actives(ingredients_text: str) -> List[str]:
        if not ingredients_text:
            return []
        lower = ingredients_text.lower()
        matched = []
        for active, kws in ACTIVE_KEYWORDS.items():
            if any(kw in lower for kw in kws):
                matched.append(active)
        return matched

    @staticmethod
    def get_budget_tier(price_inr: int) -> Dict[str, str]:
        """Categorize price into distinct INR budget tiers."""
        if price_inr <= 700:
            return {'id': 'budget', 'label': 'Affordable / Pharmacy Tier', 'color': 'emerald'}
        elif price_inr <= 1800:
            return {'id': 'mid', 'label': 'Mid-Range Clinical Tier', 'color': 'teal'}
        else:
            return {'id': 'premium', 'label': 'Luxury / Premium Tier', 'color': 'amber'}

    @classmethod
    def calculate_match_score(
        cls,
        product: Dict[str, Any],
        dominant_concern: str,
        secondary_concerns: Optional[List[str]] = None,
        skin_type: Optional[str] = None,
        preferred_tier: Optional[str] = None,
        exclude_allergens: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate an explainable 0-100% cosmetic compatibility match score.
        Weighted components:
          - Concern Alignment (40%)
          - Skin Type Fit (25%)
          - Formulation & Sensitivity Safety (20%)
          - Budget Alignment (15%)
        """
        concerns = product.get('target_concerns') or []
        if isinstance(concerns, str):
            try: concerns = json.loads(concerns)
            except: concerns = []
            
        skin_types = product.get('target_skin_types') or []
        if isinstance(skin_types, str):
            try: skin_types = json.loads(skin_types)
            except: skin_types = []

        price_inr = product.get('price_inr') or int(round((product.get('price', 38) * 83.5) / 50) * 50 - 1)
        tier_info = cls.get_budget_tier(price_inr)
        
        ingredients = product.get('ingredients', '')
        sensitivities = IngredientCompatibilityChecker.detect_sensitivities(ingredients)

        # 1. Concern score (max 40)
        secondary_concerns = secondary_concerns or []
        if dominant_concern in concerns:
            concern_score = 40
            concern_note = f"Directly targets {dominant_concern}"
        elif any(c in concerns for c in secondary_concerns):
            concern_score = 28
            concern_note = "Addresses secondary skin concern"
        else:
            concern_score = 15
            concern_note = "General skin maintenance"

        # 2. Skin type score (max 25)
        if not skin_type or skin_type == 'All' or skin_type in skin_types or 'All' in skin_types:
            skin_type_score = 25
            skin_type_note = f"Fully compatible with {skin_type or 'all'} skin"
        else:
            skin_type_score = 12
            skin_type_note = f"Formulated primarily for {', '.join(skin_types[:2])}"

        # 3. Sensitivity & Allergy score (max 20)
        has_allergen_conflict = False
        conflict_list = []
        if exclude_allergens:
            for allergen in exclude_allergens:
                al_key = allergen.lower().replace('-', '_').replace(' ', '_')
                if sensitivities.get(al_key):
                    has_allergen_conflict = True
                    conflict_list.append(allergen)

        if has_allergen_conflict:
            sensitivity_score = 4
            sensitivity_note = f"Contains excluded element(s): {', '.join(conflict_list)}"
        elif sensitivities.get('fragrance') or sensitivities.get('drying_alcohols'):
            sensitivity_score = 14
            sensitivity_note = "Contains mild fragrance or alcohol"
        else:
            sensitivity_score = 20
            sensitivity_note = "Clean, low-irritation profile"

        # 4. Budget score (max 15)
        if not preferred_tier or preferred_tier == 'all' or preferred_tier == tier_info['id']:
            budget_score = 15
            budget_note = f"Matches {tier_info['label']}"
        else:
            budget_score = 8
            budget_note = f"In {tier_info['label']}"

        total_score = concern_score + skin_type_score + sensitivity_score + budget_score
        # Ensure within reasonable bounds
        total_score = max(55, min(99, total_score))

        return {
            'overall_score': total_score,
            'budget_tier': tier_info,
            'sensitivities': sensitivities,
            'has_allergen_conflict': has_allergen_conflict,
            'conflict_allergens': conflict_list,
            'breakdown': {
                'concern': {'score': concern_score, 'max': 40, 'note': concern_note},
                'skin_type': {'score': skin_type_score, 'max': 25, 'note': skin_type_note},
                'sensitivity': {'score': sensitivity_score, 'max': 20, 'note': sensitivity_note},
                'budget': {'score': budget_score, 'max': 15, 'note': budget_note}
            }
        }

    @classmethod
    def get_recommendations_for_concern(
        cls,
        dominant_concern: str,
        secondary_concerns: List[str] = None,
        limit: int = 6,
        skin_type: Optional[str] = None,
        budget_tier: Optional[str] = None,
        exclude_allergens: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('''SELECT id, name, brand, category, price, price_inr, currency, rating, ingredients,
                                 target_skin_types, target_concerns, usage_instructions, source_attribution,
                                 official_url, image_url
                          FROM products
                          ORDER BY rating DESC, price ASC''')
        all_products = [dict(row) for row in cur.fetchall()]
        conn.close()

        matched = []
        categories_seen = {}

        for p in all_products:
            concerns = json.loads(p.get('target_concerns', '[]'))
            skin_types = json.loads(p.get('target_skin_types', '[]'))
            cat = p.get('category', '')
            price_inr = p.get('price_inr') or int(round((p.get('price', 38) * 83.5) / 50) * 50 - 1)
            tier_info = cls.get_budget_tier(price_inr)

            if skin_type and skin_type != 'All' and skin_type not in skin_types:
                continue

            if budget_tier and budget_tier != 'all' and tier_info['id'] != budget_tier:
                continue

            # Calculate match score
            match_data = cls.calculate_match_score(
                product={**p, 'price_inr': price_inr, 'target_concerns': concerns, 'target_skin_types': skin_types},
                dominant_concern=dominant_concern,
                secondary_concerns=secondary_concerns,
                skin_type=skin_type,
                preferred_tier=budget_tier,
                exclude_allergens=exclude_allergens
            )

            # If user explicitly excludes allergens and product conflicts, omit unless zero matches
            if exclude_allergens and match_data['has_allergen_conflict']:
                continue

            if dominant_concern in concerns:
                p_copy = dict(p)
                p_copy['label'] = cat
                p_copy['rank'] = p['rating']
                p_copy['match_reason'] = CONCERN_EXPLANATION.get(dominant_concern, 'Selected for high compatibility with detected concern.')
                p_copy['target_skin_types'] = skin_types
                p_copy['target_concerns'] = concerns
                p_copy['active_matches'] = cls._find_actives(p.get('ingredients', ''))
                p_copy['official_url'] = p.get('official_url') or f"https://www.sephora.com/search?keyword={p['brand']}+{p['name']}"
                p_copy['image_url'] = p.get('image_url') or "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"
                p_copy['price_inr'] = price_inr
                p_copy['match_score'] = match_data['overall_score']
                p_copy['budget_tier'] = tier_info
                p_copy['match_breakdown'] = match_data['breakdown']
                p_copy['sensitivities'] = match_data['sensitivities']
                
                count = categories_seen.get(cat, 0)
                if count < 2:
                    matched.append(p_copy)
                    categories_seen[cat] = count + 1
            if len(matched) >= limit:
                break

        if len(matched) < limit and secondary_concerns:
            for s_concern in secondary_concerns:
                for p in all_products:
                    concerns = json.loads(p.get('target_concerns', '[]'))
                    skin_types = json.loads(p.get('target_skin_types', '[]'))
                    cat = p.get('category', '')
                    price_inr = p.get('price_inr') or int(round((p.get('price', 38) * 83.5) / 50) * 50 - 1)
                    tier_info = cls.get_budget_tier(price_inr)

                    if skin_type and skin_type != 'All' and skin_type not in skin_types:
                        continue
                    if budget_tier and budget_tier != 'all' and tier_info['id'] != budget_tier:
                        continue

                    match_data = cls.calculate_match_score(
                        product={**p, 'price_inr': price_inr, 'target_concerns': concerns, 'target_skin_types': skin_types},
                        dominant_concern=dominant_concern,
                        secondary_concerns=secondary_concerns,
                        skin_type=skin_type,
                        preferred_tier=budget_tier,
                        exclude_allergens=exclude_allergens
                    )
                    if exclude_allergens and match_data['has_allergen_conflict']:
                        continue

                    if s_concern in concerns and p['id'] not in [m['id'] for m in matched]:
                        p_copy = dict(p)
                        p_copy['label'] = cat
                        p_copy['rank'] = p['rating']
                        p_copy['match_reason'] = CONCERN_EXPLANATION.get(s_concern, 'Selected to address secondary concern.')
                        p_copy['target_skin_types'] = skin_types
                        p_copy['target_concerns'] = concerns
                        p_copy['active_matches'] = cls._find_actives(p.get('ingredients', ''))
                        p_copy['official_url'] = p.get('official_url') or f"https://www.sephora.com/search?keyword={p['brand']}+{p['name']}"
                        p_copy['image_url'] = p.get('image_url') or "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"
                        p_copy['price_inr'] = price_inr
                        p_copy['match_score'] = match_data['overall_score']
                        p_copy['budget_tier'] = tier_info
                        p_copy['match_breakdown'] = match_data['breakdown']
                        p_copy['sensitivities'] = match_data['sensitivities']
                        matched.append(p_copy)
                    if len(matched) >= limit:
                        break
                if len(matched) >= limit:
                    break

        return matched

    @classmethod
    def build_routine(cls, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        cleansers = [p for p in products if p.get('category') == 'Cleanser']
        treatments = [p for p in products if p.get('category') == 'Treatment']
        moisturizers = [p for p in products if p.get('category') == 'Moisturizer']
        sunscreens = [p for p in products if p.get('category') in ['Sunscreen', 'Sun protect']]
        eye_creams = [p for p in products if p.get('category') == 'Eye Cream']

        am_routine = []
        if cleansers: am_routine.append(cleansers[0])
        if eye_creams: am_routine.append(eye_creams[0])
        if moisturizers: am_routine.append(moisturizers[0])
        if sunscreens: am_routine.append(sunscreens[0])

        pm_routine = []
        if cleansers: pm_routine.append(cleansers[0])
        if treatments: pm_routine.append(treatments[0])
        if eye_creams: pm_routine.append(eye_creams[0])
        if moisturizers: pm_routine.append(moisturizers[0])

        if not am_routine and products:
            am_routine = products[:3]
        if not pm_routine and products:
            pm_routine = products[1:4] if len(products) > 3 else products[:2]

        # Evaluate clinical safety & compatibility between AM and PM routines
        safety_report = IngredientCompatibilityChecker.evaluate_routine(am_routine, pm_routine)

        return {
            'morning': am_routine,
            'evening': pm_routine,
            'safety_report': safety_report
        }