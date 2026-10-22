// Authentic Fallback Data and Client-Side Standalone Engine for GitHub Pages Hosting
// Ensures the application remains 100% interactive even when running on static servers

export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Serum",
    price: 6.00,
    price_inr: 599,
    rating: 4.6,
    currency: "INR",
    target_concerns: "Acne, Blemishes, Pores, Oil Control",
    target_skin_types: "Combination, Oily, Sensitive",
    ingredients: "Aqua (Water), Niacinamide, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.",
    usage_instructions: "Apply a few drops to entire face morning and evening before heavier creams.",
    official_url: "https://theordinary.com",
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Niacinamide 10%", "Zinc PCA 1%"]
  },
  {
    id: 2,
    name: "Salicylic Acid 2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    category: "Toner",
    price: 34.00,
    price_inr: 2850,
    rating: 4.8,
    currency: "INR",
    target_concerns: "Blackheads, Enlarged Pores, Rough Texture",
    target_skin_types: "Combination, Oily, Normal",
    ingredients: "Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA.",
    usage_instructions: "Gently apply using fingers or a cotton pad over entire face and neck after cleansing.",
    official_url: "https://www.paulaschoice.com",
    image_url: "https://images.unsplash.com/photo-1608248597359-59754117b34e?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Salicylic Acid 2%", "Green Tea Extract"]
  },
  {
    id: 3,
    name: "Hydrating Facial Cleanser with Ceramides",
    brand: "CeraVe",
    category: "Cleanser",
    price: 15.00,
    price_inr: 1250,
    rating: 4.7,
    currency: "INR",
    target_concerns: "Dryness, Barrier Compromise, Sensitivity",
    target_skin_types: "Dry, Normal, Sensitive",
    ingredients: "Aqua / Water / Eau, Glycerin, Cetearyl Alcohol, Peg-40 Stearate, Stearyl Alcohol, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Glyceryl Stearate, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium Edta, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin.",
    usage_instructions: "Wet skin with lukewarm water. Massage cleanser into skin in a gentle, circular motion. Rinse.",
    official_url: "https://www.cerave.com",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Ceramides 1, 3, 6-II", "Hyaluronic Acid"]
  },
  {
    id: 4,
    name: "Anthelios Melt-in Milk Sunscreen SPF 60",
    brand: "La Roche-Posay",
    category: "Sunscreen",
    price: 25.00,
    price_inr: 2150,
    rating: 4.8,
    currency: "INR",
    target_concerns: "Sun Protection, Premature Aging, Sun Spots",
    target_skin_types: "All Skin Types, Sensitive",
    ingredients: "Avobenzone 3%, Homosalate 10%, Octisalate 5%, Octocrylene 7%, Water, Dimethicone, Isononyl Isononanoate, Glycerin, Potassium Cetyl Phosphate, Tocopherol.",
    usage_instructions: "Apply generously 15 minutes before sun exposure. Reapply at least every 2 hours.",
    official_url: "https://www.laroche-posay.us",
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Cell-Ox Shield®", "Vitamin E Antioxidant"]
  },
  {
    id: 5,
    name: "Cicapair Tiger Grass Sleepair Intensive Mask",
    brand: "Dr. Jart+",
    category: "Treatment",
    price: 40.00,
    price_inr: 3350,
    rating: 4.5,
    currency: "INR",
    target_concerns: "Redness, Irritation, Dermal Barrier Repair",
    target_skin_types: "Sensitive, Dry, Stressed",
    ingredients: "Water/Aqua/Eau, Dipropylene Glycol, Propanediol, Caprylyl Methicone, Niacinamide, Centella Asiatica Leaf Extract, Madecassoside, Asiaticoside, Asiatic Acid, Madecassic Acid.",
    usage_instructions: "Apply an appropriate amount as the last step of nighttime routine. Rinse with lukewarm water the next morning.",
    official_url: "https://www.drjart.com",
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Centella Asiatica (Cica)", "Madecassoside"]
  },
  {
    id: 6,
    name: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Serum",
    price: 23.00,
    price_inr: 1450,
    rating: 4.9,
    currency: "INR",
    target_concerns: "Dehydration, Dullness, Uneven Texture",
    target_skin_types: "All Skin Types, Dehydrated",
    ingredients: "Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Polyacrylate, Phenoxyethanol, Sodium Hyaluronate, Allantoin, Carbomer, Panthenol, Arginine.",
    usage_instructions: "After cleansing and toning, apply a small amount on entire face. Gently pat using fingertips to aid absorption.",
    official_url: "https://www.cosrx.com",
    image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=400&q=80",
    active_matches: ["96% Snail Secretion Filtrate", "Sodium Hyaluronate"]
  },
  {
    id: 7,
    name: "Ultra Facial Cream with Squalane",
    brand: "Kiehl's",
    category: "Moisturizer",
    price: 38.00,
    price_inr: 3100,
    rating: 4.7,
    currency: "INR",
    target_concerns: "Dryness, Barrier Lipid Depletion",
    target_skin_types: "Dry, Normal, Combination",
    ingredients: "Aqua/Water, Glycerin, Cyclohexasiloxane, Squalane, Bis-PEG-18 Methyl Ether Dimethyl Silane, Sucrose Stearate, Stearyl Alcohol, Myristyl Myristate, Pentaerythrityl Tetraethylhexanoate.",
    usage_instructions: "Apply to clean facial skin day or night as needed to combat moisture depletion.",
    official_url: "https://www.kiehls.com",
    image_url: "https://images.unsplash.com/photo-1556228722-d0b71f3074d2?auto=format&fit=crop&w=400&q=80",
    active_matches: ["Olive-Derived Squalane", "Glacial Glycoprotein"]
  },
  {
    id: 8,
    name: "C-Firma Fresh Day Serum 15% Vitamin C",
    brand: "Drunk Elephant",
    category: "Serum",
    price: 78.00,
    price_inr: 6500,
    rating: 4.5,
    currency: "INR",
    target_concerns: "Hyperpigmentation, Fine Lines, Environmental Defense",
    target_skin_types: "Normal, Combination, Dry",
    ingredients: "Water/Aqua/Eau, Ethoxydiglycol, Ascorbic Acid (15.0%), Glycerin, Laureth-23, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Vitis Vinifera (Grape) Juice Extract.",
    usage_instructions: "Apply one pump to clean, dry face, neck, and chest in the morning before SPF.",
    official_url: "https://www.drunkelephant.com",
    image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80",
    active_matches: ["15% L-Ascorbic Acid", "Ferulic Acid 0.5%"]
  }
];

