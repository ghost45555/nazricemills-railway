export interface NavigationTiming {
  dnsLookup: number;
  tcpConnection: number;
  tlsNegotiation: number;
  serverResponse: number;
  domLoad: number;
  windowLoad: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  initiatorType: string;
}

export interface PerformanceMetrics {
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  fcp: number | null;  // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  navigationTiming: NavigationTiming | null;
  resourceTiming: ResourceTiming[];
}

export interface MetricThreshold {
  good: number;
  needsImprovement: number;
  poor: number;
}

export interface MetricDefinition {
  name: string;
  unit: string;
  threshold: MetricThreshold;
  description: string;
}

export interface MetricDisplay extends MetricDefinition {
  value: number | null;
}

export interface PerformanceConfig {
  measureLCP: boolean;
  measureFID: boolean;
  measureCLS: boolean;
  reportToAnalytics: boolean;
}

export interface ResourceTimingStats {
  totalSize: number;
  totalDuration: number;
  count: number;
}

export interface PerformanceEvent {
  metric_name: string;
  value: number;
  metric_id: string;
}

export type MetricStatus = 'good' | 'needs-improvement' | 'poor';

export const DEFAULT_METRIC_THRESHOLDS: { [key: string]: MetricThreshold } = {
  lcp: { good: 2500, needsImprovement: 4000, poor: Infinity },
  fid: { good: 100, needsImprovement: 300, poor: Infinity },
  cls: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
  fcp: { good: 1800, needsImprovement: 3000, poor: Infinity },
  ttfb: { good: 800, needsImprovement: 1800, poor: Infinity }
};

export const DEFAULT_METRIC_DEFINITIONS: { [key: string]: Omit<MetricDefinition, 'threshold'> } = {
  lcp: {
    name: 'Largest Contentful Paint',
    unit: 'ms',
    description: 'Time until the largest content element is visible'
  },
  fid: {
    name: 'First Input Delay',
    unit: 'ms',
    description: 'Time from first interaction to response'
  },
  cls: {
    name: 'Cumulative Layout Shift',
    unit: '',
    description: 'Measure of visual stability'
  },
  fcp: {
    name: 'First Contentful Paint',
    unit: 'ms',
    description: 'Time until first content is painted'
  },
  ttfb: {
    name: 'Time to First Byte',
    unit: 'ms',
    description: 'Time until first byte is received'
  }
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  measureLCP: true,
  measureFID: true,
  measureCLS: true,
  reportToAnalytics: true
};

export function getMetricDefinition(metricKey: string): MetricDefinition {
  return {
    ...DEFAULT_METRIC_DEFINITIONS[metricKey],
    threshold: DEFAULT_METRIC_THRESHOLDS[metricKey]
  };
}

export function getMetricStatus(value: number | null, threshold: MetricThreshold): MetricStatus {
  if (value === null) return 'poor';
  
  if (value <= threshold.good) {
    return 'good';
  } else if (value <= threshold.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

export function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return 'N/A';
  
  if (unit === 'ms') {
    return `${Math.round(value)}ms`;
  } else if (value < 1) {
    return value.toFixed(3);
  }
  
  return value.toString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
