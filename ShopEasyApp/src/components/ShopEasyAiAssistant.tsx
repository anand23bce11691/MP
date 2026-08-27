import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, X, Bot, ShieldCheck } from 'lucide-react';
import { useShopEasy } from '../context/ShopEasyContext';

interface AiChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
}

export const ShopEasyAiAssistant: React.FC = () => {
  const { products, addToCart } = useShopEasy();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: '1',
      sender: 'aura',
      text: 'Namaste! I am Aura, your ShopEasy AI Shopping Concierge. Ask me about product recommendations, specs, discounts, or order tracking!'
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: AiChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const query = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let reply = "I'd recommend checking out our top-rated Pro Wireless ANC Headphones (₹14,999) or UltraWide 34\" Curved Monitor (₹42,999)!";
      
      if (query.includes('headphone') || query.includes('audio') || query.includes('sound')) {
        reply = "For audio, our Pro Wireless ANC Headphones (₹14,999) feature 40-hour battery life & active noise cancellation. Would you like me to help you add it to your cart?";
      } else if (query.includes('keyboard') || query.includes('mouse') || query.includes('typing')) {
        reply = "Our Ergonomic Mechanical Keyboard (₹8,499) and Precision Wireless Gaming Mouse (₹4,499) are customer favorites with 4.9★ ratings!";
      } else if (query.includes('coupon') || query.includes('discount') || query.includes('offer')) {
        reply = "Use coupon code WELCOME10 at checkout for an instant 10% discount, or FESTIVE20 for 20% off eligible tech gear!";
      } else if (query.includes('monitor') || query.includes('display') || query.includes('screen')) {
        reply = "The UltraWide 34\" Curved Monitor (₹42,999) delivers a 144Hz WQHD IPS display for multi-tasking mastery!";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'aura', text: reply }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>ShopEasy AI Assistant</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[460px] animate-in zoom-in-95 duration-150">
          
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-none">Aura AI Concierge</h3>
                <p className="text-[10px] text-blue-100 font-medium mt-0.5">ShopEasy Intelligent Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-white/80 hover:text-white">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-br-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 font-medium rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask Aura anything about products..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
