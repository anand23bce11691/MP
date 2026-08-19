import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Star, ShoppingCart, Search } from 'lucide-react';

export const ShopEasyView: React.FC = () => {
  const { products, addToCart, cart, setIsCartOpen, globalStatus } = useTelemetry();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', 'Audio', 'Peripherals', 'Displays', 'Wearables', 'Accessories', 'Smart Home'];

  return (
    <div className="space-y-6">
      
      {/* Storefront Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest">
              MONITORED TARGET WEB APPLICATION
            </span>
            {globalStatus === 'healthy' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-bold flex items-center gap-1 border border-emerald-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Baseline Normal
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-100 text-[10px] font-bold flex items-center gap-1 border border-rose-400/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Active Latency / Error Anomaly
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">ShopEasy E-Commerce Core</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Place real orders or browse products below to send live telemetry requests (`POST /api/orders`) directly into IncidentIQ's process monitor, database query logs, and AI RCA engine!
          </p>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-lg hover:bg-blue-50 transition-all relative"
        >
          <ShoppingCart className="w-4 h-4 text-blue-600" />
          <span>View Shopping Cart</span>
          {totalCartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search 15 products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-56"
          />
        </div>
      </div>

      {/* 15 Products Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image & Badge */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                  {product.category}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Add to Cart Action */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">Price</span>
                <strong className="text-lg font-extrabold text-slate-900 font-mono">₹{product.price.toLocaleString('en-IN')}</strong>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
