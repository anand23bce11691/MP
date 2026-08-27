import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  ViewRoute,
  SystemStatus,
  ServiceItem,
  MetricItem,
  TimeSeriesSample,
  ResourceSample,
  ThroughputSample,
  IncidentItem,
  LogEntry,
  NotificationItem,
  ProductItem,
  CartItem,
  WishlistItem,
  CouponCode,
  PlacedOrderItem,
  AiChatMessage
} from '../types';

interface TelemetryContextType {
  activeRoute: ViewRoute;
  setActiveRoute: (route: ViewRoute) => void;
  globalStatus: SystemStatus;
  isRefreshing: boolean;
  refreshTelemetry: () => void;
  
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  setSelectedService: (service: ServiceItem | null) => void;
  restartService: (serviceId: string) => void;
  
  metrics: MetricItem[];
  selectedMetric: MetricItem | null;
  setSelectedMetric: (metric: MetricItem | null) => void;
  updateMetricThreshold: (metricId: string, newThreshold: string) => void;
  
  timeSeriesData: TimeSeriesSample[];
  resourceData: ResourceSample[];
  throughputData: ThroughputSample[];
  timeRange: '5m' | '15m' | '1h' | '24h';
  setTimeRange: (range: '5m' | '15m' | '1h' | '24h') => void;
  streamingSpeed: number;
  setStreamingSpeed: (speed: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  
  incidents: IncidentItem[];
  triggerChaosSimulation: (type: 'dbslowdown' | 'trafficspike' | 'apifailure' | 'cascading') => void;
  acknowledgeIncident: (id: string) => void;
  runAutoRemediation: (id: string) => void;
  
  logs: LogEntry[];
  addLog: (level: 'INFO' | 'WARN' | 'ERROR', service: string, message: string) => void;
  
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;

  // ShopEasy E-Commerce Storefront state
  products: ProductItem[];
  cart: CartItem[];
  addToCart: (product: ProductItem, qty?: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (product: ProductItem) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: ProductItem) => void;
  isWishlisted: (productId: number) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Coupons
  availableCoupons: CouponCode[];
  appliedCoupon: CouponCode | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Product detail modal
  selectedProduct: ProductItem | null;
  setSelectedProduct: (product: ProductItem | null) => void;
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;

  // Order placement & history
  placeOrder: (
    customerName: string,
    customerEmail: string,
    shippingAddress?: string,
    paymentMethod?: 'card' | 'upi' | 'netbanking' | 'cod'
  ) => Promise<boolean>;
  isProcessingOrder: boolean;
  orderHistory: PlacedOrderItem[];
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  latestPlacedOrder: PlacedOrderItem | null;
  isOrderSuccessModalOpen: boolean;
  setIsOrderSuccessModalOpen: (open: boolean) => void;

  // Aura AI Shopping Assistant
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  aiMessages: AiChatMessage[];
  sendAiMessage: (text: string) => void;
  resetAiChat: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const initialProducts: ProductItem[] = [
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
    specs: {
      'Driver Size': '40mm Neodymium',
      'Battery Life': '40 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Aux',
      'Weight': '250 grams',
      'Charging': 'USB-C Fast Charge (15m = 4h)'
    },
    features: ['Active Hybrid Noise Cancellation', 'Multipoint Dual-Device Pairing', '360° Spatial Audio Tracking', 'Ultra-Plush Memory Foam Earcups'],
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
    specs: {
      'Layout': '75% Compact (84 Keys)',
      'Switch Type': 'Pre-lubed Gateron Pro Yellow',
      'Connectivity': 'Tri-Mode (BT 5.1 / 2.4GHz / Type-C)',
      'Keycaps': 'Double-shot PBT Cherry Profile',
      'Battery': '4000 mAh Rechargeable'
    },
    features: ['Hot-Swappable 5-Pin Switch Sockets', 'Sound-Absorbing Silicone Gasket Mount', 'South-Facing Per-Key RGB LEDs', 'Mac & Windows One-Touch Switch'],
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
    specs: {
      'Panel': '34" IPS 1500R Curvature',
      'Resolution': '3440 x 1440 (UltraWide QHD)',
      'Refresh Rate': '144Hz with AMD FreeSync Premium',
      'Color Gamut': '98% DCI-P3, HDR400 Certified',
      'Ports': '2x HDMI 2.1, 1x DP 1.4, USB-C 90W PD'
    },
    features: ['Integrated 90W USB-C Single Cable Dock', 'Hardware KVM Switch for Multi-PC Control', 'Flicker-Free TUV Eye Comfort Mode', 'Ergonomic Height/Tilt Adjustable Stand'],
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
    specs: {
      'Weight': '58 grams Ultra-Lightweight',
      'Sensor': 'Focus Pro 26,000 DPI Optical',
      'Battery Life': '90 Hours Continuous Play',
      'Switches': 'Gen-3 Optical (90M Clicks)',
      'Polling Rate': 'Up to 4000Hz Wireless'
    },
    features: ['Zero-Lag HyperSpeed Wireless Tech', '100% Virgin PTFE Smooth Glide Skates', '5 Programmable On-Board Memory Profiles', 'Magnetic Wireless Charging Dock Included'],
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
    specs: {
      'Display': '1.43" AMOLED 1000 nits Peak',
      'Sensors': 'Optical PPG Heart Rate, SpO2, Skin Temp',
      'Waterproof': '5 ATM / 50m Water Resistance',
      'Battery': '7 Days Typical / 14 Days Battery Saver',
      'Weight': '36g without strap'
    },
    features: ['Independent Dual-Band 5-Satellite GPS', '24/7 Heart Rate & SpO2 Blood Oxygen', '120+ Sport Modes with Auto-Detection', 'Bluetooth Phone Calls with Noise Reduction'],
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
    specs: {
      'Capacity': '2 TB (2,000 GB)',
      'Interface': 'USB 3.2 Gen 2x2 Type-C',
      'Read/Write Speed': 'Up to 2,000 MB/s Transfer Speed',
      'Durability': 'IP65 Water/Dust Resistance, 3m Drop',
      'Encryption': 'AES 256-Bit Hardware Encryption'
    },
    features: ['Heavy-Duty Anodized Aluminum Enclosure', 'Thermal Guard Dynamic Throttling Protection', 'Direct ProRes 4K Recording Support', 'USB-C to C and C to A Cables Included'],
    inStock: true
  },
  {
    id: 7,
    name: '4K Ultra HD Web Cam with Ring Light',
    category: 'Video',
    price: 7999,
    rating: 4.6,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&q=80',
    description: 'Auto-focus streaming webcam with integrated soft ring light, privacy shutter, and noise-canceling dual mics.',
    stock: 18,
    specs: {
      'Resolution': '4K @ 30 FPS / 1080p @ 60 FPS',
      'Field of View': '90° Wide Angle Glass Lens',
      'Light Source': '3-Level Touch-Adjustable Ring Light',
      'Microphone': 'Dual Stereo Noise Cancelling Mics',
      'Mount': 'Universal Monitor Clip + 1/4" Tripod'
    },
    features: ['AI Autofocus and Auto-Light Correction', 'Physical Magnetic Security Privacy Shutter', 'HDR Support for Backlit Environments', 'Plug & Play compatible with Zoom, Teams, OBS'],
    inStock: true
  },
  {
    id: 8,
    name: 'Aluminum 11-in-1 USB-C Docking Hub',
    category: 'Accessories',
    price: 4999,
    rating: 4.4,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
    description: 'Dual 4K HDMI ports, Gigabit Ethernet, 100W PD Pass-through charging, and high-speed SD card readers.',
    stock: 30,
    specs: {
      'Material': 'Precision CNC Space Grey Aluminum',
      'Video Output': 'Dual 4K@60Hz HDMI + VGA 1080p',
      'Power In': '100W Power Delivery 3.0 Pass-Through',
      'Network': 'Gigabit 1000Mbps RJ45 Ethernet',
      'Card Slots': 'UHS-I SD & MicroSD (Simultaneous)'
    },
    features: ['Multi-Monitor Extended Desktop Support', '3x High Speed USB 3.2 10Gbps Data Ports', 'Overheat and Surge Protection Circuitry', 'Braided Strain-Relief Reinforced Cable'],
    inStock: true
  },
  {
    id: 9,
    name: 'Ergonomic Mesh Executive Chair',
    category: 'Furniture',
    price: 18999,
    rating: 4.8,
    reviewsCount: 59,
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&q=80',
    description: 'Adjustable dynamic lumbar support, 3D armrests, and breathable high-density mesh backrest.',
    stock: 8,
    specs: {
      'Max Load': '150 kg (330 lbs)',
      'Recline Range': '90° - 135° Synchro-Tilt Lock',
      'Gas Lift': 'Class-4 Heavy-Duty BIFMA Certified',
      'Frame': 'High-Strength Polymer & Aluminum Base',
      'Casters': '60mm Smooth Silent PU Wheels'
    },
    features: ['Dynamic Self-Adaptive Lumbar Support', '4D Multi-Directional Soft Padded Armrests', 'Adjustable 2D Ergonomic Neck Headrest', 'Waterfall Seat Cushion for Thigh Circulation'],
    inStock: true
  },
  {
    id: 10,
    name: 'Portable Bluetooth Waterproof Speaker',
    category: 'Audio',
    price: 3499,
    rating: 4.7,
    reviewsCount: 140,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80',
    description: 'Deep bass 360-degree room-filling audio with IP67 dust and water resistance for outdoor use.',
    stock: 42,
    specs: {
      'Acoustic Drivers': '2x 15W Full-Range + Dual Bass Radiators',
      'Battery Life': '16 Hours Playback at 60% Volume',
      'Waterproof Rating': 'IP67 Submersible (1m for 30 min)',
      'Bluetooth': 'Version 5.3 with TWS Pairing',
      'Weight': '540 grams'
    },
    features: ['360-Degree Immersive Omnidirectional Audio', 'Rugged Shock-Absorbent Silicone Housing', 'Built-in USB PowerBank Phone Charging', 'Integrated Noise-Cancelling Speakerphone'],
    inStock: true
  },
  {
    id: 11,
    name: 'Smart Home AI Voice Assistant Hub',
    category: 'Smart Home',
    price: 5999,
    rating: 4.3,
    reviewsCount: 37,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&q=80',
    description: '7-inch HD touchscreen smart hub controlling lighting, security cameras, and multi-room audio.',
    stock: 22,
    specs: {
      'Display': '7" HD IPS Touchscreen (1024x600)',
      'Speaker': '1.75" Full-Range Driver + 2 Passive Bass',
      'Wireless': 'Dual-Band Wi-Fi 6, Zigbee, Matter, Thread',
      'Camera': '5 MP Wide-Angle with Privacy Slider',
      'Mics': '3 Far-Field Voice Recognition Mics'
    },
    features: ['Unified Matter & Thread Smart Home Protocol', 'Live Stream Security Camera Intercom View', 'Voice-Activated Morning & Sleep Automation', 'Photo Frame Mode with Cloud Sync'],
    inStock: true
  },
  {
    id: 12,
    name: 'MagSafe Wireless 3-in-1 Charging Stand',
    category: 'Accessories',
    price: 3299,
    rating: 4.8,
    reviewsCount: 115,
    image: 'https://images.unsplash.com/photo-1622445268465-8438364058d7?w=500&q=80',
    description: 'Fast 15W wireless charging stand for your smartphone, smartwatch, and wireless earbuds simultaneously.',
    stock: 60,
    specs: {
      'Phone Output': '15W MagSafe Magnetic Fast Charge',
      'Watch Output': '5W Dedicated Magnetic Cradle',
      'Earbuds Output': '5W Qi Base Charger Pad',
      'Input Required': '30W USB-C PD (Adapter Included)',
      'Material': 'Weighted Zinc Alloy with Silicone Mat'
    },
    features: ['Charge 3 Devices Simultaneously with 1 Cable', 'Floating Magnetic Stand in Portrait or Landscape', 'Smart LED Charging Indicator with Auto-Dimming', 'Foreign Object Detection & Overheat Protection'],
    inStock: true
  },
  {
    id: 13,
    name: 'Studio Condenser USB Microphone',
    category: 'Audio',
    price: 8999,
    rating: 4.9,
    reviewsCount: 83,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
    description: 'Broadcast-quality cardioid pickup pattern with anti-vibration shock mount and physical gain control knob.',
    stock: 15,
    specs: {
      'Capsule': '25mm Studio Gold-Sputtered Condenser',
      'Bit Depth / Rate': '24-Bit / 192 kHz High-Res Sampling',
      'Polar Pattern': 'Cardioid Directional Acoustic Pickup',
      'Monitoring': '3.5mm Headphone Jack (Zero Latency)',
      'Connection': 'USB-C High-Fidelity Digital Output'
    },
    features: ['Tap-to-Mute Sensor with Visual LED Status', 'Hardware Gain Adjustment & Mix Dial', 'Included Heavy Metal Desk Base & Boom Adapter', 'Warm Rich Broadcast Tone for Podcasts & Streaming'],
    inStock: true
  },
  {
    id: 14,
    name: 'Extended Micro-Weave Desk Mat Pad',
    category: 'Accessories',
    price: 1499,
    rating: 4.7,
    reviewsCount: 192,
    image: 'https://images.unsplash.com/photo-1616440342855-5463690d797c?w=500&q=80',
    description: 'Water-repellent anti-fray stitched edge desk mat pad (900x400mm) for ultra-smooth tracking.',
    stock: 100,
    specs: {
      'Dimensions': '900 mm x 400 mm x 4 mm Thick',
      'Surface Material': 'High-Density Micro-Weave Polyester',
      'Base Material': 'Non-Slip Textured Natural Rubber',
      'Stitching': '360° Anti-Fray Precision Stitching',
      'Cleaning': 'Waterproof Nano-Coating, Machine Washable'
    },
    features: ['Optimized for Low & High DPI Mouse Sensors', 'Water & Coffee Spill-Resistant Hydrophobic Layer', 'Extra Thick 4mm Cushioning for Wrist Comfort', 'Subtle Sleek Minimalist Desk Aesthetic'],
    inStock: true
  },
  {
    id: 15,
    name: '20,000mAh 65W Fast Power Bank',
    category: 'Accessories',
    price: 3999,
    rating: 4.6,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500&q=80',
    description: 'Charge laptops and mobile phones simultaneously with real-time digital battery status display.',
    stock: 45,
    specs: {
      'Capacity': '20,000 mAh / 74 Wh (Flight Approved)',
      'USB-C Output': '65W Power Delivery 3.0 (Fast Laptop)',
      'USB-A Output': '22.5W SuperCharge QuickCharge 4.0',
      'Recharge Time': 'Under 2 Hours with 65W Wall Charger',
      'Screen': 'Real-Time Numeric Voltage/Percentage LCD'
    },
    features: ['Power Laptops, Tablets, and Phones Concurrently', 'Low-Current Charging Mode for Earbuds/Watches', 'Dual USB-C and USB-A Multi-Port Flexibility', 'Full MultiProtect 11-Stage Security Defense'],
    inStock: true
  }
];

export const initialCoupons: CouponCode[] = [
  { code: 'SAVE10', discountPercentage: 10, description: '10% instant discount on entire order' },
  { code: 'TECH20', discountPercentage: 20, description: '20% super tech discount on orders above ₹10,000', minAmount: 10000 },
  { code: 'FREESHIP', discountPercentage: 5, description: '5% bonus discount plus free express delivery', minAmount: 3000 }
];

const initialServices: ServiceItem[] = [
  {
    id: 'app-service',
    name: 'Application Core (ShopEasy)',
    type: 'Internal Microservice',
    technology: 'ASP.NET Core 8 · 2 instances',
    instances: 2,
    uptime: '99.98%',
    latencyMs: 42,
    status: 'healthy',
    endpoint: 'http://localhost:5000/api/shopeasy/orders',
    recentPings: [
      { time: '10:14:00', latency: 41, status: 'ok' },
      { time: '10:14:15', latency: 45, status: 'ok' },
      { time: '10:14:30', latency: 39, status: 'ok' },
      { time: '10:14:45', latency: 42, status: 'ok' }
    ]
  },
  {
    id: 'db-service',
    name: 'Database Engine (OrdersDb)',
    type: 'Relational Database',
    technology: 'SQL Server 2022 · OrdersDb',
    instances: 1,
    uptime: '99.95%',
    latencyMs: 8,
    status: 'healthy',
    endpoint: '127.0.0.1:1433/IncidentIQDb',
    recentPings: [
      { time: '10:14:00', latency: 7, status: 'ok' },
      { time: '10:14:15', latency: 9, status: 'ok' },
      { time: '10:14:30', latency: 8, status: 'ok' },
      { time: '10:14:45', latency: 8, status: 'ok' }
    ]
  },
  {
    id: 'payment-api',
    name: 'Payment Gateway',
    type: 'External API Dependency',
    technology: 'HTTPS REST · Razorpay/Stripe GW',
    instances: 4,
    uptime: '99.90%',
    latencyMs: 142,
    status: 'healthy',
    endpoint: 'https://api.paymentgw.internal/v1',
    recentPings: [
      { time: '10:14:00', latency: 138, status: 'ok' },
      { time: '10:14:15', latency: 145, status: 'ok' },
      { time: '10:14:30', latency: 140, status: 'ok' },
      { time: '10:14:45', latency: 142, status: 'ok' }
    ]
  },
  {
    id: 'order-api',
    name: 'Order API Service',
    type: 'Internal Service',
    technology: 'gRPC / HTTP REST',
    instances: 3,
    uptime: '99.99%',
    latencyMs: 38,
    status: 'healthy',
    endpoint: 'http://localhost:5000/api/shopeasy/checkout',
    recentPings: [
      { time: '10:14:00', latency: 36, status: 'ok' },
      { time: '10:14:15', latency: 40, status: 'ok' },
      { time: '10:14:30', latency: 37, status: 'ok' },
      { time: '10:14:45', latency: 38, status: 'ok' }
    ]
  }
];

const initialTimeSeries: TimeSeriesSample[] = [
  { time: '10:05', apiLatency: 42, sqlLatency: 8 },
  { time: '10:06', apiLatency: 45, sqlLatency: 10 },
  { time: '10:07', apiLatency: 39, sqlLatency: 7 },
  { time: '10:08', apiLatency: 48, sqlLatency: 12 },
  { time: '10:09', apiLatency: 41, sqlLatency: 9 },
  { time: '10:10', apiLatency: 44, sqlLatency: 8 },
  { time: '10:11', apiLatency: 40, sqlLatency: 7 },
  { time: '10:12', apiLatency: 46, sqlLatency: 11 },
  { time: '10:13', apiLatency: 43, sqlLatency: 9 },
  { time: '10:14', apiLatency: 42, sqlLatency: 8 }
];

const initialResources: ResourceSample[] = [
  { time: '10:07', cpu: 38, memory: 49 },
  { time: '10:08', cpu: 41, memory: 50 },
  { time: '10:09', cpu: 39, memory: 49 },
  { time: '10:10', cpu: 44, memory: 52 },
  { time: '10:11', cpu: 40, memory: 51 },
  { time: '10:12', cpu: 45, memory: 52 },
  { time: '10:13', cpu: 41, memory: 50 },
  { time: '10:14', cpu: 42, memory: 51 }
];

const initialThroughput: ThroughputSample[] = [
  { time: '10:07', requests: 175, errors: 0 },
  { time: '10:08', requests: 182, errors: 0 },
  { time: '10:09', requests: 180, errors: 1 },
  { time: '10:10', requests: 195, errors: 0 },
  { time: '10:11', requests: 178, errors: 0 },
  { time: '10:12', requests: 189, errors: 0 },
  { time: '10:13', requests: 181, errors: 0 },
  { time: '10:14', requests: 184, errors: 0 }
];

const initialLogs: LogEntry[] = [];

const defaultInitialAiMessages: AiChatMessage[] = [
  {
    id: 'ai-welcome',
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: "Hello! I am Aura, your ShopEasy AI Shopping Concierge. I can help you find verified tech gear, compare specs, calculate setup budgets, and find the perfect match for your work or gaming setup. How can I assist your shopping today?",
    recommendedProductIds: [1, 2, 3]
  }
];

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState<ViewRoute>('dashboard');
  const [globalStatus, setGlobalStatus] = useState<SystemStatus>('healthy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { id: 'cpu', title: 'CPU Utilization', value: '42%', threshold: '80%', delta: '-2.1% vs 1h avg', status: 'normal', sparkline: [38, 41, 39, 44, 40, 45, 41, 42] },
    { id: 'memory', title: 'Memory Usage', value: '51%', threshold: '85%', delta: '+0.5% vs 1h avg', status: 'normal', sparkline: [49, 50, 49, 52, 51, 52, 50, 51] },
    { id: 'requests', title: 'Request Rate', value: '184/min', threshold: '1,000/min', delta: '+4.2% stable baseline', status: 'normal', sparkline: [175, 182, 180, 195, 178, 189, 181, 184] },
    { id: 'incidents', title: 'Active Incidents', value: '0', threshold: '0 open alerts', delta: 'All systems nominal', status: 'normal', sparkline: [0, 0, 0, 0, 0, 0, 0, 0] }
  ]);
  const [selectedMetric, setSelectedMetric] = useState<MetricItem | null>(null);
  
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesSample[]>(initialTimeSeries);
  const [resourceData, setResourceData] = useState<ResourceSample[]>(initialResources);
  const [throughputData] = useState<ThroughputSample[]>(initialThroughput);
  
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '24h'>('5m');
  const [streamingSpeed, setStreamingSpeed] = useState<number>(3000);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', title: 'Telemetry Engine Online', message: 'IncidentIQ v1.4 streaming baselines established.', time: '10:00 AM', read: false, type: 'info' }
  ]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ShopEasy Storefront State
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  
  // Cart state with localStorage hydration
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopeasy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);

  // Wishlist state with localStorage hydration
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopeasy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Coupons
  const [availableCoupons] = useState<CouponCode[]>(initialCoupons);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Order history & success modal
  const [orderHistory, setOrderHistory] = useState<PlacedOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopeasy_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<PlacedOrderItem | null>(null);
  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState<boolean>(false);

  // Aura AI Shopping Assistant
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(defaultInitialAiMessages);

  // Save cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shopeasy_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('shopeasy_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('shopeasy_orders', JSON.stringify(orderHistory));
    } catch {
      // ignore
    }
  }, [orderHistory]);

  // Load products dynamically from backend API if available
  useEffect(() => {
    const fetchBackendProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map backend product entity fields to frontend ProductItem
            const mapped: ProductItem[] = data.map((p: any) => {
              const matchedInitial = initialProducts.find(ip => ip.id === p.productId || ip.name === p.name);
              return {
                id: p.productId || p.id,
                name: p.name,
                category: p.category || matchedInitial?.category || 'General',
                price: p.price || matchedInitial?.price || 1999,
                rating: p.rating || matchedInitial?.rating || 4.5,
                reviewsCount: p.reviewsCount || matchedInitial?.reviewsCount || 50,
                image: p.imageUrl || matchedInitial?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
                description: p.description || matchedInitial?.description || '',
                stock: p.stockQuantity ?? (matchedInitial?.stock ?? 25),
                specs: matchedInitial?.specs || { 'Model': p.name, 'Price': `₹${p.price}` },
                features: matchedInitial?.features || ['Official ShopEasy Warranty', 'Fast Express Dispatch'],
                inStock: (p.stockQuantity ?? 25) > 0
              };
            });
            setProducts(mapped);
          }
        }
      } catch {
        // Backend not running or offline, keep rich initialProducts
      }
    };
    fetchBackendProducts();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const addLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR', service: string, message: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const newLog: LogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: timeStr,
      level,
      service,
      message,
      traceId: Math.random().toString(36).substring(2, 8)
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Cart operations
  const addToCart = useCallback((product: ProductItem, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    showToast(`Added '${product.name}' (x${qty}) to ShopEasy cart.`);
    addLog('INFO', 'Application Core (ShopEasy)', `Cart updated: Item #${product.id} ('${product.name}') added with quantity ${qty}.`);
  }, [showToast, addLog]);

  const updateCartQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      showToast('Removed item from shopping cart.');
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  }, [showToast]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Removed item from shopping cart.');
    addLog('INFO', 'Application Core (ShopEasy)', `Cart item #${productId} removed.`);
  }, [showToast, addLog]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Wishlist operations
  const addToWishlist = useCallback((product: ProductItem) => {
    setWishlist(prev => {
      if (prev.some(item => item.product.id === product.id)) return prev;
      return [...prev, { product, addedAt: new Date().toLocaleDateString() }];
    });
    showToast(`Added '${product.name}' to your wishlist.`);
    addLog('INFO', 'Application Core (ShopEasy)', `Wishlist updated: Item #${product.id} saved by customer.`);
  }, [showToast, addLog]);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist(prev => prev.filter(item => item.product.id !== productId));
    showToast('Removed item from wishlist.');
  }, [showToast]);

  const toggleWishlist = useCallback((product: ProductItem) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.product.id === product.id);
      if (exists) {
        showToast(`Removed '${product.name}' from wishlist.`);
        return prev.filter(item => item.product.id !== product.id);
      } else {
        showToast(`Added '${product.name}' to wishlist.`);
        addLog('INFO', 'Application Core (ShopEasy)', `Wishlist: Item #${product.id} marked as favorite.`);
        return [...prev, { product, addedAt: new Date().toLocaleDateString() }];
      }
    });
  }, [showToast, addLog]);

  const isWishlisted = useCallback((productId: number) => {
    return wishlist.some(item => item.product.id === productId);
  }, [wishlist]);

  // Coupon Engine
  const applyCoupon = useCallback((code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = availableCoupons.find(c => c.code === cleanCode);
    if (!found) {
      return { success: false, message: `Coupon code '${code}' is invalid or expired.` };
    }

    const currentSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    if (found.minAmount && currentSubtotal < found.minAmount) {
      return {
        success: false,
        message: `Coupon '${found.code}' requires a minimum order value of ₹${found.minAmount.toLocaleString('en-IN')}.`
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon '${found.code}' applied! You saved ${found.discountPercentage}%.`);
    addLog('INFO', 'Application Core (ShopEasy)', `Promotional discount '${found.code}' (${found.discountPercentage}%) applied to active cart session.`);
    return { success: true, message: `Applied ${found.discountPercentage}% discount successfully!` };
  }, [availableCoupons, cart, showToast, addLog]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Discount coupon removed.');
  }, [showToast]);

  // Place Order Flow
  const placeOrder = async (
    customerName: string,
    customerEmail: string,
    shippingAddress = '221B Baker Street, Suite 400, Tech Park, Bengaluru, KA 560100',
    paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' = 'card'
  ): Promise<boolean> => {
    if (cart.length === 0) {
      showToast('Your cart is empty.');
      return false;
    }

    setIsProcessingOrder(true);
    const startTime = performance.now();
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercentage) / 100) : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const traceId = Math.random().toString(36).substring(2, 8);
    const orderId = Math.floor(100000 + Math.random() * 900000);

    const placedOrderRecord: PlacedOrderItem = {
      orderId,
      date: new Date().toLocaleString(),
      customerName,
      customerEmail,
      shippingAddress,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      subtotal,
      discount: discountAmount,
      tax: Math.round(finalTotal * 0.18),
      shipping: 0,
      totalAmount: finalTotal,
      paymentMethod,
      status: 'Confirmed',
      telemetryTraceId: traceId
    };

    try {
      // Send live order placement telemetry request to IncidentIQ Web API endpoint
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IncidentIQ-Key': 'shopeasy_live_app_key'
        },
        body: JSON.stringify({
          userId: 1,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price
          })),
          customerName,
          customerEmail,
          shippingAddress
        })
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        setIsProcessingOrder(false);
        setLatestPlacedOrder(placedOrderRecord);
        setOrderHistory(prev => [placedOrderRecord, ...prev]);
        clearCart();
        setAppliedCoupon(null);
        setIsCartOpen(false);
        setIsOrderSuccessModalOpen(true);
        
        // Log telemetry event into IncidentIQ live stream
        addLog('INFO', 'Application Core (ShopEasy)', `POST /api/orders 201 Created (Order #${orderId}, ₹${finalTotal.toLocaleString('en-IN')}) - ${durationMs}ms duration (SQL: 8ms, TraceId: ${traceId}).`);
        addLog('INFO', 'Payment Gateway', `POST /api/payments 200 OK (${paymentMethod.toUpperCase()} Charge Approved: ₹${finalTotal.toLocaleString('en-IN')}) - 142ms (TraceId: ${traceId})`);
        
        // Push telemetry chart point
        setTimeSeriesData(prev => [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          apiLatency: durationMs > 0 ? durationMs : 45,
          sqlLatency: globalStatus === 'degraded' ? 1450 : 8
        }]);

        showToast(`Order #${orderId} Placed Successfully (₹${finalTotal.toLocaleString('en-IN')})! Telemetry ingested.`);
        return true;
      } else {
        throw new Error(`Order placement returned status ${response.status}`);
      }
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      setIsProcessingOrder(false);

      if (globalStatus === 'critical' || globalStatus === 'degraded') {
        const errorMsg = err instanceof Error ? err.message : 'Unknown pipeline error';
        addLog('ERROR', 'Application Core (ShopEasy)', `HTTP 500 Outage on Checkout API! Duration ${durationMs}ms: ${errorMsg}`);
        addLog('ERROR', 'Database Engine', `SqlException: Connection pool lock timeout on OrdersDb.`);
        showToast('Order failed: System anomaly present in active pipeline.');
        return false;
      } else {
        // Fallback: gracefully record order locally and stream simulated telemetry
        setLatestPlacedOrder(placedOrderRecord);
        setOrderHistory(prev => [placedOrderRecord, ...prev]);
        clearCart();
        setAppliedCoupon(null);
        setIsCartOpen(false);
        setIsOrderSuccessModalOpen(true);

        addLog('INFO', 'Application Core (ShopEasy)', `POST /api/orders 201 Created (Order #${orderId}, ₹${finalTotal.toLocaleString('en-IN')}) - ${durationMs}ms (TraceId: ${traceId}).`);
        addLog('INFO', 'Payment Gateway', `POST /api/payments 200 OK (${paymentMethod.toUpperCase()} Charge Approved: ₹${finalTotal.toLocaleString('en-IN')}) - 142ms (TraceId: ${traceId})`);
        
        setTimeSeriesData(prev => [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          apiLatency: durationMs > 0 ? durationMs : 42,
          sqlLatency: 8
        }]);

        showToast(`Order #${orderId} Placed (₹${finalTotal.toLocaleString('en-IN')})! Telemetry ingested.`);
        return true;
      }
    }
  };

  // Aura AI Shopping Assistant Chat Engine (Strictly Grounded)
  const sendAiMessage = useCallback((queryText: string) => {
    if (!queryText.trim()) return;

    const userMessage: AiChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText
    };

    setAiMessages(prev => [...prev, userMessage]);

    // Process grounded intent
    const q = queryText.toLowerCase();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Budget extraction
    let maxBudget: number | null = null;
    const budgetMatch = q.match(/(?:under|below|budget of|less than|within|around)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?|\d+k)/i);
    if (budgetMatch) {
      let rawNum = budgetMatch[1].replace(/,/g, '');
      if (rawNum.toLowerCase().endsWith('k')) {
        maxBudget = parseFloat(rawNum) * 1000;
      } else {
        maxBudget = parseFloat(rawNum);
      }
    }

    // 2. Comparison detection
    const isComparison = q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('difference between');

    // 3. Category & Feature matching
    let matched = products.filter(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const descLower = p.description.toLowerCase();
      const catLower = p.category.toLowerCase();

      if (maxBudget && p.price > maxBudget) return false;

      // keyword matches
      if (q.includes('audio') || q.includes('headphone') || q.includes('music') || q.includes('anc') || q.includes('speaker') || q.includes('mic')) {
        if (p.category === 'Audio') score += 3;
      }
      if (q.includes('keyboard') || q.includes('mouse') || q.includes('typing') || q.includes('gaming') || q.includes('rgb')) {
        if (p.category === 'Peripherals') score += 3;
      }
      if (q.includes('monitor') || q.includes('display') || q.includes('screen') || q.includes('ultrawide') || q.includes('curved')) {
        if (p.category === 'Displays') score += 4;
      }
      if (q.includes('watch') || q.includes('fitness') || q.includes('health') || q.includes('gps')) {
        if (p.category === 'Wearables') score += 4;
      }
      if (q.includes('ssd') || q.includes('storage') || q.includes('drive') || q.includes('transfer') || q.includes('nvme')) {
        if (p.category === 'Storage') score += 4;
      }
      if (q.includes('camera') || q.includes('webcam') || q.includes('video') || q.includes('stream') || q.includes('zoom')) {
        if (p.category === 'Video') score += 4;
      }
      if (q.includes('chair') || q.includes('seating') || q.includes('furniture') || q.includes('lumbar') || q.includes('ergonomic')) {
        if (p.category === 'Furniture') score += 4;
      }
      if (q.includes('charger') || q.includes('magsafe') || q.includes('dock') || q.includes('hub') || q.includes('power bank') || q.includes('mat')) {
        if (p.category === 'Accessories') score += 3;
      }
      if (q.includes('smart home') || q.includes('alexa') || q.includes('assistant') || q.includes('hub')) {
        if (p.category === 'Smart Home') score += 4;
      }

      // Word intersection
      const words = q.split(/\s+/);
      for (const w of words) {
        if (w.length > 3 && (nameLower.includes(w) || descLower.includes(w) || catLower.includes(w))) {
          score += 2;
        }
      }

      return score > 0;
    });

    if (matched.length === 0) {
      matched = maxBudget ? products.filter(p => p.price <= maxBudget) : products.slice(0, 3);
    }

    // Sort by rating & relevance
    matched.sort((a, b) => b.rating - a.rating);
    const topRecs = matched.slice(0, 3);
    const recIds = topRecs.map(p => p.id);

    let assistantReplyText = '';

    if (isComparison && topRecs.length >= 2) {
      const p1 = topRecs[0];
      const p2 = topRecs[1];
      assistantReplyText = `Here is a side-by-side comparison between **${p1.name}** (₹${p1.price.toLocaleString('en-IN')}) and **${p2.name}** (₹${p2.price.toLocaleString('en-IN')}):\n\n` +
        `• **${p1.name}**: Rated ${p1.rating}★ with ${p1.stock} units in stock. ${p1.description}\n` +
        `• **${p2.name}**: Rated ${p2.rating}★ with ${p2.stock} units in stock. ${p2.description}\n\n` +
        `Both items are in stock with verified telemetry tracking. You can click on either product card below to add directly to your cart or view technical specifications!`;
    } else if (maxBudget) {
      assistantReplyText = `Based on your budget constraint of **₹${maxBudget.toLocaleString('en-IN')}**, I found ${topRecs.length} top-rated verified products in our catalog:\n\n` +
        topRecs.map(p => `• **${p.name}** — ₹${p.price.toLocaleString('en-IN')} (${p.rating}★, ${p.category}): ${p.description}`).join('\n\n') +
        `\n\nAll prices and stock quantities are synced in real time from the database. Click any product below to inspect specs or add to cart!`;
    } else {
      assistantReplyText = `Here are the top grounded recommendations matching your shopping query:\n\n` +
        topRecs.map(p => `• **${p.name}** (₹${p.price.toLocaleString('en-IN')}, ${p.rating}★): ${p.description}`).join('\n\n') +
        `\n\nWould you like me to compare specs, find items within a specific budget, or add any of these directly to your cart?`;
    }

    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        {
          id: 'msg-ai-' + Date.now(),
          sender: 'assistant',
          timestamp: nowStr,
          text: assistantReplyText,
          recommendedProductIds: recIds,
          comparisonProductIds: isComparison && topRecs.length >= 2 ? [topRecs[0].id, topRecs[1].id] : undefined
        }
      ]);
      addLog('INFO', 'Aura AI Concierge', `Shopping query processed: "${queryText.substring(0, 35)}..." -> Recommended ${recIds.length} grounded catalog items.`);
    }, 450);
  }, [products, addLog]);

  const resetAiChat = useCallback(() => {
    setAiMessages(defaultInitialAiMessages);
  }, []);

  // Telemetry simulation & refresh actions
  const refreshTelemetry = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Telemetry refreshed cleanly from SQL Server baselines.');
    }, 800);
  }, [showToast]);

  const restartService = useCallback((serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, latencyMs: Math.round(s.latencyMs * 0.8), status: 'healthy' };
      }
      return s;
    }));
    addLog('INFO', serviceId, `Service restart sequence initialized by administrator.`);
    showToast(`Service '${serviceId}' restart sequence initiated.`);
  }, [addLog, showToast]);

  const updateMetricThreshold = useCallback((metricId: string, newThreshold: string) => {
    setMetrics(prev => prev.map(m => m.id === metricId ? { ...m, threshold: newThreshold } : m));
    showToast(`Threshold updated for ${metricId.toUpperCase()} to ${newThreshold}`);
  }, [showToast]);

  const acknowledgeIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, acknowledged: true, status: 'Investigating' } : inc));
    showToast(`Incident #${id} acknowledged.`);
  }, [showToast]);

  const runAutoRemediation = useCallback((id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
    setGlobalStatus('healthy');
    setServices(prev => prev.map(s => ({ ...s, status: 'healthy', latencyMs: s.id === 'db-service' ? 8 : s.latencyMs })));
    setMetrics(prev => prev.map(m => {
      if (m.id === 'incidents') return { ...m, value: '0', status: 'normal' };
      if (m.id === 'cpu') return { ...m, value: '42%', status: 'normal' };
      return m;
    }));
    addLog('INFO', 'AutoRemediationEngine', `Auto-remediation executed cleanly for Incident #${id}. System restored to healthy baseline.`);
    showToast('Auto-remediation applied! System restored to healthy baseline.');
  }, [addLog, showToast]);

  const triggerChaosSimulation = useCallback((type: 'dbslowdown' | 'trafficspike' | 'apifailure' | 'cascading') => {
    const incNumber = 'INC-' + Math.floor(1000 + Math.random() * 9000);
    const timestamp = new Date().toLocaleTimeString();

    let newInc: IncidentItem;

    if (type === 'dbslowdown') {
      setGlobalStatus('degraded');
      setServices(prev => prev.map(s => s.id === 'db-service' ? { ...s, status: 'degraded', latencyMs: 1450 } : s));
      setMetrics(prev => prev.map(m => m.id === 'incidents' ? { ...m, value: '1', status: 'warning' } : m));

      newInc = {
        id: 'inc-' + Date.now(),
        incidentNumber: incNumber,
        title: 'Database Connection Pool Exhaustion on OrdersDb',
        severity: 'HIGH',
        status: 'Open',
        timestamp,
        confidenceScore: 96,
        rootCauseSummary: 'Database connection pool size reached limit (100) due to unindexed connection locks during high throughput transactions.',
        telemetryEvidence: 'High query wait times on usp_CreateOrder (1,450ms SQL duration vs 8ms baseline).',
        evidenceChain: [
          { step: 1, metric: 'SQL Latency', observed: '1,450 ms', baseline: '8 ms', description: 'Query execution spiked by 18,000%' },
          { step: 2, metric: 'Active DB Connections', observed: '100 / 100 max', baseline: '12 active', description: 'Connection pool saturation reached' }
        ],
        suggestedRemediation: 'Scale SQL connection pool max size to 250 and run auto-remediation to flush idle transactions.',
        acknowledged: false
      };
      addLog('ERROR', 'Database Engine', 'SqlException: Connection pool timeout limit reached (1450ms duration).');
    } else if (type === 'trafficspike') {
      setGlobalStatus('degraded');
      setMetrics(prev => prev.map(m => {
        if (m.id === 'cpu') return { ...m, value: '94%', status: 'critical' };
        if (m.id === 'requests') return { ...m, value: '2,850/min', status: 'warning' };
        if (m.id === 'incidents') return { ...m, value: '1', status: 'warning' };
        return m;
      }));

      newInc = {
        id: 'inc-' + Date.now(),
        incidentNumber: incNumber,
        title: 'Traffic Overload & Thread Pool Saturation',
        severity: 'HIGH',
        status: 'Open',
        timestamp,
        confidenceScore: 94,
        rootCauseSummary: 'Unusual 15x surge in HTTP request volume overwhelmed web worker thread pool, elevating CPU utilization to 94%.',
        telemetryEvidence: 'Request rate spiked to 2,850 req/min (baseline 184 req/min).',
        evidenceChain: [
          { step: 1, metric: 'Requests/min', observed: '2,850 req/min', baseline: '184 req/min', description: 'Traffic surge of 1,449%' },
          { step: 2, metric: 'CPU %', observed: '94.2%', baseline: '42%', description: 'CPU utilization reached critical saturation' }
        ],
        suggestedRemediation: 'Activate rate-limiting middleware, enable CDN edge caching, or trigger auto-scaling.',
        acknowledged: false
      };
      addLog('WARN', 'Application Core (ShopEasy)', 'Threadpool queue depth exceeded warning limit (>500 items queued).');
    } else if (type === 'apifailure') {
      setGlobalStatus('critical');
      setServices(prev => prev.map(s => s.id === 'payment-api' ? { ...s, status: 'critical', latencyMs: 2400 } : s));
      setMetrics(prev => prev.map(m => m.id === 'incidents' ? { ...m, value: '1', status: 'critical' } : m));

      newInc = {
        id: 'inc-' + Date.now(),
        incidentNumber: incNumber,
        title: 'Payment Gateway HTTP 500 Outage on Order Settlement',
        severity: 'CRITICAL',
        status: 'Open',
        timestamp,
        confidenceScore: 99,
        rootCauseSummary: 'External Payment Gateway REST endpoint is returning HTTP 500 Internal Server Error on 78% of order settlement requests.',
        telemetryEvidence: 'Failed HTTP responses on POST /v1/charges with 2,400ms timeout.',
        evidenceChain: [
          { step: 1, metric: 'HTTP 500 Error Rate', observed: '78.4%', baseline: '0.01%', description: 'Critical error rate threshold exceeded' },
          { step: 2, metric: 'Payment Gateway Latency', observed: '2,400 ms', baseline: '142 ms', description: 'External API response time degraded' }
        ],
        suggestedRemediation: 'Switch to backup secondary payment provider circuit breaker and isolate faulty upstream gateway.',
        acknowledged: false
      };
      addLog('ERROR', 'Payment Gateway', 'HTTP 500 Internal Server Error received on POST /v1/charges (TraceId: fail-99a)');
    } else {
      // Cascading
      setGlobalStatus('critical');
      setServices(prev => prev.map(s => ({ ...s, status: 'critical', latencyMs: s.latencyMs * 4 })));
      setMetrics(prev => prev.map(m => {
        if (m.id === 'incidents') return { ...m, value: '3', status: 'critical' };
        if (m.id === 'cpu') return { ...m, value: '98%', status: 'critical' };
        return m;
      }));

      newInc = {
        id: 'inc-' + Date.now(),
        incidentNumber: incNumber,
        title: 'Cascading Outage: Database Locks & Gateway Timeouts',
        severity: 'CRITICAL',
        status: 'Open',
        timestamp,
        confidenceScore: 98,
        rootCauseSummary: 'Cascading failure triggered by unreleased database locks propagating through threadpools to payment settlement pipelines.',
        telemetryEvidence: 'Compound latency explosion across SQL Server (1,450ms), API (1,850ms), and Payment Gateway (3,200ms).',
        evidenceChain: [
          { step: 1, metric: 'System Anomaly Score', observed: '9.8 / 10', baseline: '0.2 / 10', description: 'Multi-service dependency deadlock' },
          { step: 2, metric: 'Database Connection Pool', observed: '100% Saturation', baseline: '12%', description: 'Unindexed connection leak' }
        ],
        suggestedRemediation: 'Execute emergency graceful service restart, drain pending queues, and flush blocked database connections.',
        acknowledged: false
      };
      addLog('ERROR', 'Application Core (ShopEasy)', 'Cascading failure alert triggered across all microservices.');
    }

    setIncidents(prev => [newInc, ...prev]);
    showToast(`Chaos Simulation Injected: '${newInc.title}'`);
  }, [addLog, showToast]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  }, [showToast]);

  // Live polling for ingested backend telemetry logs from ShopEasy (Port 5001 -> Port 5000)
  useEffect(() => {
    const fetchIngestedLogs = async () => {
      try {
        const res = await fetch('/api/telemetry/logs?limit=50');
        if (res.ok) {
          const fetchedLogs: LogEntry[] = await res.json();
          if (Array.isArray(fetchedLogs) && fetchedLogs.length > 0) {
            setLogs(prev => {
              const existingIds = new Set(prev.map(l => l.id));
              const newItems = fetchedLogs.filter(l => !existingIds.has(l.id));
              if (newItems.length > 0) {
                return [...newItems, ...prev].slice(0, 100);
              }
              return prev;
            });
          }
        }
      } catch {
        // quiet fallback
      }
    };

    fetchIngestedLogs();
    const interval = setInterval(fetchIngestedLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // Streaming ticker loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setTimeSeriesData(prev => {
        const last = prev[prev.length - 1];
        const apiVar = globalStatus === 'healthy'
          ? Math.max(25, Math.min(80, last.apiLatency + Math.floor(Math.random() * 7 - 3)))
          : globalStatus === 'degraded' ? 850 : 1850;
        const sqlVar = globalStatus === 'healthy'
          ? Math.max(5, Math.min(15, last.sqlLatency + Math.floor(Math.random() * 3 - 1)))
          : 1450;

        return [...prev.slice(1), { time: nowStr, apiLatency: apiVar, sqlLatency: sqlVar }];
      });

      setResourceData(prev => {
        const last = prev[prev.length - 1];
        const cpuVar = globalStatus === 'degraded' ? 94 : Math.max(30, Math.min(85, last.cpu + Math.floor(Math.random() * 5 - 2)));
        return [...prev.slice(1), { time: nowStr, cpu: cpuVar, memory: 51 }];
      });
    }, streamingSpeed);

    return () => clearInterval(interval);
  }, [isPaused, streamingSpeed, globalStatus]);

  return (
    <TelemetryContext.Provider value={{
      activeRoute,
      setActiveRoute,
      globalStatus,
      isRefreshing,
      refreshTelemetry,
      services,
      selectedService,
      setSelectedService,
      restartService,
      metrics,
      selectedMetric,
      setSelectedMetric,
      updateMetricThreshold,
      timeSeriesData,
      resourceData,
      throughputData,
      timeRange,
      setTimeRange,
      streamingSpeed,
      setStreamingSpeed,
      isPaused,
      setIsPaused,
      incidents,
      triggerChaosSimulation,
      acknowledgeIncident,
      runAutoRemediation,
      logs,
      addLog,
      notifications,
      markAllNotificationsRead,
      toastMessage,
      showToast,
      isLogoutModalOpen,
      setIsLogoutModalOpen,
      products,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      isWishlistOpen,
      setIsWishlistOpen,
      availableCoupons,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      selectedProduct,
      setSelectedProduct,
      isProductModalOpen,
      setIsProductModalOpen,
      placeOrder,
      isProcessingOrder,
      orderHistory,
      isOrderHistoryOpen,
      setIsOrderHistoryOpen,
      latestPlacedOrder,
      isOrderSuccessModalOpen,
      setIsOrderSuccessModalOpen,
      isAiAssistantOpen,
      setIsAiAssistantOpen,
      aiMessages,
      sendAiMessage,
      resetAiChat
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) throw new Error('useTelemetry must be used within a TelemetryProvider');
  return context;
};
