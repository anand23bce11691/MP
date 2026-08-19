export type ViewRoute = 'dashboard' | 'shopeasy' | 'live-monitoring' | 'incidents' | 'services' | 'logs' | 'simulations' | 'reports';

export type SystemStatus = 'healthy' | 'degraded' | 'critical';

export interface ServiceItem {
  id: string;
  name: string;
  type: string;
  technology: string;
  instances: number;
  uptime: string;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'critical';
  endpoint: string;
  recentPings: { time: string; latency: number; status: 'ok' | 'error' }[];
}

export interface MetricItem {
  id: 'cpu' | 'memory' | 'requests' | 'incidents';
  title: string;
  value: string;
  threshold: string;
  delta: string;
  status: 'normal' | 'warning' | 'critical';
  sparkline: number[];
}

export interface TimeSeriesSample {
  time: string;
  apiLatency: number;
  sqlLatency: number;
}

export interface ResourceSample {
  time: string;
  cpu: number;
  memory: number;
}

export interface ThroughputSample {
  time: string;
  requests: number;
  errors: number;
}

export interface IncidentEvidence {
  step: number;
  metric: string;
  observed: string;
  baseline: string;
  description: string;
}

export interface IncidentItem {
  id: string;
  incidentNumber: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'Open' | 'Investigating' | 'Resolved';
  timestamp: string;
  confidenceScore: number;
  rootCauseSummary: string;
  telemetryEvidence: string;
  evidenceChain: IncidentEvidence[];
  suggestedRemediation: string;
  acknowledged: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
  traceId: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical';
}

export interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}
