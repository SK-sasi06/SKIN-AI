import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  History,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Database,
  Menu,
  X,
  Camera,
  Activity,
  Layers
} from 'lucide-react';
import { getCurrentUser, setAuthToken, setCurrentUser } from '../services/api';

export default function Navbar({ activePage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getCurrentUser();

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setMobileMenuOpen(false);
    onNavigate('landing');
  };

  const handleNav = (page) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dermo-cream/95 border-b border-dermo-warm/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-dermo-teal flex items-center justify-center text-dermo-cream shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Sparkles className="w-5 h-5 text-dermo-gold" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-dermo-charcoal block leading-none">
                ALSKINCARE
              </span>
              <span className="text-dermo-teal font-sans text-[10px] sm:text-xs tracking-widest uppercase font-bold px-1.5 py-0.5 rounded bg-dermo-sand">
                AI
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-dermo-accent tracking-widest uppercase font-medium mt-1 block truncate max-w-[190px] sm:max-w-none">
              Dermatology & Precision Care
            </span>
          </div>
        </button>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => handleNav('analyze')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activePage === 'analyze'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-dermo-charcoal/80 hover:text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            Analyze Skin
          </button>

          <button
            onClick={() => handleNav('journey')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              activePage === 'journey'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-dermo-charcoal/80 hover:text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-dermo-gold" />
            Skin Journey
          </button>

          <button
            onClick={() => handleNav('catalog')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activePage === 'catalog'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-dermo-charcoal/80 hover:text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            Product Catalog
          </button>

          <button
            onClick={() => handleNav('history')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activePage === 'history'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'text-dermo-charcoal/80 hover:text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            Past Reports
          </button>

          <div className="h-4 w-px bg-dermo-warm mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-dermo-charcoal font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dermo-sand border border-dermo-warm">
                <User className="w-3.5 h-3.5 text-dermo-teal" />
                {user.email.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('auth')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dermo-sand hover:bg-dermo-warm text-xs font-semibold text-dermo-teal border border-dermo-warm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center md:hidden gap-2">
          {user && (
            <span className="text-[11px] font-mono text-dermo-teal bg-dermo-sand px-2 py-1 rounded-lg border border-dermo-warm max-w-[90px] truncate">
              {user.email.split('@')[0]}
            </span>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-dermo-sand border border-dermo-warm text-dermo-charcoal hover:text-dermo-teal transition-all focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-dermo-teal" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* =========================================================================
          MOBILE COLLAPSIBLE MENU DRAWER (Zero Overflows, Pristine Touch Targets)
      ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dermo-warm bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          <button
            type="button"
            onClick={() => handleNav('analyze')}
            className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition-all ${
              activePage === 'analyze'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-dermo-sand/60 text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Analyze Skin (Scan & Vision AI)
            </span>
            <span className="text-[10px] font-mono opacity-80">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('journey')}
            className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition-all ${
              activePage === 'journey'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-dermo-sand/60 text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dermo-gold" />
              Skin Journey (Timeline & Tracker)
            </span>
            <span className="text-[10px] font-mono opacity-80">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('catalog')}
            className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition-all ${
              activePage === 'catalog'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-dermo-sand/60 text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Product Catalog (1,472 Formulations)
            </span>
            <span className="text-[10px] font-mono opacity-80">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('history')}
            className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition-all ${
              activePage === 'history'
                ? 'bg-dermo-teal text-white shadow-sm'
                : 'bg-dermo-sand/60 text-dermo-charcoal hover:bg-dermo-sand'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Past Reports & Before/After Comparison
            </span>
            <span className="text-[10px] font-mono opacity-80">&rarr;</span>
          </button>

          <div className="pt-2 border-t border-dermo-warm/70">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-dermo-sand/80 border border-dermo-warm">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 text-dermo-teal shrink-0" />
                  <span className="text-xs font-bold text-dermo-charcoal truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors shrink-0"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('auth')}
                className="w-full py-3 rounded-2xl bg-dermo-teal text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Register Account
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}