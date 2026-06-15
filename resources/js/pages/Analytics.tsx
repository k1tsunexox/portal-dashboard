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

const MAX_VAL = 8;
const BAR_H = 200;

export default function Analytics() {
    const [tab, setTab] = useState('Overview');

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 }}>Analytics & Reports</h1>
                <select style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', color: '#374151', background: '#fff' }}>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                </select>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>Historical data and trend analysis</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '0' }}>
                {['Overview', 'Trends', 'Performance'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
                            background: 'transparent',
                            color: tab === t ? '#2563eb' : '#6b7280',
                            fontSize: '14px',
                            fontWeight: tab === t ? 500 : 400,
                            cursor: 'pointer',
                            marginBottom: '-1px',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Bar Chart */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Weekly Water Level Overview</h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: `${BAR_H}px`, paddingLeft: '40px', position: 'relative' }}>
                    {/* Y axis labels */}
                    {[8, 6, 4, 2, 0].map(v => (
                        <div key={v} style={{ position: 'absolute', left: 0, bottom: `${(v / MAX_VAL) * BAR_H}px`, fontSize: '11px', color: '#9ca3af', transform: 'translateY(50%)' }}>{v}</div>
                    ))}
                    {weeklyData.map(d => (
                        <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${BAR_H}px` }}>
                                <div style={{ width: '20px', height: `${(d.avg / MAX_VAL) * BAR_H}px`, background: '#3b82f6', borderRadius: '3px 3px 0 0' }} />
                                <div style={{ width: '20px', height: `${(d.max / MAX_VAL) * BAR_H}px`, background: '#93c5fd', borderRadius: '3px 3px 0 0' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{d.day}</span>
                        </div>
                    ))}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingLeft: '40px' }}>
                    {[{ color: '#3b82f6', label: 'Average Level' }, { color: '#93c5fd', label: 'Max Level' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                            <div style={{ width: '12px', height: '12px', background: l.color, borderRadius: '2px' }} />
                            {l.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Pie Chart placeholder */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Sensor Status Distribution</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#10b981 0% 75%, #f59e0b 75% 92%, #ef4444 92% 100%)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[{ color: '#10b981', label: 'Normal: 18' }, { color: '#f59e0b', label: 'Warning: 4' }, { color: '#ef4444', label: 'Critical: 2' }].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Line chart placeholder */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Weekly Alert Frequency</h2>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px', background: '#fef2f2', borderRadius: '8px' }}>
                        Connect to API for live data
                    </div>
                </div>
            </div>
        </div>
    );
}