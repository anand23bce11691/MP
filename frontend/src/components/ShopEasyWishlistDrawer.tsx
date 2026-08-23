import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export const ShopEasyWishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    addToCart,
    setSelectedProduct,
    setIsProductModalOpen
  } = useTelemetry();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const handleInspect = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-rose-600" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Your Wishlist</h2>
                <p className="text-xs text-slate-500 font-medium">{wishlist.length} saved favorites</p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-300 mx-auto flex items-center justify-center border border-rose-100">
                  <Heart className="w-7 h-7" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Your wishlist is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click the heart icon on any product card or in the product view to save items for later!
                </p>
              </div>
            ) : (
              wishlist.map(item => (
                <div
                  key={item.product.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      onClick={() => handleInspect(item.product)}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {item.product.category}
                      </span>
                      <h4
                        onClick={() => handleInspect(item.product)}
                        className="font-bold text-slate-900 text-xs leading-snug truncate hover:text-blue-600 cursor-pointer mt-0.5"
                      >
                        {item.product.name}
                      </h4>
                      <p className="font-extrabold text-sm text-slate-900 font-mono mt-0.5">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">Saved on {item.addedAt}</span>
                    <button
                      onClick={() => handleMoveToCart(item.product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                wishlist.forEach(item => addToCart(item.product));
                wishlist.forEach(item => removeFromWishlist(item.product.id));
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-lg shadow-blue-600/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Move All ({wishlist.length} items) to Cart</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
