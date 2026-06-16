import { useState, useEffect } from 'react';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────
// Field names confirmed directly from DeviceController.php stream() method.
// The stream endpoint selects these exact columns from the readings table.
interface StreamReading {
    id: number;
    device_id: number;
    water_level_m: string;        // cast as decimal:2 in Reading.php, arrives as string
    water_level_status: string;   // 'normal' | 'warning' | 'critical' — set by backend logic
    rainfall_mm: string;
    flow_speed_mps: string;
    battery_pct: number;
    signal_strength_dbm: number;
    signal_strength_pct: number;
    recorded_at: string;
}

// The stream endpoint also returns the updated device info alongside readings.
// We use this to show the device's current live status in the header.
interface StreamDevice {
    id: number;
    name: string;
    location_name: string;
    status: string;
    last_seen_at: string;
}

interface LiveStreamProps {
    deviceId: number;
}

// ── Helpers — match DeviceDetail.tsx dark theme exactly ───────────────────────
function statusColor(status: string): string {
    if (status === 'critical') return '#dc2626';
    if (status === 'warning') return '#d97706';
    return '#10b981';
}

function statusBg(status: string): string {
    if (status === 'critical') return 'rgba(220,38,38,0.15)';
    if (status === 'warning') return 'rgba(217,119,6,0.15)';
    return 'rgba(16,185,129,0.15)';
}

