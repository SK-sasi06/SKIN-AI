import re
from typing import List, Dict, Any, Optional

# Active families and their INCI search patterns
ACTIVE_PATTERNS = {
    'retinoids': {
        'name': 'Retinoids',
        'keywords': ['retinol', 'retinal', 'tretinoin', 'adapalene', 'retinyl palmitate', 'hydroxypinacolone retinoate', 'bakuchiol'],
        'description': 'Potent cellular turnover active. Increases epidermal sensitivity.'
    },
    'aha': {
        'name': 'AHA (Alpha Hydroxy Acids)',
        'keywords': ['glycolic acid', 'lactic acid', 'mandelic acid', 'malic acid', 'tartaric acid', 'citric acid'],
        'description': 'Chemical exfoliant operating at low pH to dissolve dead skin cell cohesion.'
    },
    'bha': {
        'name': 'BHA (Salicylic Acid)',
        'keywords': ['salicylic acid', 'betaine salicylate', 'salix alba', 'willow bark extract'],
        'description': 'Lipophilic exfoliant that penetrates deep into oil glands and pores.'
    },
    'vitamin_c': {
        'name': 'Pure Vitamin C (L-Ascorbic Acid)',
        'keywords': ['ascorbic acid', 'l-ascorbic acid'],
        'description': 'Potent antioxidant active requiring low acidic pH (under 3.5) for penetration.'
    },
    'vitamin_c_derivatives': {
        'name': 'Vitamin C Derivative',
        'keywords': ['tetrahexyldecyl ascorbate', 'magnesium ascorbyl phosphate', 'sodium ascorbyl phosphate', 'ascorbyl glucoside', 'ethyl ascorbic acid'],
        'description': 'Gentle, pH-neutral stabilized forms of Vitamin C.'
    },
    'benzoyl_peroxide': {
        'name': 'Benzoyl Peroxide',
        'keywords': ['benzoyl peroxide'],
        'description': 'Antibacterial active that releases oxygen into pores to eradicate C. acnes bacteria.'
    },
    'niacinamide': {
        'name': 'Niacinamide (Vitamin B3)',
        'keywords': ['niacinamide', 'nicotinamide'],
        'description': 'Barrier-supporting, sebum-regulating, and pore-refining active.'
    },
    'ceramides': {
        'name': 'Ceramides & Lipids',
        'keywords': ['ceramide', 'ceramide np', 'ceramide ap', 'ceramide eop', 'sphingolipid', 'phytosphingosine'],
        'description': 'Essential inter-cellular cement for rebuilding compromised moisture barriers.'
    },
    'hyaluronic_acid': {
        'name': 'Hyaluronic Acid',
        'keywords': ['hyaluronic acid', 'sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'sodium acetylated hyaluronate'],
        'description': 'Humectant holding up to 1000x its weight in water.'
    },
    'centella': {
        'name': 'Centella Asiatica (Cica)',
        'keywords': ['centella asiatica', 'madecassoside', 'asiaticoside', 'madecassic acid', 'asiatic acid'],
        'description': 'Clinical anti-inflammatory botanical that accelerates wound healing and calms redness.'
    },
    'peptides': {
        'name': 'Peptides',
        'keywords': ['peptide', 'palmitoyl', 'matrixyl', 'copper tripeptide', 'acetyl hexapeptide'],
        'description': 'Amino acid chains that signal collagen and elastin synthesis.'
    }
}

# Common allergens & skin sensitivities
ALLERGEN_PATTERNS = {
    'fragrance': ['fragrance', 'parfum', 'aroma', 'perfume'],
    'essential_oils': ['lavender oil', 'eucalyptus', 'rosemary oil', 'citrus limon', 'bergamot', 'peppermint', 'tea tree leaf oil', 'melaleuca alternifolia'],
    'drying_alcohols': ['alcohol denat', 'sd alcohol', 'isopropyl alcohol', 'denatured alcohol'],
    'sulfates': ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles'],
    'parabens': ['methylparaben', 'propylparaben', 'butylparaben', 'ethylparaben']
}


class IngredientCompatibilityChecker:
    @classmethod
    def detect_actives(cls, ingredients_text: str) -> List[Dict[str, Any]]:
        """Detect all active classes present in an ingredient string."""
        if not ingredients_text:
            return []
        
        lower = ingredients_text.lower()
        detected = []
        for key, data in ACTIVE_PATTERNS.items():
            matched_kws = [kw for kw in data['keywords'] if kw in lower]
            if matched_kws:
                detected.append({
                    'id': key,
                    'name': data['name'],
                    'matched_keywords': matched_kws,
                    'description': data['description']
                })
        return detected

    @classmethod
    def detect_sensitivities(cls, ingredients_text: str) -> Dict[str, bool]:
        """Detect potential sensitivity triggers (fragrance, essential oils, alcohol, etc.)."""
        if not ingredients_text:
            return {k: False for k in ALLERGEN_PATTERNS}
        
        lower = ingredients_text.lower()
        res = {}
        for category, kws in ALLERGEN_PATTERNS.items():
            res[category] = any(kw in lower for kw in kws)
        return res

    @classmethod
    def evaluate_routine(
        cls,
        morning_products: List[Dict[str, Any]],
        evening_products: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate full morning and evening regimens for layer conflicts, duplicate actives,
        and beneficial synergies.
        """
        # Analyze morning
        am_actives = {}
        for p in morning_products:
            actives = cls.detect_actives(p.get('ingredients', ''))
            for a in actives:
                am_actives.setdefault(a['id'], []).append(p.get('name', 'Unknown Product'))

        # Analyze evening
        pm_actives = {}
        for p in evening_products:
            actives = cls.detect_actives(p.get('ingredients', ''))
            for a in actives:
                pm_actives.setdefault(a['id'], []).append(p.get('name', 'Unknown Product'))

        conflicts = []
        cautions = []
        synergies = []
        timing_tips = []

        # --- Rule 1: Retinoids in Morning ---
        if 'retinoids' in am_actives:
            cautions.append({
                'level': 'caution',
                'title': 'Retinoids Detected in Morning Routine',
                'description': f"Retinoids in '{', '.join(am_actives['retinoids'])}' degrade in sunlight and increase photosensitivity. We strongly advise shifting retinoids to evening application only, followed by broad-spectrum SPF 50 the next morning.",
                'actives': ['retinoids'],
                'recommendation': 'Move retinoid product to Evening Regimen.'
            })

        # --- Rule 2: Retinoid + Direct Acids (AHA / BHA) in same session ---
        for session_name, session_actives in [('Morning', am_actives), ('Evening', pm_actives)]:
            has_ret = 'retinoids' in session_actives
            has_acid = ('aha' in session_actives) or ('bha' in session_actives)
            if has_ret and has_acid:
                conflicts.append({
                    'level': 'conflict',
                    'title': f'Retinoid + Chemical Acid Conflict ({session_name})',
                    'description': f"Layering retinoids with exfoliating acids (AHA/BHA) in the same {session_name.lower()} routine significantly increases risk of stratum corneum barrier compromise, erythema, and flaking.",
                    'actives': ['retinoids', 'aha/bha'],
                    'recommendation': 'Alternate nights: use your Retinoid on Night 1, and your exfoliating acid (AHA/BHA) on Night 2.'
                })

        # --- Rule 3: Benzoyl Peroxide + Retinoid ---
        for session_name, session_actives in [('Morning', am_actives), ('Evening', pm_actives)]:
            if 'benzoyl_peroxide' in session_actives and 'retinoids' in session_actives:
                conflicts.append({
                    'level': 'conflict',
                    'title': f'Benzoyl Peroxide + Retinoid Inactivation ({session_name})',
                    'description': 'Standard Benzoyl Peroxide can oxidize and deactivate classic Retinol when layered together, resulting in severe dryness with zero anti-acne benefit.',
                    'actives': ['benzoyl_peroxide', 'retinoids'],
                    'recommendation': 'Apply Benzoyl Peroxide in the Morning and your Retinoid in the Evening.'
                })

        # --- Rule 4: Pure Vitamin C (Ascorbic Acid) + Direct Acids (AHA/BHA) ---
        for session_name, session_actives in [('Morning', am_actives), ('Evening', pm_actives)]:
            if 'vitamin_c' in session_actives and ('aha' in session_actives or 'bha' in session_actives):
                cautions.append({
                    'level': 'caution',
                    'title': f'Multiple Low-pH Actives ({session_name})',
                    'description': 'Pure L-Ascorbic Acid and chemical exfoliants both demand low acidic pH, which can trigger tingling, sensitivity, or redness on reactive skin.',
                    'actives': ['vitamin_c', 'aha/bha'],
                    'recommendation': 'Use Vitamin C in the morning for antioxidant photoprotection; reserve AHAs/BHAs for evening exfoliation.'
                })

        # --- Rule 5: Duplicate Actives Check ---
        for session_name, session_actives in [('Morning', am_actives), ('Evening', pm_actives)]:
            for act_id, prod_list in session_actives.items():
                if len(prod_list) > 1 and act_id in ['bha', 'aha', 'retinoids', 'benzoyl_peroxide']:
                    act_name = ACTIVE_PATTERNS[act_id]['name']
                    cautions.append({
                        'level': 'caution',
                        'title': f'Duplicate {act_name} in {session_name}',
                        'description': f"Found multiple products containing {act_name}: {', '.join(prod_list)}. Layering duplicate strong exfoliants can lead to accidental over-exfoliation.",
                        'actives': [act_id],
                        'recommendation': 'Choose only one active step per routine.'
                    })

        # --- Rule 6: Positive Clinical Synergies ---
        # Niacinamide + Salicylic Acid (Great for pore clearance & sebum)
        if ('niacinamide' in am_actives and 'bha' in am_actives) or ('niacinamide' in pm_actives and 'bha' in pm_actives):
            synergies.append({
                'title': 'BHA + Niacinamide Synergy',
                'description': 'Salicylic acid clears sebum inside pores while Niacinamide strengthens barrier resilience and minimizes redness.',
                'status': 'Optimal Combination'
            })

        # Ceramides + Hyaluronic Acid / Retinoids (Barrier protection)
        if ('ceramides' in pm_actives and 'retinoids' in pm_actives):
            synergies.append({
                'title': 'Retinoid + Ceramide Barrier Buffering',
                'description': 'Ceramides replenish the lipid matrix, mitigating retinoid-induced dryness and peeling.',
                'status': 'Clinical Best Practice'
            })

        if ('vitamin_c' in am_actives or 'vitamin_c_derivatives' in am_actives):
            timing_tips.append('Antioxidant Defense: Apply your Vitamin C in the morning under broad-spectrum SPF to neutralize UV-induced free radicals.')

        # Overall Status
        if conflicts:
            overall_status = 'Conflict Detected'
            status_code = 'conflict'
            status_color = 'rose'
            status_summary = f'{len(conflicts)} active conflict(s) detected. Adjust timing to prevent barrier damage.'
        elif cautions:
            overall_status = 'Layering Caution'
            status_code = 'caution'
            status_color = 'amber'
            status_summary = f'{len(cautions)} mild layering caution(s). Follow spacing guidelines for best results.'
        else:
            overall_status = 'Barrier-Safe & Harmonized'
            status_code = 'safe'
            status_color = 'emerald'
            status_summary = 'All active ingredients in your morning and evening regimens are clinically compatible and safe to layer.'

        return {
            'overall_status': overall_status,
            'status_code': status_code,
            'status_color': status_color,
            'status_summary': status_summary,
            'conflicts': conflicts,
            'cautions': cautions,
            'synergies': synergies,
            'timing_tips': timing_tips,
            'active_inventory': {
                'morning': {ACTIVE_PATTERNS[k]['name']: v for k, v in am_actives.items() if k in ACTIVE_PATTERNS},
                'evening': {ACTIVE_PATTERNS[k]['name']: v for k, v in pm_actives.items() if k in ACTIVE_PATTERNS}
            }
        }
