import React, { useState, useRef, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingCart,
  Eye,
  Bot,
  User,
  TrendingUp,
  SlidersHorizontal,
  Star
} from 'lucide-react';

export const ShopEasyAiAssistant: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    aiMessages,
    sendAiMessage,
    resetAiChat,
    products,
    addToCart,
    setSelectedProduct,
    setIsProductModalOpen
  } = useTelemetry();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiAssistantOpen]);

  if (!isAiAssistantOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const q = inputQuery;
    setInputQuery('');
    sendAiMessage(q);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendAiMessage(promptText);
  };

  const handleOpenProduct = (productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setIsProductModalOpen(true);
    }
  };

  const quickPrompts = [
    '🎧 Best ANC headphones for flights',
    '💻 Complete developer desk setup under ₹30,000',
    '⚡ Fast portable storage & hubs',
    '⚖️ Compare 34" Curved Monitor vs Mechanical Keyboard'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base tracking-tight">Aura AI Concierge</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-extrabold uppercase">
                  Catalog Grounded
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">ShopEasy Conversational Shopping Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={resetAiChat}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiAssistantOpen(false)}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50">
          
          {/* Quick Prompts Banner */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Suggested Shopping Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(qp.replace(/^[\p{Emoji}\s]+/gu, ''))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-[11px] font-medium text-slate-700 transition-all text-left"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {aiMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-3 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                </div>

                {/* Grounded Recommended Product Cards */}
                {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                  <div className="space-y-2 pt-1 w-full animate-in fade-in duration-200">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                      Grounded Catalog Recommendations
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.recommendedProductIds.map(pid => {
                        const product = products.find(p => p.id === pid);
                        if (!product) return null;

                        return (
                          <div
                            key={product.id}
                            className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-100"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                  {product.category}
                                </span>
                                <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                                {product.name}
                              </h4>
                              <p className="font-extrabold text-sm text-slate-900 font-mono mt-0.5">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button
                                onClick={() => addToCart(product)}
                                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                                title="Add to Cart"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenProduct(product.id)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="View Specs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask Aura anything (e.g. 'Find audio under ₹5000')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold transition-colors shadow-md shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <span>Powered by ShopEasy Catalog Grounded AI</span>
            <span>·</span>
            <span>Real-Time Inventory Synced</span>
          </p>
        </form>

      </div>
    </div>
  );
};
