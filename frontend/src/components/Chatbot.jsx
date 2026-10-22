import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, X, Minus, Maximize2, Send, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { formatINR } from '../utils/currency';
import ProductImage from './ProductImage';

const SUGGESTED_PROMPTS = [
  'Understand my skin analysis',
  'Find products for dark spots',
  'Build my morning routine',
  'Build my evening routine',
  'Compare two products',
  'Explain my past reports',
];

const INITIAL_WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: `**Welcome to your ALSKINCARE Assistant**

I provide clinical skincare guidance and personalized routine planning tailored to your skin profile.

**How I can assist you**
- Analyze active ingredients and cosmetic formulations
- Build or refine your personalized morning and evening routines
- Explain visible concerns from your skin analysis
- Recommend authentic formulations from our curated catalog

How can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

// Safe, tailored Markdown component renderer for Dermavision / ALSKINCARE AI assistant
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="font-serif text-sm sm:text-base font-bold text-dermo-charcoal mt-2.5 mb-1.5 pb-1 border-b border-dermo-warm/70" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="font-serif text-xs sm:text-sm font-bold text-dermo-teal mt-2 mb-1" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dermo-teal mt-2 mb-1" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="font-sans text-xs font-bold text-dermo-charcoal mt-1.5 mb-0.5" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-xs sm:text-sm text-dermo-charcoal/90 leading-relaxed mb-2 last:mb-0" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-dermo-charcoal" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-stone-600" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="space-y-1 mb-2 pl-4 list-disc list-outside text-xs sm:text-sm text-dermo-charcoal/90" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="space-y-1 mb-2 pl-4 list-decimal list-outside text-xs sm:text-sm text-dermo-charcoal/90" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed pl-0.5" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-dermo-teal/70 pl-2.5 my-2 text-xs italic text-stone-600 bg-dermo-sand/40 py-1 rounded-r-lg" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-2 border border-dermo-warm/80 rounded-lg">
            <table className="w-full text-xs text-left border-collapse" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="bg-dermo-sand/80 px-2.5 py-1.5 font-semibold text-dermo-charcoal border-b border-dermo-warm" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-2.5 py-1.5 border-b border-dermo-warm/40 text-dermo-charcoal/90" {...props} />
        ),
        hr: ({ node, ...props }) => (
          <hr className="my-2.5 border-t border-dermo-warm/70" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-dermo-teal font-medium underline underline-offset-2 hover:text-dermo-tealDark transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code className="px-1 py-0.5 rounded bg-dermo-sand text-[11px] font-mono text-dermo-teal font-medium" {...props} />
          ) : (
            <pre className="p-2 rounded-lg bg-stone-900 text-stone-100 text-[11px] font-mono overflow-x-auto my-1.5" {...props} />
          ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function Chatbot({ currentPage = 'landing', latestAnalysis = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSend = async (messageText) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputValue('');

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(text, {
        currentPage,
        latestAnalysis,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        products: res.recommended_products || [],
        provider: res.provider,
        providerNote: res.provider_note,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setErrorMessage(err.message || 'Unable to connect to skincare assistant. Please try again.');
      setLastFailedMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const retryLastMessage = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage);
    }
  };

  return (
    <aside aria-label="AI Skincare Assistant" className="fixed bottom-6 right-4 sm:right-6 z-50 font-sans">
      {/* 1. Closed Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Open AI Skincare Assistant"
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-dermo-teal hover:bg-dermo-tealDark text-white shadow-xl shadow-dermo-teal/25 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-dermo-gold"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-dermo-gold animate-pulse" />
          </div>
          <span className="font-serif font-bold text-sm tracking-wide hidden sm:inline">
            AI Assistant
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full" />
        </button>
      )}

      {/* 2. Minimized Header Bar */}
      {isOpen && isMinimized && (
        <div className="flex items-center justify-between w-72 px-4 py-3 bg-dermo-teal text-white rounded-2xl shadow-xl border border-dermo-tealDark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-dermo-gold" />
            <span className="font-serif font-bold text-sm">AI Skincare Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
              aria-label="Maximize Assistant"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Full Expanded Chatbot Panel */}
      {isOpen && !isMinimized && (
        <div className="flex flex-col w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-dermo-warm overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-dermo-teal text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-dermo-gold" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base leading-tight text-white flex items-center gap-2">
                  AI Skincare Assistant
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                  <span className="text-[10px] text-dermo-sand/60">•</span>
                  <p className="text-[11px] text-dermo-sand/80 font-sans">Personal Skincare Guide</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
                aria-label="Minimize Assistant"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
                aria-label="Close Assistant"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-dermo-cream/40 via-white to-dermo-sand/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 sm:px-4.5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-dermo-teal text-white rounded-br-sm'
                      : 'bg-[#F9F7F3] border border-dermo-warm/80 text-dermo-charcoal rounded-bl-sm font-sans'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-body">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}

                  {/* Provider Note Badge if active */}
                  {msg.providerNote && (
                    <div className="mt-2.5 pt-2 border-t border-dermo-warm/60 text-[10px] text-stone-500 italic">
                      {msg.providerNote}
                    </div>
                  )}
                </div>

                {/* Compact Product Recommendations Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2 space-y-2.5 pl-1 pr-2">
                    <span className="text-[11px] font-bold text-dermo-accent uppercase tracking-wider block">
                      Matched Catalog Formulations
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-dermo-warm shadow-sm hover:shadow-md transition-shadow group"
                        >
                          {/* Product Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-dermo-sand flex-shrink-0 border border-dermo-warm/60">
                            <ProductImage
                              src={prod.image_url}
                              alt={prod.name}
                              category={prod.category}
                              brand={prod.brand}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-dermo-teal block truncate">
                              {prod.brand}
                            </span>
                            <h4 className="font-serif font-bold text-xs text-dermo-charcoal truncate" title={prod.name}>
                              {prod.name}
                            </h4>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span className="font-sans font-bold text-xs text-dermo-charcoal">
                                {formatINR(prod.price_inr)}
                              </span>
                              {prod.official_url ? (
                                <a
                                  href={prod.official_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dermo-teal hover:bg-dermo-tealDark text-white text-[10px] font-bold transition-colors shadow-sm"
                                >
                                  View Product
                                  <ExternalLink className="w-3 h-3 text-dermo-gold" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">Official link unavailable</span>
                              )}
                            </div>

                            {/* Retailer Quick Links */}
                            <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-dermo-warm/50 flex-wrap">
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                                Stores:
                              </span>
                              <a
                                href={`https://www.amazon.in/s?k=${encodeURIComponent((prod.brand + ' ' + prod.name).trim())}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-[9px] font-bold border border-amber-300 transition-colors"
                              >
                                Amazon
                              </a>
                              <a
                                href={`https://www.flipkart.com/search?q=${encodeURIComponent((prod.brand + ' ' + prod.name).trim())}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 text-[9px] font-bold border border-blue-300 transition-colors"
                              >
                                Flipkart
                              </a>
                              <a
                                href={`https://www.nykaa.com/search/result/?q=${encodeURIComponent((prod.brand + ' ' + prod.name).trim())}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 text-[9px] font-bold border border-pink-300 transition-colors"
                              >
                                Nykaa
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-stone-400 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {/* Suggested Prompt Chips (only shown if 1-2 messages in thread) */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Suggested topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-dermo-sand border border-dermo-warm/90 text-dermo-charcoal font-medium text-left transition-all hover:scale-[1.02] shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F9F7F3] border border-dermo-warm/80 w-24">
                <div className="w-2 h-2 rounded-full bg-dermo-teal animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-dermo-teal animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-dermo-teal animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
                {lastFailedMessage && (
                  <button
                    onClick={retryLastMessage}
                    className="inline-flex items-center gap-1 font-bold underline hover:text-rose-900"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 sm:p-4 border-t border-dermo-warm/80 bg-white">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                disabled={isLoading}
                className="w-full resize-none rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm bg-dermo-sand/50 border border-dermo-warm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dermo-teal/40 text-dermo-charcoal placeholder-stone-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 rounded-xl bg-dermo-teal hover:bg-dermo-tealDark disabled:opacity-40 disabled:hover:bg-dermo-teal text-white transition-all shadow-sm focus:outline-none"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-dermo-cream" />
              </button>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-[10px] text-center text-stone-500 mt-2 font-sans">
              This AI assistant provides general skincare guidance and is not a medical diagnosis.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
