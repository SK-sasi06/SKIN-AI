# Verified Dataset Sources

## 1. Cosmetics Benchmark Dataset
- **File**: `datasets/products/cosmetics.csv`
- **Source**: Kaggle / GitHub Public Benchmark (`kingabzpro/Cosmetics-Datasets` & Sephora Scrape Benchmark)
- **Record Count**: 1,472 products
- **Fields**:
  - `Label`: Moisturizer, Cleanser, Treatment, Face Mask, Eye Cream, Sunscreen
  - `Brand`: Commercial skincare brands (The Ordinary, Dr. Jart+, Kiehl's, Clinique, Sunday Riley, etc.)
  - `Name`: Official product commercial name
  - `Price`: Retail pricing in USD
  - `Rank`: User satisfaction rating (1.0 - 5.0)
  - `Ingredients`: Full INCI ingredient declaration list
  - `Combination`, `Dry`, `Normal`, `Oily`, `Sensitive`: Boolean compatibility flags

## 2. Active Ingredient Mapping Table
The recommendation engine analyzes the INCI list against verified active ingredient aliases:
- **Salicylic Acid (BHA)**: `salicylic acid`, `willow bark extract`, `betaine salicylate`
- **Niacinamide (Vitamin B3)**: `niacinamide`, `nicotinic acid`
- **Vitamin C (L-Ascorbic Acid / Derivatives)**: `ascorbic acid`, `tetrahexyldecyl ascorbate`, `magnesium ascorbyl phosphate`, `sodium ascorbyl phosphate`
- **Retinoids**: `retinol`, `retinyl palmitate`, `hydroxypinacolone retinoate`, `bakuchiol`
- **Centella / Madecassoside (Cica)**: `centella asiatica`, `madecassoside`, `asiaticoside`
- **Peptides**: `palmitoyl tripeptide`, `copper tripeptide`, `acetyl hexapeptide`, `matrixyl`
- **Caffeine**: `caffeine`, `green tea extract`
- **Hyaluronic Acid**: `hyaluronic acid`, `sodium hyaluronate`, `hydrolyzed hyaluronic acid`