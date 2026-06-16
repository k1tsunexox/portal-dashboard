import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE = '/api';

const MAX_VAL = 8;
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '18px',
};

interface WaterPoint {
  day: string;
  avg: number;
  max: number;
}

interface FrequencyPoint {
  day: string;
  normal: number;
  warning: number;
  critical: number;
  total: number;
}

function FrequencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 140,
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
        {label}
      </p>

      {payload.map((entry: any) => (
        <div
          key={entry.name}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}
        >
          <span style={{ color: entry.fill, fontSize: 11, textTransform: 'capitalize' }}>
            {entry.name}
          </span>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState('Overview');
  const [range, setRange] = useState('Last 7 Days');

  const [waterData, setWaterData] = useState<WaterPoint[]>([]);
  const [freqData, setFreqData] = useState<FrequencyPoint[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAnalytics() {
      try {
        setState('loading');

        const days = range === 'Last 30 Days' ? 30 : range === 'Last 90 Days' ? 90 : 7;

        const [waterRes, freqRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/last24Hrs`, { signal: controller.signal }),
          fetch(`${API_BASE}/analytics/alert-frequency?days=${days}`, {
            signal: controller.signal,
          }),
        ]);

        if (!waterRes.ok || !freqRes.ok) throw new Error('Failed to fetch analytics');

        const waterJson: { recorded_at: string; water_level_m: string | number }[] =
          await waterRes.json();

        const freqJson: {
          date: string;
          normal: number;
          warning: number;
          critical: number;
        }[] = await freqRes.json();

        const groupedWater = waterJson.reduce<Record<string, number[]>>((acc, row) => {
          const day = new Date(row.recorded_at).toLocaleDateString('en-PH', {
            weekday: 'short',
          });

          if (!acc[day]) acc[day] = [];
          acc[day].push(Number(row.water_level_m));

          return acc;
        }, {});

        const waterPoints = Object.entries(groupedWater).map(([day, values]) => ({
          day,
          avg: values.reduce((sum, value) => sum + value, 0) / values.length,
          max: Math.max(...values),
        }));

        const freqPoints = freqJson.map((row) => ({
          day: new Date(row.date).toLocaleDateString('en-PH', { weekday: 'short' }),
          normal: Number(row.normal ?? 0),
          warning: Number(row.warning ?? 0),
          critical: Number(row.critical ?? 0),
          total:
            Number(row.normal ?? 0) +
            Number(row.warning ?? 0) +
            Number(row.critical ?? 0),
        }));

        setWaterData(waterPoints);
        setFreqData(freqPoints);
        setState('ok');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setState('error');
        }
      }
    }

    fetchAnalytics();

    return () => controller.abort();
  }, [range]);

  const statusTotals = freqData.reduce(
    (acc, row) => ({
      normal: acc.normal + row.normal,
      warning: acc.warning + row.warning,
      critical: acc.critical + row.critical,
    }),
    { normal: 0, warning: 0, critical: 0 }
  );

  const statusTotal = statusTotals.normal + statusTotals.warning + statusTotals.critical || 1;

  const normalPct = (statusTotals.normal / statusTotal) * 100;
  const warningPct = normalPct + (statusTotals.warning / statusTotal) * 100;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 text-slate-300">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-white font-semibold text-base leading-tight">
            Analytics &amp; Reports
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Historical data and trend analysis
          </p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="self-start text-xs font-medium rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#cbd5e1',
          }}
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      <div
        className="flex gap-1"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        {['Overview', 'Trends', 'Performance'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs font-medium px-4 py-2.5 transition-colors"
            style={{
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent',
              color: tab === t ? '#60a5fa' : '#64748b',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={CARD}>
        <h3 className="text-white text-sm font-semibold mb-4">
          Water Level Overview
        </h3>

        {state === 'loading' && (
          <div className="h-32 flex items-center justify-center text-xs text-slate-600">
            Loading water level data…
          </div>
        )}

        {state === 'error' && (
          <div className="h-32 flex items-center justify-center text-xs text-red-400">
            Could not load analytics data.
          </div>
        )}

        {state === 'ok' && waterData.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={waterData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip />
              <Bar dataKey="avg" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="max" fill="rgba(147,197,253,0.7)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={CARD}>
        <h3 className="text-white text-sm font-semibold mb-4">Status Distribution</h3>

        <div className="flex items-center gap-6">
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `conic-gradient(#10b981 0% ${normalPct}%, #f59e0b ${normalPct}% ${warningPct}%, #ef4444 ${warningPct}% 100%)`,
              flexShrink: 0,
            }}
          />

          <div className="flex flex-col gap-3">
            {[
              { color: '#10b981', label: 'Normal', count: statusTotals.normal },
              { color: '#f59e0b', label: 'Warning', count: statusTotals.warning },
              { color: '#ef4444', label: 'Critical', count: statusTotals.critical },
            ].map(({ color, label, count }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 0 3px ${color}30`,
                  }}
                />
                <span className="text-slate-400 text-sm">
                  {label}: <span className="text-white font-semibold">{count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Alert Frequency</h3>
          <span className="text-xs text-slate-600">Readings / day</span>
        </div>

        {state === 'ok' && freqData.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={freqData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<FrequencyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="normal" stackId="a" fill="#10b981" />
              <Bar dataKey="warning" stackId="a" fill="#f59e0b" />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}