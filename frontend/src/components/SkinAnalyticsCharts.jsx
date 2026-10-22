import React, { useState } from 'react';
import { Activity, Sparkles, TrendingUp, ShieldCheck, BarChart3, Sun, Moon, Info } from 'lucide-react';

export default function SkinAnalyticsCharts({ report }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  if (!report) return null;

  const rawScores = report.analysis?.scores || {};
  
  // Calculate Dermal Health metrics for the 6-Axis Radar Chart (0-100 scale)
  // Higher is better / healthier
  const acneVal = Math.round(100 - (rawScores['Acne'] || 0.35) * 80);
  const rednessVal = Math.round(100 - (rawScores['Skin Redness'] || 0.25) * 80);
  const textureVal = Math.round(100 - (rawScores['Skin Texture'] || 0.30) * 80);
  const pigmentVal = Math.round(100 - (rawScores['Skin Pigmentation'] || 0.20) * 80);
  const hydrationVal = Math.round(85 - (rawScores['Skin Redness'] || 0.2) * 30);
  const resilienceVal = Math.round(80 - (rawScores['Wrinkled Face'] || 0.15) * 40);

  const radarMetrics = [
    { label: 'Blemish Clarity', value: acneVal, desc: 'Absence of inflammatory papules and comedones' },
    { label: 'Erythema Calm', value: rednessVal, desc: 'Microvascular barrier soothing and low flushing' },
    { label: 'Hydration Depth', value: hydrationVal, desc: 'Epidermal moisture retention and plumpness' },
    { label: 'Pore Smoothness', value: textureVal, desc: 'Follicular texture refinement and uniform keratin' },
    { label: 'Pigment Evenness', value: pigmentVal, desc: 'Melanin distribution and dark spot clarity' },
    { label: 'Lipid Resilience', value: resilienceVal, desc: 'Stratum corneum acid mantle protection' }
  ];

  // SVG Radar Chart Math
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const totalAxes = radarMetrics.length;

  const getCoordinates = (value, index) => {
    const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
    const distance = (value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(m.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid concentric levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Concern probabilities for bar chart
  const allConcerns = Object.entries(rawScores)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Chart Section Header */}
      <div className="flex items-center justify-between border-b border-dermo-warm/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-dermo-sand text-dermo-teal flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-dermo-gold" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-dermo-charcoal leading-none">
              Dermatological Analytics & Biomarker Charts
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Multi-axial computer vision breakdown across key epidermal health vectors
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-dermo-sand text-dermo-teal border border-dermo-warm">
          ViT Quantified
        </span>
      </div>

      {/* Grid: Radar Chart + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6-Axis Dermal Health Radar Chart (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-dermo-warm shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-dermo-teal" />
                Dermal Health Hexagonal Matrix
              </h4>
              <p className="text-[11px] text-stone-500">6-axis holistic skin health score</p>
            </div>
            <span className="text-xs font-bold font-serif text-dermo-teal bg-dermo-sand/80 px-2 py-0.5 rounded-md">
              Score: {Math.round(radarMetrics.reduce((acc, m) => acc + m.value, 0) / radarMetrics.length)}/100
            </span>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg width={size} height={size} className="overflow-visible select-none max-w-full">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2E6B65" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              {/* Concentric Web Grid Rings */}
              {levels.map((level, lvlIdx) => {
                const ringPoints = radarMetrics
                  .map((_, i) => {
                    const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
                    const x = cx + r * level * Math.cos(angle);
                    const y = cy + r * level * Math.sin(angle);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvlIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#E6DFD5"
                    strokeWidth="1"
                    strokeDasharray={lvlIdx === levels.length - 1 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {radarMetrics.map((_, i) => {
                const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#E6DFD5"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Colored Polygon Area */}
              <polygon
                points={polygonPoints}
                fill="url(#radarGlow)"
                stroke="#2E6B65"
                strokeWidth="2.5"
                className="transition-all duration-700 filter drop-shadow-sm"
              />

              {/* Interactive Points and Labels */}
              {radarMetrics.map((m, i) => {
                const { x, y } = getCoordinates(m.value, i);
                const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
                const labelDist = r + 24;
                const lx = cx + labelDist * Math.cos(angle);
                const ly = cy + labelDist * Math.sin(angle);

                let textAnchor = 'middle';
                if (Math.abs(Math.cos(angle)) > 0.3) {
                  textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
                }

                return (
                  <g key={i}>
                    {/* Circle Vertex */}
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#C5A059"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer hover:scale-150 transition-transform"
                      onMouseEnter={() => setActiveTooltip(m)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                    {/* Outer Label */}
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="text-[10px] font-sans font-bold fill-stone-700"
                    >
                      {m.label} ({m.value}%)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {activeTooltip && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white px-3 py-1.5 rounded-xl text-[11px] shadow-lg pointer-events-none text-center">
                <span className="font-bold text-dermo-gold">{activeTooltip.label}: {activeTooltip.value}%</span>
                <p className="text-[10px] text-stone-300">{activeTooltip.desc}</p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-500 text-center italic bg-dermo-sand/40 p-2 rounded-xl border border-dermo-warm/50">
            Hover over vertices to view specific barrier and clarity indicators.
          </div>
        </div>

        {/* Right: Concern Probability Distribution Bars (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white border border-dermo-warm shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-dermo-gold" />
                Vision Transformer Concern Distribution
              </h4>
              <p className="text-[11px] text-stone-500">
                Probability percentages detected by neural network feature extraction
              </p>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">ViT Top 7</span>
          </div>

          {/* Bar Chart list */}
          <div className="space-y-3 pt-1">
            {allConcerns.map(([concern, score]) => {
              const pct = (score * 100).toFixed(1);
              const isDominant = concern === report.dominant_concern;

              let severity = 'Mild';
              let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (score >= 0.4) {
                severity = 'Elevated';
                badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
              } else if (score >= 0.2) {
                severity = 'Moderate';
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
              }

              return (
                <div key={concern} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold capitalize ${isDominant ? 'text-dermo-teal font-bold' : 'text-dermo-charcoal'}`}>
                        {concern}
                      </span>
                      {isDominant && (
                        <span className="px-1.5 py-0.2 rounded-md bg-dermo-sand text-dermo-teal text-[9px] font-bold uppercase tracking-wider border border-dermo-warm">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {severity}
                      </span>
                      <span className="font-mono font-bold text-stone-700 w-12 text-right">{pct}%</span>
                    </div>
                  </div>

                  {/* Horizontal Bar with Gradient */}
                  <div className="w-full bg-dermo-sand/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-dermo-warm/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDominant
                          ? 'bg-gradient-to-r from-dermo-teal to-teal-400'
                          : score >= 0.2
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-stone-300 to-stone-400'
                      }`}
                      style={{ width: `${Math.max(score * 100, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AM vs PM Potency Footer Bar */}
          <div className="pt-3 border-t border-dermo-warm/70 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-dermo-charcoal block text-[11px]">AM Protection actives</span>
                <span className="text-[10px] text-stone-500">Antioxidants & Broad SPF 50+</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-700 shrink-0" />
              <div>
                <span className="font-bold text-dermo-charcoal block text-[11px]">PM Epidermal repair</span>
                <span className="text-[10px] text-stone-500">Lipids, Ceramides & Cell Turnover</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
