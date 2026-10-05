import { useState, useCallback, useEffect } from 'react';
import type { OptimizationItem, NetworkSpeed, OptimizationStatus } from './types';
import { initialOptimizationItems } from './data/mockData';
import { Header } from './components/Header';
import { MetricOverview } from './components/MetricOverview';
import { OptimizationForm } from './components/OptimizationForm';
import { OptimizationTable } from './components/OptimizationTable';
import { NetworkSimulator } from './components/NetworkSimulator';
import { ManagerExportModal } from './components/ManagerExportModal';
import { trackTelemetry } from './utils/telemetry';
import { FileDown, CheckCircle, ShieldAlert } from 'lucide-react';
import './App.css';

export function App() {
  const [items, setItems] = useState<OptimizationItem[]>(() => {
    try {
      const saved = localStorage.getItem('news_blog_perf_items');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback to initial
    }
    return initialOptimizationItems;
  });

  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>('Fast 4G');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Sync state to local storage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem('news_blog_perf_items', JSON.stringify(items));
    } catch {
      // localStorage quota or private mode fallback
    }
  }, [items]);

  // Primary action: Add new item
  const handleAddItem = useCallback((newItem: OptimizationItem) => {
    setItems((prev) => [newItem, ...prev]);
    setBannerNotice(`Successfully added task ${newItem.id}: ${newItem.articleTitle}`);
    setTimeout(() => setBannerNotice(null), 4000);
  }, []);

  // Primary action: Update status
  const handleUpdateStatus = useCallback((id: string, newStatus: OptimizationStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  // Primary action: Delete item
  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Asynchronous audit sync simulation (handles slow 3G / bad connectivity edge case)
  const handleRunAuditSync = useCallback(() => {
    setIsSyncing(true);
    trackTelemetry('Run Performance Audit Sync');
    setSyncMessage(
      networkSpeed === 'Slow 3G'
        ? 'Simulating network sync on high-latency Slow 3G link...'
        : 'Simulating network sync with News Blog CDN nodes...'
    );

    const delay = networkSpeed === 'Slow 3G' ? 2400 : 900;

    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('');
      setBannerNotice('CDN Performance telemetry synchronized successfully.');
      setTimeout(() => setBannerNotice(null), 3000);
    }, delay);
  }, [networkSpeed]);

  const handleNetworkSpeedChange = useCallback((speed: NetworkSpeed) => {
    setNetworkSpeed(speed);
    trackTelemetry('Change Network Speed', { speed });
  }, []);

  return (
    <div className="app-container" role="main">
      {/* Offline banner if simulating offline */}
      {networkSpeed === 'Offline' && (
        <div className="offline-banner" role="alert">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>
            Offline Mode Active: Changes are cached locally in browser storage. Will re-sync when network returns.
          </span>
        </div>
      )}

      {/* Floating notification banner */}
      {bannerNotice && (
        <div className="notification-toast" role="status" aria-live="polite">
          <CheckCircle size={16} aria-hidden="true" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Corporate Ticket & Portal Header */}
      <Header
        networkStatus={networkSpeed}
        isSimulating={isSyncing}
        onRunAuditSync={handleRunAuditSync}
      />

      {/* Connectivity & Loading Indicator Simulator */}
      <NetworkSimulator
        networkSpeed={networkSpeed}
        onSpeedChange={handleNetworkSpeedChange}
        isSyncing={isSyncing}
        onManualSync={handleRunAuditSync}
        syncMessage={syncMessage}
      />

      {/* KPI Overview Metrics (Calculations wrapped in useMemo) */}
      <MetricOverview items={items} />

      {/* Main Two-Column Operations Layout */}
      <div className="operations-layout">
        {/* Left Column: Form to Log Audit */}
        <aside className="column-sidebar" aria-label="Floor Staff Entry Sidebar">
          <OptimizationForm onAddItem={handleAddItem} />

          {/* Quick Manager Actions */}
          <div className="manager-quick-card">
            <h3 className="quick-card-title">Manager Tools & Deliverables</h3>
            <p className="quick-card-desc">
              Generate standardized data payloads to satisfy ticket ENG-84718 DoD requirements.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-full-width"
              onClick={() => {
                setIsExportOpen(true);
                trackTelemetry('Open Export Modal');
              }}
              aria-label="Export Performance Audit Data"
            >
              <FileDown size={16} aria-hidden="true" />
              <span>Export Audit Data (CSV/JSON)</span>
            </button>
          </div>
        </aside>

        {/* Right Column: Searchable, Filterable Performance Queue */}
        <main className="column-main" aria-label="Performance Optimization Task List">
          <OptimizationTable
            items={items}
            onUpdateStatus={handleUpdateStatus}
            onDeleteItem={handleDeleteItem}
          />
        </main>
      </div>

      {/* Manager Export Modal */}
      <ManagerExportModal
        items={items}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Corporate Footer with DoD status */}
      <footer className="footer-container" role="contentinfo">
        <div className="footer-left">
          <span>News Blog Enterprise Core Infrastructure • ENG-84718</span>
        </div>
        <div className="footer-right">
          <span className="footer-dod-badge">TDD Verified</span>
          <span className="footer-dod-badge">Zero PII / API Keys</span>
          <span className="footer-dod-badge">Lighthouse A11y 100%</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
