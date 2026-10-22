import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import SkinJourneyPage from './pages/SkinJourneyPage';
import CatalogPage from './pages/CatalogPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import DatabaseAdminPage from './pages/DatabaseAdminPage';
import Chatbot from './components/Chatbot';

function getInitialPage() {
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (hash) {
    if (hash.startsWith('db')) return 'db';
    if (hash === 'analyze') return 'analyze';
    if (hash === 'journey') return 'journey';
    if (hash === 'catalog') return 'catalog';
    if (hash === 'history') return 'history';
    if (hash === 'auth') return 'auth';
  }
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/db') || path.includes('/db/')) return 'db';
  if (path.endsWith('/analyze')) return 'analyze';
  if (path.endsWith('/journey')) return 'journey';
  if (path.endsWith('/catalog')) return 'catalog';
  if (path.endsWith('/history')) return 'history';
  if (path.endsWith('/auth')) return 'auth';
  return 'landing';
}

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);

  // Sync URL and hash changes (e.g. typing /#/analyze, clicking links, or browser back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    const targetHash = page === 'landing' ? '#/' : `#/${page}`;
    window.location.hash = targetHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dermo-cream text-dermo-charcoal flex flex-col font-sans selection:bg-dermo-teal selection:text-white">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activePage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {activePage === 'analyze' && <AnalyzePage onNavigate={handleNavigate} />}
        {activePage === 'journey' && <SkinJourneyPage onNavigate={handleNavigate} />}
        {activePage === 'catalog' && <CatalogPage />}
        {activePage === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {activePage === 'auth' && <AuthPage onNavigate={handleNavigate} />}
        {activePage === 'db' && <DatabaseAdminPage onNavigate={handleNavigate} />}
      </main>

      {/* Floating AI Skincare Assistant Chatbot (hide on /db admin route) */}
      {activePage !== 'db' && <Chatbot currentPage={activePage} />}

      <footer className="border-t border-dermo-warm/80 bg-white/70 py-10 text-xs text-stone-500 mt-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-serif font-bold text-dermo-charcoal text-sm">
              ALSKINCARE AI <span className="font-sans text-[11px] font-normal text-stone-400">| Clinical Skincare Intelligence</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Vision Transformer Image Recognition & Authentic 1,472 Sephora Dataset Formulations
            </p>
          </div>
          <div className="text-center sm:text-right text-[11px] text-stone-400">
            PyTorch CPU &bull; Hugging Face Transformers &bull; Official Boutique Links
          </div>
        </div>
      </footer>
    </div>
  );
}