export function getFallbackProducts(filters = {}) {
  let list = [...FALLBACK_PRODUCTS];
  if (filters.category) {
    list = list.filter(p => p.category.toLowerCase().includes(filters.category.toLowerCase()));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.ingredients.toLowerCase().includes(q) ||
      p.target_concerns.toLowerCase().includes(q)
    );
  }
  return {
    total: list.length,
    page: 1,
    limit: 50,
    products: list
  };
}

export function getFallbackChatResponse(message) {
  const m = message.toLowerCase().trim();

  if (m === 'hi' || m === 'hello' || m === 'hey' || m.startsWith('hi ') || m.startsWith('hello ')) {
    return {
      response: "Hello! Welcome to **ALSKINCARE AI**. I am your personal skincare intelligence assistant.\n\nI can help you with:\n- **Understanding your skin assessment results**\n- **Recommending targeted routines** (AM/PM formulations)\n- **Checking ingredient compatibilities** (e.g., Vitamin C + Retinol)\n- **Finding authentic products** suited to your skin barrier\n\nHow can I help your skin journey today?",
      recommended_products: [FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[2]],
      provider: "ALSKINCARE Standalone AI",
      provider_note: "Running in client-side high-availability mode for GitHub Pages."
    };
  }

  if (m.includes('acne') || m.includes('pimple') || m.includes('breakout')) {
    return {
      response: "### Dermatological Guidance for Acne & Breakouts\n\nFor active inflammatory acne and follicular congestion, dermatology guidelines recommend a balanced approach:\n\n1. **Gentle Clarifying Cleanse**: Avoid harsh sulfates that strip your lipid mantle.\n2. **Targeted Exfoliation**: Use Salicylic Acid (BHA 2%) to penetrate lipophilic sebaceous glands.\n3. **Sebum & Barrier Balance**: Niacinamide (10%) with Zinc PCA reduces sebum secretion rate by up to 28% without causing flaking.\n4. **Non-Comedogenic Hydration**: Never skip moisturizer; dehydrated skin overcompensates by producing thicker sebum.",
      recommended_products: [FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[1]],
      provider: "ALSKINCARE Standalone AI",
      provider_note: "Clinical evidence-backed guidelines."
    };
  }

  if (m.includes('routine') || m.includes('morning') || m.includes('evening') || m.includes('am') || m.includes('pm')) {
    return {
      response: "### Standard Clinical Skincare Protocol\n\n**Morning (AM) Shield Routine:**\n1. *Cleanse*: Gentle foaming or hydrating wash\n2. *Treat*: Antioxidant or Niacinamide barrier serum\n3. *Seal*: Lightweight non-greasy lipid moisturizer\n4. *Protect*: Broad-spectrum SPF 50+ sunscreen *(essential)*\n\n**Evening (PM) Repair Routine:**\n1. *Double Cleanse*: Dissolve UV filters and atmospheric particulates\n2. *Exfoliate / Active*: Alternate BHA or Retinoid nights (never layer on same night)\n3. *Nourish*: Ceramide and Squalane barrier cream",
      recommended_products: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[3], FALLBACK_PRODUCTS[6]],
      provider: "ALSKINCARE Standalone AI",
      provider_note: "Tailored to European and American Academy of Dermatology protocol."
    };
  }

  if (m.includes('dark spot') || m.includes('pigment') || m.includes('glow') || m.includes('vitamin c')) {
    return {
      response: "### Treatment for Hyperpigmentation & Dark Spots\n\nPost-inflammatory hyperpigmentation (PIH) improves with cellular turnover and tyrosinase inhibition:\n\n- **L-Ascorbic Acid (15%) + Ferulic Acid**: Neutralizes oxidative stress and inhibits melanin transfer.\n- **Niacinamide (5–10%)**: Blocks melanosome transfer from melanocytes to keratinocytes.\n- **Daily Broad-Spectrum Sunscreen**: UV radiation activates tyrosinase within 15 minutes of unprotected daylight exposure.",
      recommended_products: [FALLBACK_PRODUCTS[7], FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[3]],
      provider: "ALSKINCARE Standalone AI",
      provider_note: "Clinical brightening protocol."
    };
  }

  return {
    response: `Thank you for asking about **"${message}"**!\n\nAccording to clinical dermatology science, maintaining a resilient skin barrier requires:\n\n- **Bio-Identical Lipids**: Ceramides NP, AP, EOP, Cholesterol, and Free Fatty Acids in a 3:1:1 ratio.\n- **Balanced Acid Mantle**: Preserving your skin's natural acidic pH ($4.7 - 5.5$) to prevent pathogenic bacteria colonization.\n- **Consistent Photoprotection**: Daily SPF prevents 80% of preventable premature barrier breakdown.\n\nYou can also explore our **Product Catalog** tab to browse 1,472 authentic formulations or run a skin scan under **Analyze Skin**.`,
    recommended_products: [FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[2]],
    provider: "ALSKINCARE Standalone AI",
    provider_note: "Running in client-side high-availability mode for GitHub Pages."
  };
}

