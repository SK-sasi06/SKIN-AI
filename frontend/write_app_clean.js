const fs = require('fs');
const appCode = import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import CatalogPage from './pages/CatalogPage';
import { getStoredUser, removeStoredToken, removeStoredUser } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) setUser(existing);
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    removeStoredUser();
    setUser(null);
    setActiveTab('home');
  };

  return (
    <div className=" min-h-screen bg-stone-50 flex flex-col font-sans\>
 <Navbar
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 user={user}
 onLogout={handleLogout}
 />

 <main className=\flex-1 pb-16\>
 {activeTab === 'home' && (
 <LandingPage
 onStartScan={() => setActiveTab('analyze')}
 onBrowseCatalog={() => setActiveTab('catalog')}
 />
 )}

 {activeTab === 'analyze' && (
 <AnalyzePage onSaveSuccess={() => {}} />
 )}

 {activeTab === 'catalog' && (
 <CatalogPage />
 )}

 {activeTab === 'auth' && (
 <AuthPage
 onAuthSuccess={(u) => {
 setUser(u);
 setActiveTab('analyze');
 }}
 />
 )}

 {activeTab === 'history' && (
 <HistoryPage />
 )}
 </main>

 <footer className=\bg-white border-t border-stone-200 py-8 text-center text-xs text-stone-500\>
 <div className=\max-w-7xl mx-auto px-4 space-y-2\>
 <p className=\font-bold text-stone-700\>
 ALSKINCARE AI 2026 - Verified Computer Vision & Dermatological Recommendation Subsystem
 </p>
 <p>
 Powered by Hugging Face Vision Transformer (<code className=\text-emerald-800 font-mono\>varun1505/face-characteristics</code>) and DataCamp Sephora Benchmark Dataset (<code className=\text-emerald-800 font-mono\>cosmetics.csv</code>).
 </p>
 <p className=\text-[11px] text-stone-400\>
 Disclaimer: For cosmetic skincare routine planning only. Not intended to diagnose, treat, or replace medical advice.
 </p>
 </div>
 </footer>
 </div>
 );
}
;
fs.writeFileSync('src/App.jsx', appCode, 'utf8');
console.log('App.jsx cleanly written!');
