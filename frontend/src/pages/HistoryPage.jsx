import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar, ShieldAlert, Sparkles, ArrowRight, Eye, RefreshCw, Trash2,
  CheckCircle2, Clock, Sun, Moon, ArrowLeft, ArrowUpDown, Filter, Scale,
  Info, ExternalLink, Activity, ChevronRight, X, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { fetchHistory, deleteHistoryReport, getAuthToken } from '../services/api';
import { formatINR } from '../utils/currency';
import ProductImage from '../components/ProductImage';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import SavedRoutineModal from '../components/SavedRoutineModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ReportUserHeader from '../components/ReportUserHeader';
import SkinKartPreview from '../components/SkinKartPreview';
import SkinAnalyticsCharts from '../components/SkinAnalyticsCharts';

export default function HistoryPage({ onNavigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'detail' | 'compare' | 'routine'
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Compare selection
  const [compareIds, setCompareIds] = useState([]);

  // Filtering & Search
  const [concernFilter, setConcernFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Routine tracker state (persisted per-user in localStorage)
  const [savedRoutineIds, setSavedRoutineIds] = useState(() => {
    try {
      const stored = localStorage.getItem('alskincare_active_routine');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const token = getAuthToken();

  const loadHistory = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchHistory()
      .then((data) => {
        setHistory(data || []);
        setError('');
      })
      .catch((err) => setError(err.message || 'Unable to load diagnostic history.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [token]);

  const toggleRoutineItem = (productId) => {
    setSavedRoutineIds((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('alskincare_active_routine', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    if (!history.length) return null;
    const total = history.length;
    const latest = history[0];
    const concernCounts = {};
    history.forEach((h) => {
      const c = h.primary_concern || h.dominant_concern || 'Unknown';
      concernCounts[c] = (concernCounts[c] || 0) + 1;
    });

    const sortedConcerns = Object.entries(concernCounts).sort((a, b) => b[1] - a[1]);
    const topConcern = sortedConcerns[0] ? sortedConcerns[0][0] : 'None';
    const topConcernCount = sortedConcerns[0] ? sortedConcerns[0][1] : 0;

    return {
      total,
      latestDate: new Date(latest.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      latestConcern: latest.primary_concern || latest.dominant_concern,
      latestConfidence: latest.primary_confidence || latest.confidence_score,
      topConcern,
      topConcernFrequency: Math.round((topConcernCount / total) * 100),
      activeRoutineCount: savedRoutineIds.length,
    };
  }, [history, savedRoutineIds]);

  // Filtered & Sorted reports
  const filteredHistory = useMemo(() => {
    let list = [...history];
    if (concernFilter !== 'All') {
      list = list.filter((r) => (r.primary_concern || r.dominant_concern) === concernFilter);
    }
    list.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [history, concernFilter, sortOrder]);

  // Selected report for detail view
  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null;
    return history.find((r) => r.id === selectedReportId) || null;
  }, [history, selectedReportId]);

  // Reports for side-by-side comparison (defaults to previous/yesterday vs latest/today)
  const reportA = useMemo(() => {
    if (compareIds[0]) return history.find((r) => r.id === compareIds[0]) || null;
    return history.length >= 2 ? history[1] : (history[0] || null);
  }, [history, compareIds]);

  const reportB = useMemo(() => {
    if (compareIds[1]) return history.find((r) => r.id === compareIds[1]) || null;
    return history[0] || null;
  }, [history, compareIds]);

  // Latest report for active routine section
  const latestReport = history[0] || null;

  const handleSelectForCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryReport(id);
      setDeleteConfirmId(null);
      if (selectedReportId === id) setSelectedReportId(null);
      setCompareIds((prev) => prev.filter((item) => item !== id));
      loadHistory();
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  if (!token) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-dermo-charcoal">Sign In Required</h2>
        <p className="text-stone-500 text-xs leading-relaxed">
          Please sign in to access your confidential skin journey records and track personal assessments over time.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 rounded-2xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
        >
          Go to Sign In
          <ArrowRight className="w-4 h-4 text-dermo-gold" />
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 space-y-10">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-dermo-warm/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dermo-sand text-dermo-teal text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-dermo-gold" />
            Personalized Skincare Journey
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-dermo-charcoal tracking-tight">
            Personal Skin Journey
          </h1>
          <p className="text-stone-600 text-xs md:text-sm max-w-2xl leading-relaxed">
            Historical assessment timeline tracking your skin concern patterns, targeted active ingredients, and tailored morning & evening skincare routines.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-white border border-dermo-warm text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'routine'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-white border border-dermo-warm text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            My Skincare Routine
          </button>
          {history.length >= 1 && (
            <button
              onClick={() => {
                if (compareIds.length < 2 && history.length >= 2) {
                  setCompareIds([history[1].id, history[0].id]);
                }
                setActiveTab('compare');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'bg-dermo-teal text-white shadow-sm'
                  : 'bg-dermo-sand border border-dermo-warm text-dermo-teal hover:bg-dermo-warm'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-dermo-gold" />
              Compare Scans (Yesterday vs Today)
            </button>
          )}
        </div>
      </div>

      {/* 1. Personal Skin Journey Dashboard (Metrics Banner) */}
      {metrics && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-dermo-warm/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-dermo-accent uppercase tracking-wider">Total Completed Scans</span>
            <div className="text-3xl font-serif font-bold text-dermo-charcoal">{metrics.total}</div>
            <p className="text-[11px] text-stone-500">Stored in your private history</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-dermo-warm/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-dermo-accent uppercase tracking-wider">Latest Assessment</span>
            <div className="text-3xl font-serif font-bold text-dermo-teal capitalize truncate">
              {metrics.latestConcern}
            </div>
            <p className="text-[11px] text-stone-500">Recorded on {metrics.latestDate}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-dermo-warm/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-dermo-accent uppercase tracking-wider">Frequent Skin Concern</span>
            <div className="text-3xl font-serif font-bold text-dermo-charcoal capitalize truncate">
              {metrics.topConcern}
            </div>
            <p className="text-[11px] text-stone-500">Observed in {metrics.topConcernFrequency}% of recorded scans</p>
          </div>

          <div 
            onClick={() => {
              setIsRoutineModalOpen(true);
              setActiveTab('routine');
              setTimeout(() => {
                document.getElementById('routine-protocol-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="p-6 rounded-2xl bg-white border border-dermo-warm/90 shadow-sm space-y-1 cursor-pointer hover:border-dermo-teal/40 transition-all hover:shadow-md group"
            title="Click to open your active morning and evening routine"
          >
            <span className="text-[11px] font-bold text-dermo-accent uppercase tracking-wider flex items-center justify-between">
              <span>Saved Routine</span>
              <span className="text-dermo-teal text-[10px] font-bold uppercase underline group-hover:text-dermo-tealDark">View Routine &rarr;</span>
            </span>
            <div className="text-xl font-serif font-bold text-dermo-charcoal truncate">
              {metrics.activeRoutineCount > 0 ? `${metrics.activeRoutineCount} Formulations Active` : 'Custom Routine Ready'}
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              {metrics.activeRoutineCount > 0 ? 'AM & PM daily protocols tracked' : 'Click to organize morning & evening steps'}
            </p>
          </div>
        </section>
      )}

      {/* Main Content Area based on Tab */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-stone-500">
          <RefreshCw className="w-6 h-6 animate-spin text-dermo-teal" />
          <span className="text-sm font-medium">Retrieving private skincare records...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-3xl border border-dermo-warm bg-white p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal mx-auto">
            <Sparkles className="w-8 h-8 text-dermo-gold" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-dermo-charcoal">No Saved Scans Yet</h3>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            Complete your first AI facial analysis while logged in. Your detected skin characteristics and recommended AM/PM regimens will be preserved here.
          </p>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-6 py-3 rounded-2xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            Analyze Your Skin Now
            <ArrowRight className="w-4 h-4 text-dermo-gold" />
          </button>
        </div>
      ) : activeTab === 'detail' && selectedReport ? (
        /* 3. Detailed Report View */
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-dermo-warm pb-4">
            <button
              onClick={() => setActiveTab('timeline')}
              className="inline-flex items-center gap-2 text-xs font-bold text-dermo-teal hover:text-dermo-tealDark"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Reports
            </button>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <Calendar className="w-3.5 h-3.5 text-dermo-accent" />
              <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Aligned User & Diagnostic Report Header */}
          <ReportUserHeader report={selectedReport} />

          {/* SkinKart 3D Face Zone & Skincare Try-On Visualizer */}
          <SkinKartPreview 
            report={selectedReport} 
            userImage={selectedReport.image_url} 
          />

          {/* Dermal Health Spider Radar & Probability Bar Charts */}
          <SkinAnalyticsCharts report={selectedReport} />

          {/* Assessment Header Card */}
          <div className="p-8 rounded-3xl bg-white border border-dermo-warm space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dermo-warm/60 pb-5">
              <div>
                <span className="text-xs font-bold tracking-widest text-dermo-accent uppercase">
                  Assessment ID #{selectedReport.id}
                </span>
                <h2 className="font-serif font-bold text-3xl text-dermo-charcoal capitalize mt-1">
                  Primary Finding: {selectedReport.primary_concern || selectedReport.dominant_concern}
                </h2>
              </div>
              <div className="px-4 py-2 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-sm border border-dermo-warm">
                {((selectedReport.primary_confidence || selectedReport.confidence_score) * 100).toFixed(1)}% Confidence
              </div>
            </div>

            {/* Model Softmax Distribution */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                ViT Logit Probability Distribution
              </h4>
              <div className="space-y-2">
                {selectedReport.all_predictions && selectedReport.all_predictions.map((pred) => (
                  <div key={pred.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-dermo-charcoal">{pred.label}</span>
                      <span className="font-mono text-stone-500">{(pred.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-dermo-sand rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          pred.label === (selectedReport.primary_concern || selectedReport.dominant_concern)
                            ? 'bg-dermo-teal'
                            : 'bg-dermo-warm'
                        }`}
                        style={{ width: `${Math.max(pred.confidence * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actives */}
            {selectedReport.targeted_actives && selectedReport.targeted_actives.length > 0 && (
              <div className="pt-4 border-t border-dermo-warm/60 space-y-3">
                <h4 className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                  Targeted Active Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.targeted_actives.map((act) => (
                    <span
                      key={act}
                      className="px-3 py-1.5 rounded-full bg-dermo-sand text-dermo-teal text-xs font-semibold border border-dermo-warm flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-dermo-gold" />
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AM & PM Routines Associated with this report */}
          <div className="space-y-8">
            {selectedReport.morning_routine && selectedReport.morning_routine.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Morning Regimen (AM)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {selectedReport.morning_routine.map((prod, idx) => (
                    <div key={prod.id || idx} className="p-5 rounded-2xl bg-white border border-dermo-warm shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                          <span>Step {idx + 1} &bull; {prod.category || prod.label}</span>
                          <span className="text-dermo-teal font-serif font-bold text-xs">{formatINR(prod.price_inr, prod.price)}</span>
                        </div>
                        <h5 className="font-serif font-bold text-sm text-dermo-charcoal line-clamp-1">{prod.name}</h5>
                        <p className="text-[11px] text-stone-500 uppercase font-semibold">{prod.brand}</p>
                        {prod.match_reason && (
                          <p className="text-xs text-dermo-sage bg-dermo-sand/60 p-2.5 rounded-xl border border-dermo-warm/60 leading-relaxed">
                            {prod.match_reason}
                          </p>
                        )}
                      </div>
                      <a
                        href={prod.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-dermo-sand hover:bg-dermo-warm text-dermo-teal text-xs font-semibold transition-colors"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3.5 h-3.5 text-dermo-gold" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport.evening_routine && selectedReport.evening_routine.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-900" />
                  <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Evening Regimen (PM)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {selectedReport.evening_routine.map((prod, idx) => (
                    <div key={prod.id || idx} className="p-5 rounded-2xl bg-white border border-dermo-warm shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                          <span>Step {idx + 1} &bull; {prod.category || prod.label}</span>
                          <span className="text-dermo-teal font-serif font-bold text-xs">{formatINR(prod.price_inr, prod.price)}</span>
                        </div>
                        <h5 className="font-serif font-bold text-sm text-dermo-charcoal line-clamp-1">{prod.name}</h5>
                        <p className="text-[11px] text-stone-500 uppercase font-semibold">{prod.brand}</p>
                        {prod.match_reason && (
                          <p className="text-xs text-dermo-sage bg-dermo-sand/60 p-2.5 rounded-xl border border-dermo-warm/60 leading-relaxed">
                            {prod.match_reason}
                          </p>
                        )}
                      </div>
                      <a
                        href={prod.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-dermo-sand hover:bg-dermo-warm text-dermo-teal text-xs font-semibold transition-colors"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3.5 h-3.5 text-dermo-gold" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'compare' && reportA && reportB ? (
        /* 4. Side-by-Side Assessment Comparison */
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-dermo-warm pb-4">
            <button
              onClick={() => setActiveTab('timeline')}
              className="inline-flex items-center gap-2 text-xs font-bold text-dermo-teal hover:text-dermo-tealDark"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Timeline
            </button>
            <span className="text-xs text-dermo-accent font-semibold uppercase tracking-wider">
              Comparing Assessment #{reportA.id} vs #{reportB.id}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Context:</strong> Variations between photos may be influenced by lighting conditions, camera distance, ambient hydration, and diurnal changes. Computer vision scores represent model logit distributions and do not constitute a diagnostic medical progression.
            </span>
          </div>

          {/* Interactive Split Before/After Image Slider & Side-by-Side Suite */}
          <BeforeAfterSlider 
            reportA={reportA} 
            reportB={reportB} 
            allReports={history}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column A */}
            <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-5 shadow-sm">
              <div className="border-b border-dermo-warm pb-3">
                <span className="text-[10px] font-bold text-dermo-accent uppercase">Assessment A &bull; #{reportA.id}</span>
                <p className="text-xs text-stone-500">{new Date(reportA.created_at).toLocaleString()}</p>
                <h3 className="font-serif font-bold text-2xl text-dermo-charcoal capitalize mt-2">
                  {reportA.primary_concern || reportA.dominant_concern}
                </h3>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-xs">
                  {((reportA.primary_confidence || reportA.confidence_score) * 100).toFixed(1)}% Match
                </span>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-dermo-accent uppercase">All Concern Probabilities</h5>
                {reportA.all_predictions && reportA.all_predictions.map((p) => (
                  <div key={p.label} className="flex justify-between text-xs py-1 border-b border-dermo-warm/40">
                    <span className="capitalize text-stone-700">{p.label}</span>
                    <span className="font-mono text-stone-500">{(p.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column B */}
            <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-5 shadow-sm">
              <div className="border-b border-dermo-warm pb-3">
                <span className="text-[10px] font-bold text-dermo-accent uppercase">Assessment B &bull; #{reportB.id}</span>
                <p className="text-xs text-stone-500">{new Date(reportB.created_at).toLocaleString()}</p>
                <h3 className="font-serif font-bold text-2xl text-dermo-charcoal capitalize mt-2">
                  {reportB.primary_concern || reportB.dominant_concern}
                </h3>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-xs">
                  {((reportB.primary_confidence || reportB.confidence_score) * 100).toFixed(1)}% Match
                </span>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-dermo-accent uppercase">All Concern Probabilities</h5>
                {reportB.all_predictions && reportB.all_predictions.map((p) => (
                  <div key={p.label} className="flex justify-between text-xs py-1 border-b border-dermo-warm/40">
                    <span className="capitalize text-stone-700">{p.label}</span>
                    <span className="font-mono text-stone-500">{(p.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'routine' ? (
        /* 5. My Skincare Routine Area */
        <div id="routine-protocol-section" className="space-y-10 scroll-mt-6">
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Active Skincare Protocol</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Revisit your daily routine assembled from your latest assessment. Click "In My Daily Routine" to flag products you actively apply.
              </p>
            </div>
            {latestReport && (
              <div className="text-right text-xs text-stone-500">
                <span>Based on latest assessment from</span>
                <strong className="block text-dermo-charcoal font-serif">{new Date(latestReport.created_at).toLocaleDateString()}</strong>
              </div>
            )}
          </div>

          {latestReport && latestReport.morning_routine && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-600" />
                <h4 className="font-serif font-bold text-xl text-dermo-charcoal">Morning Routine Protocol</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestReport.morning_routine.map((prod, idx) => {
                  const isInRoutine = savedRoutineIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id || idx}
                      className={`p-6 rounded-3xl bg-white border transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 ${
                        isInRoutine ? 'border-dermo-teal ring-1 ring-dermo-teal/20' : 'border-dermo-warm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-xs">
                            Step {idx + 1}: {prod.category || prod.label}
                          </span>
                          <span className="text-xs font-bold text-dermo-charcoal">
                            {formatINR(prod.price_inr, prod.price)}
                          </span>
                        </div>

                        <div className="h-36 w-full rounded-xl overflow-hidden bg-dermo-sand">
                          <ProductImage
                            src={prod.image_url}
                            alt={prod.name}
                            category={prod.category || prod.label}
                            brand={prod.brand}
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-dermo-accent uppercase">{prod.brand}</p>
                          <h5 className="font-serif font-bold text-base text-dermo-charcoal line-clamp-1">{prod.name}</h5>
                        </div>

                        {prod.match_reason && (
                          <p className="text-xs text-dermo-sage bg-dermo-sand/60 p-2.5 rounded-xl border border-dermo-warm/60 leading-relaxed">
                            {prod.match_reason}
                          </p>
                        )}

                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          <strong>Usage:</strong> Smooth evenly over cleansed skin before sun exposure. Perform a patch test before first use.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-dermo-warm/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRoutineItem(prod.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isInRoutine
                              ? 'bg-dermo-teal text-white'
                              : 'bg-dermo-sand text-dermo-teal hover:bg-dermo-warm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isInRoutine ? 'Active in Routine' : 'Add to Routine'}</span>
                        </button>

                        <a
                          href={prod.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-dermo-warm text-stone-600 hover:text-dermo-teal hover:border-dermo-teal transition-colors"
                          title="Visit Official Boutique"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {latestReport && latestReport.evening_routine && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-900" />
                <h4 className="font-serif font-bold text-xl text-dermo-charcoal">Evening Routine Protocol</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestReport.evening_routine.map((prod, idx) => {
                  const isInRoutine = savedRoutineIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id || idx}
                      className={`p-6 rounded-3xl bg-white border transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 ${
                        isInRoutine ? 'border-dermo-teal ring-1 ring-dermo-teal/20' : 'border-dermo-warm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-xs">
                            Step {idx + 1}: {prod.category || prod.label}
                          </span>
                          <span className="text-xs font-bold text-dermo-charcoal">
                            {formatINR(prod.price_inr, prod.price)}
                          </span>
                        </div>

                        <div className="h-36 w-full rounded-xl overflow-hidden bg-dermo-sand">
                          <ProductImage
                            src={prod.image_url}
                            alt={prod.name}
                            category={prod.category || prod.label}
                            brand={prod.brand}
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-dermo-accent uppercase">{prod.brand}</p>
                          <h5 className="font-serif font-bold text-base text-dermo-charcoal line-clamp-1">{prod.name}</h5>
                        </div>

                        {prod.match_reason && (
                          <p className="text-xs text-dermo-sage bg-dermo-sand/60 p-2.5 rounded-xl border border-dermo-warm/60 leading-relaxed">
                            {prod.match_reason}
                          </p>
                        )}

                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          <strong>Usage:</strong> Apply as part of nocturnal barrier regeneration. Avoid combining potent AHAs with strong retinoids simultaneously.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-dermo-warm/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRoutineItem(prod.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isInRoutine
                              ? 'bg-dermo-teal text-white'
                              : 'bg-dermo-sand text-dermo-teal hover:bg-dermo-warm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isInRoutine ? 'Active in Routine' : 'Add to Routine'}</span>
                        </button>

                        <a
                          href={prod.official_url || `https://www.sephora.com/search?keyword=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-dermo-warm text-stone-600 hover:text-dermo-teal hover:border-dermo-teal transition-colors"
                          title="Visit Official Boutique"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. Structured Chronological Report Timeline & List */
        <div className="space-y-6">
          {/* Timeline Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-dermo-warm shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by Finding:
              </span>
              <select
                value={concernFilter}
                onChange={(e) => setConcernFilter(e.target.value)}
                className="bg-dermo-cream border border-dermo-warm text-dermo-charcoal text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-dermo-teal"
              >
                <option value="All">All Detected Concerns</option>
                <option value="Acne">Acne</option>
                <option value="Skin Pigmentation">Skin Pigmentation</option>
                <option value="Skin Redness">Skin Redness</option>
                <option value="Skin Texture">Skin Texture</option>
                <option value="Wrinkled Face">Wrinkled Face</option>
                <option value="Eyes Dark Circles">Eyes Dark Circles</option>
                <option value="Puffy Eyes">Puffy Eyes</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-dermo-accent uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort Order:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-dermo-cream border border-dermo-warm text-dermo-charcoal text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-dermo-teal"
              >
                <option value="newest">Newest Assessment First</option>
                <option value="oldest">Oldest Assessment First</option>
              </select>
            </div>
          </div>

          {/* Timeline Entries */}
          <div className="relative border-l-2 border-dermo-warm ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
            {filteredHistory.map((report) => {
              const isSelectedForCompare = compareIds.includes(report.id);
              return (
                <div key={report.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-6 w-4 h-4 rounded-full bg-white border-4 border-dermo-teal shadow-sm group-hover:scale-125 transition-transform" />

                  <div className="p-6 md:p-8 rounded-3xl bg-white border border-dermo-warm hover:border-dermo-teal/40 transition-all duration-300 shadow-sm space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dermo-warm/60 pb-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Calendar className="w-3.5 h-3.5 text-dermo-accent" />
                        <span className="font-semibold text-dermo-charcoal">
                          {new Date(report.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>&bull;</span>
                        <Clock className="w-3.5 h-3.5 text-dermo-accent" />
                        <span>{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-xs border border-dermo-warm">
                          {((report.primary_confidence || report.confidence_score) * 100).toFixed(0)}% Match
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSelectForCompare(report.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isSelectedForCompare
                              ? 'bg-dermo-teal text-white border-dermo-teal'
                              : 'bg-white border-dermo-warm text-stone-600 hover:bg-dermo-sand'
                          }`}
                        >
                          {isSelectedForCompare ? '✓ Selected to Compare' : '+ Compare'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-8 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-dermo-accent tracking-wider">
                          Primary Detected Concern
                        </span>
                        <h4 className="font-serif font-bold text-2xl text-dermo-charcoal capitalize">
                          {report.primary_concern || report.dominant_concern}
                        </h4>

                        {report.targeted_actives && report.targeted_actives.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {report.targeted_actives.map((act) => (
                              <span
                                key={act}
                                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-dermo-sand text-dermo-teal border border-dermo-warm"
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="md:col-span-4 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setActiveTab('detail');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <span>View Full Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === report.id ? (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(report.id)}
                              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-lg bg-stone-200 text-stone-700 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(report.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-600 transition-colors pt-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Record
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Routine Full Modal */}
      <SavedRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        latestReport={latestReport}
        savedRoutineIds={savedRoutineIds}
        toggleRoutineItem={toggleRoutineItem}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* Product Details & Price Comparison Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}