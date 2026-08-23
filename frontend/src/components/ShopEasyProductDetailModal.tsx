import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  CheckCircle2,
  Package
} from 'lucide-react';

export const ShopEasyProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    isProductModalOpen,
    setIsProductModalOpen,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsCartOpen
  } = useTelemetry();

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'specs' | 'shipping'>('overview');

  if (!isProductModalOpen || !selectedProduct) return null;

  const handleClose = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    setIsProductModalOpen(false);
    setIsCartOpen(true);
  };

  const isFavorite = isWishlisted(selectedProduct.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Product Image & Badges */}
        <div className="md:w-1/2 bg-slate-100 p-6 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              {selectedProduct.category}
            </span>
            <button
              onClick={() => toggleWishlist(selectedProduct)}
              className={`p-2 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 shadow-sm'
                  : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
              }`}
              title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          <div className="my-auto py-4 flex items-center justify-center">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-h-72 w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Quick Perks Strip */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/80 text-center">
            <div className="p-2 rounded-xl bg-white/60 text-[11px] font-medium text-slate-600">
              <Truck className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <span>Free Delivery</span>
            </div>
            <div className="p-2 rounded-xl bg-white/60 text-[11px] font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <span>1-Yr Warranty</span>
            </div>
            <div className="p-2 rounded-xl bg-white/60 text-[11px] font-medium text-slate-600">
              <RotateCcw className="w-4 h-4 mx-auto text-amber-600 mb-1" />
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Right: Details, Specs, Actions */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          
          <div>
            {/* Header & Close */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedProduct.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    ({selectedProduct.reviewsCount || 85} verified reviews)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedProduct.name}
                </h2>
              </div>
              
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Stock Indicator */}
            <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider block">Special Offer Price</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{Math.round(selectedProduct.price * 1.25).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    20% OFF
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({selectedProduct.stock} units)
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Dispatches in 24h</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-5 flex border-b border-slate-200 gap-4 text-xs font-bold">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`pb-2 transition-colors relative ${
                  selectedTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('specs')}
                className={`pb-2 transition-colors relative ${
                  selectedTab === 'specs'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tech Specs
              </button>
              <button
                onClick={() => setSelectedTab('shipping')}
                className={`pb-2 transition-colors relative ${
                  selectedTab === 'shipping'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Telemetry & Assurance
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4 text-xs">
              {selectedTab === 'overview' && (
                <div className="space-y-3">
                  <p className="text-slate-600 leading-relaxed font-normal">
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.features && (
                    <div className="space-y-1.5 pt-2">
                      <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] block">
                        Key Highlights
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedProduct.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'specs' && (
                <div className="space-y-2">
                  {selectedProduct.specs ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {Object.entries(selectedProduct.specs).map(([key, val]) => (
                        <div key={key} className="flex justify-between p-2.5 bg-slate-50/50 hover:bg-slate-50">
                          <span className="font-semibold text-slate-500">{key}</span>
                          <span className="font-mono text-slate-900 font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Standard manufacturer specifications apply.</p>
                  )}
                </div>
              )}

              {selectedTab === 'shipping' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Real-Time Monitored Fulfillment</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    This item is managed by the ShopEasy Core Inventory API and monitored by IncidentIQ Telemetry SDK. Orders generate live telemetry events (`POST /api/orders`) directly into the pipeline.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions & Quantity Selector */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono font-bold text-xs text-slate-900 bg-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs transition-colors border border-slate-300"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Buy Now (₹{(selectedProduct.price * quantity).toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
