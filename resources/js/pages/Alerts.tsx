import React, { useState } from 'react';

const alertsData = [
    { id: 'S-003', location: 'Industrial Zone B', msg: 'Critical water level detected - Immediate action required', time: '2 min ago', date: '2026-06-11 14:32', level: 'critical' },
    { id: 'S-001', location: 'Downtown Station A', msg: 'Water level above threshold', time: '15 min ago', date: '2026-06-11 14:19', level: 'warning' },
    { id: 'S-007', location: 'North Gate Monitor', msg: 'Water level rising rapidly', time: '28 min ago', date: '2026-06-11 14:06', level: 'warning' },
    { id: 'S-005', location: 'Bridge Checkpoint', msg: 'Sensor back online', time: '1 hour ago', date: '2026-06-11 13:34', level: 'info' },
];

const resolvedData = [
    { id: 'S-002', location: 'Riverside Monitor', msg: 'Water level normalized', time: '2 hours ago', date: '2026-06-11 12:30', level: 'info' },
    { id: 'S-004', location: 'Residential Area C', msg: 'Battery level restored', time: '3 hours ago', date: '2026-06-11 11:15', level: 'info' },
    { id: 'S-006', location: 'East Valley Sensor', msg: 'Signal strength recovered', time: '5 hours ago', date: '2026-06-11 09:00', level: 'info' },
];

function levelIcon(level: string) {
    if (level === 'critical') return { icon: '🔴', badge: { background: '#fee2e2', color: '#dc2626' } };
    if (level === 'warning') return { icon: '🟡', badge: { background: '#fef3c7', color: '#d97706' } };
    return { icon: '🔵', badge: { background: '#dbeafe', color: '#2563eb' } };
}

export default function Alerts() {
    const [tab, setTab] = useState<'active' | 'resolved'>('active');
    const list = tab === 'active' ? alertsData : resolvedData;

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Alerts & Notifications
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>
                Monitor and manage system alerts
            </p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { icon: '🔴', label: 'Critical Alerts', value: '1' },
                    { icon: '🟡', label: 'Warnings', value: '2' },
                    { icon: '✅', label: 'Resolved Today', value: '3' },
                ].map(card => (
                    <div key={card.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '24px' }}>{card.icon}</span>
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{card.label}</p>
                            <p style={{ fontSize: '28px', fontWeight: 600, color: '#111827', margin: 0 }}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['active', 'resolved'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: tab === t ? '#111827' : '#fff',
                            color: tab === t ? '#fff' : '#6b7280',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        {t === 'active' ? `Active (${alertsData.length})` : `Resolved (${resolvedData.length})`}
                    </button>
                ))}
            </div>

            {/* Alert List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {list.map((alert, i) => {
                    const { icon, badge } = levelIcon(alert.level);
                    return (
                        <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ fontSize: '20px', marginTop: '2px' }}>{icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{alert.id}</span>
                                        <span style={{ ...badge, padding: '1px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                            {alert.level}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{alert.location}</p>
                                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px' }}>{alert.msg}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>🕐 {alert.time} · {alert.date}</p>
                                </div>
                            </div>
                            {tab === 'active' && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingLeft: '32px' }}>
                                    {['Acknowledge', 'Resolve'].map(btn => (
                                        <button key={btn} style={{
                                            padding: '6px 14px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            background: '#fff',
                                            color: '#374151',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                        }}>
                                            {btn}
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