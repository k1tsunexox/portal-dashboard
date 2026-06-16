import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveStream from '../components/LiveStream';
import axios from 'axios';

interface Reading {
    id: number;
    water_level_m: string;
    water_level_status: string;
    rainfall_mm: string;
    flow_speed_mps: string;
    battery_pct: number;
    signal_strength_pct: number;
    recorded_at: string;
}

interface Device {
    id: number;
    name: string;
    location_name: string;
    area: string;
    elevation: string;
    latitude: string;
    longitude: string;
    status: string;
    installed_at: string;
    last_seen_at: string;
    readings: Reading[];
}

function statusColor(status: string) {
    if (status === 'critical') return '#dc2626';
    if (status === 'warning') return '#d97706';
    return '#10b981';
}

function statusBg(status: string) {
    if (status === 'critical') return 'rgba(220,38,38,0.15)';
    if (status === 'warning') return 'rgba(217,119,6,0.15)';
    return 'rgba(16,185,129,0.15)';
}

function formatDate(str: string) {
    return new Date(str).toLocaleString('en-PH', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

export default function DeviceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get(`/api/devices/${id}`)
            .then(res => { setDevice(res.data.data); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
            Loading device...
        </div>
    );
    if (error || !device) return (
        <div style={{ padding: '20px', color: '#dc2626', fontSize: '13px' }}>
            Device not found.
        </div>
    );

    const latest = device.readings[0];

    const metricCards = [
        { label: 'Water Level', value: `${latest?.water_level_m ?? '—'}m`,  status: latest?.water_level_status ?? 'normal' },
        { label: 'Rainfall',    value: `${latest?.rainfall_mm ?? '—'}mm`,    status: 'normal' },
        { label: 'Battery',     value: `${latest?.battery_pct ?? '—'}%`,     status: (latest?.battery_pct ?? 100) < 30 ? 'critical' : 'normal' },
        { label: 'Signal',      value: `${latest?.signal_strength_pct ?? '—'}%`, status: (latest?.signal_strength_pct ?? 100) < 40 ? 'warning' : 'normal' },
    ];

    return (
        <div style={{ padding: '16px', color: '#e2e8f0' }}>

            {/* Back button */}
            <button
                onClick={() => navigate('/sensors')}
                style={{
                    background: 'none', border: 'none',
                    color: '#64748b', fontSize: '12px',
                    cursor: 'pointer', marginBottom: '12px',
                    padding: 0, display: 'flex', alignItems: 'center', gap: '4px',
                }}
            >
                ← Back to Sensors
            </button>

            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px', lineHeight: 1.3 }}>
                        {device.name}
                    </h1>
                    <span style={{
                        padding: '3px 10px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: 700,
                        background: statusBg(device.status),
                        color: statusColor(device.status),
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                        {device.status}
                    </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    📍 {device.location_name} · {device.area}
                </p>
            </div>

            {/* Metric Cards — 2x2 grid fits the sidebar width */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {metricCards.map(card => (
                    <div key={card.label} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${card.status !== 'normal' ? statusColor(card.status) + '66' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px',
                        padding: '12px',
                    }}>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px', fontWeight: 500 }}>
                            {card.label}
                        </p>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: statusColor(card.status), margin: '0 0 4px' }}>
                            {card.value}
                        </p>
                        <span style={{
                            fontSize: '10px', fontWeight: 700,
                            color: statusColor(card.status),
                            background: statusBg(card.status),
                            padding: '2px 6px', borderRadius: '4px',
                        }}>
                            {card.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Recent Readings — scrollable horizontally */}
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '14px',
                marginBottom: '8px',
            }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', margin: '0 0 10px' }}>
                    Recent Readings
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '480px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Time', 'Level', 'Status', 'Rain', 'Flow', 'Bat.', 'Sig.'].map(h => (
                                    <th key={h} style={{
                                        textAlign: 'left', padding: '6px 8px',
                                        color: '#475569', fontWeight: 500, whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {device.readings.map((r, i) => (
                                <tr key={r.id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    background: i === 0 ? 'rgba(16,185,129,0.08)' : 'transparent',
                                }}>
                                    <td style={{ padding: '7px 8px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                        {formatDate(r.recorded_at)}
                                    </td>
                                    <td style={{ padding: '7px 8px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                                        {r.water_level_m}m
                                    </td>
                                    <td style={{ padding: '7px 8px' }}>
                                        <span style={{
                                            color: statusColor(r.water_level_status),
                                            background: statusBg(r.water_level_status),
                                            padding: '1px 6px', borderRadius: '4px',
                                            fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
                                        }}>
                                            {r.water_level_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '7px 8px', color: '#94a3b8' }}>{r.rainfall_mm}mm</td>
                                    <td style={{ padding: '7px 8px', color: '#94a3b8' }}>{r.flow_speed_mps}m/s</td>
                                    <td style={{ padding: '7px 8px', fontWeight: 500, whiteSpace: 'nowrap', color: r.battery_pct < 30 ? '#dc2626' : '#10b981' }}>
                                        {r.battery_pct}%
                                    </td>
                                    <td style={{ padding: '7px 8px', fontWeight: 500, whiteSpace: 'nowrap', color: r.signal_strength_pct < 40 ? '#d97706' : '#10b981' }}>
                                        {r.signal_strength_pct}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Device Info */}
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '14px',
                marginBottom: '8px',
            }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', margin: '0 0 10px' }}>
                    Device Info
                </h2>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                        { label: 'Elevation',    value: `${device.elevation}m` },
                        { label: 'Coordinates',  value: `${device.latitude}, ${device.longitude}` },
                        { label: 'Installed',    value: formatDate(device.installed_at) },
                        { label: 'Last Seen',    value: formatDate(device.last_seen_at) },
                    ].map(row => (
                        <div key={row.label} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: '8px',
                            padding: '6px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <span style={{ color: '#475569', flexShrink: 0 }}>{row.label}</span>
                            <span style={{ color: '#cbd5e1', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Stream — your Role 4 component */}
            <LiveStream deviceId={device.id} />

        </div>
    );
}
