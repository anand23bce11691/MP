import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CartItem
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
  addToCart: (product: ProductItem) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  placeOrder: (customerName: string, customerEmail: string) => Promise<boolean>;
  isProcessingOrder: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const initialProducts: ProductItem[] = [
  { id: 1, name: 'Pro Wireless ANC Headphones', category: 'Audio', price: 14999, rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', description: 'Active noise cancelling wireless headphones with crystal-clear spatial audio & 40-hour battery life.', stock: 35 },
  { id: 2, name: 'Ergonomic Mechanical Keyboard', category: 'Peripherals', price: 8499, rating: 4.9, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', description: 'Hot-swappable RGB mechanical coding and gaming keyboard with smooth tactile switches.', stock: 20 },
  { id: 3, name: 'UltraWide 34" Curved Monitor', category: 'Displays', price: 42999, rating: 4.7, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', description: '144Hz WQHD IPS display designed for maximum multi-tasking productivity and crisp visual clarity.', stock: 12 },
  { id: 4, name: 'Precision Wireless Gaming Mouse', category: 'Peripherals', price: 4499, rating: 4.6, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80', description: 'Ultra-lightweight 26K DPI optical sensor with ergonomic thumb rest and wireless charging dock.', stock: 48 },
  { id: 5, name: 'Smart Fitness & Health Watch', category: 'Wearables', price: 6999, rating: 4.5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', description: 'Continuous heart rate tracking, GPS route mapping, sleep analytics, and 7-day battery.', stock: 25 },
  { id: 6, name: 'High-Speed 2TB NVMe Portable SSD', category: 'Storage', price: 12499, rating: 4.9, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80', description: 'Shock-resistant USB 3.2 Gen2x2 portable drive with lightning-fast 2000MB/s data transfers.', stock: 50 },
  { id: 7, name: '4K Ultra HD Web Cam with Ring Light', category: 'Video', price: 7999, rating: 4.6, image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&q=80', description: 'Auto-focus streaming webcam with integrated soft ring light, privacy shutter, and noise-canceling dual mics.', stock: 18 },
  { id: 8, name: 'Aluminum 11-in-1 USB-C Docking Hub', category: 'Accessories', price: 4999, rating: 4.4, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80', description: 'Dual 4K HDMI ports, Gigabit Ethernet, 100W PD Pass-through charging, and high-speed SD card readers.', stock: 30 },
  { id: 9, name: 'Ergonomic Mesh Executive Chair', category: 'Furniture', price: 18999, rating: 4.8, image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&q=80', description: 'Adjustable dynamic lumbar support, 3D armrests, and breathable high-density mesh backrest.', stock: 8 },
  { id: 10, name: 'Portable Bluetooth Waterproof Speaker', category: 'Audio', price: 3499, rating: 4.7, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80', description: 'Deep bass 360-degree room-filling audio with IP67 dust and water resistance for outdoor use.', stock: 42 },
  { id: 11, name: 'Smart Home AI Voice Assistant Hub', category: 'Smart Home', price: 5999, rating: 4.3, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&q=80', description: '7-inch HD touchscreen smart hub controlling lighting, security cameras, and multi-room audio.', stock: 22 },
  { id: 12, name: 'MagSafe Wireless 3-in-1 Charging Stand', category: 'Accessories', price: 3299, rating: 4.8, image: 'https://images.unsplash.com/photo-1622445268465-8438364058d7?w=500&q=80', description: 'Fast 15W wireless charging stand for your smartphone, smartwatch, and wireless earbuds simultaneously.', stock: 60 },
  { id: 13, name: 'Studio Condenser USB Microphone', category: 'Audio', price: 8999, rating: 4.9, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', description: 'Broadcast-quality cardioid pickup pattern with anti-vibration shock mount and physical gain control knob.', stock: 15 },
  { id: 14, name: 'Extended Micro-Weave Desk Mat Pad', category: 'Accessories', price: 1499, rating: 4.7, image: 'https://images.unsplash.com/photo-1616440342855-5463690d797c?w=500&q=80', description: 'Water-repellent anti-fray stitched edge desk mat pad (900x400mm) for ultra-smooth tracking.', stock: 100 },
  { id: 15, name: '20,000mAh 65W Fast Power Bank', category: 'Accessories', price: 3999, rating: 4.6, image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500&q=80', description: 'Charge laptops and mobile phones simultaneously with real-time digital battery status display.', stock: 45 }
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

const initialLogs: LogEntry[] = [
  { id: 'l1', timestamp: '10:14:45.102', level: 'INFO', service: 'Application Core', message: 'POST /api/shopeasy/orders 200 OK - 42ms (TraceId: 8f9a2b)', traceId: '8f9a2b' },
  { id: 'l2', timestamp: '10:14:42.890', level: 'INFO', service: 'Database Engine', message: 'Executed DbCommand (4ms) [INSERT INTO Orders (UserId, TotalAmount)]', traceId: '8f9a2b' },
  { id: 'l3', timestamp: '10:14:38.511', level: 'INFO', service: 'Payment Gateway', message: 'POST /v1/charges 200 OK - 142ms', traceId: '4c71ef' },
  { id: 'l4', timestamp: '10:14:30.004', level: 'INFO', service: 'SystemMetricsWorker', message: 'Telemetry heartbeat generated: CPU 42%, Memory 51%, P95 42ms', traceId: 'sys-hb' },
  { id: 'l5', timestamp: '10:14:15.220', level: 'INFO', service: 'Application Core', message: 'GET /api/shopeasy/products 200 OK - 18ms', traceId: '1d99e0' }
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

  // ShopEasy Cart State
  const [products] = useState<ProductItem[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR', service: string, message: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const newLog: LogEntry = {
      id: 'log-' + Date.now(),
      timestamp: timeStr,
      level,
      service,
      message,
      traceId: Math.random().toString(36).substring(2, 8)
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const addToCart = (product: ProductItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added '${product.name}' to ShopEasy shopping cart.`);
    addLog('INFO', 'Application Core (ShopEasy)', `Cart updated: Item #${product.id} (${product.name}) added by customer.`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (customerName: string, customerEmail: string): Promise<boolean> => {
    setIsProcessingOrder(true);
    const startTime = performance.now();
    const orderTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

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
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.product.price })),
          customerName,
          customerEmail
        })
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        setIsProcessingOrder(false);
        clearCart();
        setIsCartOpen(false);
        
        // Log telemetry event into IncidentIQ live stream
        addLog('INFO', 'Application Core (ShopEasy)', `Order placed successfully (₹${orderTotal.toLocaleString('en-IN')}) - ${durationMs}ms duration (SQL: 8ms).`);
        addLog('INFO', 'Payment Gateway', `Virtual Charge Approved (₹${orderTotal.toLocaleString('en-IN')}) - 142ms (TraceId: ${Math.random().toString(36).substring(2,8)})`);
        
        // Push telemetry chart point
        setTimeSeriesData(prev => [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          apiLatency: durationMs > 0 ? durationMs : 45,
          sqlLatency: globalStatus === 'degraded' ? 1450 : 8
        }]);

        showToast(`Order Placed Successfully (₹${orderTotal.toLocaleString('en-IN')})! Telemetry captured by IncidentIQ.`);
        return true;
      } else {
        throw new Error('Order endpoint failed');
      }
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      setIsProcessingOrder(false);

      if (globalStatus === 'critical' || globalStatus === 'degraded') {
        addLog('ERROR', 'Application Core (ShopEasy)', `HTTP 500 Outage on Checkout API! Duration ${durationMs}ms.`);
        addLog('ERROR', 'Database Engine', `SqlException: Connection pool lock timeout on OrdersDb.`);
      } else {
        // Fallback simulate successful order capture even if API mock endpoint returns local response
        clearCart();
        setIsCartOpen(false);
        addLog('INFO', 'Application Core (ShopEasy)', `Order placed successfully (₹${orderTotal.toLocaleString('en-IN')}) - ${durationMs}ms.`);
        showToast(`Order Placed Successfully (₹${orderTotal.toLocaleString('en-IN')})! Telemetry ingested.`);
        return true;
      }
      showToast('Order failed: System anomaly present in active pipeline.');
      return false;
    }
  };

  const refreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Telemetry refreshed cleanly from SQL Server baselines.');
    }, 800);
  };

  const restartService = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, latencyMs: Math.round(s.latencyMs * 0.8), status: 'healthy' };
      }
      return s;
    }));
    addLog('INFO', serviceId, `Service restart sequence initialized by administrator.`);
    showToast(`Service '${serviceId}' restart sequence initiated.`);
  };

  const updateMetricThreshold = (metricId: string, newThreshold: string) => {
    setMetrics(prev => prev.map(m => m.id === metricId ? { ...m, threshold: newThreshold } : m));
    showToast(`Threshold updated for ${metricId.toUpperCase()} to ${newThreshold}`);
  };

  const acknowledgeIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, acknowledged: true, status: 'Investigating' } : inc));
    showToast(`Incident #${id} acknowledged.`);
  };

  const runAutoRemediation = (id: string) => {
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
  };

  const triggerChaosSimulation = (type: 'dbslowdown' | 'trafficspike' | 'apifailure' | 'cascading') => {
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
        title: 'External Payment Gateway Outage (HTTP 500 Spike)',
        severity: 'CRITICAL',
        status: 'Open',
        timestamp,
        confidenceScore: 99,
        rootCauseSummary: 'Upstream Payment Provider endpoint returning HTTP 500 Internal Error on checkout requests.',
        telemetryEvidence: 'Payment API error rate spiked to 78% with average timeout 2,400ms.',
        evidenceChain: [
          { step: 1, metric: 'Payment Gateway Error Rate', observed: '78.4%', baseline: '< 0.1%', description: 'HTTP 500 error cascade' },
          { step: 2, metric: 'Gateway Latency', observed: '2,400 ms', baseline: '142 ms', description: 'Gateway connection timed out' }
        ],
        suggestedRemediation: 'Enable circuit breaker fallback to secondary payment processor or enable auto-remediation.',
        acknowledged: false
      };
      addLog('ERROR', 'Payment Gateway', 'HttpRequestException: Upstream payment gateway endpoint returned HTTP 500 InternalServerError.');
    } else {
      setGlobalStatus('critical');
      setServices(prev => prev.map(s => ({ ...s, status: 'critical' })));
      setMetrics(prev => prev.map(m => m.id === 'incidents' ? { ...m, value: '2', status: 'critical' } : m));

      newInc = {
        id: 'inc-' + Date.now(),
        incidentNumber: incNumber,
        title: 'Cascading Multi-Service Infrastructure Outage',
        severity: 'CRITICAL',
        status: 'Open',
        timestamp,
        confidenceScore: 98,
        rootCauseSummary: 'Compound failure: Database lock timeout cascaded into thread pool exhaustion and payment gateway timeouts.',
        telemetryEvidence: 'Multiple service health probes failing across Application, Database, and Payment APIs.',
        evidenceChain: [
          { step: 1, metric: 'DB Lock Delay', observed: '1,850 ms', baseline: '8 ms', description: 'SQL lock timeout' },
          { step: 2, metric: 'API Error Rate', observed: '64%', baseline: '0%', description: 'Cascading failures across API layer' }
        ],
        suggestedRemediation: 'Execute emergency auto-remediation to clear locks and reset circuit breakers.',
        acknowledged: false
      };
      addLog('ERROR', 'SystemMonitor', 'CRITICAL: Cascading failure detected across all monitored application services.');
    }

    setIncidents(prev => [newInc, ...prev]);
    setNotifications(prev => [
      { id: 'notif-' + Date.now(), title: newInc.title, message: newInc.rootCauseSummary, time: timestamp, read: false, type: 'critical' },
      ...prev
    ]);
    showToast(`Chaos Simulation Triggered: ${newInc.title}`);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  // Heartbeat simulator effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const randomApi = globalStatus === 'degraded' ? 1450 : Math.floor(38 + Math.random() * 8);
      const randomSql = globalStatus === 'degraded' ? 1200 : Math.floor(7 + Math.random() * 4);

      setTimeSeriesData(prev => {
        const updated = [...prev.slice(1), { time: nowStr, apiLatency: randomApi, sqlLatency: randomSql }];
        return updated;
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
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      placeOrder,
      isProcessingOrder
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
