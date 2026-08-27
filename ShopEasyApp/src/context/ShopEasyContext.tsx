import React, { createContext, useContext, useState } from 'react';
import type { ProductItem, CartItem, WishlistItem, PlacedOrderItem } from '../types';

const INCIDENTIQ_INGEST_URL = 'http://localhost:5000/api/telemetry/ingest';
const INCIDENTIQ_ORDERS_URL = 'http://localhost:5000/api/orders';

const initialProducts: ProductItem[] = [
  {
    id: 1,
    name: 'Pro Wireless ANC Headphones',
    category: 'Audio',
    price: 14999,
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    description: 'Active noise cancelling wireless headphones with crystal-clear spatial audio & 40-hour battery life.',
    stock: 35,
    specs: { 'Battery': '40 Hours ANC On', 'Bluetooth': 'v5.3 Multipoint', 'Drivers': '40mm Custom Titanium' },
    features: ['Active Hybrid Noise Cancellation', 'Customizable Equalizer via App', 'Foldable Compact Travel Design'],
    inStock: true
  },
  {
    id: 2,
    name: 'Ergonomic Mechanical Keyboard',
    category: 'Peripherals',
    price: 8499,
    rating: 4.9,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    description: 'Hot-swappable RGB mechanical coding and gaming keyboard with smooth tactile switches.',
    stock: 20,
    specs: { 'Switches': 'Gateron Pro Yellow', 'Connectivity': 'Tri-Mode Wireless', 'Keycaps': 'PBT Double-Shot' },
    features: ['Hot-Swappable Switch Sockets', 'Sound Absorbing Silicone Foam', 'South-Facing Per-Key RGB Lighting'],
    inStock: true
  },
  {
    id: 3,
    name: 'UltraWide 34" Curved Monitor',
    category: 'Displays',
    price: 42999,
    rating: 4.7,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    description: '144Hz WQHD IPS display designed for maximum multi-tasking productivity and crisp visual clarity.',
    stock: 12,
    specs: { 'Panel': '34" IPS 1500R Curvature', 'Resolution': '3440 x 1440 WQHD', 'Refresh Rate': '144Hz FreeSync' },
    features: ['Integrated 90W USB-C Docking', 'Hardware KVM Switch for Dual-PC', 'TUV Eye Comfort Certified'],
    inStock: true
  },
  {
    id: 4,
    name: 'Precision Wireless Gaming Mouse',
    category: 'Peripherals',
    price: 4499,
    rating: 4.6,
    reviewsCount: 152,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
    description: 'Ultra-lightweight 26K DPI optical sensor with ergonomic thumb rest and wireless charging dock.',
    stock: 48,
    specs: { 'Weight': '58g Ultra-Light', 'Sensor': '26,000 DPI Optical', 'Battery': '90 Hours Playtime' },
    features: ['Zero-Lag HyperSpeed Wireless', '100% PTFE Smooth Glide Feet', 'Magnetic Wireless Dock Included'],
    inStock: true
  },
  {
    id: 5,
    name: 'Smart Fitness & Health Watch',
    category: 'Wearables',
    price: 6999,
    rating: 4.5,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    description: 'Continuous heart rate tracking, GPS route mapping, sleep analytics, and 7-day battery.',
    stock: 25,
    specs: { 'Display': '1.43" AMOLED 1000 nits', 'Sensors': 'PPG Heart Rate, SpO2', 'Waterproof': '5 ATM / 50m' },
    features: ['Independent Satellite GPS', '24/7 Heart Rate & SpO2 Monitoring', '120+ Dedicated Sport Modes'],
    inStock: true
  },
  {
    id: 6,
    name: 'High-Speed 2TB NVMe Portable SSD',
    category: 'Storage',
    price: 12499,
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80',
    description: 'Shock-resistant USB 3.2 Gen2x2 portable drive with lightning-fast 2000MB/s data transfers.',
    stock: 50,
    specs: { 'Capacity': '2 TB (2000 GB)', 'Read Speed': 'Up to 2000 MB/s', 'Interface': 'USB 3.2 Gen 2x2' },
    features: ['Heavy-Duty Anodized Aluminum', 'IP65 Water & Dust Resistant', 'AES 256-Bit Hardware Encryption'],
    inStock: true
  }
];

