import React from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export const ShopEasyWishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, addToCart } = useShopEasy();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
                <Heart className="w-4.5 h-4.5 fill-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base leading-none">Wishlist & Saved Items</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{wishlist.length} saved products</p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">Your Wishlist is Empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click the heart icon on any product in the catalog to save items to your wishlist for later!
                </p>
              </div>
            ) : (
              wishlist.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{item.product.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">₹{item.product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { addToCart(item.product); removeFromWishlist(item.product.id); }}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                      title="Move to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
