import React, { useMemo } from 'react';
import type { OptimizationItem } from '../types';
import { Gauge, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface MetricOverviewProps {
  items: OptimizationItem[];
}

export const MetricOverview: React.FC<MetricOverviewProps> = React.memo(({ items }) => {
  // Wrap computations in useMemo to prevent unnecessary re-renders
  const metrics = useMemo(() => {
    const total = items.length;
    const optimized = items.filter((i) => i.status === 'Optimized').length;
    const optimizing = items.filter((i) => i.status === 'Optimizing').length;
    const needsAudit = items.filter((i) => i.status === 'Needs Audit').length;

    const lcpItems = items.filter((i) => i.metricType === 'LCP');
    const avgLcp = lcpItems.length > 0
      ? (lcpItems.reduce((acc, curr) => acc + curr.currentValue, 0) / lcpItems.length).toFixed(2)
      : 'N/A';

    const ttfbItems = items.filter((i) => i.metricType === 'TTFB');
    const avgTtfb = ttfbItems.length > 0
      ? Math.round(ttfbItems.reduce((acc, curr) => acc + curr.currentValue, 0) / ttfbItems.length)
      : 'N/A';

    const completionRate = total > 0 ? Math.round((optimized / total) * 100) : 0;

    return {
      total,
      optimized,
      optimizing,
      needsAudit,
      avgLcp,
      avgTtfb,
      completionRate,
    };
  }, [items]);

  return (
    <section className="metric-overview-grid" aria-label="Key Performance Indicators">
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-title">Audit Completion Rate</span>
          <CheckCircle2 size={18} className="metric-icon" aria-hidden="true" />
        </div>
        <div className="metric-number">{metrics.completionRate}%</div>
        <div className="metric-meta">
          <span>{metrics.optimized} of {metrics.total} tasks resolved</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-title">Average Floor LCP</span>
          <Gauge size={18} className="metric-icon" aria-hidden="true" />
        </div>
        <div className="metric-number">{metrics.avgLcp} <span className="metric-unit">s</span></div>
        <div className="metric-meta">
          <span>Target baseline: &lt; 2.5s</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-title">Average Server TTFB</span>
          <Clock size={18} className="metric-icon" aria-hidden="true" />
        </div>
        <div className="metric-number">{metrics.avgTtfb} <span className="metric-unit">ms</span></div>
        <div className="metric-meta">
          <span>Edge cache response SLA: &lt; 200ms</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-title">Pending Action Items</span>
          <AlertCircle size={18} className="metric-icon" aria-hidden="true" />
        </div>
        <div className="metric-number">{metrics.needsAudit + metrics.optimizing}</div>
        <div className="metric-meta">
          <span>{metrics.needsAudit} waiting audit, {metrics.optimizing} in-progress</span>
        </div>
      </div>
    </section>
  );
});

MetricOverview.displayName = 'MetricOverview';
