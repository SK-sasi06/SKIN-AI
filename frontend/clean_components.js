const fs = require('fs');

const files = {
  'src/components/Navbar.jsx': import React from 'react';
import { Sparkles, History, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav className= sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200>
      <div className=max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between>
        <div 
          onClick={() => setActiveTab('home')}
          className=flex items-center space-x-3 cursor-pointer group
        >
          <div className=w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform>
            <Sparkles className=w-5 h-5 />
          </div>
          <div>
            <span className=font-bold text-lg tracking-tight text-stone-900 block leading-tight>
              ALSKINCARE <span className=text-emerald-700>AI</span>
            </span>
            <span className=text-[10px] tracking-widest uppercase font-semibold text-stone-500 block>
              Dermatological Vision
            </span>
          </div>
        </div>

        <div className=flex items-center space-x-2 sm:space-x-4>
          <button
            onClick={() => setActiveTab('home')}
            className={px-3 py-1.5 text-sm font-medium rounded-lg transition-colors  + (activeTab === 'home' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900')}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('analyze')}
            className={ px-3.5 py-1.5 text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm  + (activeTab === 'analyze' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100')}
          >
            <Sparkles className= w-4 h-4 />
            <span>AI Skin Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={px-3 py-1.5 text-sm font-medium rounded-lg transition-colors  + (activeTab === 'catalog' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900')}
          >
            Verified Catalog
          </button>

          {user ? (
            <div className= flex items-center space-x-2>
              <button
                onClick={() => setActiveTab('history')}
                className={px-3 py-1.5 text-sm font-medium rounded-lg flex items-center space-x-1 transition-colors  + (activeTab === 'history' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900')}
              >
                <History className= w-4 h-4 />
                <span>My History</span>
              </button>
              <div className=h-5 w-px bg-stone-300 mx-1 hidden sm:block></div>
              <span className=text-xs font-semibold px-2 py-1 bg-stone-100 rounded-full text-stone-700 hidden md:inline-block>
                {user.full_name}
              </span>
              <button
                onClick={onLogout}
                title=Sign out
                className=p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors
              >
                <LogOut className=w-4 h-4 />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className=px-4 py-1.5 text-sm font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
},

  'src/components/ProductCard.jsx': import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <div className=bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between>
      <div>
        <div className=flex items-start justify-between gap-2 mb-2>
          <span className=text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full>
            {product.category}
          </span>
          {product.rating > 0 && (
            <div className=flex items-center space-x-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full>
              <Star className=w-3.5 h-3.5 fill-amber-400 text-amber-400 />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h4 className=text-xs font-bold tracking-widest text-stone-400 uppercase mb-0.5>
          {product.brand}
        </h4>
        <h3 className=text-base font-bold text-stone-900 mb-2 leading-snug>
          {product.name}
        </h3>

        {product.match_reason && (
          <div className=mb-3 text-xs text-stone-600 bg-stone-50 border border-stone-100 p-2.5 rounded-xl>
            <span className=font-semibold text-emerald-800 block mb-0.5>Why it matches:</span>
            {product.match_reason}
          </div>
        )}

        {product.target_skin_types && product.target_skin_types.length > 0 && (
          <div className=flex flex-wrap gap-1 mb-3>
            {product.target_skin_types.map((type) => (
              <span key={type} className=text-[10px] font-medium px-2 py-0.5 bg-stone-100 text-stone-600 rounded>
                {type}
              </span>
            ))}
          </div>
        )}

        {product.usage_instructions && (
          <p className=text-[11px] text-stone-500 italic mb-3 line-clamp-2>
            {product.usage_instructions}
          </p>
        )}
      </div>

      <div className=pt-3 border-t border-stone-100 flex items-center justify-between>
        <div>
          <span className=text-xs text-stone-400>Price: </span>
          <span className=text-base font-extrabold text-stone-900>
            \
          </span>
        </div>
        <div className=flex items-center text-[10px] text-stone-400>
          <ShieldCheck className=w-3.5 h-3.5 text-emerald-600 mr-1 />
          <span>Verified INCI</span>
        </div>
      </div>
    </div>
  );
}
};

for (const [path, content] of Object.entries(files)) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('Cleaned file:', path);
}
