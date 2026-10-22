import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Database,
  Cpu,
  ArrowRight,
  HeartHandshake,
  Camera,
  CheckCircle2,
  Scan,
  Sparkle,
  ShoppingBag,
  Award
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="space-y-24 py-6 md:py-10">
      {/* 1. Hero Section - Two Column Luxury Campaign Layout */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F6F2EC] via-white to-[#F0ECE4] border border-dermo-warm p-6 sm:p-10 lg:p-14 shadow-lg shadow-dermo-sand/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Headline, CTAs & Benefits */}
          <div className="lg:col-span-7 space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-dermo-warm/90 text-dermo-teal text-xs font-bold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-dermo-gold" />
              AI-POWERED SKIN ANALYSIS
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold tracking-tight text-dermo-charcoal leading-[1.12]">
              Healthy Skin Starts with Real Insights
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-xl">
              Understand what your skin truly needs. Our Vision Transformer AI scans for concern patterns like blemishes, hyperpigmentation, and texture, delivering targeted active ingredients and authenticated product regimens.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <button
                onClick={() => onNavigate('analyze')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-sm shadow-md shadow-dermo-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-dermo-teal"
              >
                Analyze Your Skin
                <ArrowRight className="w-4 h-4 text-dermo-gold" />
              </button>
              <button
                onClick={() => onNavigate('journey')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-dermo-sand hover:bg-dermo-warm border border-dermo-warm text-dermo-teal font-bold text-sm transition-all shadow-sm focus:outline-none hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-dermo-gold" />
                Skin Journey AI
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-dermo-sand border border-dermo-warm text-dermo-charcoal font-semibold text-sm transition-all shadow-sm focus:outline-none"
              >
                Explore Products
              </button>
            </div>

            {/* Row of Three Benefits */}
            <div className="pt-4 border-t border-dermo-warm/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal flex-shrink-0">
                  <Scan className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-dermo-charcoal">AI Skin Analysis</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-dermo-gold" />
                </div>
                <span className="text-xs font-bold text-dermo-charcoal">Personalized Recommendations</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-dermo-charcoal">Trusted Products</span>
              </div>
            </div>
          </div>

          {/* Right Column: Skincare Model Portrait with Delicate Facial Analysis Overlays */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Background Soft Organic Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-dermo-sand/60 to-amber-100/30 rounded-3xl filter blur-2xl transform scale-95 -z-10" />

            <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden border border-dermo-warm bg-white p-2.5 shadow-xl shadow-dermo-teal/10">
              {/* Model Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-dermo-sand">
                <img
                  src="/images/hero-skincare-model.jpg"
                  alt="Radiant skincare model portrait"
                  className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Subtle vignette gradient for clinical editorial feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                {/* Overlay Pinpoint Label 1: Acne (Forehead / Temples) */}
                <div className="absolute top-[22%] left-[12%] animate-in fade-in zoom-in duration-700">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span className="text-[11px] font-bold text-dermo-charcoal tracking-wide">Acne</span>
                  </div>
                </div>

                {/* Overlay Pinpoint Label 2: Uneven Texture (Cheek) */}
                <div className="absolute top-[48%] right-[10%] animate-in fade-in zoom-in duration-900">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span className="text-[11px] font-bold text-dermo-charcoal tracking-wide">Uneven Texture</span>
                  </div>
                </div>

                {/* Overlay Pinpoint Label 3: Dark Spots (Lower Cheek / Jawline) */}
                <div className="absolute bottom-[24%] left-[18%] animate-in fade-in zoom-in duration-1000">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dermo-teal opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-dermo-teal" />
                    </span>
                    <span className="text-[11px] font-bold text-dermo-charcoal tracking-wide">Dark Spots</span>
                  </div>
                </div>
              </div>

              {/* Caption Footnote */}
              <div className="pt-2.5 pb-1 px-2 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Facial mapping overlay
                </span>
                <span className="italic text-stone-400 text-[10px]">Illustrative preview. Model not analyzed.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. "How It Works" Section - 4 Steps */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-dermo-accent tracking-widest uppercase">Simple & Transparent</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-dermo-charcoal">How It Works</h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Get personalized skincare recommendations backed by computer vision science in four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
              <Camera className="w-6 h-6 text-dermo-teal" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-dermo-accent">Step 01</span>
              <h4 className="font-serif font-bold text-lg text-dermo-charcoal">Capture or Upload</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Take a quick live photo using your camera or upload a clear, front-facing image of your face.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
              <Cpu className="w-6 h-6 text-dermo-teal" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-dermo-accent">Step 02</span>
              <h4 className="font-serif font-bold text-lg text-dermo-charcoal">AI Analysis</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Our Vision Transformer model analyzes your skin across key concern categories with authentic probability scoring.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
              <Sparkles className="w-6 h-6 text-dermo-gold" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-dermo-accent">Step 03</span>
              <h4 className="font-serif font-bold text-lg text-dermo-charcoal">Get Results</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              View your primary concern breakdown, matched active ingredients, and tailored morning & evening routines.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-white border border-dermo-warm space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
              <ShoppingBag className="w-6 h-6 text-dermo-teal" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-dermo-accent">Step 04</span>
              <h4 className="font-serif font-bold text-lg text-dermo-charcoal">Shop & Care</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Explore matched formulations with genuine Indian Rupee (₹) pricing and direct links to official brand stores.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-dermo-warm/90 space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
            <Cpu className="w-6 h-6 text-dermo-teal" />
          </div>
          <h3 className="font-serif font-bold text-xl text-dermo-charcoal">AI-Powered Skin Analysis</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Advanced computer vision analyzes visible facial skin concerns to help personalize your skincare recommendations.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-dermo-warm/90 space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
            <Database className="w-6 h-6 text-dermo-teal" />
          </div>
          <h3 className="font-serif font-bold text-xl text-dermo-charcoal">1,472 Verified Products</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Commercial formulations across Cleansers, Moisturizers, Treatments, Masks, Eye Creams, and Sunscreens cross-referenced with full INCI ingredients.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-dermo-warm/90 space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-dermo-sand flex items-center justify-center text-dermo-teal">
            <HeartHandshake className="w-6 h-6 text-dermo-teal" />
          </div>
          <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Official Brand Boutiques</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Every product connects directly to the brand's verified official boutique or authorized retailer with genuine Indian Rupee (₹) pricing.
          </p>
        </div>
      </section>

      {/* 4. Safety & Medical Notice */}
      <section className="rounded-3xl border border-amber-200/90 bg-amber-50/60 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Cosmetic Guidance & Medical Disclaimer
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            ALSKINCARE AI provides informational cosmetic routine guidance and ingredient education. It is not an FDA-cleared diagnostic device and does not diagnose disease. Always consult a board-certified dermatologist for persistent skin conditions or suspicious lesions.
          </p>
        </div>
      </section>
    </div>
  );
}
