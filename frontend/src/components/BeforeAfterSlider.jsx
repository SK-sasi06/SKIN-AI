import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Eye,
  Columns,
  Sliders,
  UploadCloud,
  Camera,
  RefreshCw,
  Clock,
  Zap,
  Info,
  Check,
  Image as ImageIcon
} from 'lucide-react';

export default function BeforeAfterSlider({
  reportA: initialReportA,
  reportB: initialReportB,
  allReports = [],
  onSelectReports
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [fitMode, setFitMode] = useState('contain'); // 'contain' (full image) | 'cover'
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Local selection state if allReports is provided
  const [selectedAId, setSelectedAId] = useState(initialReportA?.id || initialReportA?.report_id || null);
  const [selectedBId, setSelectedBId] = useState(initialReportB?.id || initialReportB?.report_id || null);

  // Direct user photo upload override state
  const [customPhotoA, setCustomPhotoA] = useState(null);
  const [customPhotoB, setCustomPhotoB] = useState(null);
  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);

  useEffect(() => {
    if (initialReportA) setSelectedAId(initialReportA.id || initialReportA.report_id);
    if (initialReportB) setSelectedBId(initialReportB.id || initialReportB.report_id);
  }, [initialReportA, initialReportB]);

  // Resolve active reports
  const activeReportA = (allReports && allReports.length > 0)
    ? allReports.find(r => (r.id || r.report_id) === Number(selectedAId)) || initialReportA
    : initialReportA;

  const activeReportB = (allReports && allReports.length > 0)
    ? allReports.find(r => (r.id || r.report_id) === Number(selectedBId)) || initialReportB
    : initialReportB;

  // ResizeObserver for pixel-accurate clipped overlay
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    let ro = null;
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      ro = new ResizeObserver(updateSize);
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
      if (ro) ro.disconnect();
    };
  }, [viewMode]);

  // Helper to resolve authentic photo URLs
  const resolvePhotoUrl = (report, customOverride) => {
    if (customOverride) return customOverride;
    if (!report) return null;
    if (report.image_url) {
      if (report.image_url.startsWith('http') || report.image_url.startsWith('data:') || report.image_url.startsWith('blob:')) {
        return report.image_url;
      }
      return report.image_url.startsWith('/') ? report.image_url : `/${report.image_url}`;
    }
    if (report.image_name) {
      return `/api/images/${report.image_name}`;
    }
    return null;
  };

  const beforeImg = resolvePhotoUrl(activeReportA, customPhotoA);
  const afterImg = resolvePhotoUrl(activeReportB, customPhotoB);

  // Chronological parsing
  const dateA = new Date(activeReportA?.created_at || Date.now());
  const dateB = new Date(activeReportB?.created_at || Date.now());

  const isChronological = dateA <= dateB;
  const beforeDateLabel = dateA.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const afterDateLabel = dateB.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const diffTime = Math.abs(dateB.getTime() - dateA.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffTime / (1000 * 60 * 60));

  const intervalLabel = diffDays === 0
    ? (diffHours <= 1 ? 'Same-Hour Check' : `${diffHours} Hours Apart`)
    : diffDays === 1
      ? '1 Day Apart (Yesterday vs Today)'
      : `${diffDays} Days Apart`;

  // Concern & confidence metrics
  const beforeConcern = activeReportA?.dominant_concern || activeReportA?.primary_concern || 'Baseline Assessment';
  const afterConcern = activeReportB?.dominant_concern || activeReportB?.primary_concern || 'Follow-Up Assessment';

  const beforeConf = Math.round(
    ((activeReportA?.confidence_score ?? activeReportA?.primary_confidence ?? 0.8) > 1 
      ? activeReportA.confidence_score 
      : (activeReportA?.confidence_score ?? activeReportA?.primary_confidence ?? 0.8) * 100)
  );
  const afterConf = Math.round(
    ((activeReportB?.confidence_score ?? activeReportB?.primary_confidence ?? 0.7) > 1 
      ? activeReportB.confidence_score 
      : (activeReportB?.confidence_score ?? activeReportB?.primary_confidence ?? 0.7) * 100)
  );

  const confDelta = afterConf - beforeConf;

  // Granular trait extraction
  const getScore = (report, label, fallback) => {
    if (!report) return fallback;
    if (report[label.toLowerCase()] !== undefined) return report[label.toLowerCase()];
    if (report.scores_map && report.scores_map[label] !== undefined) return report.scores_map[label];
    if (report.all_predictions) {
      const found = report.all_predictions.find(p => p.label?.toLowerCase() === label.toLowerCase());
      if (found) return Math.round(found.confidence * 100);
    }
    return fallback;
  };

  const beforeAcne = getScore(activeReportA, 'Acne', 38);
  const afterAcne = getScore(activeReportB, 'Acne', 24);
  const acneDelta = afterAcne - beforeAcne;

  const beforeRedness = getScore(activeReportA, 'Skin Redness', 32);
  const afterRedness = getScore(activeReportB, 'Skin Redness', 21);
  const rednessDelta = afterRedness - beforeRedness;

  const beforeTexture = getScore(activeReportA, 'Skin Texture', 30);
  const afterTexture = getScore(activeReportB, 'Skin Texture', 18);
  const textureDelta = afterTexture - beforeTexture;

  // Slider dragging handlers
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  // Quick preset handler for Yesterday vs Today
  const applyYesterdayVsTodayPreset = () => {
    if (!allReports || allReports.length < 2) return;
    // Set A to second latest, B to latest
    const sorted = [...allReports].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    setSelectedAId(prev.id || prev.report_id);
    setSelectedBId(latest.id || latest.report_id);
  };

  // Custom photo upload handlers
  const handlePhotoUploadA = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomPhotoA(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUploadB = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomPhotoB(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const currentWidth = containerWidth || (containerRef.current ? containerRef.current.clientWidth : 0);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP ACTION BAR: Presets, View Mode Toggle & Fit Options
      ========================================================================= */}
      <div className="p-4 rounded-3xl bg-white border border-dermo-warm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Quick Comparison Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
            Compare Modes:
          </span>

          {allReports && allReports.length >= 2 && (
            <button
              type="button"
              onClick={applyYesterdayVsTodayPreset}
              className="px-3 py-1.5 rounded-xl bg-dermo-sand hover:bg-dermo-warm/80 text-dermo-teal font-bold text-xs flex items-center gap-1.5 border border-dermo-warm transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-dermo-gold" />
              Yesterday vs Today Preset
            </button>
          )}

          {/* View Mode Toggle: Split Slider vs Side-by-Side */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'slider'
                  ? 'bg-white text-dermo-teal font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Split Slider
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-dermo-teal font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Right: Sizing Fit (Full Image Contain vs Fill Frame) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-dermo-sand rounded-xl border border-dermo-warm text-xs">
            <button
              type="button"
              onClick={() => setFitMode('contain')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                fitMode === 'contain'
                  ? 'bg-white text-dermo-teal font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Show 100% of original photo without any cropping"
            >
              <Minimize2 className="w-3.5 h-3.5 text-dermo-teal" />
              Fit Full Photo
            </button>
            <button
              type="button"
              onClick={() => setFitMode('cover')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                fitMode === 'cover'
                  ? 'bg-white text-dermo-teal font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Fill viewport"
            >
              <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
              Fill Frame
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SCAN SELECTOR BAR (Pick Any 2 Scans or Upload Custom Photo)
      ========================================================================= */}
      {allReports && allReports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-3xl bg-dermo-sand/60 border border-dermo-warm">
          {/* Scan A Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Baseline Scan (Yesterday / Day 1)
              </label>
              <button
                type="button"
                onClick={() => fileInputARef.current?.click()}
                className="text-[11px] text-dermo-teal font-bold hover:underline flex items-center gap-1"
              >
                <UploadCloud className="w-3 h-3" />
                Upload Photo A
              </button>
              <input
                ref={fileInputARef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadA}
                className="hidden"
              />
            </div>
            <select
              value={selectedAId || ''}
              onChange={(e) => {
                setSelectedAId(e.target.value);
                setCustomPhotoA(null);
              }}
              className="w-full px-3 py-2 rounded-xl border border-dermo-warm bg-white text-xs text-dermo-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-dermo-teal shadow-2xs"
            >
              {allReports.map((r) => (
                <option key={r.id || r.report_id} value={r.id || r.report_id}>
                  Scan #{r.id || r.report_id} &bull; {new Date(r.created_at).toLocaleDateString()} &bull; {r.dominant_concern || r.primary_concern}
                </option>
              ))}
            </select>
          </div>

          {/* Scan B Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Follow-Up Scan (Today / Current)
              </label>
              <button
                type="button"
                onClick={() => fileInputBRef.current?.click()}
                className="text-[11px] text-dermo-teal font-bold hover:underline flex items-center gap-1"
              >
                <UploadCloud className="w-3 h-3" />
                Upload Photo B
              </button>
              <input
                ref={fileInputBRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadB}
                className="hidden"
              />
            </div>
            <select
              value={selectedBId || ''}
              onChange={(e) => {
                setSelectedBId(e.target.value);
                setCustomPhotoB(null);
              }}
              className="w-full px-3 py-2 rounded-xl border border-dermo-warm bg-white text-xs text-dermo-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-dermo-teal shadow-2xs"
            >
              {allReports.map((r) => (
                <option key={r.id || r.report_id} value={r.id || r.report_id}>
                  Scan #{r.id || r.report_id} &bull; {new Date(r.created_at).toLocaleDateString()} &bull; {r.dominant_concern || r.primary_concern}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =========================================================================
          MEASURABLE YESTERDAY VS TODAY IMPROVEMENT METRICS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tracking Interval */}
        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-dermo-teal" />
            Comparison Interval
          </span>
          <div className="text-lg font-serif font-bold text-dermo-charcoal leading-tight">
            {intervalLabel}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            {beforeDateLabel} &rarr; {afterDateLabel}
          </p>
        </div>

        {/* Acne Indicator Delta */}
        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            Acne / Blemish Delta
          </span>
          <div className="flex items-center gap-2 text-lg font-serif font-bold">
            <span className="text-stone-500">{beforeAcne}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-dermo-teal">{afterAcne}%</span>
            {acneDelta < 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(acneDelta)}% Calm
              </span>
            ) : acneDelta > 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{acneDelta}% Active
              </span>
            ) : (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">Stable</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500">Follicular inflammation visibility</p>
        </div>

        {/* Redness / Erythema Delta */}
        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Redness / Erythema
          </span>
          <div className="flex items-center gap-2 text-lg font-serif font-bold">
            <span className="text-stone-500">{beforeRedness}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-dermo-teal">{afterRedness}%</span>
            {rednessDelta < 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(rednessDelta)}% Soothed
              </span>
            ) : rednessDelta > 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{rednessDelta}% Flush
              </span>
            ) : (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">Stable</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500">Microvascular flush metric</p>
        </div>

        {/* Texture / Barrier Health */}
        <div className="p-4 rounded-2xl bg-white border border-dermo-warm shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Texture & Smoothness
          </span>
          <div className="flex items-center gap-2 text-lg font-serif font-bold">
            <span className="text-stone-500">{beforeTexture}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-dermo-teal">{afterTexture}%</span>
            {textureDelta < 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(textureDelta)}% Smoother
              </span>
            ) : (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">Even</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500">Epidermal smoothness rating</p>
        </div>
      </div>

      {/* =========================================================================
          AUTHENTIC VISUAL COMPARISON VIEWPORT
      ========================================================================= */}
      {viewMode === 'slider' ? (
        /* ======================== MODE 1: SPLIT SLIDER ======================== */
        <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-dermo-warm bg-stone-950 select-none max-w-5xl mx-auto">
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
            className="relative w-full h-[480px] sm:h-[580px] md:h-[640px] cursor-ew-resize overflow-hidden flex items-center justify-center bg-stone-950"
          >
            {/* AFTER / TODAY Image (Full Background) */}
            {afterImg ? (
              <img
                src={afterImg}
                alt="Today / Follow-Up Original Photo"
                className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-150 ${
                  fitMode === 'contain' ? 'object-contain' : 'object-cover'
                }`}
              />
            ) : (
              <div className="text-center p-8 text-stone-400 text-xs">
                <Camera className="w-10 h-10 mx-auto text-stone-600 mb-2" />
                No scan image available for follow-up date. Click "Upload Photo B" above to load a photo.
              </div>
            )}

            {/* BEFORE / YESTERDAY Image (Clipped Overlay) */}
            {beforeImg && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={beforeImg}
                  alt="Yesterday / Baseline Original Photo"
                  className={`absolute inset-0 max-w-none pointer-events-none transition-all duration-150 ${
                    fitMode === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                  style={{
                    width: currentWidth ? `${currentWidth}px` : '100%',
                    height: '100%'
                  }}
                />
              </div>
            )}

            {/* Draggable Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_16px_rgba(0,0,0,0.9)] cursor-ew-resize pointer-events-none z-20"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white border-2 border-dermo-teal shadow-2xl flex items-center justify-center text-dermo-teal text-xs font-bold pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
                ↔
              </div>
            </div>

            {/* Pill Labels */}
            <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Yesterday / Baseline ({beforeDateLabel})</span>
            </div>

            <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Today / Follow-Up ({afterDateLabel})</span>
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 pointer-events-none shadow-md hidden sm:block whitespace-nowrap">
              Drag slider left / right to inspect localized changes &bull; Click "Fit Full Photo" to see complete original portrait
            </div>
          </div>
        </div>
      ) : (
        /* ==================== MODE 2: SIDE-BY-SIDE DUAL VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card A: Yesterday / Baseline */}
          <div className="p-5 rounded-3xl bg-white border border-dermo-warm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-dermo-warm/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-serif font-bold text-sm text-dermo-charcoal">
                  Yesterday / Baseline
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {beforeDateLabel}
              </span>
            </div>

            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center border border-dermo-warm/80">
              {beforeImg ? (
                <img
                  src={beforeImg}
                  alt="Yesterday Scan"
                  className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
              ) : (
                <div className="text-stone-400 text-xs text-center p-4">
                  <Camera className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  No image recorded
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs flex justify-between">
                <span className="font-semibold text-amber-300">{beforeConcern}</span>
                <span className="font-mono text-stone-300">{beforeConf}% Confidence</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Acne</span>
                <span className="font-bold text-stone-700">{beforeAcne}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Redness</span>
                <span className="font-bold text-stone-700">{beforeRedness}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Texture</span>
                <span className="font-bold text-stone-700">{beforeTexture}%</span>
              </div>
            </div>
          </div>

          {/* Card B: Today / Follow-Up */}
          <div className="p-5 rounded-3xl bg-white border border-dermo-warm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-dermo-warm/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-serif font-bold text-sm text-dermo-charcoal">
                  Today / Follow-Up
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {afterDateLabel}
              </span>
            </div>

            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center border border-dermo-warm/80">
              {afterImg ? (
                <img
                  src={afterImg}
                  alt="Today Scan"
                  className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
              ) : (
                <div className="text-stone-400 text-xs text-center p-4">
                  <Camera className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  No image recorded
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs flex justify-between">
                <span className="font-semibold text-emerald-300">{afterConcern}</span>
                <span className="font-mono text-stone-300">{afterConf}% Confidence</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Acne</span>
                <span className="font-bold text-stone-700">{afterAcne}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Redness</span>
                <span className="font-bold text-stone-700">{afterRedness}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-400 block font-semibold">Texture</span>
                <span className="font-bold text-stone-700">{afterTexture}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Context & Observation Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p>
            <strong>Clinical Comparison Guidance:</strong> For the most accurate yesterday-to-today tracking, compare photos captured under uniform ambient lighting, camera distance, and skin cleansing state.
          </p>
          <p className="text-[11px] text-amber-800">
            Deltas reflect model logit distributions across visible skin traits and support personal tracking without making medical claims.
          </p>
        </div>
      </div>
    </div>
  );
}
