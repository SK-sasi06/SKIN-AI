import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, AlertTriangle, RefreshCw, Sparkles, Sun, Moon, Video, X, CheckCircle2, RotateCcw, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { analyzeSkin } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import RoutineSafetyBadge from '../components/RoutineSafetyBadge';
import DermatologistReferralModal from '../components/DermatologistReferralModal';
import ReportUserHeader from '../components/ReportUserHeader';
import SkinKartPreview from '../components/SkinKartPreview';
import SkinAnalyticsCharts from '../components/SkinAnalyticsCharts';

export default function AnalyzePage({ onNavigate }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDermModalOpen, setIsDermModalOpen] = useState(false);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Ensure camera streams are halted on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  const startCamera = async () => {
    setError('');
    setCameraError('');
    setCameraLoading(true);
    setIsCameraActive(true);

    try {
      const constraints = {
        video: {
          width: { ideal: 720 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => {
            console.error('Video play error:', e);
          });
          setCameraLoading(false);
        };
      } else {
        setCameraLoading(false);
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      let msg = 'Unable to access your webcam. Please check browser permissions or upload a facial photo directly.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings or select an image file.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device was detected on your system. Please upload a photo instead.';
      }
      setCameraError(msg);
      stopCameraStream();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 640;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const capturedFile = new File([blob], 'facial_capture.jpg', { type: 'image/jpeg' });
          setFile(capturedFile);
          setPreview(URL.createObjectURL(capturedFile));
          setReport(null);
          setError('');
          stopCameraStream();
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError('Could not capture photo frame. Please try uploading an image.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
      setReport(null);
      stopCameraStream();
    }
  };

  const handleRetake = () => {
    setFile(null);
    setPreview(null);
    setReport(null);
    setError('');
    startCamera();
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose or capture a facial photo first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Analyze skin without prompting user for speculative skin type dropdown
      const data = await analyzeSkin(file);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Diagnostic analysis failed. Please verify the photo clarity and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 space-y-12">
      {/* Intro Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dermo-sand border border-dermo-warm text-dermo-teal text-xs font-bold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-dermo-gold" />
          AI-Powered Skin Analysis
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-dermo-charcoal tracking-tight">
          Discover Your Skin Concerns
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Powered by advanced computer vision. Capture or upload a clear facial photo to evaluate visible skin concerns and receive personalized skincare routines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Step 1 Capture Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-dermo-warm/90 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-dermo-warm/60 pb-4">
              <div>
                <span className="text-xs font-bold tracking-widest text-dermo-accent uppercase">Step 01</span>
                <h3 className="font-serif font-bold text-lg text-dermo-charcoal">Facial Image Capture</h3>
              </div>
              {preview && (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1 text-xs text-dermo-teal hover:text-dermo-tealDark font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Photo
                </button>
              )}
            </div>

            {/* Camera Viewport or Upload Area */}
            <div className="space-y-4">
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-dermo-teal/40 bg-dermo-charcoal aspect-square flex flex-col items-center justify-center">
                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dermo-charcoal/80 text-white z-10 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-dermo-gold" />
                      <span className="text-xs font-medium">Initializing camera stream...</span>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />

                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="px-3 py-2 rounded-xl bg-white/90 text-stone-700 hover:bg-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={cameraLoading}
                      className="px-5 py-2.5 rounded-xl bg-dermo-teal hover:bg-dermo-tealDark text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                    >
                      <Camera className="w-4 h-4 text-dermo-gold" />
                      Capture Frame
                    </button>
                  </div>
                </div>
              ) : preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-dermo-warm bg-dermo-sand aspect-square flex items-center justify-center group">
                  <img
                    src={preview}
                    alt="Facial Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-dermo-teal shadow-md flex items-center gap-1.5 border border-dermo-warm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ready for Analysis
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-dermo-warm hover:border-dermo-teal/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-dermo-cream/50 min-h-[260px] space-y-4">
                  <div className="w-16 h-16 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal shadow-inner">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-dermo-charcoal text-base">Select Your Photo Method</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">
                      Take a real-time photo with your device camera or upload an existing front-facing picture.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dermo-teal text-white hover:bg-dermo-tealDark text-xs font-semibold shadow-sm transition-transform active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5 text-dermo-gold" />
                      Start Camera
                    </button>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-dermo-warm text-dermo-charcoal hover:bg-dermo-sand text-xs font-semibold cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-dermo-accent" />
                      Upload File
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Camera error notification if any */}
            {cameraError && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{cameraError}</span>
              </div>
            )}

            {/* Clinical Photo Guidance */}
            <div className="p-4 rounded-2xl bg-dermo-sand/60 border border-dermo-warm/80 space-y-2">
              <h5 className="text-[11px] font-bold text-dermo-teal uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Imaging Best Practices
              </h5>
              <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                <li>Diffuse natural lighting without harsh shadows</li>
                <li>Direct front-facing angle with relaxed facial expression</li>
                <li>Avoid heavy beautification filters or tinted sunglasses</li>
              </ul>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Action Analyze CTA */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                loading || !file
                  ? 'bg-dermo-warm/80 text-stone-400 cursor-not-allowed'
                  : 'bg-dermo-teal hover:bg-dermo-tealDark text-white shadow-lg shadow-dermo-teal/15 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-dermo-gold" />
                  Analyzing Skin with Vision Transformer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-dermo-gold" />
                  Analyze My Skin
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Step 2 & 3 Results / Empty State */}
        <div className="lg:col-span-7">
          {!report && !loading && (
            <div className="bg-white border border-dermo-warm/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-5">
              <div className="w-20 h-20 rounded-full bg-dermo-sand flex items-center justify-center text-dermo-teal">
                <Sparkles className="w-9 h-9 text-dermo-gold" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-serif font-bold text-2xl text-dermo-charcoal">
                  Awaiting Diagnostic Photo
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Capture or upload your front-facing photo on the left. Our Vision Transformer model will evaluate your skin profile across 7 dermatological concerns.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg pt-4 text-left">
                {['Acne & Blemishes', 'Hyperpigmentation', 'Texture & Pores', 'Redness & Barrier', 'Under-Eye Dark Circles', 'Fine Rhytids / Lines'].map((item) => (
                  <div key={item} className="p-3 rounded-xl bg-dermo-cream border border-dermo-warm/60 text-xs text-dermo-charcoal font-medium">
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-dermo-warm/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-dermo-sand border-t-dermo-teal animate-spin" />
                <Sparkles className="w-6 h-6 text-dermo-gold absolute inset-0 m-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-2xl text-dermo-charcoal">Analyzing Facial Characteristics</h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                  Evaluating visible facial skin features and cross-referencing with 1,472 authentic product formulations...
                </p>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Aligned User & Diagnostic Report Header */}
              <ReportUserHeader report={report} />

              {/* SkinKart 3D Face Zone & Formulation Try-On Visualizer */}
              <SkinKartPreview 
                report={report} 
                userImage={preview || report.image_url} 
              />

              {/* Dermal Health Spider Radar & Probability Bar Charts */}
              <SkinAnalyticsCharts report={report} />

              {/* Step 3: Skin Concern Findings Banner */}
              <div className="bg-white border border-dermo-warm/90 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dermo-warm/60 pb-5">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-dermo-accent uppercase">Step 02 & 03 — AI Findings</span>
                    <h2 className="font-serif font-bold text-2xl md:text-3xl text-dermo-charcoal capitalize mt-0.5">
                      Primary Concern: {report.dominant_concern}
                    </h2>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-dermo-sand text-dermo-teal font-serif font-bold text-sm border border-dermo-warm text-right">
                    <span>{(report.dominant_confidence * 100).toFixed(1)}% Model Confidence</span>
                  </div>
                </div>

                {/* Score breakdown across model traits */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                    Concern Probability Distribution
                  </h4>
                  <div className="space-y-2.5">
                    {report.analysis && report.analysis.scores && Object.entries(report.analysis.scores).map(([concern, score]) => (
                      <div key={concern} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="capitalize text-dermo-charcoal">{concern}</span>
                          <span className="font-mono text-stone-500">{(score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-dermo-sand rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${
                              concern === report.dominant_concern ? 'bg-dermo-teal' : 'bg-dermo-warm'
                            }`}
                            style={{ width: `${Math.max(score * 100, 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Targeted Active Ingredients */}
                <div className="pt-4 border-t border-dermo-warm/60 space-y-3">
                  <h4 className="text-xs font-bold text-dermo-accent uppercase tracking-wider">
                    Recommended Active Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.targeted_actives && report.targeted_actives.map((act) => (
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

                {/* Clinical Disclaimer & Dermatologist Guide Trigger */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="font-bold">Informational Guidance Notice:</strong> {report.disclaimer || 'This analysis is intended solely for cosmetic skincare routine planning and self-care education.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDermModalOpen(true)}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs transition-all"
                  >
                    Clinical Red Flags & Referral Guide
                  </button>
                </div>
              </div>

              {/* Step 4: Routine Ingredient Safety & Layering Check */}
              {report.routine_safety && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-dermo-teal" />
                    <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Active Ingredient Compatibility</h3>
                  </div>
                  <RoutineSafetyBadge safetyReport={report.routine_safety} />
                </div>
              )}

              {/* Step 5: Matched Regimen Routines */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sun className="w-5 h-5 text-amber-600" />
                    <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Morning Regimen (AM)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {report.morning_routine && report.morning_routine.map((prod) => (
                      <ProductCard key={prod.id} product={prod} onSelect={(p) => setSelectedProduct(p)} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="w-5 h-5 text-indigo-900" />
                    <h3 className="font-serif font-bold text-xl text-dermo-charcoal">Evening Regimen (PM)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {report.evening_routine && report.evening_routine.map((prod) => (
                      <ProductCard key={prod.id} product={prod} onSelect={(p) => setSelectedProduct(p)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details & Price Comparison Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Dermatologist Referral & Clinical Red Flag Modal */}
      <DermatologistReferralModal
        isOpen={isDermModalOpen}
        onClose={() => setIsDermModalOpen(false)}
        currentReport={report}
      />
    </div>
  );
}