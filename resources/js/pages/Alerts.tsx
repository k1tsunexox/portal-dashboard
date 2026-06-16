import React, { useEffect, useState } from 'react';

const API_BASE = '/api';

type AlertLevel = 'critical' | 'warning' | 'info' | string;

interface FloodAlert {
  id: number | string;
  sensor_code?: string;
  location?: string;
  msg: string;
  time?: string;
  level: AlertLevel;
  is_active: boolean;
}

const levelConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: 'rgba(239,68,68,0.18)', text: '#ef4444', dot: '#ef4444', label: 'Critical' },
  warning: { bg: 'rgba(245,158,11,0.18)', text: '#f59e0b', dot: '#f59e0b', label: 'Warning' },
  info: { bg: 'rgba(59,130,246,0.18)', text: '#60a5fa', dot: '#60a5fa', label: 'Info' },
};

export default function Alerts() {
  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setStatus('loading');

        const res = await fetch(`${API_BASE}/alerts`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        setAlerts(data);
        setStatus('ok');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    }

    fetchAlerts();

    const timer = setInterval(fetchAlerts, 60_000);

    return () => clearInterval(timer);
  }, []);

  const activeAlerts = alerts.filter((a) => a.is_active);
  const resolvedAlerts = alerts.filter((a) => !a.is_active);
  const list = tab === 'active' ? activeAlerts : resolvedAlerts;

  const critCount = activeAlerts.filter((a) => a.level === 'critical').length;
  const warnCount = activeAlerts.filter((a) => a.level === 'warning').length;

  return (
    <div className="flex flex-col h-full text-slate-300">
      <div className="flex gap-3 px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
        {[
          { label: 'Critical', count: critCount, color: '#ef4444' },
          { label: 'Warning', count: warnCount, color: '#f59e0b' },
          { label: 'Resolved', count: resolvedAlerts.length, color: '#10b981' },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="flex-1 rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div className="text-xl font-bold" style={{ color }}>
              {count}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        {(['active', 'resolved'] as const).map((t) => (
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
            {t === 'active'
              ? `Active (${activeAlerts.length})`
              : `Resolved (${resolvedAlerts.length})`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {status === 'loading' && (
          <div className="px-5 py-4 text-xs text-slate-500">Loading alerts…</div>
        )}

        {status === 'error' && (
          <div className="px-5 py-4 text-xs text-red-400">
            Failed to load alerts. Check Laravel API.
          </div>
        )}

        {status === 'ok' && list.length === 0 && (
          <div className="mx-3 mt-2 rounded-xl p-4 text-xs text-slate-500 border border-white/10">
            No {tab} alerts.
          </div>
        )}

        {status === 'ok' &&
          list.map((alert) => {
            const cfg = levelConfig[alert.level] ?? levelConfig.info;

            return (
              <div
                key={alert.id}
                className="mx-3 mb-2 rounded-xl p-3.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{
                      background: cfg.dot,
                      boxShadow: `0 0 0 3px ${cfg.dot}33`,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-semibold">
                        {alert.sensor_code ?? `#${alert.id}`}
                      </span>

                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mb-1">
                      {alert.location ?? 'Unknown location'}
                    </p>

                    <p className="text-slate-300 text-xs">{alert.msg}</p>

                    <p className="text-slate-600 text-xs mt-1.5">
                      🕐 {alert.time ?? 'Unknown time'}
                    </p>
                  </div>
                </div>

                {tab === 'active' && alert.level !== 'info' && (
                  <div className="flex gap-2 mt-3">
                    {['Acknowledge', 'Resolve'].map((label) => (
                      <button
                        key={label}
                        className="flex-1 text-xs font-medium py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}
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