interface ShopEasyContextType {
  products: ProductItem[];
  cart: CartItem[];
  addToCart: (product: ProductItem, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  wishlist: WishlistItem[];
  addToWishlist: (product: ProductItem) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  
  orders: PlacedOrderItem[];
  selectedProductModal: ProductItem | null;
  setSelectedProductModal: (product: ProductItem | null) => void;
  completedOrder: PlacedOrderItem | null;
  setCompletedOrder: (order: PlacedOrderItem | null) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;

  placeOrder: (customerName: string, customerEmail: string) => Promise<boolean>;
  isProcessingOrder: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ShopEasyContext = createContext<ShopEasyContextType | undefined>(undefined);

export const ShopEasyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<ProductItem[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [orders, setOrders] = useState<PlacedOrderItem[]>([]);
  const [selectedProductModal, setSelectedProductModalState] = useState<ProductItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<PlacedOrderItem | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sendTelemetryToIncidentIQ = async (method: string, path: string, status: number, durationMs: number, sqlMs: number) => {
    try {
      await fetch(INCIDENTIQ_INGEST_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appName: 'ShopEasy App (Port 5001)',
          apiKey: 'app_shopeasy_standalone_key',
          requestMethod: method,
          requestPath: path,
          statusCode: status,
          responseTimeMs: durationMs,
          sqlTimeMs: sqlMs,
          traceId: Math.random().toString(36).substring(2, 8)
        })
      });
    } catch {
      // Silent telemetry dispatch
    }
  };

  const setSelectedProductModal = (product: ProductItem | null) => {
    setSelectedProductModalState(product);
    if (product) {
      sendTelemetryToIncidentIQ('GET', `/api/shopeasy/products/${product.id}?name=${encodeURIComponent(product.name)}`, 200, 18, 4);
    }
  };

  const addToCart = (product: ProductItem, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, quantity: qty }];
    });
    showToast(`Added '${product.name}' to cart.`);
    sendTelemetryToIncidentIQ('POST', `/api/shopeasy/cart/add?item=${encodeURIComponent(product.name)}`, 200, 24, 5);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Removed item from shopping cart.');
    sendTelemetryToIncidentIQ('DELETE', `/api/shopeasy/cart/items/${productId}`, 200, 16, 3);
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
    sendTelemetryToIncidentIQ('PUT', `/api/shopeasy/cart/items/${productId}?qty=${quantity}`, 200, 18, 4);
  };

  const clearCart = () => setCart([]);

  const addToWishlist = (product: ProductItem) => {
    setWishlist(prev => {
      if (prev.some(item => item.product.id === product.id)) return prev;
      return [...prev, { product, addedAt: new Date().toLocaleDateString() }];
    });
    showToast(`Saved '${product.name}' to Wishlist.`);
    sendTelemetryToIncidentIQ('POST', `/api/shopeasy/wishlist?item=${encodeURIComponent(product.name)}`, 200, 19, 4);
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(item => item.product.id !== productId));
    sendTelemetryToIncidentIQ('DELETE', `/api/shopeasy/wishlist/${productId}`, 200, 14, 3);
  };

  const placeOrder = async (customerName: string, customerEmail: string): Promise<boolean> => {
    if (cart.length === 0) return false;
    setIsProcessingOrder(true);
    const startTime = performance.now();
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const traceId = Math.random().toString(36).substring(2, 8);
    const orderId = Math.floor(100000 + Math.random() * 900000);

    const placedOrderRecord: PlacedOrderItem = {
      orderId,
      date: new Date().toLocaleString(),
      customerName,
      customerEmail,
      shippingAddress: '221B Baker Street, Bengaluru, KA 560100',
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      subtotal,
      discount: 0,
      tax: Math.round(subtotal * 0.18),
      shipping: 0,
      totalAmount: subtotal,
      paymentMethod: 'card',
      status: 'Confirmed',
      telemetryTraceId: traceId
    };

    try {
      await fetch(INCIDENTIQ_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.product.price })),
          customerName,
          customerEmail
        })
      });
    } catch {
      // Local fallback telemetry simulation
    }

    const durationMs = Math.round(performance.now() - startTime);
    await sendTelemetryToIncidentIQ('POST', `/api/shopeasy/orders?id=${orderId}&amount=INR${subtotal}`, 200, durationMs > 0 ? durationMs : 42, 8);

    setIsProcessingOrder(false);
    clearCart();
    setIsCartOpen(false);
    setCompletedOrder(placedOrderRecord);
    setOrders(prev => [placedOrderRecord, ...prev]);
    showToast(`Order #${orderId} Placed! Telemetry registered in IncidentIQ.`);
    return true;
  };

  return (
    <ShopEasyContext.Provider value={{
      products,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isWishlistOpen,
      setIsWishlistOpen,
      orders,
      selectedProductModal,
      setSelectedProductModal,
      completedOrder,
      setCompletedOrder,
      isOrderHistoryOpen,
      setIsOrderHistoryOpen,
      placeOrder,
      isProcessingOrder,
      toastMessage,
      showToast
    }}>
      {children}
    </ShopEasyContext.Provider>
  );
};

export const useShopEasy = () => {
  const context = useContext(ShopEasyContext);
  if (!context) throw new Error('useShopEasy must be used within a ShopEasyProvider');
  return context;
};
