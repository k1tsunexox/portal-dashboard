/**
 * Sensors.tsx
 *
 * Redesigned for the dark glass slide-over panel.
 * Clicking a sensor row calls flyTo() from MapContext — the map pans to that
 * sensor while this panel stays open.
 *
 * Key differences from the original:
 *  - White-on-dark palette to suit the glass panel surface.
 *  - Sensor rows call useMap().flyTo() and highlightDevice() instead of navigate().
 *  - No more padding + white card wrapper — the panel already provides that.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMap } from './MapContext';

interface Device {
  id: number;
  name: string;
  location_name: string;
  status: string;
  latitude: number;
  longitude: number;
  last_seen_at: string;
}

function statusDot(status: string) {
  if (status === 'online')  return '#10b981';
  if (status === 'warning') return '#f59e0b';
  return '#ef4444';
}

function statusChip(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    online:  { bg: 'rgba(16,185,129,0.18)',  text: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.18)',  text: '#f59e0b' },
    offline: { bg: 'rgba(239,68,68,0.18)',   text: '#ef4444' },
  };
  return map[status] ?? { bg: 'rgba(148,163,184,0.18)', text: '#94a3b8' };
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Sensors() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const { flyTo, highlightDevice } = useMap();

  useEffect(() => {
    axios.get('/api/devices')
      .then(res => { setDevices(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = devices.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.location_name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = devices.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDeviceClick = (device: Device) => {
    setActiveId(device.id);
    flyTo(device.longitude, device.latitude, 14);
    highlightDevice(device.id);
  };

  return (
    <div className="flex flex-col h-full text-slate-300">

      {/* Summary strip */}
      <div className="flex gap-3 px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
        {[
          { label: 'Online',  count: counts['online']  ?? 0, color: '#10b981' },
          { label: 'Warning', count: counts['warning'] ?? 0, color: '#f59e0b' },
          { label: 'Offline', count: counts['offline'] ?? 0, color: '#ef4444' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="text-xl font-bold" style={{ color }}>{count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search sensors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 pl-8 pr-3 py-2 outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 text-sm">No sensors match "{search}"</div>
        )}

        {filtered.map(device => {
          const chip = statusChip(device.status);
          const isActive = activeId === device.id;
          return (
            <button
              key={device.id}
              onClick={() => handleDeviceClick(device)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors group border-b border-white/5 last:border-0"
              style={{ background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent' }}
            >
              {/* Status dot */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: statusDot(device.status), boxShadow: `0 0 0 3px ${statusDot(device.status)}33` }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{device.name}</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: chip.bg, color: chip.text }}
                  >
                    {device.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 truncate">{device.location_name}</span>
                  <span className="text-slate-700 text-xs shrink-0">·</span>
                  <span className="text-xs text-slate-600 shrink-0">{timeAgo(device.last_seen_at)}</span>
                </div>
              </div>

              {/* Pan icon */}
              <svg
                className="text-slate-600 group-hover:text-blue-400 transition-colors shrink-0"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