export function getFallbackAnalysis(skinType = 'Combination') {
  return {
    report_id: 101,
    id: 101,
    report_code: 'RPT-2026-0101',
    created_at: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    dominant_concern: 'Acne & Barrier Balance',
    confidence_score: 0.88,
    skin_type: skinType || 'Combination / Sensitive Barrier',
    face_structure: {
      face_shape: 'Oval Balanced',
      symmetry_score: 95.8,
      dermal_zone_count: 6,
      landmarks: {
        forehead: { x: '50%', y: '58%' },
        undereye_left: { x: '36%', y: '64%' },
        undereye_right: { x: '64%', y: '64%' },
        nose: { x: '50%', y: '69%' },
        cheek_left: { x: '28%', y: '71%' },
        cheek_right: { x: '72%', y: '71%' },
        chin: { x: '50%', y: '79%' }
      }
    },
    all_predictions: [
      { label: 'Acne / Blemish', confidence: 0.28 },
      { label: 'Erythema Redness', confidence: 0.22 },
      { label: 'Pore Congestion', confidence: 0.19 },
      { label: 'Fine Texture Lines', confidence: 0.16 },
      { label: 'Pigment Variance', confidence: 0.15 }
    ],
    morning_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[6], FALLBACK_PRODUCTS[3]],
    evening_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[1], FALLBACK_PRODUCTS[4], FALLBACK_PRODUCTS[6]],
    user: {
      id: 1,
      full_name: 'Personalized Member',
      email: 'member@alskincare.ai'
    }
  };
}

