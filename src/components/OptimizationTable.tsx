import React, { useState, useMemo, useCallback } from 'react';
import type { OptimizationItem, OptimizationStatus } from '../types';
import { trackTelemetry } from '../utils/telemetry';
import { Search, Filter, CheckCircle2, RotateCw, ExternalLink, Inbox, ArrowUpDown } from 'lucide-react';

interface OptimizationTableProps {
  items: OptimizationItem[];
  onUpdateStatus: (id: string, newStatus: OptimizationStatus) => void;
  onDeleteItem: (id: string) => void;
}

export const OptimizationTable: React.FC<OptimizationTableProps> = React.memo(({
  items,
  onUpdateStatus,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [metricFilter, setMetricFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'currentValue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // useMemo for filtered and sorted records
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.articleUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedStaff.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMetric = metricFilter === 'ALL' || item.metricType === metricFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchMetric && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.currentValue - a.currentValue : a.currentValue - b.currentValue;
      }
    });
  }, [items, searchTerm, metricFilter, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = useCallback(
    (id: string, status: OptimizationStatus) => {
      onUpdateStatus(id, status);
      trackTelemetry('Update Status', { id, status });
    },
    [onUpdateStatus]
  );

  const toggleSort = useCallback((type: 'date' | 'currentValue') => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
    trackTelemetry('Toggle Sort', { type });
  }, [sortBy]);

  return (
    <section className="table-card" aria-labelledby="table-heading">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <h2 id="table-heading" className="card-title">
            News Performance Audit Queue ({filteredItems.length})
          </h2>
        </div>

        <div className="toolbar-controls">
          {/* Search Box */}
          <div className="search-box">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search performance records..."
              aria-label="Search performance records"
            />
          </div>

          {/* Metric Filter */}
          <div className="filter-dropdown">
            <Filter size={14} className="filter-icon" aria-hidden="true" />
            <select
              value={metricFilter}
              onChange={(e) => {
                setMetricFilter(e.target.value);
                trackTelemetry('Filter Metric', { filter: e.target.value });
              }}
              aria-label="Filter by Metric"
              className="filter-select"
            >
              <option value="ALL">All Metrics</option>
              <option value="LCP">LCP (Paint)</option>
              <option value="TTFB">TTFB (Server)</option>
              <option value="FID">FID (Input)</option>
              <option value="CLS">CLS (Shift)</option>
              <option value="ImageSize">Image Payload</option>
              <option value="CacheHit">Cache Hit</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-dropdown">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                trackTelemetry('Filter Status', { filter: e.target.value });
              }}
              aria-label="Filter by Status"
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="Needs Audit">Needs Audit</option>
              <option value="Optimizing">Optimizing</option>
              <option value="Optimized">Optimized</option>
            </select>
          </div>

          {/* Sort Button */}
          <button
            type="button"
            className="btn btn-outline sort-btn"
            onClick={() => toggleSort('currentValue')}
            aria-label={`Sort by metric value ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            <ArrowUpDown size={14} aria-hidden="true" />
            <span>Sort by Value</span>
          </button>
        </div>
      </div>

      {/* Unhappy Path Requirement: Empty States */}
      {filteredItems.length === 0 ? (
        <div className="empty-state-container" role="status" aria-live="polite">
          <div className="empty-state-icon-wrapper">
            <Inbox size={42} aria-hidden="true" className="empty-icon" />
          </div>
          <h3 className="empty-state-title">No data found</h3>
          <p className="empty-state-desc">
            No performance records match your current search &quot;{searchTerm}&quot; or selected filters. Try clearing your filters or adding a new performance task.
          </p>
          {(searchTerm || metricFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm('');
                setMetricFilter('ALL');
                setStatusFilter('ALL');
              }}
              aria-label="Clear all filters"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="corporate-table" aria-label="Performance Optimization Task Table">
            <thead>
              <tr>
                <th scope="col">Task ID & Article</th>
                <th scope="col">Target Metric</th>
                <th scope="col">Current vs Target</th>
                <th scope="col">Status</th>
                <th scope="col">Assigned Staff</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="cell-article">
                    <div className="task-id-badge">{item.id}</div>
                    <div className="article-title">{item.articleTitle}</div>
                    <a
                      href={item.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-link"
                      aria-label={`Open article link for ${item.articleTitle}`}
                    >
                      <span>{item.articleUrl}</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                    {item.notes && <div className="article-notes">{item.notes}</div>}
                  </td>

                  <td>
                    <span className={`metric-tag metric-${item.metricType.toLowerCase()}`}>
                      {item.metricType}
                    </span>
                  </td>

                  <td>
                    <div className="metric-comparison">
                      <div className="metric-current">
                        <span className="comp-label">Current:</span>
                        <strong>{item.currentValue} {item.unit}</strong>
                      </div>
                      <div className="metric-target">
                        <span className="comp-label">Target:</span>
                        <span>{item.targetValue} {item.unit}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="cell-staff">
                    <span>{item.assignedStaff}</span>
                  </td>

                  <td className="cell-actions text-right">
                    <div className="action-buttons-group">
                      {item.status !== 'Optimized' && (
                        <button
                          type="button"
                          className="btn btn-action-success"
                          onClick={() => handleStatusChange(item.id, 'Optimized')}
                          aria-label={`Mark task ${item.id} as Optimized`}
                          title="Mark as Optimized"
                        >
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>Optimize</span>
                        </button>
                      )}

                      {item.status !== 'Optimizing' && item.status !== 'Optimized' && (
                        <button
                          type="button"
                          className="btn btn-action-neutral"
                          onClick={() => handleStatusChange(item.id, 'Optimizing')}
                          aria-label={`Mark task ${item.id} as Optimizing`}
                          title="Begin Optimization"
                        >
                          <RotateCw size={14} aria-hidden="true" />
                          <span>Start</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-action-delete"
                        onClick={() => {
                          onDeleteItem(item.id);
                          trackTelemetry('Delete Task', { id: item.id });
                        }}
                        aria-label={`Remove audit task ${item.id}`}
                        title="Remove Record"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

OptimizationTable.displayName = 'OptimizationTable';
