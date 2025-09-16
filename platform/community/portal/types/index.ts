// Houston EJ-AI Platform - Type Definitions
// Production-ready TypeScript interfaces for type safety

export interface SensorData {
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  health_events: number;
  timestamp: number;
  device_id: string;
  signature?: string;
  encrypted?: boolean;
  location_lat?: number;
  location_lng?: number;
}

export interface CompensationClaim {
  id?: number;
  wallet_address: string;
  amount: number;
  claim_time: string;
  transaction_hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  pm25_trigger?: number;
  device_id?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  category: string;
  influence: number;
  x: number;
  y: number;
  z: number;
  metadata?: Record<string, any>;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface VisualizationPoint {
  pos: [number, number, number];
  confidence: number;
  category: string;
  timestamp: number;
  meta: number[];
  device_id?: string;
  encrypted?: boolean;
}

export interface VisualizationData {
  research_points: VisualizationPoint[];
  total_count: number;
  generation_time: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthStatus {
  status: 'alive' | 'ready' | 'not_ready';
  database?: 'connected' | 'disconnected';
  redis?: 'connected' | 'disconnected';
  timestamp: string;
}

export interface MetricsData {
  requests_total: number;
  uptime_seconds: number;
  memory_rss_mb: number;
  native: 'available' | 'fallback';
  route_counts: Record<string, number>;
  route_errors: Record<string, number>;
}