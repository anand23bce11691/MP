import React, { useState, useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Star,
  ShoppingCart,
  Search,
  Heart,
  Eye,
  Sparkles,
  Package,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';

export const ShopEasyView: React.FC = () => {
  const {
    products,
    addToCart,
    cart,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    toggleWishlist,
    isWishlisted,
    setSelectedProduct,
    setIsProductModalOpen,
    setIsAiAssistantOpen,
    orderHistory,
    setIsOrderHistoryOpen,
    globalStatus
  } = useTelemetry();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    'ALL',
    'Audio',
    'Peripherals',
    'Displays',
    'Wearables',
    'Storage',
    'Video',
    'Accessories',
    'Furniture',
    'Smart Home'
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStock = !onlyInStock || (p.stock > 0);
        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.id - b.id;
      });
  }, [products, selectedCategory, searchTerm, sortBy, onlyInStock]);

  const handleQuickView = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Storefront Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              TARGET E-COMMERCE MICROSERVICE
            </span>
            {globalStatus === 'healthy' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-bold flex items-center gap-1.5 border border-emerald-400/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Baseline Normal
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-100 text-[10px] font-bold flex items-center gap-1.5 border border-rose-400/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Active Anomaly Detected
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">ShopEasy E-Commerce Core</h1>
          <p className="text-xs text-blue-100 leading-relaxed font-medium">
            Browse verified premium hardware, compare specs with our grounded Aura AI Concierge, and place real orders (`POST /api/orders`) to generate live telemetry for IncidentIQ SRE anomaly detection.
          </p>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          
          {/* Aura AI Shopping Assistant Trigger */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Aura AI Concierge</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all relative border border-white/20"
            title="Open Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold font-mono">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Order History Button */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all relative border border-white/20"
            title="Order History"
          >
            <Package className="w-4 h-4 text-white" />
            <span>Orders</span>
            {orderHistory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold font-mono">
                {orderHistory.length}
              </span>
            )}
          </button>

          {/* View Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white text-blue-700 font-black text-xs shadow-xl hover:bg-blue-50 transition-all relative active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter & Search & Sorting Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={`Search ${products.length} products, specs, categories...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Sort & In-stock Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-black shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">No products found matching filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters to view all catalog items.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchTerm('');
              setOnlyInStock(false);
              setSortBy('featured');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isFav = isWishlisted(product.id);

            return (
              <div
                key={product.id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Image, Badges & Wishlist Trigger */}
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 flex items-center justify-center p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      onClick={() => handleQuickView(product)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer rounded-xl"
                    />

                    {/* Category badge */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {product.category}
                    </span>

                    {/* Rating badge */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                    </span>

                    {/* Wishlist toggle */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>

                    {/* Quick View Overlay on hover */}
                    <button
                      onClick={() => handleQuickView(product)}
                      className="absolute inset-x-4 bottom-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-[11px] font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View Specs</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => handleQuickView(product)}
                    className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                    {product.description}
                  </p>

                  {/* Stock Indicator */}
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>In Stock ({product.stock} units)</span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Price</span>
                    <strong className="text-lg font-black text-slate-900 font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
