import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  Shield,
  ShieldCheck,
  AlertCircle,
  Plus,
  Search,
  Camera,
  Trash2,
  RefreshCw,
  Printer,
  ChevronRight,
  Sun,
  Moon,
  Droplets,
  Flame,
  CheckCircle2,
  ArrowRight,
  Award,
  Layers,
  FileText,
  Sliders,
  X,
  Package,
  Pencil
} from 'lucide-react';
import {
  fetchJourneyTimeline,
  saveDailyRoutine,
  deleteDailyRoutine,
  fetchJourneyStreak,
  fetchJourneyProducts,
  addJourneyProduct,
  deleteJourneyProduct,
  fetchSkinReactions,
  logSkinReaction,
  fetchSkinAnalytics,
  fetchProductEffectiveness,
  fetchJourneySummary,
  fetchMonthlyReport,
  searchJourneyTimeline,
  deleteUploadedPhoto
} from '../services/api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import LogRoutineModal from '../components/LogRoutineModal';
import LogReactionModal from '../components/LogReactionModal';
import AddProductModal from '../components/AddProductModal';

export default function SkinJourneyPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'progress' | 'reports'

  // Data states
  const [timeline, setTimeline] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [vanityProducts, setVanityProducts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [productJournal, setProductJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Before/After comparison report selection
  const [selectedReportAId, setSelectedReportAId] = useState(null);
  const [selectedReportBId, setSelectedReportBId] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('slider'); // 'slider' | 'side-by-side'

  // Selected product for effectiveness journal
  const [selectedJournalProductId, setSelectedJournalProductId] = useState(null);

  // Modals state
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutineData, setEditingRoutineData] = useState(null);
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Load initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tl, stk, prods, analytics, sum, report] = await Promise.all([
        fetchJourneyTimeline(30).catch(() => []),
        fetchJourneyStreak().catch(() => null),
        fetchJourneyProducts().catch(() => []),
        fetchSkinAnalytics().catch(() => null),
        fetchJourneySummary().catch(() => null),
        fetchMonthlyReport(2026, 10).catch(() => null)
      ]);

      setTimeline(tl);
      setStreakData(stk);
      setVanityProducts(prods);
      setAnalyticsData(analytics);
      setSummaryData(sum);
      setMonthlyReport(report);

      // Default before/after selection
      if (analytics && analytics.timeline && analytics.timeline.length >= 2) {
        setSelectedReportAId(analytics.timeline[0].report_id);
        setSelectedReportBId(analytics.timeline[analytics.timeline.length - 1].report_id);
      } else if (analytics && analytics.timeline && analytics.timeline.length === 1) {
        setSelectedReportAId(analytics.timeline[0].report_id);
        setSelectedReportBId(analytics.timeline[0].report_id);
      }

      // Default product journal
      if (prods && prods.length > 0) {
        setSelectedJournalProductId(prods[0].id);
        const journal = await fetchProductEffectiveness(prods[0].id).catch(() => null);
        setProductJournal(journal);
      }
    } catch (err) {
      console.error('Error loading Skin Journey data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update product journal when product changes
  const handleSelectJournalProduct = async (prodId) => {
    setSelectedJournalProductId(prodId);
    try {
      const journal = await fetchProductEffectiveness(prodId);
      setProductJournal(journal);
    } catch (err) {
      console.error('Failed to fetch product journal:', err);
    }
  };

  // Search handler
  const handleSearchSubmit = async (e) => {
    e?.preventDefault?.();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchJourneyTimeline(searchQuery.trim());
      setSearchResult(res);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = async (term) => {
    setSearchQuery(term);
    setSearching(true);
    try {
      const res = await searchJourneyTimeline(term);
      setSearchResult(res);
    } catch (err) {
      console.error('Quick search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
  };

  // Save routine handler
  const handleSaveRoutine = async (routinePayload) => {
    await saveDailyRoutine(routinePayload);
    await loadAllData();
  };

  // Delete routine handler
  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine record?')) {
      await deleteDailyRoutine(routineId);
      await loadAllData();
    }
  };

  // Log reaction handler
  const handleSaveReaction = async (reactionPayload) => {
    await logSkinReaction(reactionPayload);
    await loadAllData();
  };

  // Add product handler
  const handleSaveProduct = async (productPayload) => {
    await addJourneyProduct(productPayload);
    await loadAllData();
  };

  // Delete product handler
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Remove this product from your vanity shelf?')) {
      await deleteJourneyProduct(productId);
      await loadAllData();
    }
  };

  // Refresh AI summary
  const handleRefreshSummary = async () => {
    try {
      const sum = await fetchJourneySummary();
      setSummaryData(sum);
    } catch (err) {
      console.error('Failed to regenerate AI summary:', err);
    }
  };

  // Delete photo handler
  const handleDeletePhoto = async (imageName) => {
    if (window.confirm('Permanently delete this facial photo from disk to protect your privacy?')) {
      try {
        await deleteUploadedPhoto(imageName);
        alert('Photo successfully scrubbed and deleted from server storage.');
        await loadAllData();
      } catch (err) {
        alert(err.message || 'Failed to delete photo');
      }
    }
  };

  // Prepare before/after reports
  const allScans = analyticsData?.timeline || [];
  const reportA = allScans.find(s => s.report_id === Number(selectedReportAId)) || allScans[0];
  const reportB = allScans.find(s => s.report_id === Number(selectedReportBId)) || allScans[allScans.length - 1] || allScans[0];

  if (loading) {
    return (
      <div className="py-8 space-y-8 animate-pulse">
        {/* Skeleton Hero */}
        <div className="rounded-3xl bg-dermo-warm/50 h-72 w-full p-8 flex flex-col justify-between border border-dermo-warm/80">
          <div className="space-y-3">
            <div className="h-5 w-48 bg-stone-300/60 rounded-full" />
            <div className="h-10 w-80 sm:w-96 bg-stone-300/80 rounded-2xl" />
            <div className="h-4 w-72 bg-stone-300/50 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-300/30">
            <div className="h-14 bg-stone-300/40 rounded-2xl" />
            <div className="h-14 bg-stone-300/40 rounded-2xl" />
            <div className="h-14 bg-stone-300/40 rounded-2xl" />
            <div className="h-14 bg-stone-300/40 rounded-2xl" />
          </div>
        </div>

        {/* Skeleton Nav Tabs */}
        <div className="h-12 w-80 bg-dermo-sand rounded-2xl border border-dermo-warm/60" />

        {/* Skeleton Timeline Cards */}
        <div className="space-y-4">
          <div className="h-48 rounded-3xl bg-white border border-dermo-warm/80 p-6 space-y-4">
            <div className="h-6 w-44 bg-stone-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 bg-stone-100 rounded-2xl" />
              <div className="h-28 bg-stone-100 rounded-2xl" />
            </div>
          </div>
          <div className="h-48 rounded-3xl bg-white border border-dermo-warm/80 p-6 space-y-4">
            <div className="h-6 w-44 bg-stone-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 bg-stone-100 rounded-2xl" />
              <div className="h-28 bg-stone-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dermo-tealDark via-dermo-teal to-[#1B302C] text-white p-6 sm:p-10 shadow-xl border border-dermo-warm/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-dermo-gold font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skin Journey AI &bull; Longitudinal Skincare Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Your Skin's Daily Story
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed font-light">
              Track daily AM/PM routines, monitor before-and-after photo evolution, log barrier reactions, and view objective clinical indicator analytics over time.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => {
                setEditingRoutineData(null);
                setIsRoutineModalOpen(true);
              }}
              className="px-5 py-3 rounded-full bg-white text-dermo-teal hover:bg-dermo-sand font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-dermo-teal" />
              Record Routine
            </button>
            <button
              onClick={() => onNavigate('analyze')}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-dermo-gold" />
              Scan Face
            </button>
          </div>
        </div>

        {/* Top Metric Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/15">
          {/* Streak Card */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Flame className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                {streakData?.streak_days || 7} <span className="text-xs font-sans font-normal text-amber-300">Days</span>
              </div>
              <div className="text-[11px] text-white/70 font-medium">Routine Streak 🔥</div>
            </div>
          </div>

          {/* Adherence Rate */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                {streakData?.adherence_7_days_pct || 86}%
              </div>
              <div className="text-[11px] text-white/70 font-medium">7-Day Adherence</div>
            </div>
          </div>

          {/* Scans Analyzed */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <Camera className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                {analyticsData?.timeline?.length || 14}
              </div>
              <div className="text-[11px] text-white/70 font-medium">Objective Scans</div>
            </div>
          </div>

          {/* Vanity Shelf Products */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Package className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                {vanityProducts.length} <span className="text-xs font-sans font-normal text-white/70">Actives</span>
              </div>
              <div className="text-[11px] text-white/70 font-medium">Vanity Shelf</div>
            </div>
          </div>
        </div>

        {/* Missed Routine / Routine Reminder Alert Banner */}
        {streakData?.alerts && streakData.alerts.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <div className="text-xs text-white">
                <span className="font-bold text-amber-300">{streakData.alerts[0].title}: </span>
                {streakData.alerts[0].message}
              </div>
            </div>
            <button
              onClick={() => {
                setEditingRoutineData(null);
                setIsRoutineModalOpen(true);
              }}
              className="text-xs px-3 py-1 rounded-full bg-amber-400 text-stone-900 font-bold hover:bg-amber-300 transition-colors shrink-0"
            >
              Log Now
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-center sm:justify-start border-b border-dermo-warm/80">
        <div className="flex items-center gap-2 p-1.5 bg-dermo-sand/70 rounded-2xl border border-dermo-warm">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-stone-600 hover:text-dermo-charcoal hover:bg-white/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-stone-600 hover:text-dermo-charcoal hover:bg-white/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Progress & Comparison
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-stone-600 hover:text-dermo-charcoal hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            AI Reports & Shelf
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TIMELINE (Daily skincare history, routine logs, search)
      ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Smart Timeline Search & Quick Action Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What products did I use last Wednesday? (or search 'dryness', 'Cleanser')..."
                  className="w-full pl-10 pr-24 py-3 rounded-2xl border border-dermo-warm bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dermo-teal shadow-2xs"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-dermo-teal text-white text-xs font-bold hover:bg-dermo-tealDark transition-all"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </form>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => {
                    setEditingRoutineData(null);
                    setIsRoutineModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-dermo-warm hover:border-dermo-teal text-xs font-semibold text-dermo-charcoal shadow-2xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-dermo-teal" />
                  Log Routine
                </button>
                <button
                  onClick={() => setIsReactionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-dermo-warm hover:border-rose-400 text-xs font-semibold text-rose-800 shadow-2xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Droplets className="w-3.5 h-3.5 text-rose-600" />
                  Log Reaction
                </button>
                <button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-dermo-warm hover:border-dermo-teal text-xs font-semibold text-dermo-charcoal shadow-2xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Package className="w-3.5 h-3.5 text-dermo-teal" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Quick search suggestion chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-500">
              <span className="font-semibold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-dermo-gold" />
                Quick filter:
              </span>
              {['Cleanser', 'Moisturizer', 'Niacinamide', 'Sunscreen', 'Yesterday', 'Dryness'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickSearch(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-dermo-sand/70 hover:bg-dermo-teal hover:text-white border border-dermo-warm/80 transition-all font-medium text-stone-600 shadow-2xs cursor-pointer"
                >
                  {tag}
                </button>
              ))}
              {searchResult && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold ml-1 transition-all"
                >
                  Reset Filter &times;
                </button>
              )}
            </div>
          </div>

          {/* AI Search Answer Banner if search submitted */}
          {searchResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-dermo-sand to-white border-2 border-dermo-teal/40 shadow-sm space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-dermo-teal uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-dermo-gold" />
                  <span>Timeline Search Synthesis</span>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-dermo-charcoal font-medium leading-relaxed">
                {searchResult.answer}
              </p>
              <div className="text-[11px] text-stone-500">
                Found {searchResult.count} matching day{searchResult.count === 1 ? '' : 's'} in your skincare history.
              </div>
            </div>
          )}

          {/* Daily Skincare History Timeline Stream */}
          <div className="space-y-6">
            {(searchResult ? searchResult.results : timeline).length === 0 ? (
              searchResult ? (
                /* Search Empty State */
                <div className="p-10 text-center rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-3">
                  <Search className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-dermo-charcoal">No Matching Records Found</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    We couldn't find any routines or skin reaction notes matching <span className="font-semibold text-dermo-charcoal">"{searchQuery}"</span>. Try searching for specific product names (e.g. "Cleanser"), dates ("yesterday"), or reactions ("dryness").
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 rounded-full bg-dermo-sand text-stone-700 text-xs font-bold hover:bg-dermo-warm transition-all"
                    >
                      Clear Search & View All
                    </button>
                    <button
                      onClick={() => setIsRoutineModalOpen(true)}
                      className="px-4 py-2 rounded-full bg-dermo-teal text-white text-xs font-bold shadow-md hover:bg-dermo-tealDark transition-all"
                    >
                      Log Routine
                    </button>
                  </div>
                </div>
              ) : (
                /* General Empty State */
                <div className="p-12 text-center rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-3">
                  <Clock className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-dermo-charcoal">No Routine History Found</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Start logging your daily cleanser, serum, moisturizer, and sunscreen routines to build your personal skin journey.
                  </p>
                  <button
                    onClick={() => setIsRoutineModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-dermo-teal text-white text-xs font-bold shadow-md hover:bg-dermo-tealDark"
                  >
                    Log First Routine
                  </button>
                </div>
              )
            ) : (
              (searchResult ? searchResult.results : timeline).map((dayItem) => {
                const dateMeta = dayItem.date_meta;
                const morning = dayItem.morning;
                const evening = dayItem.evening;
                const reactions = dayItem.reactions || [];
                const scans = dayItem.scans || [];

                return (
                  <div
                    key={dayItem.date}
                    className="rounded-3xl bg-white border border-dermo-warm/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Date Ribbon Header */}
                    <div className="p-4 sm:p-5 bg-dermo-cream/70 border-b border-dermo-warm/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        {/* Date Block */}
                        <div className="w-14 h-14 rounded-2xl bg-white border border-dermo-warm shadow-xs flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-dermo-accent uppercase tracking-wider leading-none">
                            {dateMeta.month_short}
                          </span>
                          <span className="text-xl font-serif font-bold text-dermo-charcoal leading-none mt-0.5">
                            {dateMeta.day_num}
                          </span>
                          <span className="text-[9px] text-stone-400 font-medium leading-none mt-0.5">
                            {dateMeta.relative}
                          </span>
                        </div>

                        {/* Title and adherence status */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base sm:text-lg text-dermo-charcoal">
                              {dateMeta.weekday}
                            </h3>
                            <span className="text-stone-400 text-xs">&bull;</span>
                            <span className="text-xs text-stone-500 font-medium">
                              {morning && evening ? 'Full Routine Recorded' : morning ? 'Morning Logged' : 'Day Log'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {dateMeta.full_date}
                          </p>
                        </div>
                      </div>

                      {/* Day Status Badge & Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${dayItem.status_badge || 'bg-stone-100 text-stone-700'}`}>
                          {dayItem.overall_status}
                        </span>
                        <button
                          onClick={() => {
                            setEditingRoutineData({
                              log_date: dayItem.date,
                              period: morning ? 'evening' : 'morning'
                            });
                            setIsRoutineModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-dermo-teal hover:bg-dermo-sand transition-colors"
                          title="Add/Edit routine for this date"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Routine Details Grid */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Morning Routine Card */}
                      <div className="p-4 rounded-2xl bg-dermo-cream/50 border border-dermo-warm/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sun className="w-4 h-4 text-amber-500" />
                            Morning Routine
                          </span>
                          {morning ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {morning.products?.[0]?.time || 'Completed'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingRoutineData({
                                    id: morning.id,
                                    log_date: dayItem.date,
                                    period: 'morning',
                                    is_completed: morning.is_completed,
                                    missed_reason: morning.missed_reason,
                                    steps: morning.steps,
                                    products: morning.products,
                                    skin_feel: morning.skin_feel,
                                    reactions: morning.reactions,
                                    notes: morning.notes
                                  });
                                  setIsRoutineModalOpen(true);
                                }}
                                className="p-1 rounded-md text-stone-400 hover:text-dermo-teal hover:bg-white shadow-2xs transition-all"
                                title="Edit morning routine"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoutine(morning.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-white shadow-2xs transition-all"
                                title="Delete morning routine"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Not logged</span>
                          )}
                        </div>

                        {morning ? (
                          <div className="space-y-2">
                            {/* Step pills */}
                            <div className="text-xs font-serif font-bold text-dermo-charcoal">
                              {morning.steps?.length > 0
                                ? morning.steps.join(' · ')
                                : 'Cleanser · Moisturizer · Sunscreen'}
                            </div>

                            {/* Specific products */}
                            {morning.products && morning.products.length > 0 && (
                              <div className="space-y-1 pt-1">
                                {morning.products.map((p, idx) => (
                                  <div key={idx} className="text-xs text-stone-600 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-dermo-teal"></span>
                                    <span className="font-medium text-dermo-charcoal">{p.name}</span>
                                    {p.brand && <span className="text-stone-400 text-[11px]">({p.brand})</span>}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Skin feel */}
                            {morning.skin_feel && (
                              <div className="text-xs text-stone-500 italic pt-1 border-t border-stone-200/60">
                                Skin feel: {morning.skin_feel}
                              </div>
                            )}

                            {morning.notes && (
                              <div className="text-[11px] text-stone-500">
                                {morning.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="py-3 text-center space-y-2">
                            <p className="text-xs text-stone-400">Morning routine not recorded for this date.</p>
                            <button
                              onClick={() => {
                                setEditingRoutineData({ log_date: dayItem.date, period: 'morning' });
                                setIsRoutineModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-full bg-white border border-dermo-warm hover:bg-dermo-sand text-[11px] font-semibold text-dermo-teal"
                            >
                              + Log Morning
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Evening Routine Card */}
                      <div className="p-4 rounded-2xl bg-dermo-cream/50 border border-dermo-warm/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-dermo-teal uppercase tracking-wider flex items-center gap-1.5">
                            <Moon className="w-4 h-4 text-indigo-500" />
                            Evening Routine
                          </span>
                          {evening ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {evening.products?.[0]?.time || (evening.is_completed ? 'Completed' : 'Missed')}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingRoutineData({
                                    id: evening.id,
                                    log_date: dayItem.date,
                                    period: 'evening',
                                    is_completed: evening.is_completed,
                                    missed_reason: evening.missed_reason,
                                    steps: evening.steps,
                                    products: evening.products,
                                    skin_feel: evening.skin_feel,
                                    reactions: evening.reactions,
                                    notes: evening.notes
                                  });
                                  setIsRoutineModalOpen(true);
                                }}
                                className="p-1 rounded-md text-stone-400 hover:text-dermo-teal hover:bg-white shadow-2xs transition-all"
                                title="Edit evening routine"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoutine(evening.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-white shadow-2xs transition-all"
                                title="Delete evening routine"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium">Routine not recorded yet</span>
                          )}
                        </div>

                        {evening ? (
                          evening.is_completed ? (
                            <div className="space-y-2">
                              {/* Step pills */}
                              <div className="text-xs font-serif font-bold text-dermo-charcoal">
                                {evening.steps?.length > 0
                                  ? evening.steps.join(' · ')
                                  : 'Cleanser · Moisturizer'}
                              </div>

                              {/* Specific products */}
                              {evening.products && evening.products.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  {evening.products.map((p, idx) => (
                                    <div key={idx} className="text-xs text-stone-600 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-dermo-teal"></span>
                                      <span className="font-medium text-dermo-charcoal">{p.name}</span>
                                      {p.brand && <span className="text-stone-400 text-[11px]">({p.brand})</span>}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Skin feel */}
                              {evening.skin_feel && (
                                <div className="text-xs text-stone-600 italic pt-1 border-t border-stone-200/60 font-medium">
                                  User feedback: {evening.skin_feel}.
                                </div>
                              )}

                              {evening.notes && (
                                <div className="text-[11px] text-stone-500">
                                  {evening.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Routine Missed
                              </span>
                              <p className="text-xs text-rose-700">
                                Reason: {evening.missed_reason || 'Forgot routine'}
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="py-3 text-center space-y-2">
                            <p className="text-xs text-stone-500 font-medium">Evening: Routine not recorded yet</p>
                            <button
                              onClick={() => {
                                setEditingRoutineData({ log_date: dayItem.date, period: 'evening' });
                                setIsRoutineModalOpen(true);
                              }}
                              className="px-4 py-1.5 rounded-full bg-dermo-teal text-white text-[11px] font-bold shadow-xs hover:bg-dermo-tealDark transition-all"
                            >
                              + Record Evening Routine
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback, Reactions & Photo Analysis Footer */}
                    <div className="px-5 py-3.5 bg-stone-50/70 border-t border-dermo-warm/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      {/* Reactions logged */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {reactions.length > 0 ? (
                          reactions.map((rx, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Droplets className="w-3 h-3 text-rose-600" />
                              Reaction: {rx.reaction_type} ({rx.severity})
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400 text-[11px]">
                            Skin tolerance calm & healthy
                          </span>
                        )}
                      </div>

                      {/* Photo analysis status */}
                      <div className="flex items-center gap-2">
                        {scans.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5" />
                              Scan recorded: {scans[0].dominant_concern} ({scans[0].confidence_pct}%)
                            </span>
                            <button
                              onClick={() => {
                                setSelectedReportBId(scans[0].id);
                                setActiveTab('progress');
                              }}
                              className="text-dermo-teal hover:underline font-semibold text-[11px] flex items-center gap-0.5"
                            >
                              Compare Progress <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400 text-[11px]">New photo analysis: Awaiting upload</span>
                            <button
                              onClick={() => onNavigate('analyze')}
                              className="text-dermo-teal hover:underline font-semibold text-[11px]"
                            >
                              + Scan Photo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROGRESS & COMPARISON (Before/After slider, timeline charts, journal)
      ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-10">
          {/* Section 1: Before-and-After Skin Comparison */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-dermo-teal" />
                  Before-and-After Skin Comparison
                </h2>
                <p className="text-xs text-stone-500">
                  Compare objective facial scans across dates under consistent conditions to observe visible acne, redness, and texture evolution.
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-2 bg-dermo-sand p-1 rounded-xl border border-dermo-warm">
                <button
                  onClick={() => setComparisonMode('slider')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    comparisonMode === 'slider' ? 'bg-white shadow-xs text-dermo-teal font-bold' : 'text-stone-600'
                  }`}
                >
                  Interactive Slider
                </button>
                <button
                  onClick={() => setComparisonMode('side-by-side')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    comparisonMode === 'side-by-side' ? 'bg-white shadow-xs text-dermo-teal font-bold' : 'text-stone-600'
                  }`}
                >
                  Side by Side
                </button>
              </div>
            </div>

            {/* Scan Selectors */}
            {allScans.length < 2 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-dermo-warm space-y-3">
                <Camera className="w-8 h-8 text-stone-400 mx-auto" />
                <h3 className="font-serif font-bold text-base text-dermo-charcoal">Need at least 2 scans to compare</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Upload a follow-up photo scan to start comparing before-and-after progress side-by-side.
                </p>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="px-5 py-2.5 rounded-full bg-dermo-teal text-white text-xs font-bold"
                >
                  Take Next Scan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Baseline Scan (Initial Date)
                    </label>
                    <select
                      value={selectedReportAId || ''}
                      onChange={(e) => setSelectedReportAId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-dermo-warm bg-dermo-cream text-xs text-stone-700 focus:outline-none"
                    >
                      {allScans.map(s => (
                        <option key={s.report_id} value={s.report_id}>
                          Scan #{s.report_id} &bull; {s.date} &bull; {s.dominant_concern} ({s.confidence_pct}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Follow-up Scan (Current / Progress Date)
                    </label>
                    <select
                      value={selectedReportBId || ''}
                      onChange={(e) => setSelectedReportBId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-dermo-warm bg-dermo-cream text-xs text-stone-700 focus:outline-none"
                    >
                      {allScans.map(s => (
                        <option key={s.report_id} value={s.report_id}>
                          Scan #{s.report_id} &bull; {s.date} &bull; {s.dominant_concern} ({s.confidence_pct}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Render Comparison */}
                {reportA && reportB && (
                  comparisonMode === 'slider' ? (
                    <BeforeAfterSlider reportA={reportA} reportB={reportB} allReports={allScans} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Card: Report A */}
                      <div className="p-5 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Baseline Scan ({reportA.date})
                          </span>
                          <span className="text-xs font-serif font-bold text-dermo-charcoal">
                            {reportA.dominant_concern} &bull; {reportA.confidence_pct}%
                          </span>
                        </div>
                        <div className="h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-950 relative flex items-center justify-center p-2">
                          <img
                            src={reportA.image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=720&q=80'}
                            alt="Baseline"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=720&q=80';
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-stone-600">
                          <div>Acne Indicator: <span className="font-bold">{reportA.acne}% ({reportA.acne_severity})</span></div>
                          <div>Redness Indicator: <span className="font-bold">{reportA.redness}% ({reportA.redness_severity})</span></div>
                          <div>Texture Indicator: <span className="font-bold">{reportA.texture}% ({reportA.texture_severity})</span></div>
                        </div>
                      </div>

                      {/* Right Card: Report B */}
                      <div className="p-5 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Follow-Up Scan ({reportB.date})
                          </span>
                          <span className="text-xs font-serif font-bold text-dermo-charcoal">
                            {reportB.dominant_concern} &bull; {reportB.confidence_pct}%
                          </span>
                        </div>
                        <div className="h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-950 relative flex items-center justify-center p-2">
                          <img
                            src={reportB.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80'}
                            alt="Follow up"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80';
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 text-xs text-stone-600">
                          <div>Acne Indicator: <span className="font-bold">{reportB.acne}% ({reportB.acne_severity})</span></div>
                          <div>Redness Indicator: <span className="font-bold">{reportB.redness}% ({reportB.redness_severity})</span></div>
                          <div>Texture Indicator: <span className="font-bold">{reportB.texture}% ({reportB.texture_severity})</span></div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Privacy photo deletion button */}
                {reportB && reportB.image_name && (
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleDeletePhoto(reportB.image_name)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete facial photo ({reportB.image_name})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Skin Improvement Analytics Timeline Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  Skin Improvement Analytics
                </h3>
                <p className="text-xs text-stone-500">
                  Timeline showing changes in measured skin indicators over time from facial Vision Transformer analyses.
                </p>
              </div>

              {/* Delta badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Acne Delta: {analyticsData?.metrics_deltas?.acne || 0}%
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  Redness Delta: {analyticsData?.metrics_deltas?.redness || 0}%
                </span>
              </div>
            </div>

            {/* Visual SVG Timeline Chart */}
            <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm/80">
              <div className="h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 px-2 overflow-x-auto">
                {(analyticsData?.timeline || []).map((pt, idx) => {
                  const barHeight = Math.max(15, Math.min(100, pt.acne));
                  return (
                    <div key={idx} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 group">
                      {/* Tooltip on hover */}
                      <span className="text-[10px] font-bold text-stone-600 opacity-80 group-hover:opacity-100">
                        {pt.acne}%
                      </span>
                      {/* Bar */}
                      <div className="w-full bg-dermo-warm/60 rounded-t-xl h-40 flex items-end overflow-hidden">
                        <div
                          style={{ height: `${barHeight}%` }}
                          className={`w-full transition-all duration-500 rounded-t-lg ${
                            pt.acne > 40
                              ? 'bg-rose-500'
                              : pt.acne > 25
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        />
                      </div>
                      {/* Date label */}
                      <span className="text-[10px] text-stone-500 font-medium truncate max-w-[50px]">
                        {pt.date?.slice(5) || `Scan ${idx+1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="pt-4 border-t border-dermo-warm/70 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Mild Concern (&lt;25%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Moderate (25-40%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span> Elevated (&gt;40%)
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  Showing {analyticsData?.timeline?.length || 0} scan milestones
                </span>
              </div>
            </div>

            {/* Milestones list */}
            {analyticsData?.milestones && analyticsData.milestones.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Clinical Indicator Milestones
                </span>
                <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                  {analyticsData.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-[11px] leading-relaxed flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>
                <strong>Cosmetic Guidance Notice:</strong> {analyticsData?.disclaimer || 'Timeline shows changes in measured skin indicators over time without claiming a particular product caused the change without sufficient clinical trial evidence.'}
              </span>
            </div>
          </div>

          {/* Section 3: Product Effectiveness Journal */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                  <Package className="w-5 h-5 text-dermo-teal" />
                  Product Effectiveness Journal
                </h3>
                <p className="text-xs text-stone-500">
                  Compare skin trends before and after starting a specific product without assuming direct causation.
                </p>
              </div>

              {/* Product picker */}
              {vanityProducts.length > 0 && (
                <select
                  value={selectedJournalProductId || ''}
                  onChange={(e) => handleSelectJournalProduct(Number(e.target.value))}
                  className="px-3.5 py-2 rounded-xl border border-dermo-warm bg-dermo-cream text-xs font-semibold text-dermo-charcoal"
                >
                  {vanityProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.days_used} days in use)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {productJournal && productJournal.product ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Product Start Date</span>
                  <div className="text-lg font-serif font-bold text-dermo-charcoal">
                    {productJournal.start_date}
                  </div>
                  <p className="text-xs text-stone-500">{productJournal.days_in_use} consecutive days active</p>
                </div>

                <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Baseline Period (Before)</span>
                  <div className="text-lg font-serif font-bold text-stone-700">
                    {productJournal.baseline_avg_confidence}%
                  </div>
                  <p className="text-xs text-stone-500">{productJournal.before_scans_count} scans recorded prior to product</p>
                </div>

                <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Active Period (After)</span>
                  <div className="text-lg font-serif font-bold text-dermo-teal">
                    {productJournal.current_avg_confidence}%
                  </div>
                  <p className="text-xs text-stone-500">{productJournal.after_scans_count} scans tracked during usage</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">Add products to your vanity shelf to evaluate before/after trajectories.</p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: REPORTS & SHELF (AI progress summary, monthly dossier, vanity shelf)
      ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-10">
          {/* Section 1: AI Daily Progress Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-dermo-sand via-white to-dermo-cream border-2 border-dermo-teal/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-dermo-teal text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-dermo-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-dermo-charcoal">
                    AI Daily Progress Summary
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Synthesized from your recorded routines, user feedback, and previous analyses
                  </span>
                </div>
              </div>
              <button
                onClick={handleRefreshSummary}
                className="px-3 py-1.5 rounded-full bg-white border border-dermo-warm hover:bg-stone-50 text-xs font-semibold text-dermo-teal flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-dermo-warm/80 text-sm text-dermo-charcoal leading-relaxed font-serif shadow-2xs">
              "{summaryData?.summary || 'You completed your evening routine on five of the last seven days. Your latest photo shows a lower estimated acne score than last week.'}"
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span>Primary tracked concern: <strong>{summaryData?.latest_concern || 'Acne'}</strong></span>
              <span>Generated: {summaryData?.generated_at || 'Just now'}</span>
            </div>
          </div>

          {/* Section 2: Weekly Progress Report */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-dermo-teal" />
                    Weekly Progress Report
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    Week of Oct 16 – Oct 22, 2026
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Honest, data-backed comparison of this week's routines, recorded reactions, and photo indicator progression.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{streakData?.adherence_7_days_pct || 86}% Adherence This Week</span>
              </div>
            </div>

            {/* Weekly comparison metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-dermo-cream/70 border border-dermo-warm space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Completed Sessions</span>
                <div className="text-xl font-serif font-bold text-dermo-charcoal">
                  6 Morning &bull; 5 Evening
                </div>
                <p className="text-[11px] text-stone-500">1 evening routine missed on traveling day</p>
              </div>

              <div className="p-4 rounded-2xl bg-dermo-cream/70 border border-dermo-warm space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Acne Severity Trajectory</span>
                <div className="text-xl font-serif font-bold text-emerald-700 flex items-center gap-1.5">
                  <span>33.9% → 28.9%</span>
                  <span className="text-xs font-sans font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">↓ 5.0% calm</span>
                </div>
                <p className="text-[11px] text-stone-500">Shifted from Moderate to Mild-Moderate</p>
              </div>

              <div className="p-4 rounded-2xl bg-dermo-cream/70 border border-dermo-warm space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Skin Tolerance & Reactions</span>
                <div className="text-xl font-serif font-bold text-amber-700">
                  1 Mild Dryness
                </div>
                <p className="text-[11px] text-stone-500">Logged on Oct 20; resolved with barrier moisturizer</p>
              </div>
            </div>

            {/* Honest, data-backed insight box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-dermo-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-dermo-teal" />
                Data-Backed Weekly Reflection
              </span>
              <p className="text-xs text-stone-600 leading-relaxed font-serif">
                "You completed your evening routine on five of the last seven days. Your latest photo shows a lower estimated acne score than last week. Skin dryness noted on Monday resolved following barrier cream application."
              </p>
              <div className="text-[11px] text-stone-400 italic pt-1 border-t border-stone-200/60">
                Illustrative example only — based on optical feature probabilities under consistent capture conditions. No medical causation is claimed.
              </div>
            </div>
          </div>

          {/* Section 3: Comprehensive Monthly Skin Report */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                  <FileText className="w-5 h-5 text-dermo-teal" />
                  Monthly Skin Report ({monthlyReport?.month || 'October 2026'})
                </h3>
                <p className="text-xs text-stone-500">
                  Monthly summary of photo comparisons, routine adherence, and recorded skin reactions.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-dermo-sand hover:bg-dermo-warm border border-dermo-warm text-xs font-bold text-dermo-teal flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Export Report
              </button>
            </div>

            {monthlyReport && (
              <div className="space-y-6">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Adherence Rate</span>
                    <span className="text-2xl font-serif font-bold text-dermo-teal">{monthlyReport.adherence_rate_pct}%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Sessions Logged</span>
                    <span className="text-2xl font-serif font-bold text-dermo-charcoal">{monthlyReport.total_routines_logged}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Completed</span>
                    <span className="text-2xl font-serif font-bold text-emerald-700">{monthlyReport.completed_routines}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Scans Tracked</span>
                    <span className="text-2xl font-serif font-bold text-dermo-accent">{monthlyReport.total_scans_taken}</span>
                  </div>
                </div>

                {/* Executive summary narrative */}
                <div className="p-5 rounded-2xl bg-dermo-sand/60 border border-dermo-warm space-y-2">
                  <span className="text-xs font-bold text-dermo-charcoal uppercase tracking-wider block">
                    Executive Monthly Retrospective
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                    {monthlyReport.executive_summary}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Vanity Shelf & Product Start Date Tracker */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-dermo-charcoal flex items-center gap-2">
                  <Package className="w-5 h-5 text-dermo-teal" />
                  Vanity Shelf & Product Start Date Tracker
                </h3>
                <p className="text-xs text-stone-500">
                  Track when you first introduced each product to correlate with long-term barrier response.
                </p>
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 rounded-full bg-dermo-teal text-white hover:bg-dermo-tealDark text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vanityProducts.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm hover:border-dermo-teal transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-dermo-teal uppercase tracking-wider bg-dermo-sand px-2 py-0.5 rounded-full border border-dermo-warm">
                        {p.category}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-dermo-charcoal line-clamp-1">{p.product_name}</h4>
                      {p.brand && <p className="text-xs text-stone-500">{p.brand}</p>}
                    </div>

                    {p.notes && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 italic">
                        {p.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-dermo-warm/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400 text-[11px]">Started: {p.start_date}</span>
                    <span className="font-bold text-dermo-teal">{p.days_used} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LogRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => {
          setIsRoutineModalOpen(false);
          setEditingRoutineData(null);
        }}
        onSaved={handleSaveRoutine}
        onDelete={handleDeleteRoutine}
        vanityProducts={vanityProducts}
        initialData={editingRoutineData}
      />

      <LogReactionModal
        isOpen={isReactionModalOpen}
        onClose={() => setIsReactionModalOpen(false)}
        onSaved={handleSaveReaction}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSaved={handleSaveProduct}
      />
    </div>
  );
}
