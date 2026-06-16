/**
 * Overview.tsx
 *
 * use npm install recharts to install the charting library.
 * 
 * Redesigned for the dark glass slide-over panel.
 * Same data as before, dark palette, compact layout that fits the panel width.
 * 24-Hour Trend now fetches water_level_m from Laravel API and renders a line chart.
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE = 'http://localhost:8000/api';

const metricCards = [
  { icon: '📡', label: 'Active Sensors', value: '24',     delta: '+2',   trend: 'up',   color: '#10b981' },
  { icon: '💧', label: 'Water Level',    value: '3.2m',   delta: '-0.4m',trend: 'down', color: '#3b82f6' },
  { icon: '🔔', label: 'Active Alerts',  value: '3',      delta: '0',    trend: 'flat', color: '#f59e0b' },
  { icon: '〜', label: 'Flow Rate',      value: '145 L/s',delta: '+12',  trend: 'up',   color: '#10b981' },
];

const recentAlerts = [
  { id: 'S-003', msg: 'Critical water level detected',    time: '2 min ago',  level: 'critical' },
  { id: 'S-001', msg: 'Water level above threshold',      time: '15 min ago', level: 'warning'  },
  { id: 'S-008', msg: 'Sensor communication restored',    time: '1 hour ago', level: 'info'     },
];

const levelChip: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.18)',  text: '#ef4444', dot: '#ef4444' },
  warning:  { bg: 'rgba(245,158,11,0.18)', text: '#f59e0b', dot: '#f59e0b' },
  info:     { bg: 'rgba(59,130,246,0.18)', text: '#60a5fa', dot: '#60a5fa' },
};

const trendIcon: Record<string, string> = { up: '↑', down: '↓', flat: '—' };

// ── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint {
  time: string;       // e.g. "14:30"
  level: number;      // water_level_m
}

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
  const [chartData, setChartData]   = useState<ChartPoint[]>([]);
  const [chartState, setChartState] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReadings() {
      try {
        setChartState('loading');

        const res = await fetch(`${API_BASE}/readings/last24hours`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { recorded_at: string; water_level_m: string | number }[] = await res.json();

        const points: ChartPoint[] = json.map((row) => ({
          time: new Date(row.recorded_at).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          level: parseFloat(String(row.water_level_m)),
        }));

        setChartData(points);
        setChartState('ok');
      } catch (err: any) {
        if (err.name !== 'AbortError') setChartState('error');
      }
    }

    fetchReadings();
    // Refresh every 60 s so the panel stays live
    const timer = setInterval(fetchReadings, 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  // Derive y-axis domain with a bit of breathing room
  const levels = chartData.map((d) => d.level);
  const minY = levels.length ? Math.max(0, Math.min(...levels) - 0.3) : 0;
  const maxY = levels.length ? Math.max(...levels) + 0.3 : 5;

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

      {/* 24-Hour Water Level Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            24-Hour Trend
          </h3>
          <span className="text-xs text-slate-600">Water Level (m)</span>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {chartState === 'loading' && (
            <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
              Loading readings…
            </div>
          )}

          {chartState === 'error' && (
            <div className="flex flex-col items-center justify-center h-32 gap-1">
              <span className="text-red-400 text-xs font-semibold">Could not load data</span>
              <span className="text-slate-600 text-xs">Check that the Laravel API is running</span>
            </div>
          )}

          {chartState === 'ok' && chartData.length === 0 && (
            <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
              No readings in the last 24 hours
            </div>
          )}

          {chartState === 'ok' && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={128}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="50%"  stopColor="#60a5fa" stopOpacity={1}   />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#475569', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />

                <YAxis
                  domain={[minY, maxY]}
                  tick={{ fill: '#475569', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(1)}m`}
                  width={38}
                />

                <Tooltip content={<WaterTooltip />} cursor={{ stroke: 'rgba(99,179,237,0.2)', strokeWidth: 1 }} />

                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="url(#lineGlow)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#60a5fa', stroke: 'rgba(96,165,250,0.3)', strokeWidth: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}