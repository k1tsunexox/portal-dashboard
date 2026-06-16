import React, { useState } from 'react';

const weeklyData = [
  { day: 'Mon', avg: 2.7, max: 3.5 },
  { day: 'Tue', avg: 3.0, max: 3.8 },
  { day: 'Wed', avg: 2.8, max: 3.4 },
  { day: 'Thu', avg: 3.3, max: 4.1 },
  { day: 'Fri', avg: 3.1, max: 3.8 },
  { day: 'Sat', avg: 2.6, max: 3.2 },
  { day: 'Sun', avg: 2.4, max: 2.9 },
];

const MAX_VAL = 5;  // tighter ceiling so bars fill the chart nicely
const BAR_H   = 160;
// Each day column is 52px wide; 7 days = 364px minimum scroll width
const BAR_COL_W = 52;

const CARD: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '18px',
};

export default function Analytics() {
    const [tab, setTab] = useState('Overview');
    const [range, setRange] = useState('Last 7 Days');

    return (
        <div className="flex flex-col gap-4 px-4 py-4 text-slate-300">

            {/* ── Header: title + date picker stacked ─────────────────────── */}
            {/*
              Stacking instead of a flex row prevents the picker from
              pushing the title off-screen in a 400px panel.
            */}
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

            {/* ── Tabs ────────────────────────────────────────────────────── */}
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
                            borderBottom: tab === t
                                ? '2px solid #3b82f6'
                                : '2px solid transparent',
                            background: 'transparent',
                            color: tab === t ? '#60a5fa' : '#64748b',
                            cursor: 'pointer',
                            marginBottom: '-1px',
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

            {/* ── Bar chart card ───────────────────────────────────────────── */}
            <div style={CARD}>
                <h3 className="text-white text-sm font-semibold mb-4">
                    Weekly Water Level Overview
                </h3>

                {/*
                  overflow-x: auto lets the chart scroll horizontally inside
                  the panel instead of clipping or wrapping bars.
                  The inner div is wide enough to show all 7 columns at full size.
                */}
                <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
                    <div
                        style={{
                            minWidth: BAR_COL_W * weeklyData.length + 40, // 40px for Y axis
                            position: 'relative',
                        }}
                    >
                        {/* Y-axis grid lines + labels */}
                        <div
                            style={{
                                position: 'relative',
                                height: BAR_H,
                                paddingLeft: 36,
                                marginBottom: 24, // room for day labels
                            }}
                        >
                            {/* Grid lines */}
                            {[MAX_VAL, MAX_VAL * 0.75, MAX_VAL * 0.5, MAX_VAL * 0.25, 0].map(v => (
                                <div
                                    key={v}
                                    style={{
                                        position: 'absolute',
                                        left: 36,
                                        right: 0,
                                        bottom: `${(v / MAX_VAL) * BAR_H}px`,
                                        borderTop: '1px solid rgba(255,255,255,0.07)',
                                    }}
                                />
                            ))}

                            {/* Y axis labels */}
                            {[MAX_VAL, MAX_VAL * 0.5, 0].map(v => (
                                <div
                                    key={v}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: `${(v / MAX_VAL) * BAR_H - 6}px`,
                                        fontSize: 10,
                                        color: '#475569',
                                        width: 30,
                                        textAlign: 'right',
                                    }}
                                >
                                    {v}m
                                </div>
                            ))}

                            {/* Bars */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 36,
                                    right: 0,
                                    bottom: 0,
                                    top: 0,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: 8,
                                    paddingRight: 8,
                                }}
                            >
                                {weeklyData.map(d => (
                                    <div
                                        key={d.day}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0,
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                gap: 3,
                                                height: '100%',
                                            }}
                                        >
                                            {/* Average bar */}
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
                                            {/* Max bar */}
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

                                        {/* Day label sits below the bar container */}
                                        <span
                                            style={{
                                                position: 'absolute',
                                                bottom: -20,
                                                fontSize: 11,
                                                color: '#64748b',
                                                whiteSpace: 'nowrap',
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

                {/* Legend */}
                <div className="flex gap-4 mt-2" style={{ paddingLeft: 36 }}>
                    {[
                        { color: '#3b82f6',            label: 'Average Level' },
                        { color: 'rgba(147,197,253,0.7)', label: 'Max Level'     },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div
                                style={{
                                    width: 10,
                                    height: 10,
                                    background: l.color,
                                    borderRadius: 2,
                                }}
                            />
                            <span className="text-slate-500 text-xs">{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
          ))}
        </div>
      </div>

            {/* ── Status Distribution ──────────────────────────────────────── */}
            {/*
              Single column now — the 1fr 1fr grid was the source of the
              squashed "Weekly Alert Frequency" card.
            */}
            <div style={CARD}>
                <h3 className="text-white text-sm font-semibold mb-4">
                    Status Distribution
                </h3>
                <div className="flex items-center gap-6">
                    {/* Donut */}
                    <div
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'conic-gradient(#10b981 0% 75%, #f59e0b 75% 91.7%, #ef4444 91.7% 100%)',
                            flexShrink: 0,
                        }}
                    />
                    {/* Legend */}
                    <div className="flex flex-col gap-3">
                        {[
                            { color: '#10b981', label: 'Normal',   count: 18 },
                            { color: '#f59e0b', label: 'Warning',  count: 4  },
                            { color: '#ef4444', label: 'Critical', count: 2  },
                        ].map(({ color, label, count }) => (
                            <div key={label} className="flex items-center gap-2.5">
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: color,
                                        boxShadow: `0 0 0 3px ${color}30`,
                                        flexShrink: 0,
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

            {/* ── Weekly Alert Frequency ───────────────────────────────────── */}
            {/*
              Now full-width and with a tall enough placeholder that the
              "Connect to API" text has room to breathe.
            */}
            <div style={CARD}>
                <h3 className="text-white text-sm font-semibold mb-4">
                    Weekly Alert Frequency
                </h3>
                <div
                    className="flex flex-col items-center justify-center gap-2 rounded-xl"
                    style={{
                        height: 120,
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.15)',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#ef4444" strokeWidth="1.8" opacity={0.5}>
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <span className="text-slate-500 text-xs text-center px-4">
                        Connect to API for live data
                    </span>
                </div>
            </div>

            {/* bottom breathing room */}
            <div style={{ height: 8 }} />
        </div>
    );
}
