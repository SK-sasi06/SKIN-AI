import React from 'react';
import { User, ShieldCheck, Calendar, Clock, FileText, CheckCircle2, Award, Printer } from 'lucide-react';
import { getCurrentUser } from '../services/api';

export default function ReportUserHeader({ report }) {
  const loggedInUser = getCurrentUser();
  const user = report?.user || loggedInUser || {
    id: 1,
    full_name: 'Demo User',
    email: 'demo@alskincare.ai'
  };

  const reportCode = report?.report_code || (report?.report_id ? `RPT-2026-${String(report.report_id).padStart(4, '0')}` : 'RPT-2026-0016');
  const timestamp = report?.created_at || 'October 22, 2026';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-dermo-sand/80 via-white to-dermo-cream border border-dermo-warm/90 shadow-2xs space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dermo-warm/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-dermo-teal text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-dermo-charcoal leading-none">
                {user.full_name || 'Anonymous User'}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Personalized Skin Profile
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-1">
              {user.email} &bull; User ID: #{user.id || 1}
            </p>
          </div>
        </div>

        {/* Action Controls & Report Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dermo-accent block">Report Record</span>
            <span className="font-mono text-xs font-bold text-dermo-charcoal">{reportCode}</span>
          </div>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-dermo-warm hover:border-dermo-teal text-xs font-semibold text-dermo-charcoal flex items-center gap-1.5 shadow-2xs transition-all"
            title="Print or export diagnostic report"
          >
            <Printer className="w-3.5 h-3.5 text-dermo-teal" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white/70 border border-dermo-warm/60 space-y-0.5">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Diagnostic Code</span>
          <span className="font-mono font-bold text-dermo-teal">{reportCode}</span>
        </div>

        <div className="p-3 rounded-xl bg-white/70 border border-dermo-warm/60 space-y-0.5">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Scan Date & Time</span>
          <span className="font-medium text-dermo-charcoal truncate block">{timestamp}</span>
        </div>

        <div className="p-3 rounded-xl bg-white/70 border border-dermo-warm/60 space-y-0.5">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">AI Diagnostic Model</span>
          <span className="font-medium text-dermo-charcoal flex items-center gap-1">
            <Award className="w-3 h-3 text-dermo-gold" />
            ViT-Base Dermo
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/70 border border-dermo-warm/60 space-y-0.5">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Clinical Lighting</span>
          <span className="font-medium text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Natural Diffuse
          </span>
        </div>
      </div>
    </div>
  );
}
