export type MetricType = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'ImageSize' | 'CacheHit';

export type OptimizationStatus = 'Needs Audit' | 'Optimizing' | 'Optimized' | 'Failed';

export interface OptimizationItem {
  id: string;
  articleTitle: string;
  articleUrl: string;
  metricType: MetricType;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: OptimizationStatus;
  assignedStaff: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormErrors {
  articleTitle?: string;
  articleUrl?: string;
  metricType?: string;
  currentValue?: string;
  targetValue?: string;
  assignedStaff?: string;
}

export type NetworkSpeed = 'Fast 4G' | 'Slow 3G' | 'Offline';
