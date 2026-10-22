import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag, RefreshCw, Filter, Sparkles, SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import SensitivityFilterBar from '../components/SensitivityFilterBar';

const CATEGORIES = ['All', 'Moisturizer', 'Cleanser', 'Treatment', 'Face Mask', 'Eye Cream', 'Sunscreen'];
const SKIN_CONCERNS = ['All', 'Acne', 'Skin Pigmentation', 'Skin Redness', 'Skin Texture', 'Wrinkled Face', 'Eyes Dark Circles', 'Puffy Eyes'];

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹1,500', value: 'under1500' },
  { label: '₹1,500 – ₹5,000', value: '1500to5000' },
  { label: 'Above ₹5,000', value: 'above5000' },
];

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: 'rating_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Product Name (A-Z)', value: 'name_asc' },
];

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [concern, setConcern] = useState('All');
  const [priceRange, setPriceRange] = useState('all');
  const [budgetTier, setBudgetTier] = useState('all');
  const [fragranceFree, setFragranceFree] = useState(false);
  const [alcoholFree, setAlcoholFree] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(24);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    setError('');
    const filters = { limit: pageSize };
    if (category !== 'All') filters.label = category;
    if (search.trim()) filters.search = search.trim();

    fetchProducts(filters)
      .then((data) => {
        let prods = data.products || [];
        setTotal(data.total || 0);
        setProducts(prods);
      })
      .catch((err) => {
        console.error('Catalog fetch error:', err);
        setError('Unable to load product formulations. Please verify backend connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [category, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  // Client-side filtering & sorting for instant responsiveness
  const filteredAndSortedProducts = products
    .filter((p) => {
      // Concern filter
      if (concern !== 'All') {
        const concerns = p.target_concerns || [];
        if (!concerns.includes(concern)) return false;
      }

      // Price filter
      const price = p.price_inr || p.price * 83.5 || 0;
      if (priceRange === 'under1500' && price >= 1500) return false;
      if (priceRange === '1500to5000' && (price < 1500 || price > 5000)) return false;
      if (priceRange === 'above5000' && price <= 5000) return false;

      // Budget Tier filter
      if (budgetTier !== 'all') {
        const pTier = p.budget_tier ? p.budget_tier.id : (price <= 700 ? 'budget' : (price <= 1800 ? 'mid' : 'premium'));
        if (pTier !== budgetTier) return false;
      }

      // Skin Sensitivity & Allergy Filters
      if (fragranceFree && p.sensitivities?.fragrance) return false;
      if (alcoholFree && p.sensitivities?.drying_alcohols) return false;

      return true;
    })
    .sort((a, b) => {
      const priceA = a.price_inr || a.price * 83.5 || 0;
      const priceB = b.price_inr || b.price * 83.5 || 0;
      const ratingA = a.rank || a.rating || 0;
      const ratingB = b.rank || b.rating || 0;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      return ratingB - ratingA; // rating_desc default
    });

  return (
    <div className="py-10 space-y-10">
      {/* Title */}
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-dermo-charcoal tracking-tight">
          Curated Product Catalogue
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          1,472 authentic commercial skincare products cross-referenced with dermatological active ingredients, INCI declarations, and official boutique store links.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-3xl p-6 border border-dermo-warm/90 shadow-sm space-y-5">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, product name, or INCI ingredient (e.g. Niacinamide, Retinol, Clinique)..."
              className="w-full bg-dermo-cream border border-dermo-warm text-dermo-charcoal rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-dermo-teal focus:ring-1 focus:ring-dermo-teal"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs shadow-sm transition-all"
          >
            Search Catalogue
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-dermo-teal text-white shadow-sm'
                  : 'bg-dermo-sand text-dermo-charcoal hover:bg-dermo-warm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Concern, Price, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dermo-warm/60">
          <div className="flex flex-wrap items-center gap-4">
            {/* Concern Focus */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                Concern:
              </span>
              <select
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                className="bg-dermo-cream border border-dermo-warm text-dermo-charcoal text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-dermo-teal font-medium"
              >
                {SKIN_CONCERNS.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                Price:
              </span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="bg-dermo-cream border border-dermo-warm text-dermo-charcoal text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-dermo-teal font-medium"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dermo-cream border border-dermo-warm text-dermo-charcoal text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-dermo-teal font-medium"
            >
              {SORT_OPTIONS.map((so) => (
                <option key={so.value} value={so.value}>
                  {so.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sensitivity & Budget Tier Filter Bar */}
      <SensitivityFilterBar
        budgetTier={budgetTier}
        setBudgetTier={setBudgetTier}
        fragranceFree={fragranceFree}
        setFragranceFree={setFragranceFree}
        alcoholFree={alcoholFree}
        setAlcoholFree={setAlcoholFree}
        totalResults={filteredAndSortedProducts.length}
      />

      {/* Product Grid Area */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs text-stone-500">
          <span>
            Displaying <strong>{filteredAndSortedProducts.length}</strong> matching formulations
          </span>
          <span>
            Total Database: <strong>{total}</strong> verified items
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadProducts}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 font-bold hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex items-center justify-center gap-3 text-stone-500">
            <RefreshCw className="w-5 h-5 animate-spin text-dermo-teal" />
            <span>Retrieving formulations...</span>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-dermo-warm text-stone-500 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-serif font-bold text-lg text-dermo-charcoal">No products match these filters</p>
            <p className="text-xs">Try selecting 'All' categories or adjusting your price and concern criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onSelect={(selected) => setSelectedProduct(selected)}
              />
            ))}
          </div>
        )}

        {/* Load More Pagination Button */}
        {!loading && pageSize < total && (
          <div className="pt-6 text-center">
            <button
              onClick={() => setPageSize((prev) => prev + 24)}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-dermo-sand border border-dermo-warm text-dermo-charcoal font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              Load More Products ({pageSize} of {total})
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
