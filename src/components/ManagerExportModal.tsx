import React, { useState, useCallback } from 'react';
import type { OptimizationItem } from '../types';
import { trackTelemetry } from '../utils/telemetry';
import { Download, FileJson, FileSpreadsheet, X, Check } from 'lucide-react';

interface ManagerExportModalProps {
  items: OptimizationItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerExportModal: React.FC<ManagerExportModalProps> = React.memo(({
  items,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const exportJSON = useCallback(() => {
    const payload = {
      ticketId: 'ENG-84718',
      epic: 'Core Infrastructure Overhaul',
      client: 'News Blog',
      generatedAt: new Date().toISOString(),
      totalTasks: items.length,
      records: items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-blog-performance-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackTelemetry('Export Data JSON', { count: items.length });
  }, [items]);

  const exportCSV = useCallback(() => {
    const headers = ['Task ID', 'Article Title', 'URL', 'Metric', 'Current Value', 'Target Value', 'Unit', 'Status', 'Staff', 'Updated At'];
    const rows = items.map((i) => [
      `"${i.id}"`,
      `"${i.articleTitle.replace(/"/g, '""')}"`,
      `"${i.articleUrl}"`,
      `"${i.metricType}"`,
      i.currentValue,
      i.targetValue,
      `"${i.unit}"`,
      `"${i.status}"`,
      `"${i.assignedStaff}"`,
      `"${i.updatedAt}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-blog-performance-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackTelemetry('Export Data CSV', { count: items.length });
  }, [items]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    setCopied(true);
    trackTelemetry('Copy JSON to Clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <h3 id="modal-heading" className="modal-title">Standardized Audit Export (Manager Delivery)</h3>
            <p className="modal-subtitle">Consistent schema export for News Blog operations and Excel replacement.</p>
          </div>
          <button
            type="button"
            className="btn btn-icon-close"
            onClick={onClose}
            aria-label="Close export dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="export-stats-banner">
            <div><strong>Total Exportable Records:</strong> {items.length}</div>
            <div><strong>Schema Standard:</strong> ENG-84718 TRD Compliant</div>
          </div>

          <div className="export-action-grid">
            <button
              type="button"
              className="export-card-btn"
              onClick={exportJSON}
              aria-label="Export formatted JSON report"
            >
              <FileJson size={28} className="export-type-icon" aria-hidden="true" />
              <div className="export-type-details">
                <strong>Export Structured JSON</strong>
                <span>Complete payload with audit metadata for automated CI/CD pipelines.</span>
              </div>
              <Download size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="export-card-btn"
              onClick={exportCSV}
              aria-label="Export standard CSV spreadsheet"
            >
              <FileSpreadsheet size={28} className="export-type-icon" aria-hidden="true" />
              <div className="export-type-details">
                <strong>Export CSV Sheet</strong>
                <span>Ready for spreadsheet imports, replacing legacy manual papers.</span>
              </div>
              <Download size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={copyToClipboard}
            aria-label="Copy JSON payload to clipboard"
          >
            {copied ? <Check size={14} className="text-success" aria-hidden="true" /> : null}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

ManagerExportModal.displayName = 'ManagerExportModal';
