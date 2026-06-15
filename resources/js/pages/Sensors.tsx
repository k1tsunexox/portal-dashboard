import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Device {
    id: number;
    name: string;
    location_name: string;
    status: string;
    last_seen_at: string;
}

function statusBadge(status: string): React.CSSProperties {
    if (status === 'critical') return { color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
    if (status === 'warning') return { color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
    return { color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 };
}

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hr ago`;
}

export default function Sensors() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/devices')
            .then(res => {
                setDevices(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load devices:', err);
                setLoading(false);
            });
    }, []);

    const filtered = devices.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.location_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Sensor Management
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }}>
                Monitor and manage all flood sensors
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search sensors by name or location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#111827',
                        background: '#fff',
                        boxSizing: 'border-box',
                        outline: 'none',
                    }}
                />
            </div>

            {loading && (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading sensors...</p>
            )}

            {/* Sensor Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {filtered.map(device => (
                    <div
                        key={device.id}
                        onClick={() => navigate(`/devices/${device.id}`)}
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{device.name}</p>
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{device.location_name}</p>
                            </div>
                            <span style={statusBadge(device.status)}>{device.status}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                            Last seen {timeAgo(device.last_seen_at)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}