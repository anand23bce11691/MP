import React from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { X, Star, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

export const ShopEasyProductDetailModal: React.FC = () => {
  const { selectedProductModal, setSelectedProductModal, addToCart, addToWishlist } = useShopEasy();

  if (!selectedProductModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in zoom-in-95 duration-150 relative">
        
        <button
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img src={selectedProductModal.image} alt={selectedProductModal.name} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
              {selectedProductModal.category}
            </span>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedProductModal.rating} ({selectedProductModal.reviewsCount} customer reviews)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedProductModal.name}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedProductModal.description}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Truck className="w-4 h-4 text-blue-600" /> Free Express Delivery across India
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <RefreshCw className="w-4 h-4 text-emerald-600" /> 14-Day Replacement Guarantee
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Zap className="w-4 h-4 text-amber-500" /> In Stock ({selectedProductModal.stockQuantity} units available)
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                <strong className="text-2xl font-black text-slate-900 font-mono">₹{selectedProductModal.price.toLocaleString('en-IN')}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { addToWishlist(selectedProductModal); }}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-500 font-bold text-xs transition-all"
                  title="Add to Wishlist"
                >
                  <Heart className="w-4.5 h-4.5 fill-rose-500" />
                </button>
                <button
                  onClick={() => { addToCart(selectedProductModal); setSelectedProductModal(null); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