// Shortened format to fit the narrow sidebar column
function formatDate(str: string): string {
    return new Date(str).toLocaleString('en-PH', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveStream({ deviceId }: LiveStreamProps) {
    const [readings, setReadings] = useState<StreamReading[]>([]);
    const [liveDevice, setLiveDevice] = useState<StreamDevice | null>(null);
    const [isPolling, setIsPolling] = useState<boolean>(true);
    const [lastInserted, setLastInserted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // When paused, bail early — no interval created, no requests fired.
        // Confirm by opening browser Network tab and clicking Pause.
        if (!isPolling) return;

        const fetchLatest = () => {
            axios
                .get(`/api/devices/${deviceId}/stream`)
                .then((res) => {
                    // The stream endpoint returns:
                    //   res.data.data     → array of latest 10 readings (newest first)
                    //   res.data.device   → updated device info (status, last_seen_at)
                    //   res.data.inserted → whether a new reading was generated this tick
                    setReadings(res.data.data);
                    setLiveDevice(res.data.device);
                    setLastInserted(res.data.inserted);
                    setError(null);
                })
                .catch(() => {
                    // Always attach .catch() — a bare .then() swallows network
                    // failures silently and leaves the table frozen with no user feedback.
                    setError('Stream unavailable. Retrying...');
                });
        };

        // Fetch immediately so the table isn't blank during the first 5-second wait.
        fetchLatest();

        // Poll every 5 seconds to simulate live sensor activity.
        // The backend stream() has a 60% chance of inserting a new reading each call,
        // so the data feels live but not perfectly predictable.
        const intervalId = setInterval(fetchLatest, 5000);

        // ── CRITICAL CLEANUP ──────────────────────────────────────────────────
        // This return runs when the component unmounts OR when deviceId / isPolling
        // changes (before the effect re-runs with new values).
        //
        // WITHOUT clearInterval here is what happens:
        //   1. User opens DeviceDetail → interval starts, polling every 5s.
        //   2. User navigates away → component unmounts, but the interval
        //      keeps firing in the background.
        //   3. Every navigation stacks a NEW interval on top of the old one.
        //   4. Ten navigations = ten simultaneous intervals all calling
        //      setReadings on a component that no longer exists in the DOM.
        //   5. Result: memory leak, race conditions, display stops updating.
        //      This is the exact production bug this task is modelling.
        //
        // clearInterval is the fix. This line must never be removed.
        return () => clearInterval(intervalId);

    }, [deviceId, isPolling]);
    // deviceId in the dependency array: if user navigates from /devices/1 to
    // /devices/2, the old interval is cleared and a new one starts automatically.

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '14px',
            marginTop: '8px',
        }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', margin: 0 }}>
                        Live Sensor Stream
                    </h2>

                    {/* Animated dot — @keyframes livestream-pulse is already in app.css */}
                    <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        flexShrink: 0,
                        background: isPolling ? '#10b981' : '#475569',
                        animation: isPolling ? 'livestream-pulse 1.5s ease-in-out infinite' : 'none',
                    }} />

                    <span style={{ fontSize: '11px', color: '#475569' }}>
                        {isPolling ? 'Live' : 'Paused'}
                    </span>

                    {/* Shows whether the last poll inserted a new reading (60% chance from backend) */}
                    {isPolling && (
                        <span style={{
                            fontSize: '10px', fontWeight: 700,
                            padding: '1px 6px', borderRadius: '4px',
                            background: lastInserted ? 'rgba(16,185,129,0.15)' : 'rgba(71,85,105,0.3)',
                            color: lastInserted ? '#10b981' : '#475569',
                        }}>
                            {lastInserted ? '+ new' : 'no change'}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {/* Live device status badge — updates in real time from stream response */}
                    {liveDevice && (
                        <span style={{
                            fontSize: '10px', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '4px',
                            background: statusBg(liveDevice.status),
                            color: statusColor(liveDevice.status),
                        }}>
                            {liveDevice.status}
                        </span>
                    )}

                    {/* Pause / Resume — toggling isPolling false causes the useEffect
                        to hit the early return, so no interval is created and
                        all network requests stop until the user resumes. */}
                    <button
                        onClick={() => setIsPolling(prev => !prev)}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '11px',
                            background: isPolling ? 'rgba(220,38,38,0.15)' : 'rgba(16,185,129,0.15)',
                            color: isPolling ? '#dc2626' : '#10b981',
                        }}
                    >
                        {isPolling ? '⏸ Pause' : '▶ Resume'}
                    </button>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div style={{
                    background: 'rgba(220,38,38,0.15)',
                    color: '#dc2626',
                    fontSize: '11px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                }}>
                    ⚠ {error}
                </div>
            )}

            {/* ── Loading state ── */}
            {readings.length === 0 && !error && (
                <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    Waiting for stream data...
                </p>
            )}

            {/* ── Readings table — scrollable horizontally to fit sidebar ── */}
            {readings.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '520px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Time', 'Level', 'Status', 'Rain', 'Flow', 'Bat.', 'dBm', 'Sig.'].map(h => (
                                    <th key={h} style={{
                                        textAlign: 'left',
                                        padding: '6px 8px',
                                        color: '#475569',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map((r, i) => {
                                // Index 0 = most recent (API returns newest first via orderByDesc).
                                // Highlight so operators instantly spot the latest reading.
                                const isLatest = i === 0;
                                return (
                                    <tr key={r.id} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        background: isLatest ? 'rgba(16,185,129,0.08)' : 'transparent',
                                        transition: 'background 0.3s',
                                    }}>
                                        <td style={{ padding: '7px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {formatDate(r.recorded_at)}
                                        </td>
                                        <td style={{ padding: '7px 8px', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                                            {r.water_level_m}m
                                        </td>
                                        <td style={{ padding: '7px 8px' }}>
                                            <span style={{
                                                color: statusColor(r.water_level_status),
                                                background: statusBg(r.water_level_status),
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {r.water_level_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '7px 8px', color: '#94a3b8' }}>{r.rainfall_mm}mm</td>
                                        <td style={{ padding: '7px 8px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{r.flow_speed_mps}m/s</td>
                                        <td style={{ padding: '7px 8px', fontWeight: 600, whiteSpace: 'nowrap', color: r.battery_pct < 30 ? '#dc2626' : '#10b981' }}>
                                            {r.battery_pct}%
                                        </td>
                                        <td style={{ padding: '7px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {r.signal_strength_dbm}
                                        </td>
                                        <td style={{ padding: '7px 8px', fontWeight: 600, whiteSpace: 'nowrap', color: r.signal_strength_pct < 40 ? '#d97706' : '#10b981' }}>
                                            {r.signal_strength_pct}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}