import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    if (status === 'critical') return '#fee2e2';
    if (status === 'warning') return '#fef3c7';
    return '#d1fae5';
}

function formatDate(str: string) {
    return new Date(str).toLocaleString();
}

export default function DeviceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get(`/api/devices/${id}`)
            .then(res => {
                setDevice(res.data.data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ padding: '24px', color: '#6b7280' }}>Loading device...</div>;
    if (error || !device) return <div style={{ padding: '24px', color: '#dc2626' }}>Device not found.</div>;

    const latest = device.readings[0];

    const metricCards = [
        { label: 'Water Level', value: `${latest?.water_level_m ?? '—'}m`, status: latest?.water_level_status ?? 'normal' },
        { label: 'Rainfall', value: `${latest?.rainfall_mm ?? '—'}mm`, status: 'normal' },
        { label: 'Battery', value: `${latest?.battery_pct ?? '—'}%`, status: (latest?.battery_pct ?? 100) < 30 ? 'critical' : 'normal' },
        { label: 'Signal', value: `${latest?.signal_strength_pct ?? '—'}%`, status: (latest?.signal_strength_pct ?? 100) < 40 ? 'warning' : 'normal' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Back button */}
            <button
                onClick={() => navigate('/sensors')}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
            >
                ← Back to Sensors
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{device.name}</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>📍 {device.location_name} · {device.area}</p>
                </div>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: statusBg(device.status),
                    color: statusColor(device.status),
                }}>
                    {device.status}
                </span>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {metricCards.map(card => (
                    <div key={card.label} style={{
                        background: '#fff',
                        border: `1px solid ${card.status !== 'normal' ? statusColor(card.status) : '#e5e7eb'}`,
                        borderRadius: '10px',
                        padding: '20px',
                    }}>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>{card.label}</p>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: statusColor(card.status), margin: '0 0 4px' }}>{card.value}</p>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: statusColor(card.status),
                            background: statusBg(card.status),
                            padding: '2px 8px',
                            borderRadius: '4px',
                        }}>
                            {card.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Readings Table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Recent Readings</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {['Recorded At', 'Water Level', 'Status', 'Rainfall', 'Flow Speed', 'Battery', 'Signal'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {device.readings.map((r, i) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', background: i === 0 ? '#f0fdf4' : 'transparent' }}>
                                <td style={{ padding: '10px 12px', color: '#374151' }}>{formatDate(r.recorded_at)}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>{r.water_level_m}m</td>
                                <td style={{ padding: '10px 12px' }}>
                                    <span style={{ color: statusColor(r.water_level_status), background: statusBg(r.water_level_status), padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                        {r.water_level_status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 12px', color: '#374151' }}>{r.rainfall_mm}mm</td>
                                <td style={{ padding: '10px 12px', color: '#374151' }}>{r.flow_speed_mps} m/s</td>
                                <td style={{ padding: '10px 12px', color: r.battery_pct < 30 ? '#dc2626' : '#10b981', fontWeight: 500 }}>{r.battery_pct}%</td>
                                <td style={{ padding: '10px 12px', color: r.signal_strength_pct < 40 ? '#d97706' : '#10b981', fontWeight: 500 }}>{r.signal_strength_pct}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Device Info */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginTop: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Device Info</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    {[
                        { label: 'Elevation', value: `${device.elevation}m` },
                        { label: 'Coordinates', value: `${device.latitude}, ${device.longitude}` },
                        { label: 'Installed', value: formatDate(device.installed_at) },
                        { label: 'Last Seen', value: formatDate(device.last_seen_at) },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ color: '#6b7280' }}>{row.label}</span>
                            <span style={{ color: '#111827', fontWeight: 500 }}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
