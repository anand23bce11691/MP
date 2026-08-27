import React, { useState } from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { ShoppingCart, Heart, Search, Star, ShoppingBag, ShieldCheck, Zap, Activity, ArrowUpDown } from 'lucide-react';
import { ShopEasyCartDrawer } from './ShopEasyCartDrawer';
import { ShopEasyWishlistDrawer } from './ShopEasyWishlistDrawer';
import { ShopEasyProductDetailModal } from './ShopEasyProductDetailModal';
import { ShopEasyOrderSuccessModal } from './ShopEasyOrderSuccessModal';
import { ShopEasyOrderHistoryModal } from './ShopEasyOrderHistoryModal';
import { ShopEasyAiAssistant } from './ShopEasyAiAssistant';

export const ShopEasyStorefront: React.FC = () => {
  const {
    products,
    addToCart,
    addToWishlist,
    cart,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsOrderHistoryOpen,
    setSelectedProductModal,
    toastMessage
  } = useShopEasy();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products
    .filter(p => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.id - b.id;
    });

  const categories = ['ALL', 'Audio', 'Peripherals', 'Displays', 'Wearables', 'Storage', 'Video', 'Accessories', 'Furniture', 'Smart Home'];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standalone Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">ShopEasy Storefront</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Telemetry Stream Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Standalone Monitored E-Commerce Client (Port 5001)</p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center gap-1.5 relative"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Storefront Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 space-y-8">
        
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              Target Monitored Application
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Premium Tech & Electronics Storefront
            </h2>
            <p className="text-xs text-blue-100 leading-relaxed">
              Every action taken here (browsing, adding to cart, checkout orders in ₹ Rupees) dispatches real-time HTTP and SQL query telemetry over API calls to **IncidentIQ SRE Hub (Port 5000)**!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 text-xs text-white">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Zap className="w-4 h-4" /> Live Telemetry Feed Status
            </div>
            <p className="text-[11px] text-blue-100">Target App URL: <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">http://localhost:5001</code></p>
            <p className="text-[11px] text-blue-100">Telemetry Gateway: <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">http://localhost:5000/api/telemetry/ingest</code></p>
          </div>
        </div>

        {/* Filter Controls, Search & Sorting */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 w-56"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="featured">Featured Items</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-52 rounded-xl overflow-hidden bg-slate-100 mb-4 cursor-pointer" onClick={() => setSelectedProductModal(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                    {product.category}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToWishlist(product); }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-500 transition-colors shadow-sm"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {product.rating}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedProductModal(product)}>
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                  <strong className="text-xl font-black text-slate-900 font-mono">₹{product.price.toLocaleString('en-IN')}</strong>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Drawers & Modals */}
      <ShopEasyCartDrawer />
      <ShopEasyWishlistDrawer />
      <ShopEasyProductDetailModal />
      <ShopEasyOrderSuccessModal />
      <ShopEasyOrderHistoryModal />
      <ShopEasyAiAssistant />

    </div>
  );
};
