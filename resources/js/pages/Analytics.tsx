/**
 * Analytics.tsx
 *
 * Redesigned for the dark glass slide-over panel (400px wide).
 * Weekly Alert Frequency now fetches from Laravel API and renders
 * a stacked bar chart broken down by normal / warning / critical.
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const API_BASE = 'http://localhost:8000/api';

const weeklyData = [
  { day: 'Mon', avg: 2.7, max: 3.5 },
  { day: 'Tue', avg: 3.0, max: 3.8 },
  { day: 'Wed', avg: 2.8, max: 3.4 },
  { day: 'Thu', avg: 3.3, max: 4.1 },
  { day: 'Fri', avg: 3.1, max: 3.8 },
  { day: 'Sat', avg: 2.6, max: 3.2 },
  { day: 'Sun', avg: 2.4, max: 2.9 },
];

const MAX_VAL   = 5;
const BAR_H     = 160;
const BAR_COL_W = 52;

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '18px',
};

// ── Types ────────────────────────────────────────────────────────────────────

interface FrequencyPoint {
  day: string;      // e.g. "Mon"
  normal: number;
  warning: number;
  critical: number;
  total: number;
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────

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
        <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
          <span style={{ color: entry.fill, fontSize: 11, textTransform: 'capitalize' }}>
            {entry.name}
          </span>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
            {entry.value}
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          marginTop: 6,
          paddingTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: '#64748b', fontSize: 11 }}>Total</span>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
          {payload.reduce((s: number, e: any) => s + e.value, 0)}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [tab,   setTab]   = useState('Overview');
  const [range, setRange] = useState('Last 7 Days');

  const [freqData,  setFreqData]  = useState<FrequencyPoint[]>([]);
  const [freqState, setFreqState] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFrequency() {
      try {
        setFreqState('loading');

        const days = range === 'Last 30 Days' ? 30 : range === 'Last 90 Days' ? 90 : 7;
        const res  = await fetch(`${API_BASE}/readings/alert-frequency?days=${days}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Expected: [{ date: "2025-06-10", normal: 12, warning: 3, critical: 1 }, ...]
        const json: { date: string; normal: number; warning: number; critical: number }[] =
          await res.json();

        const points: FrequencyPoint[] = json.map((row) => ({
          day: new Date(row.date).toLocaleDateString('en-PH', { weekday: 'short' }),
          normal:   row.normal   ?? 0,
          warning:  row.warning  ?? 0,
          critical: row.critical ?? 0,
          total:    (row.normal ?? 0) + (row.warning ?? 0) + (row.critical ?? 0),
        }));

        setFreqData(points);
        setFreqState('ok');
      } catch (err: any) {
        if (err.name !== 'AbortError') setFreqState('error');
      }
    }

    fetchFrequency();
    return () => controller.abort();
  }, [range]); // re-fetch when date range changes

  return (
    <div className="flex flex-col gap-4 px-4 py-4 text-slate-300">

      {/* ── Header ──────────────────────────────────────────────────────── */}
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
          onChange={e => setRange(e.target.value)}
          className="self-start text-xs font-medium rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#cbd5e1',
            appearance: 'auto',
          }}
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex gap-1"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', paddingBottom: 0 }}
      >
        {['Overview', 'Trends', 'Performance'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs font-medium px-4 py-2.5 transition-colors"
            style={{
              border: 'none',
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent',
              color: tab === t ? '#60a5fa' : '#64748b',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Weekly Water Level Overview (existing bar chart) ─────────────── */}
      <div style={CARD}>
        <h3 className="text-white text-sm font-semibold mb-4">
          Weekly Water Level Overview
        </h3>
        <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <div style={{ minWidth: BAR_COL_W * weeklyData.length + 40, position: 'relative' }}>
            <div style={{ position: 'relative', height: BAR_H, paddingLeft: 36, marginBottom: 24 }}>
              {[MAX_VAL, MAX_VAL * 0.75, MAX_VAL * 0.5, MAX_VAL * 0.25, 0].map(v => (
                <div
                  key={v}
                  style={{
                    position: 'absolute', left: 36, right: 0,
                    bottom: `${(v / MAX_VAL) * BAR_H}px`,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                  }}
                />
              ))}
              {[MAX_VAL, MAX_VAL * 0.5, 0].map(v => (
                <div
                  key={v}
                  style={{
                    position: 'absolute', left: 0,
                    bottom: `${(v / MAX_VAL) * BAR_H - 6}px`,
                    fontSize: 10, color: '#475569', width: 30, textAlign: 'right',
                  }}
                >
                  {v}m
                </div>
              ))}
              <div
                style={{
                  position: 'absolute', left: 36, right: 0, bottom: 0, top: 0,
                  display: 'flex', alignItems: 'flex-end', gap: 8, paddingRight: 8,
                }}
              >
                {weeklyData.map(d => (
                  <div
                    key={d.day}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', height: '100%', justifyContent: 'flex-end',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%' }}>
                      <div
                        style={{
                          width: 14,
                          height: `${(d.avg / MAX_VAL) * BAR_H}px`,
                          background: '#3b82f6',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                        title={`${d.day} avg: ${d.avg}m`}
                      />
                      <div
                        style={{
                          width: 14,
                          height: `${(d.max / MAX_VAL) * BAR_H}px`,
                          background: 'rgba(147,197,253,0.55)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                        title={`${d.day} max: ${d.max}m`}
                      />
                    </div>
                    <span
                      style={{
                        position: 'absolute', bottom: -20,
                        fontSize: 11, color: '#64748b', whiteSpace: 'nowrap',
                      }}
                    >
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-2" style={{ paddingLeft: 36 }}>
          {[
            { color: '#3b82f6',               label: 'Average Level' },
            { color: 'rgba(147,197,253,0.7)', label: 'Max Level'     },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
              <span className="text-slate-500 text-xs">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Distribution ──────────────────────────────────────────── */}
      <div style={CARD}>
        <h3 className="text-white text-sm font-semibold mb-4">Status Distribution</h3>
        <div className="flex items-center gap-6">
          <div
            style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'conic-gradient(#10b981 0% 75%, #f59e0b 75% 91.7%, #ef4444 91.7% 100%)',
              flexShrink: 0,
            }}
          />
          <div className="flex flex-col gap-3">
            {[
              { color: '#10b981', label: 'Normal',   count: 18 },
              { color: '#f59e0b', label: 'Warning',  count: 4  },
              { color: '#ef4444', label: 'Critical', count: 2  },
            ].map(({ color, label, count }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: color, boxShadow: `0 0 0 3px ${color}30`, flexShrink: 0,
                  }}
                />
                <span className="text-slate-400 text-sm">
                  {label}:&nbsp;
                  <span className="text-white font-semibold">{count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly Alert Frequency ───────────────────────────────────────── */}
      <div style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Weekly Alert Frequency</h3>
          <span className="text-xs text-slate-600">Alerts / day</span>
        </div>

        {freqState === 'loading' && (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
            Loading alert data…
          </div>
        )}

        {freqState === 'error' && (
          <div className="flex flex-col items-center justify-center h-32 gap-1">
            <span className="text-red-400 text-xs font-semibold">Could not load data</span>
            <span className="text-slate-600 text-xs">Check that the Laravel API is running</span>
          </div>
        )}

        {freqState === 'ok' && freqData.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
            No alert data for this period
          </div>
        )}

        {freqState === 'ok' && freqData.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={freqData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="day"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />

              <Tooltip content={<FrequencyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />

              {/* Stacked bars: normal → warning → critical */}
              <Bar dataKey="normal"   stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="warning"  stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {freqState === 'ok' && freqData.length > 0 && (
          <div className="flex gap-4 mt-3">
            {[
              { color: '#10b981', label: 'Normal'   },
              { color: '#f59e0b', label: 'Warning'  },
              { color: '#ef4444', label: 'Critical' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, background: l.color, borderRadius: 2 }} />
                <span className="text-slate-500 text-xs">{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}