import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { ProductItem } from '../types';

interface ShopEasyComparisonModalProps {
  products: ProductItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
}

export const ShopEasyComparisonModal: React.FC<ShopEasyComparisonModalProps> = ({
  products,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Side-by-Side Product Spec Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparing {products.length} selected equipment models</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 font-bold text-xs text-slate-500 uppercase border-b border-slate-200 w-1/4">Specification</th>
                {products.map(p => (
                  <th key={p.id} className="p-4 border-b border-slate-200 text-center min-w-[200px]">
                    <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-xl mx-auto mb-2 border border-slate-200 shadow-sm" />
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h4>
                    <p className="text-indigo-600 font-extrabold text-sm font-mono mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                    <button 
                      onClick={() => onAddToCart(p)}
                      className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      Add to Cart <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Category</td>
                {products.map(p => <td key={p.id} className="p-4 text-center font-medium text-slate-600">{p.category}</td>)}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Customer Rating</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center font-mono font-bold text-amber-500">
                    ★ {p.rating} / 5.0 ({p.reviewsCount || 42} reviews)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Stock Availability</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center font-semibold text-emerald-600">
                    <Check className="w-4 h-4 inline-block mr-1 text-emerald-500" /> In Stock ({p.stock} units)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Warranty & Support</td>
                {products.map(p => <td key={p.id} className="p-4 text-center text-slate-600">2-Year Brand Replacement Guarantee</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
