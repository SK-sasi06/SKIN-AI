import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, FileText, CheckCircle2, PhoneCall, Stethoscope, HeartPulse, ExternalLink, Printer } from 'lucide-react';

export default function DermatologistReferralModal({ isOpen, onClose, currentReport }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const redFlags = [
    {
      title: 'Deep, Painful Nodulocystic Lesions',
      desc: 'Blemishes that feel firm, tender, and situated deep beneath the epidermis. Over-the-counter cosmetic topicals cannot penetrate deep cystic structures and can lead to permanent scarring without prescription intervention (e.g., Oral Isotretinoin, Spironolactone, or intralesional therapy).'
    },
    {
      title: 'Rapidly Changing Pigmentation or Moles (ABCDE Rule)',
      desc: 'Any lesion exhibiting Asymmetry, Border irregularity, uneven Color variation, Diameter > 6mm, or Evolving growth/bleeding must be evaluated in-person with a dermatoscope by a qualified dermatologist to rule out melanoma or atypical dysplastic nevi.'
    },
    {
      title: 'Persistent Burning, Oozing, or Facial Swelling',
      desc: 'Signs of acute contact allergic dermatitis, severe rosacea flares, or bacterial/fungal skin infections (such as Impetigo or Folliculitis) requiring antibiotic or prescription anti-inflammatory medication.'
    },
    {
      title: 'Non-Healing Crusted Spots (Exceeding 4 Weeks)',
      desc: 'Lesions that scab, bleed, or refuse to resolve over several weeks require histological evaluation to rule out basal cell carcinoma (BCC) or actinic keratosis.'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-dermo-warm flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">
                  Clinical Safety Guidance
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-white mt-0.5">
                Dermatology Consultation & Referral Guide
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 text-xs sm:text-sm">
          {/* Important Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Cosmetic Technology Limitations Notice
            </div>
            <p className="text-xs leading-relaxed text-amber-900/90">
              ALSKINCARE AI is designed exclusively for cosmetic routine curation, ingredient safety, and self-care education. Artificial intelligence cannot perform palpation, dermoscopy, or biopsy. If your skin exhibits severe or deteriorating symptoms, please schedule an appointment with a licensed medical professional.
            </p>
          </div>

          {/* Red Flag Checklist */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-dermo-charcoal flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Signs Requiring In-Person Medical Evaluation
            </h4>
            <div className="space-y-2.5">
              {redFlags.map((flag, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="font-bold text-dermo-charcoal flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>{flag.title}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-3">
                    {flag.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prep Sheet for Doctor Visit */}
          <div className="p-4 rounded-2xl bg-dermo-sand/60 border border-dermo-warm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-dermo-charcoal flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-dermo-teal" />
                Preparation Checklist for Your Appointment
              </h4>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-600 list-disc list-inside leading-relaxed">
              <li><strong>Do not apply heavy makeup or tinted SPF</strong> on the morning of your visit so the doctor can observe natural erythema and texture.</li>
              <li><strong>Take photos of active flare-ups</strong> when symptoms peak, in case they calm down before your consultation day.</li>
              <li><strong>List all active ingredients</strong> currently used (e.g., Retinol, BHA, Benzoyl Peroxide) to avoid accidental drug-cosmetic contraindications.</li>
              <li><strong>Mention systemic medications</strong> (including hormonal contraceptives, antihistamines, or antibiotics).</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Compliant with cosmetic AI regulatory standards
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dermo-teal text-white text-xs font-semibold hover:bg-dermo-teal/90 transition-all shadow-xs"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
}
