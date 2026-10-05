import React from 'react';
import { Activity, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  networkStatus: string;
  isSimulating: boolean;
  onRunAuditSync: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  networkStatus,
  isSimulating,
  onRunAuditSync,
}) => {
  return (
    <header className="header-container" role="banner">
      <div className="header-top">
        <div className="ticket-meta-pills">
          <span className="badge badge-ticket">TICKET ID: ENG-84718</span>
          <span className="badge badge-priority">PRIORITY: P1 (HIGH)</span>
          <span className="badge badge-points">5 STORY POINTS</span>
          <span className="badge badge-epic">EPIC: CORE INFRASTRUCTURE OVERHAUL</span>
          <span className="badge badge-accountability">MANDATORY DELIVERY</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary sync-btn"
            onClick={onRunAuditSync}
            disabled={isSimulating}
            aria-label="Header Trigger Audit Sync"
          >
            <Activity className="btn-icon" aria-hidden="true" size={16} />
            <span>Run Performance Audit Sync</span>
          </button>
        </div>
      </div>

      <div className="header-main">
        <div className="title-area">
          <div className="portal-tag">
            <span className="status-dot"></span>
            News Blog Enterprise • Floor Staff Portal
          </div>
          <h1 className="main-heading">Performance Optimization for News Blog</h1>
          <p className="sub-heading">
            Digital performance operations management system replacing legacy paper logs and spreadsheet trackers.
            Engineered for high-traffic real-time news publishing with edge-case resiliency.
          </p>
        </div>

        <div className="ticket-assignee-card">
          <div className="assignee-row">
            <UserCheck size={14} className="meta-icon" aria-hidden="true" />
            <span className="meta-label">Primary Owner:</span>
            <span className="meta-value">Ujjawal Tiwari <code>[PDIT-INT-1193]</code></span>
          </div>
          <div className="assignee-row">
            <ShieldCheck size={14} className="meta-icon" aria-hidden="true" />
            <span className="meta-label">Tech Lead:</span>
            <span className="meta-value">Deepika Kumari</span>
          </div>
          <div className="assignee-row">
            <AlertTriangle size={14} className="meta-icon" aria-hidden="true" />
            <span className="meta-label">Network State:</span>
            <span className="meta-value status-pill">{networkStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
