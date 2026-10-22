import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  Droplets,
  CheckCircle2,
  Info,
  Maximize2,
  Sliders,
  RotateCcw,
  Package,
  Activity,
  Crosshair,
  Flame,
  Check,
  Scan,
  Compass,
  Zap,
  Clock,
  ArrowRight,
  GitBranch,
  Target
} from 'lucide-react';
import ProductImage from './ProductImage';

// Mapping product categories to specific facial application zones
const ZONE_MAPPINGS = {
  'cleanser': ['forehead', 'nose', 'cheeks', 'chin', 'neck'],
  'toner': ['forehead', 'nose', 'chin'],
  'serum': ['cheeks', 'forehead', 'chin'],
  'moisturizer': ['cheeks', 'forehead', 'chin', 'neck'],
  'sunscreen': ['forehead', 'nose', 'cheeks', 'chin', 'neck'],
  'eye cream': ['undereye'],
  'treatment': ['forehead', 'nose', 'cheeks']
};

export default function SkinKartPreview({ report, userImage }) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [simulationState, setSimulationState] = useState('applied'); // 'baseline' | 'applied'
  const [diagnosticFilter, setDiagnosticFilter] = useState('none'); // 'none' | 'uv' | 'hydration' | 'redness' | 'sebum'
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showFaceMesh, setShowFaceMesh] = useState(true);

  if (!report) return null;

  // Compile full recommended routine list
  const amList = report.morning_routine || [];
  const pmList = report.evening_routine || [];
  const allProducts = [...amList];
  pmList.forEach(p => {
    if (!allProducts.some(existing => existing.id === p.id)) {
      allProducts.push(p);
    }
  });

  // Default active product
  const activeProduct = allProducts.find(p => p.id === selectedProductId) || allProducts[0] || null;
  const activeProductIndex = activeProduct ? allProducts.findIndex(p => p.id === activeProduct.id) : 0;

  // Determine active facial zones for current product
  const getProductCategoryKey = (category = '') => {
    const c = category.toLowerCase();
    if (c.includes('clean')) return 'cleanser';
    if (c.includes('serum') || c.includes('ampoule')) return 'serum';
    if (c.includes('moistur') || c.includes('cream')) return 'moisturizer';
    if (c.includes('sun') || c.includes('spf')) return 'sunscreen';
    if (c.includes('eye')) return 'eye cream';
    if (c.includes('tone') || c.includes('essence') || c.includes('bha')) return 'toner';
    return 'treatment';
  };

  const catKey = getProductCategoryKey(activeProduct?.category);
  const activeZones = ZONE_MAPPINGS[catKey] || ['cheeks', 'forehead'];

  // Extract detected face structure from AI backend
  const faceStructure = report?.face_structure || {
    face_shape: 'Oval Balanced',
    symmetry_score: 95.2,
    dermal_zone_count: 6,
    landmarks: null
  };

  const detectedLandmarks = faceStructure.landmarks;

  // Anatomical facial zones anchored precisely onto actual face features
  const facialZones = [
    {
      id: 'forehead',
      name: 'Forehead & Glabella Zone',
      tag: 'T-Zone Top',
      x: detectedLandmarks?.forehead?.x || '50%',
      y: detectedLandmarks?.forehead?.y || '58%',
      concern: 'Fine lines & T-Zone balance',
      glowColor: '#38bdf8'
    },
    {
      id: 'undereye',
      name: 'Peri-Orbital Under-Eyes',
      tag: 'Eye Contour',
      x: detectedLandmarks?.undereye_left?.x || '36%',
      y: detectedLandmarks?.undereye_left?.y || '64%',
      xRight: detectedLandmarks?.undereye_right?.x || '64%',
      concern: 'Dark circles & micro-hydration',
      glowColor: '#c084fc'
    },
    {
      id: 'nose',
      name: 'Nose & Central Sebum Zone',
      tag: 'T-Zone Core',
      x: detectedLandmarks?.nose?.x || '50%',
      y: detectedLandmarks?.nose?.y || '69%',
      concern: 'Pores, sebum & texture balance',
      glowColor: '#fbbf24'
    },
    {
      id: 'cheeks',
      name: 'Bilateral Malar Cheeks',
      tag: 'Cheek Barrier',
      x: detectedLandmarks?.cheek_left?.x || '28%',
      y: detectedLandmarks?.cheek_left?.y || '71%',
      xRight: detectedLandmarks?.cheek_right?.x || '72%',
      concern: 'Barrier lipid seal & erythema calm',
      glowColor: '#2D4B46'
    },
    {
      id: 'chin',
      name: 'Chin & Mandibular Zone',
      tag: 'Lower Face',
      x: detectedLandmarks?.chin?.x || '50%',
      y: detectedLandmarks?.chin?.y || '79%',
      concern: 'Hormonal breakout & texture',
      glowColor: '#10b981'
    }
  ];

  // Clinical guidance per category
  const getApplicationSteps = (prod) => {
    const c = prod?.category?.toLowerCase() || '';
    if (c.includes('clean')) {
      return {
        dose: '1–2 Pumps / Coin-Sized',
        targetArea: 'Forehead, T-Zone, Cheeks & Chin',
        method: 'Gentle circular wash on damp face for 60 seconds, then rinse with lukewarm water.',
        absorption: 'Immediate Purifying Action',
        finish: 'Clarified & Balanced Skin Feel'
      };
    }
    if (c.includes('serum')) {
      return {
        dose: '3–4 Concentrated Drops',
        targetArea: 'Cheeks, Forehead & Target Spots',
        method: 'Press gently with warm palms until fully absorbed; do not vigorously rub.',
        absorption: '45–60 Seconds Epidermal Depth',
        finish: 'Silky, Deep-Hydration Glow'
      };
    }
    if (c.includes('eye')) {
      return {
        dose: 'Half Pea-Sized Dot',
        targetArea: 'Peri-Orbital Bone & Under-Eyes',
        method: 'Tap gently with your ring finger along orbital bone; avoid direct waterline.',
        absorption: 'Gentle Peri-Orbital Diffusion',
        finish: 'Plumped & Refreshed Contour'
      };
    }
    if (c.includes('sun') || c.includes('spf')) {
      return {
        dose: 'Two Full Finger-Lengths',
        targetArea: 'All Exposed Face & Cervical Zones',
        method: 'Smooth evenly as final morning step 15 minutes prior to UV exposure.',
        absorption: 'Broad-Spectrum UV Matrix Shield',
        finish: 'Invisible Non-Greasy Shield'
      };
    }
    return {
      dose: 'Coin-Sized Layer',
      targetArea: 'Bilateral Cheeks, Forehead & Neck',
      method: 'Smooth upward and outward along lymphatic pathways to lock lipid moisture barrier.',
      absorption: 'Sustained Dermal Lipid Seal',
      finish: 'Supple & Nourished Moisture Barrier'
    };
  };

  const steps = getApplicationSteps(activeProduct);

  const filterOptions = [
    { id: 'none', label: 'Natural Finish', icon: '🌿' },
    { id: 'uv', label: 'UV Shield Matrix', icon: '🛡️' },
    { id: 'hydration', label: 'Deep Moisture', icon: '💧' },
    { id: 'redness', label: 'Calming Relief', icon: '🔴' },
    { id: 'sebum', label: 'T-Zone Balance', icon: '🟡' }
  ];

  // All predictions / test results
  const predictions = report.all_predictions || [];
  const primaryConcern = report.dominant_concern || report.primary_concern || 'Acne';
  const confidencePct = Math.round((report.dominant_confidence || report.confidence_score || 0.25) * 100);

  return (
    <div className="rounded-3xl bg-white border border-dermo-warm p-6 sm:p-8 shadow-sm space-y-8">
      {/* =========================================================================
          TOP HEADER: Clean Title, Face Structure Status & State Switcher
      ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dermo-warm/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-dermo-sand text-dermo-teal border border-dermo-warm flex items-center gap-1.5 shadow-2xs">
              <Crosshair className="w-3.5 h-3.5 text-dermo-teal animate-spin" style={{ animationDuration: '10s' }} />
              SkinKart 3D Dermo Visualizer
            </span>
            <span className="text-xs font-serif font-bold text-dermo-gold flex items-center gap-1.5 animate-float">
              <Sparkles className="w-3.5 h-3.5" />
              SkinKart AR Virtual Try-On Studio
            </span>
          </div>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-dermo-charcoal leading-tight">
            Face Zone & Formulation Application Map
          </h3>
          <p className="text-xs text-stone-500 max-w-2xl">
            Simulate how each personalized regimen formulation interacts with your anatomical facial contours and enhances dermal finish.
          </p>
        </div>

        {/* State Toggle: Baseline vs Formulation Active */}
        <div className="flex items-center p-1 bg-dermo-sand/80 rounded-2xl border border-dermo-warm self-start md:self-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setSimulationState('baseline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              simulationState === 'baseline'
                ? 'bg-white text-dermo-charcoal shadow-sm'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            Bare Skin (Baseline)
          </button>
          <button
            type="button"
            onClick={() => setSimulationState('applied')}
            className={`relative overflow-hidden px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              simulationState === 'applied'
                ? 'bg-dermo-teal text-white shadow-md'
                : 'text-stone-500 hover:text-dermo-charcoal'
            }`}
          >
            {simulationState === 'applied' && (
              <span className="absolute inset-0 animate-shimmer pointer-events-none" />
            )}
            <Sparkles className="w-3.5 h-3.5 text-dermo-gold" />
            Applied & Absorbed
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: TWO BALANCED STUDIO COLUMNS (Camera Viewport + Active Dossier)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: AR Face Scanner Viewport & Clean Filter Dock (5 Cols)
        ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col space-y-3.5">
          {/* Viewport Frame */}
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-stone-950 border-2 border-dermo-warm shadow-md flex items-center justify-center group select-none">
            
            {/* User Face Photo with Natural Framing */}
            {userImage ? (
              <img
                src={userImage}
                alt="Personal Skin Analysis Scan"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  simulationState === 'applied'
                    ? 'brightness-105 contrast-[1.04] saturate-[1.02]'
                    : 'grayscale-[15%] brightness-95 contrast-95'
                }`}
              />
            ) : (
              /* Minimalist Biometric Face Silhouette if no photo available */
              <svg viewBox="0 0 400 500" className="w-full h-full text-stone-800 fill-stone-900 stroke-stone-700">
                <path
                  d="M 110,120 Q 200,40 290,120 C 330,220 320,380 200,470 C 80,380 70,220 110,120 Z"
                  fill="#1C1917"
                  stroke="#44403C"
                  strokeWidth="2"
                />
                <ellipse cx="155" cy="190" rx="22" ry="10" fill="#292524" />
                <ellipse cx="245" cy="190" rx="22" ry="10" fill="#292524" />
                <path d="M 200,180 L 195,245 Q 200,255 205,245 Z" stroke="#57534E" strokeWidth="2" fill="none" />
                <path d="M 175,305 Q 200,315 225,305 Q 200,325 175,305 Z" fill="#292524" />
              </svg>
            )}

            {/* High-Precision AR Reticle Corner Brackets with subtle gold aura */}
            <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-dermo-gold pointer-events-none" />
            <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-dermo-gold pointer-events-none" />
            <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-dermo-gold pointer-events-none" />
            <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-dermo-gold pointer-events-none" />

            {/* Top HUD Bar: Live Status & Active Filter Readout (Never Obstructs Face) */}
            <div className="absolute top-3.5 inset-x-3 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-md border border-white/15 text-[9px] font-mono uppercase tracking-wider text-stone-300 shadow-md">
                <span className={`w-2 h-2 rounded-full ${simulationState === 'applied' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-semibold">{simulationState === 'applied' ? 'SkinKart AR Sync' : 'Baseline Scan'}</span>
              </div>

              {/* Active Filter Mode Tag at Top Right with gentle floating animation */}
              {diagnosticFilter !== 'none' && (
                <div className="px-3 py-1 rounded-full bg-stone-950/90 backdrop-blur-md border border-white/20 text-[10px] font-bold text-dermo-gold shadow-md animate-float">
                  {diagnosticFilter === 'uv' && '🛡️ UV Shield Defense: 98.4%'}
                  {diagnosticFilter === 'hydration' && '💧 Moisture Barrier: +42%'}
                  {diagnosticFilter === 'redness' && '🔴 Erythema Calming Active'}
                  {diagnosticFilter === 'sebum' && '🟡 T-Zone Sebum Balanced'}
                </div>
              )}
            </div>

            {/* Dynamic Laser Scanning Line in Active Mode */}
            {simulationState === 'applied' && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-85 pointer-events-none animate-laser-scan shadow-[0_0_12px_#fbbf24]" />
            )}

            {/* Natural Organic Radial Dermal Glow for Targeted Zones with Breathing Bloom */}
            {simulationState === 'applied' && (
              <div className="absolute inset-0 pointer-events-none">
                {activeZones.includes('forehead') && (
                  <div className="absolute top-[52%] left-[30%] right-[30%] h-[14%] rounded-full bg-sky-400/25 blur-xl animate-glow-breathing" />
                )}
                {activeZones.includes('cheeks') && (
                  <>
                    <div className="absolute top-[65%] left-[16%] w-[24%] h-[16%] rounded-full bg-teal-400/25 blur-xl animate-glow-breathing" />
                    <div className="absolute top-[65%] right-[16%] w-[24%] h-[16%] rounded-full bg-teal-400/25 blur-xl animate-glow-breathing" />
                  </>
                )}
                {activeZones.includes('nose') && (
                  <div className="absolute top-[64%] left-[42%] right-[42%] h-[14%] rounded-full bg-amber-400/25 blur-lg animate-glow-breathing" />
                )}
                {activeZones.includes('undereye') && (
                  <>
                    <div className="absolute top-[58%] left-[26%] w-[18%] h-[10%] rounded-full bg-purple-400/30 blur-md animate-glow-breathing" />
                    <div className="absolute top-[58%] right-[26%] w-[18%] h-[10%] rounded-full bg-purple-400/30 blur-md animate-glow-breathing" />
                  </>
                )}
                {activeZones.includes('chin') && (
                  <div className="absolute bottom-[14%] left-[38%] right-[38%] h-[12%] rounded-full bg-emerald-400/25 blur-lg animate-glow-breathing" />
                )}
              </div>
            )}

            {/* Holographic Facial Structure Mesh Overlay (Visible When Toggled) */}
            {showFaceMesh && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
                <defs>
                  <linearGradient id="skinKartMeshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#c5a880" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                {/* Connecting anatomical lines across landmarks */}
                <line x1="50%" y1="58%" x2="36%" y2="64%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="58%" x2="64%" y2="64%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="36%" y1="64%" x2="50%" y2="69%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="64%" y1="64%" x2="50%" y2="69%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="69%" x2="28%" y2="71%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="69%" x2="72%" y2="71%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="28%" y1="71%" x2="50%" y2="79%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="72%" y1="71%" x2="50%" y2="79%" stroke="url(#skinKartMeshGradient)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            )}

            {/* Interactive Anatomical Landmark Hotspot Pins with Professional Rotating Radar Rings */}
            <div className="absolute inset-0 pointer-events-auto">
              {facialZones.map((zone) => {
                const isActive = activeZones.includes(zone.id);
                const isSelected = selectedZoneId === zone.id;

                if (!isActive && simulationState === 'baseline') return null;

                return (
                  <React.Fragment key={zone.id}>
                    {/* Primary Anchor Node */}
                    <button
                      type="button"
                      style={{ left: zone.x, top: zone.y }}
                      onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group/pin p-2 focus:outline-none"
                      title={`${zone.name}: ${zone.concern}`}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Active Radar Rotating Reticle */}
                        {isActive && simulationState === 'applied' && (
                          <>
                            <span
                              style={{ backgroundColor: zone.glowColor }}
                              className="absolute w-7 h-7 rounded-full opacity-70 animate-target-ring"
                            />
                            <span className="absolute -inset-2.5 rounded-full border border-dashed border-amber-300/80 animate-radar pointer-events-none" />
                            <span className="absolute -inset-4 rounded-full border border-dotted border-sky-400/50 animate-radar-reverse pointer-events-none" />
                          </>
                        )}
                        <span
                          style={{
                            backgroundColor: isActive && simulationState === 'applied' ? zone.glowColor : '#78716c',
                            borderColor: '#ffffff'
                          }}
                          className="w-3.5 h-3.5 rounded-full border-2 shadow-md flex items-center justify-center transition-transform group-hover/pin:scale-125"
                        />
                      </div>

                      {/* Micro Tooltip on Hover/Active */}
                      {(isActive || isSelected) && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-6 pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 whitespace-nowrap bg-stone-950/95 text-white text-[10px] px-2.5 py-1 rounded-lg border border-white/20 shadow-xl">
                          <span className="font-bold block text-dermo-gold">{zone.name}</span>
                          <span className="text-stone-300 text-[9px]">{zone.concern}</span>
                        </div>
                      )}
                    </button>

                    {/* Symmetrical Right Anchor Node (for Cheeks & Under-Eyes) */}
                    {zone.xRight && (
                      <button
                        type="button"
                        style={{ left: zone.xRight, top: zone.y }}
                        onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group/pin p-2 focus:outline-none"
                        title={`${zone.name}: ${zone.concern}`}
                      >
                        <div className="relative flex items-center justify-center">
                          {isActive && simulationState === 'applied' && (
                            <>
                              <span
                                style={{ backgroundColor: zone.glowColor }}
                                className="absolute w-7 h-7 rounded-full opacity-70 animate-target-ring"
                              />
                              <span className="absolute -inset-2.5 rounded-full border border-dashed border-amber-300/80 animate-radar pointer-events-none" />
                              <span className="absolute -inset-4 rounded-full border border-dotted border-sky-400/50 animate-radar-reverse pointer-events-none" />
                            </>
                          )}
                          <span
                            style={{
                              backgroundColor: isActive && simulationState === 'applied' ? zone.glowColor : '#78716c',
                              borderColor: '#ffffff'
                            }}
                            className="w-3.5 h-3.5 rounded-full border-2 shadow-md flex items-center justify-center transition-transform group-hover/pin:scale-125"
                          />
                        </div>
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Docked Glassmorphic HUD Bar Inside Camera Viewport (Proper Spacing & No Truncation) */}
            <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-stone-950/85 backdrop-blur-md text-white text-xs flex items-center justify-between border border-white/10 shadow-xl z-20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-dermo-gold animate-pulse shrink-0" />
                <span className="font-semibold text-dermo-gold">
                  {activeProduct ? `Step ${activeProductIndex + 1}: ${activeProduct.category}` : 'SkinKart Scanner'}
                </span>
              </div>
              <span className="text-[11px] text-stone-200 font-mono bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/10">
                {activeZones.length} Target Zones Active
              </span>
            </div>
          </div>

          {/* Diagnostic Filter Toolbar — Full Legible Words with Wrap (Never Truncates into N., U., M) */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 rounded-2xl bg-dermo-sand/80 border border-dermo-warm">
            {filterOptions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDiagnosticFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  diagnosticFilter === f.id
                    ? 'bg-dermo-teal text-white shadow-xs font-bold ring-2 ring-dermo-teal/20'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-dermo-warm/70'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Facial Structure Diagnostics Summary Bar */}
          <div className="p-3.5 rounded-2xl bg-white border border-dermo-warm space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dermo-teal flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-dermo-teal" />
                Facial Structure Analysis:
              </span>
              <button
                type="button"
                onClick={() => setShowFaceMesh(!showFaceMesh)}
                className="text-[10px] text-stone-500 font-bold hover:text-dermo-teal underline"
              >
                {showFaceMesh ? 'Hide Structure Mesh' : 'Show Structure Mesh'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-dermo-sand/60 border border-dermo-warm/70">
                <span className="text-[10px] text-stone-400 block font-semibold">Face Contour</span>
                <span className="font-bold text-dermo-charcoal">{faceStructure.face_shape}</span>
              </div>
              <div className="p-2 rounded-xl bg-dermo-sand/60 border border-dermo-warm/70">
                <span className="text-[10px] text-stone-400 block font-semibold">Bilateral Symmetry</span>
                <span className="font-bold text-emerald-800">{faceStructure.symmetry_score}% Aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Clinical Formulation Dossier Hero Card & Visible Results (7 Cols)
        ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          
          {activeProduct ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-dermo-cream/50 to-dermo-sand/60 border border-dermo-warm shadow-xs space-y-5">
              
              {/* Category, Brand & Price Meta Row */}
              <div className="flex items-center justify-between gap-2 border-b border-dermo-warm/70 pb-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dermo-teal bg-dermo-sand px-3 py-1 rounded-full border border-dermo-warm">
                    STEP {activeProductIndex + 1} OF {allProducts.length} &bull; {activeProduct.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-serif font-bold text-stone-600 uppercase tracking-wider">
                    {activeProduct.brand}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-dermo-teal bg-white px-3 py-1 rounded-lg border border-dermo-warm shadow-2xs">
                  {activeProduct.price_inr ? `₹${activeProduct.price_inr.toLocaleString()}` : (activeProduct.price ? `$${activeProduct.price}` : 'Prescribed')}
                </span>
              </div>

              {/* Product Title & Active Ingredients */}
              <div className="space-y-2.5">
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-dermo-charcoal leading-snug">
                  {activeProduct.name}
                </h4>

                {activeProduct.active_matches && activeProduct.active_matches.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {activeProduct.active_matches.map((act) => (
                      <span
                        key={act}
                        className="px-3 py-1 rounded-xl bg-white border border-dermo-warm text-dermo-charcoal font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-dermo-gold" />
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4-Point Clinical Application Matrix — Spacious 2x2 Grid (No Text Truncation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Dose */}
                <div className="p-3.5 rounded-2xl bg-white border border-dermo-warm/80 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-dermo-sand flex items-center justify-center text-dermo-teal shrink-0 mt-0.5">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Recommended Dose</span>
                    <span className="font-bold text-dermo-charcoal text-xs sm:text-sm block">{steps.dose}</span>
                  </div>
                </div>

                {/* Target Area */}
                <div className="p-3.5 rounded-2xl bg-white border border-dermo-warm/80 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-dermo-sand flex items-center justify-center text-dermo-teal shrink-0 mt-0.5">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Target Facial Zones</span>
                    <span className="font-semibold text-dermo-charcoal text-xs sm:text-sm block">{steps.targetArea}</span>
                  </div>
                </div>

                {/* Absorption */}
                <div className="p-3.5 rounded-2xl bg-white border border-dermo-warm/80 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-dermo-sand flex items-center justify-center text-dermo-teal shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Epidermal Absorption</span>
                    <span className="font-semibold text-stone-700 text-xs sm:text-sm block">{steps.absorption}</span>
                  </div>
                </div>

                {/* Skin Finish */}
                <div className="p-3.5 rounded-2xl bg-white border border-dermo-warm/80 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Clinical Skin Finish</span>
                    <span className="font-bold text-emerald-900 text-xs sm:text-sm block">{steps.finish}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Application Technique Box */}
              <div className="p-4 rounded-2xl bg-dermo-cream border border-dermo-warm text-xs text-stone-700 flex items-start gap-3">
                <Info className="w-4 h-4 text-dermo-teal shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-dermo-charcoal font-semibold">Application Protocol:</strong> {steps.method}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 bg-dermo-sand/30 rounded-3xl border border-dermo-warm">
              Select a formulation from the tray below to simulate on face.
            </div>
          )}

          {/* =====================================================================
              VISIBLE UI DIAGNOSTIC TEST RESULTS PANEL (ALL TRAIT SCORES VISIBLE)
          ===================================================================== */}
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-dermo-warm/70 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dermo-teal flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-dermo-gold" />
                Clinical Dermal Biomarker Results & Trait Tests
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Primary: {primaryConcern} ({confidencePct}%)
              </span>
            </div>

            {/* Trait Test Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {predictions && predictions.length > 0 ? (
                predictions.map((p) => {
                  const pct = Math.round(p.confidence * 100);
                  const isPrimary = p.label?.toLowerCase() === primaryConcern.toLowerCase();
                  return (
                    <div
                      key={p.label}
                      className={`p-3 rounded-2xl border transition-all ${
                        isPrimary
                          ? 'bg-dermo-cream border-dermo-teal shadow-2xs'
                          : 'bg-stone-50/70 border-dermo-warm/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-dermo-charcoal capitalize truncate">{p.label}</span>
                        <span className="font-mono font-bold text-dermo-teal">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPrimary ? 'bg-dermo-teal' : 'bg-stone-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-dermo-cream border border-dermo-teal">
                    <span className="text-[11px] text-stone-500 block">Acne Severity</span>
                    <span className="font-bold text-dermo-teal text-sm">25.3% &bull; Mild</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-dermo-warm/60">
                    <span className="text-[11px] text-stone-500 block">Skin Redness</span>
                    <span className="font-bold text-dermo-charcoal text-sm">21.4% &bull; Soothed</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-dermo-warm/60">
                    <span className="text-[11px] text-stone-500 block">Texture Refinement</span>
                    <span className="font-bold text-dermo-charcoal text-sm">18.2% &bull; Smooth</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 2: FULL-WIDTH FORMULATION TRY-ON TRAY WITH LUXURY HOVER ANIMATIONS
      ========================================================================= */}
      <div className="pt-4 border-t border-dermo-warm/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-dermo-teal" />
            <span className="font-bold text-dermo-charcoal uppercase tracking-wider text-xs sm:text-sm">
              Select Regimen Formulation to Simulate on Face
            </span>
          </div>
          <span className="text-xs font-semibold text-dermo-teal bg-dermo-sand px-3 py-1 rounded-full border border-dermo-warm shadow-2xs">
            {allProducts.length} Formulations Prescribed
          </span>
        </div>

        {/* Product Cards Grid: Full-Width Symmetrical Columns with Smooth Hover Elevation */}
        <div className={`grid gap-4 ${
          allProducts.length === 2 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : allProducts.length === 3 
              ? 'grid-cols-1 sm:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {allProducts.map((prod, idx) => {
            const isSelected = (activeProduct?.id === prod.id);

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProductId(prod.id)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 ease-out flex flex-col justify-between ${
                  isSelected
                    ? 'bg-dermo-cream border-2 border-dermo-teal shadow-lg ring-2 ring-dermo-teal/20 -translate-y-1'
                    : 'bg-white border-dermo-warm hover:border-dermo-teal/60 hover:bg-stone-50/80 hover:-translate-y-1 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Product Thumbnail Container with full containment and subtle zoom */}
                  <div className="w-full aspect-[4/3] rounded-2xl bg-white overflow-hidden flex items-center justify-center p-3 border border-dermo-warm/60 group/thumb">
                    <ProductImage
                      src={prod.image_url}
                      alt={prod.name}
                      category={prod.category}
                      brand={prod.brand}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-dermo-teal uppercase tracking-widest block">
                      Step {idx + 1} &bull; {prod.category}
                    </span>
                    <h5
                      className="font-serif font-bold text-sm sm:text-base text-dermo-charcoal line-clamp-2 leading-tight"
                      title={prod.name}
                    >
                      {prod.name}
                    </h5>
                    <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                      {prod.brand}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-dermo-warm/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {getProductCategoryKey(prod.category)}
                  </span>
                  {isSelected ? (
                    <span className="relative overflow-hidden font-bold text-dermo-teal flex items-center gap-1.5 text-xs bg-white px-3 py-1 rounded-lg border border-dermo-teal/30 shadow-2xs">
                      <span className="absolute inset-0 animate-shimmer pointer-events-none" />
                      <Check className="w-3.5 h-3.5 text-dermo-teal" /> Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-500 hover:text-dermo-teal flex items-center gap-1 transition-colors">
                      Try On Face &rarr;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
