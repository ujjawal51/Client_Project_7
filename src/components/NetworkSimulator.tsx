import React from 'react';
import type { NetworkSpeed } from '../types';
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';

interface NetworkSimulatorProps {
  networkSpeed: NetworkSpeed;
  onSpeedChange: (speed: NetworkSpeed) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  syncMessage: string;
}

export const NetworkSimulator: React.FC<NetworkSimulatorProps> = React.memo(({
  networkSpeed,
  onSpeedChange,
  isSyncing,
  onManualSync,
  syncMessage,
}) => {
  return (
    <div className="network-simulator-bar" role="region" aria-label="Network Connectivity & Sync Monitor">
      <div className="network-info">
        {networkSpeed === 'Offline' ? (
          <WifiOff size={16} className="network-icon text-danger" aria-hidden="true" />
        ) : (
          <Wifi size={16} className="network-icon" aria-hidden="true" />
        )}
        <span className="network-label">Simulated Network Connection:</span>
        <div className="network-speed-toggles" role="group" aria-label="Network Speed Simulator">
          {(['Fast 4G', 'Slow 3G', 'Offline'] as NetworkSpeed[]).map((speed) => (
            <button
              key={speed}
              type="button"
              className={`btn btn-speed ${networkSpeed === speed ? 'speed-active' : ''}`}
              onClick={() => onSpeedChange(speed)}
              aria-label={`Switch connection simulation to ${speed}`}
              aria-pressed={networkSpeed === speed}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>

      <div className="network-actions">
        {isSyncing ? (
          <div
            className="sync-indicator"
            data-testid="loading-indicator"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 size={16} className="spinner-icon" aria-hidden="true" />
            <span className="sync-text">{syncMessage || 'Simulating network sync on Slow 3G...'}</span>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-outline sync-manual-btn"
            onClick={onManualSync}
            aria-label="Run Performance Audit Sync"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Run Performance Audit Sync</span>
          </button>
        )}
      </div>
    </div>
  );
});

NetworkSimulator.displayName = 'NetworkSimulator';
