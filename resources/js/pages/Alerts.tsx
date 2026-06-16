/**
 * Alerts.tsx
 *
 * Redesigned for the dark glass slide-over panel.
 * Compact, scannable alert list with active/resolved tabs.
 */

import React, { useState } from 'react';

const alertsData = [
  { id: 'S-003', location: 'Industrial Zone B',   msg: 'Critical water level — immediate action required', time: '2 min ago',  level: 'critical' },
  { id: 'S-001', location: 'Downtown Station A',  msg: 'Water level above threshold',                      time: '15 min ago', level: 'warning'  },
  { id: 'S-007', location: 'North Gate Monitor',  msg: 'Water level rising rapidly',                       time: '28 min ago', level: 'warning'  },
  { id: 'S-005', location: 'Bridge Checkpoint',   msg: 'Sensor back online',                               time: '1 hour ago', level: 'info'     },
];

const resolvedData = [
  { id: 'S-002', location: 'Riverside Monitor',   msg: 'Water level normalized',      time: '2 hours ago', level: 'info' },
  { id: 'S-004', location: 'Residential Area C',  msg: 'Battery level restored',      time: '3 hours ago', level: 'info' },
  { id: 'S-006', location: 'East Valley Sensor',  msg: 'Signal strength recovered',   time: '5 hours ago', level: 'info' },
];

const levelConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: 'rgba(239,68,68,0.18)',  text: '#ef4444', dot: '#ef4444', label: 'Critical' },
  warning:  { bg: 'rgba(245,158,11,0.18)', text: '#f59e0b', dot: '#f59e0b', label: 'Warning'  },
  info:     { bg: 'rgba(59,130,246,0.18)', text: '#60a5fa', dot: '#60a5fa', label: 'Info'     },
};

export default function Alerts() {
  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const list = tab === 'active' ? alertsData : resolvedData;

  const critCount = alertsData.filter(a => a.level === 'critical').length;
  const warnCount = alertsData.filter(a => a.level === 'warning').length;

  return (
    <div className="flex flex-col h-full text-slate-300">

      {/* Summary strip */}
      <div className="flex gap-3 px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
        {[
          { label: 'Critical', count: critCount,        color: '#ef4444' },
          { label: 'Warning',  count: warnCount,        color: '#f59e0b' },
          { label: 'Resolved', count: resolvedData.length, color: '#10b981' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="text-xl font-bold" style={{ color }}>{count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        {(['active', 'resolved'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t ? '#3b82f6' : 'rgba(255,255,255,0.06)',
              color: tab === t ? '#fff' : '#64748b',
              border: tab === t ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {t === 'active' ? `Active (${alertsData.length})` : `Resolved (${resolvedData.length})`}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto py-2">
        {list.map((alert, i) => {
          const cfg = levelConfig[alert.level];
          return (
            <div
              key={i}
              className="mx-3 mb-2 rounded-xl p-3.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-3">
                {/* Dot */}
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.dot}33` }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-xs font-semibold">{alert.id}</span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-1">{alert.location}</p>
                  <p className="text-slate-300 text-xs">{alert.msg}</p>
                  <p className="text-slate-600 text-xs mt-1.5">🕐 {alert.time}</p>
                </div>
              </div>

              {/* Action buttons for active alerts */}
              {tab === 'active' && alert.level !== 'info' && (
                <div className="flex gap-2 mt-3">
                  {['Acknowledge', 'Resolve'].map(label => (
                    <button
                      key={label}
                      className="flex-1 text-xs font-medium py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