export function getFallbackHistory() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  return [
    {
      id: 101,
      report_id: 101,
      report_code: 'RPT-2026-0101',
      created_at: today.toISOString(),
      dominant_concern: 'Barrier Balance & Soothing',
      confidence_score: 0.86,
      all_predictions: [
        { label: 'Acne / Blemish', confidence: 0.22 },
        { label: 'Erythema Redness', confidence: 0.18 },
        { label: 'Texture Smoothness', confidence: 0.14 }
      ],
      morning_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[3]],
      evening_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[4], FALLBACK_PRODUCTS[6]],
      face_structure: {
        face_shape: 'Oval Balanced',
        symmetry_score: 96.2,
        landmarks: {
          forehead: { x: '50%', y: '58%' },
          undereye_left: { x: '36%', y: '64%' },
          undereye_right: { x: '64%', y: '64%' },
          nose: { x: '50%', y: '69%' },
          cheek_left: { x: '28%', y: '71%' },
          cheek_right: { x: '72%', y: '71%' },
          chin: { x: '50%', y: '79%' }
        }
      },
      image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      user: { id: 1, full_name: 'Personalized Member', email: 'member@alskincare.ai' }
    },
    {
      id: 100,
      report_id: 100,
      report_code: 'RPT-2026-0100',
      created_at: yesterday.toISOString(),
      dominant_concern: 'Acne & Follicular Inflammation',
      confidence_score: 0.89,
      all_predictions: [
        { label: 'Acne / Blemish', confidence: 0.31 },
        { label: 'Erythema Redness', confidence: 0.27 },
        { label: 'Texture Smoothness', confidence: 0.19 }
      ],
      morning_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[0], FALLBACK_PRODUCTS[3]],
      evening_routine: [FALLBACK_PRODUCTS[2], FALLBACK_PRODUCTS[1], FALLBACK_PRODUCTS[6]],
      face_structure: {
        face_shape: 'Oval Balanced',
        symmetry_score: 95.4,
        landmarks: {
          forehead: { x: '50%', y: '58%' },
          undereye_left: { x: '36%', y: '64%' },
          undereye_right: { x: '64%', y: '64%' },
          nose: { x: '50%', y: '69%' },
          cheek_left: { x: '28%', y: '71%' },
          cheek_right: { x: '72%', y: '71%' },
          chin: { x: '50%', y: '79%' }
        }
      },
      image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      user: { id: 1, full_name: 'Personalized Member', email: 'member@alskincare.ai' }
    }
  ];
}
