import React from 'react';

const metricCards = [
  { icon: '📡', label: 'Active Sensors', value: '24', delta: '+2',  trend: 'up',   color: '#10b981' },
  { icon: '💧', label: 'Water Level',    value: '3.2m', delta: '-0.4m', trend: 'down', color: '#3b82f6' },
  { icon: '🔔', label: 'Active Alerts',  value: '3',    delta: '0',     trend: 'flat', color: '#f59e0b' },
  { icon: '〜', label: 'Flow Rate',      value: '145 L/s', delta: '+12', trend: 'up', color: '#10b981' },
];

const recentAlerts = [
  { id: 'S-003', msg: 'Critical water level detected', time: '2 min ago', level: 'critical' },
  { id: 'S-001', msg: 'Water level above threshold',    time: '15 min ago', level: 'warning' },
  { id: 'S-008', msg: 'Sensor communication restored',  time: '1 hour ago', level: 'info'    },
];

const levelChip: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.18)',   text: '#ef4444', dot: '#ef4444' },
  warning:  { bg: 'rgba(245,158,11,0.18)',  text: '#f59e0b', dot: '#f59e0b' },
  info:     { bg: 'rgba(59,130,246,0.18)',  text: '#60a5fa', dot: '#60a5fa' },
};

const trendIcon: Record<string, string> = { up: '↑', down: '↓', flat: '—' };

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function WaterTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.92)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 10,
        padding: '8px 12px',
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#3b82f6', fontSize: 13, fontWeight: 700 }}>
        {payload[0].value.toFixed(2)} m
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Overview() {
  return (
    <div className="flex flex-col gap-5 px-5 py-4 text-slate-300">

      {/* Header */}
      <div>
        <h2 className="text-white font-semibold text-base">Dashboard Overview</h2>
        <p className="text-slate-500 text-xs mt-0.5">Real-time flood monitoring</p>
      </div>

      {/* Metric Cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {metricCards.map(card => (
          <div
            key={card.label}
            className="rounded-xl p-3.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-base">{card.icon}</span>
              <span className="text-xs font-bold" style={{ color: card.color }}>
                {trendIcon[card.trend]} {card.delta}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-1">{card.label}</p>
            <p className="text-white text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Recent Alerts</h3>
        <div className="flex flex-col gap-1.5">
          {recentAlerts.map(alert => {
            const chip = levelChip[alert.level];
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: chip.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-xs font-semibold">{alert.id}</span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: chip.bg, color: chip.text }}
                    >
                      {alert.level}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs truncate">{alert.msg}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{alert.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart placeholder */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">24-Hour Trend</h3>
        <div
          className="rounded-xl flex items-center justify-center h-32 text-slate-600 text-xs text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          Chart renders once<br />API data is connected
        </div>
      </div>

    </div>
  );
}
