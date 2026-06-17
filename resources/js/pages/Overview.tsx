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

const API_BASE = '/api';

interface ChartPoint {
  time: string;
  level: number;
}

interface DashboardSummary {
  active_sensors: number;
  total_sensors: number;
  water_level: string | number;
  flow_rate: string | number;
  active_alerts: number;
  recent_alerts?: RecentAlert[];
}

interface RecentAlert {
  id: number | string;
  sensor_code?: string;
  msg: string;
  time: string;
  level: 'critical' | 'warning' | 'info' | string;
}

const levelChip: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.18)', text: '#ef4444', dot: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.18)', text: '#f59e0b', dot: '#f59e0b' },
  info: { bg: 'rgba(59,130,246,0.18)', text: '#60a5fa', dot: '#60a5fa' },
};

const trendIcon: Record<string, string> = { up: '↑', down: '↓', flat: '—' };

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
        {Number(payload[0].value).toFixed(2)} m
      </p>
    </div>
  );
}

export default function Overview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartState, setChartState] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReadings() {
      try {
        setChartState('loading');

        const res = await fetch(`${API_BASE}/analytics/last24Hrs`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { recorded_at: string; water_level_m: string | number }[] =
          await res.json();

        const points = json.map((row) => ({
          time: new Date(row.recorded_at).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          level: Number(row.water_level_m),
        }));

        setChartData(points);
        setChartState('ok');
      } catch (err: any) {
        if (err.name !== 'AbortError') setChartState('error');
      }
    }

    fetchReadings();

    const timer = setInterval(fetchReadings, 60_000);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  const metricCards = [
    {
      icon: '📡',
      label: 'Active Sensors',
      value: summary ? String(summary.active_sensors) : '—',
      delta: summary ? `${summary.total_sensors} total` : '',
      color: '#10b981',
    },
    {
      icon: '💧',
      label: 'Water Level',
      value: summary ? `${Number(summary.water_level).toFixed(2)}m` : '—',
      delta: '',
      color: '#3b82f6',
    },
    {
      icon: '🔔',
      label: 'Active Alerts',
      value: summary ? String(summary.active_alerts) : '—',
      delta: '',
      color: '#f59e0b',
    },
    {
      icon: '〜',
      label: 'Flow Rate',
      value: summary ? `${Number(summary.flow_rate).toFixed(2)} m/s` : '—',
      delta: '',
      color: '#10b981',
    },
  ];

  const recentAlerts = summary?.recent_alerts ?? [];

  const levels = chartData.map((d) => d.level);
  const minY = levels.length ? Math.max(0, Math.min(...levels) - 0.3) : 0;
  const maxY = levels.length ? Math.max(...levels) + 0.3 : 5;

  return (
    <div className="flex flex-col gap-5 px-5 py-4 text-slate-300">
      <div>
        <h2 className="text-white font-semibold text-base">Dashboard Overview</h2>
        <p className="text-slate-500 text-xs mt-0.5">Real-time flood monitoring</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-3.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-base">{card.icon}</span>
              <span className="text-xs font-bold" style={{ color: card.color }}>
                {card.delta}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-1">{card.label}</p>
            <p className="text-white text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Recent Alerts
        </h3>

        <div className="flex flex-col gap-1.5">
          {recentAlerts.length === 0 && (
            <div className="text-slate-600 text-xs rounded-xl p-3 border border-white/10">
              No recent alerts
            </div>
          )}

          {recentAlerts.map((alert) => {
            const chip = levelChip[alert.level] ?? levelChip.info;

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: chip.dot }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-xs font-semibold">
                      {alert.sensor_code ?? alert.id}
                    </span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md capitalize"
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            24-Hour Trend
          </h3>
          <span className="text-xs text-slate-600">Water Level (m)</span>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
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
                  tickFormatter={(v) => `${Number(v).toFixed(1)}m`}
                  width={38}
                />

                <Tooltip
                  content={<WaterTooltip />}
                  cursor={{ stroke: 'rgba(99,179,237,0.2)', strokeWidth: 1 }}
                />

                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#60a5fa',
                    stroke: 'rgba(96,165,250,0.3)',
                    strokeWidth: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}