import React from 'react';

const metricCards = [
    { icon: '📡', label: 'Active Sensors', value: '24', change: '+2 from last hour', trend: '↑', color: '#10b981' },
    { icon: '💧', label: 'Water Level Avg', value: '3.2m', change: '-0.4m from last hour', trend: '↓', color: '#3b82f6' },
    { icon: '△', label: 'Active Alerts', value: '3', change: '0 from last hour', trend: '—', color: '#6b7280' },
    { icon: '〜', label: 'Flow Rate', value: '145 L/s', change: '+12 L/s from last hour', trend: '↑', color: '#10b981' },
];

const recentAlerts = [
    { id: 'S-003', msg: 'Critical water level detected', time: '2 min ago', level: 'critical' },
    { id: 'S-001', msg: 'Water level above threshold', time: '15 min ago', level: 'warning' },
    { id: 'S-008', msg: 'Sensor communication restored', time: '1 hour ago', level: 'info' },
];

function badge(level: string) {
    const styles: Record<string, React.CSSProperties> = {
        critical: { background: '#fee2e2', color: '#dc2626' },
        warning: { background: '#fef3c7', color: '#d97706' },
        info: { background: '#dbeafe', color: '#2563eb' },
    };
    return {
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        ...styles[level],
    } as React.CSSProperties;
}

export default function Overview() {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Dashboard Overview
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>
                Real-time flood monitoring and sensor status
            </p>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {metricCards.map(card => (
                    <div key={card.label} style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>{card.icon}</span>
                            <span style={{ color: card.color, fontSize: '16px', fontWeight: 600 }}>{card.trend}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>{card.label}</p>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{card.value}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{card.change}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
                {/* Chart */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>
                        24-Hour Water Level Trend
                    </h2>
                    <div style={{
                        height: '220px',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#93c5fd',
                        fontSize: '14px',
                    }}>
                        Chart loads here once Backend API is ready
                    </div>
                </div>

                {/* Recent Alerts */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>
                        Recent Alerts
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentAlerts.map(alert => (
                            <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{alert.id}</p>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{alert.msg}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{alert.time}</p>
                                </div>
                                <span style={badge(alert.level)}>{alert.level}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}