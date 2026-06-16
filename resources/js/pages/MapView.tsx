/**
 * MapView.tsx
 *
 * Full-viewport Mapbox map. Responsibilities:
 *  - Renders as 100% of its container (AppShell makes that 100vw × 100vh).
 *  - Fetches devices and drops markers.
 *  - On marker click: shows a floating DeviceDetailCard instead of navigating away.
 *  - Exposes flyTo + highlightDevice via MapContext so sidebar items can control the camera.
 *  - Floating controls: search/filter bar (top-left), map style + 2D/3D toggle (bottom-right).
 *
 * What changed from the original:
 *  - Removed `navigate('/devices/:id')` on marker click → replaced with in-map card.
 *  - Wired to MapContext so siblings can call flyTo().
 *  - Floating overlay structure is now Tailwind-based and theme-consistent.
 *  - height: calc(100vh - 52px) removed — this component now OWNS the viewport.
 *  - Added safer Mapbox token checking.
 *  - Added safer map container checking.
 *  - Added marker cleanup to avoid duplicate markers.
 *  - Made API response handling work with both `res.data.data` and plain `res.data`.
 *  - Converted latitude/longitude to numbers before passing them to Mapbox.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { useMap } from '../MapContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Device {
  id: number;
  name: string;
  location_name: string;
  area: string;
  status: string;
  latitude: number | string;
  longitude: number | string;
  elevation?: string;
  last_seen_at: string;
}

interface Reading {
  water_level_m: string;
  water_level_status: string;
  rainfall_mm: string;
  flow_speed_mps: string;
  battery_pct: number;
  signal_strength_pct: number;
  recorded_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === 'online') return '#10b981';
  if (status === 'warning') return '#f59e0b';
  return '#ef4444';
}

function statusLabel(status: string) {
  if (status === 'online') return { bg: 'rgba(16,185,129,0.18)', text: '#10b981' };
  if (status === 'warning') return { bg: 'rgba(245,158,11,0.18)', text: '#f59e0b' };
  return { bg: 'rgba(239,68,68,0.18)', text: '#ef4444' };
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hr ago`;
}

const MAP_STYLES = [
  { id: 'streets-v12', label: 'Streets' },
  { id: 'satellite-streets-v12', label: 'Satellite' },
  { id: 'dark-v11', label: 'Dark' },
  { id: 'light-v11', label: 'Light' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { mapRef, registerMarker } = useMap();

  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);

  const [is3D, setIs3D] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets-v12');
  const [showStylePicker, setShowStylePicker] = useState(false);

  // ── Clear existing markers ────────────────────────────────────────────────
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // ── Fetch latest reading for the detail card ──────────────────────────────
  const fetchLatestReading = useCallback((deviceId: number) => {
    setReadingLoading(true);
    setLatestReading(null);

    axios.get(`/api/devices/${deviceId}`)
      .then(res => {
        const payload = res.data?.data ?? res.data;
        const readings: Reading[] = payload?.readings ?? [];
        setLatestReading(readings?.[0] ?? null);
      })
      .catch(err => {
        console.error('Failed to load latest reading:', err);
        setLatestReading(null);
      })
      .finally(() => setReadingLoading(false));
  }, []);

  // ── Drop markers ──────────────────────────────────────────────────────────
  const dropMarkers = useCallback((data: Device[]) => {
    if (!mapRef.current) return;

    clearMarkers();

    data.forEach(device => {
      const lng = Number(device.longitude);
      const lat = Number(device.latitude);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        console.warn('Invalid device coordinates:', device);
        return;
      }

      // Custom marker element — a glowing dot
      const el = document.createElement('div');
      el.style.cssText = `
        width: 14px; height: 14px;
        background: ${statusColor(device.status)};
        border: 2.5px solid rgba(255,255,255,0.9);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 0 4px ${statusColor(device.status)}33;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.5)';
        el.style.boxShadow = `0 0 0 8px ${statusColor(device.status)}44`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.boxShadow = `0 0 0 4px ${statusColor(device.status)}33`;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
      registerMarker(device.id, marker);

      // On click: show floating card instead of navigating
      el.addEventListener('click', e => {
        e.stopPropagation(); // prevent map click from immediately closing

        setSelectedDevice(device);
        fetchLatestReading(device.id);

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 13,
          offset: [180, 0], // pan slightly right so card doesn't overlap
          speed: 1.4,
          curve: 1.4,
        });
      });
    });
  }, [mapRef, registerMarker, fetchLatestReading, clearMarkers]);

  // ── Fetch devices ─────────────────────────────────────────────────────────
  const fetchDevices = useCallback(() => {
    axios.get('/api/devices')
      .then(res => {
        const data: Device[] = res.data?.data ?? res.data ?? [];

        setDevices(data);
        setFilteredDevices(data);
        dropMarkers(data);
      })
      .catch(err => console.error('Failed to load devices:', err));
  }, [dropMarkers]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      console.error('Missing VITE_MAPBOX_TOKEN. Check your .env file and restart npm run dev.');
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [121.774, 12.879],
      zoom: 6,
      dragPan: true,
      dragRotate: true,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
    });

    map.on('load', () => {
      map.resize();
      fetchDevices();
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      fetchDevices();
    });

    // Close device card when clicking blank map
    map.on('click', () => {
      setSelectedDevice(null);
    });

    map.on('error', e => {
      console.error('Mapbox error:', e);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [mapRef, mapStyle, fetchDevices, clearMarkers]);

  // ── Search + filter ───────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.toLowerCase();

    const filtered = devices.filter(d => {
      const matchesSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.location_name?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredDevices(filtered);
    dropMarkers(filtered);
  }, [searchQuery, statusFilter, devices, dropMarkers]);

  // ── Toggle 3D terrain ─────────────────────────────────────────────────────
  const toggle3D = () => {
    if (!mapRef.current) return;

    if (!is3D) {
      if (!mapRef.current.getSource('mapbox-dem')) {
        mapRef.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }

      mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      mapRef.current.easeTo({ pitch: 50, bearing: -10, duration: 800 });
    } else {
      mapRef.current.setTerrain(null as any);
      mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }

    setIs3D(prev => !prev);
  };

  // ── Change map style ──────────────────────────────────────────────────────
  const changeStyle = (styleId: string) => {
    if (!mapRef.current) return;

    setMapStyle(styleId);
    setShowStylePicker(false);

    mapRef.current.setStyle(`mapbox://styles/mapbox/${styleId}`);

    // Re-drop markers after style loads.
    // Markers usually survive style changes, but this keeps behavior predictable.
    mapRef.current.once('styledata', () => {
      dropMarkers(filteredDevices);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
    borderRadius: '16px',
  };

  const { bg: selBg, text: selText } = selectedDevice
    ? statusLabel(selectedDevice.status)
    : { bg: '', text: '' };

  return (
    <div className="relative inset-0 w-full h-full overflow-hidden">

      {/* ── Map canvas ────────────────────────────────────────────────────── */}
      {/** Added w-full and h-full to maximize occupied space */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          cursor: 'grab',
          zIndex: 1,
        }}
      />

      {/* ── All overlays: pointer-events:none wrapper ──────────────────────
           Individual interactive children re-enable pointer-events.         */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        {/* ── Top-left: Search + filter bar ──────────────────────────────── */}
        <div
          className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto"
          style={{ width: 280 }}
        >
          {/* Search input */}
          <div className="relative" style={panelStyle}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search sensors…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm placeholder-slate-500 pl-9 pr-4 py-3 rounded-2xl outline-none"
            />
          </div>

          {/* Status filter chips */}
          <div className="flex gap-2">
            {['all', 'online', 'warning', 'offline'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
                style={{
                  background: statusFilter === s
                    ? s === 'all'
                      ? '#3b82f6'
                      : statusColor(s)
                    : 'rgba(15,23,42,0.80)',
                  color: statusFilter === s ? '#fff' : '#94a3b8',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Filtered result count only when filtering */}
          {(searchQuery || statusFilter !== 'all') && (
            <div
              className="text-xs text-slate-400 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(15,23,42,0.70)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {filteredDevices.length} sensor{filteredDevices.length !== 1 ? 's' : ''} shown
            </div>
          )}
        </div>

        {/* ── Bottom-right: Map controls ──────────────────────────────────── */}
        {/*
          Note: Mapbox's own NavigationControl is rendered at bottom-right.
          We stack our custom controls just above it via margin.
        */}
        <div
          className="absolute bottom-32 right-4 flex flex-col gap-2 pointer-events-auto"
          style={{ width: 120 }}
        >
          {/* 3D toggle */}
          <button
            onClick={toggle3D}
            className="text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            style={{
              ...panelStyle,
              color: is3D ? '#60a5fa' : '#94a3b8',
              border: is3D
                ? '1px solid rgba(96,165,250,0.4)'
                : '1px solid rgba(255,255,255,0.10)',
            }}
          >
            {is3D ? '🗺️ 2D' : '🏔️ 3D'}
          </button>

          {/* Style picker */}
          <div className="relative">
            <button
              onClick={() => setShowStylePicker(v => !v)}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-slate-300 transition-all"
              style={panelStyle}
            >
              🎨 Style
            </button>

            {showStylePicker && (
              <div
                className="absolute bottom-full right-0 mb-2 flex flex-col gap-1 p-1.5 rounded-xl"
                style={{ ...panelStyle, width: 130 }}
              >
                {MAP_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => changeStyle(s.id)}
                    className="text-left text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{
                      color: mapStyle === s.id ? '#60a5fa' : '#94a3b8',
                      background: mapStyle === s.id
                        ? 'rgba(96,165,250,0.15)'
                        : 'transparent',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom-left: Legend ─────────────────────────────────────────── */}
        <div
          className="absolute bottom-8 left-4 pointer-events-auto"
          style={{ ...panelStyle, padding: '12px 16px' }}
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Status
          </p>

          {[
            { color: '#10b981', label: 'Online' },
            { color: '#f59e0b', label: 'Warning' },
            { color: '#ef4444', label: 'Offline' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 0 3px ${color}33`,
                }}
              />
              <span className="text-slate-300 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Device detail pop-up card replaces page navigation ─────────── */}
        {selectedDevice && (
          <div
            className="absolute pointer-events-auto"
            style={{
              bottom: 32,
              right: 80, // leave room for Mapbox nav controls
              width: 300,
              ...panelStyle,
            }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between p-4 border-b border-white/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white text-sm font-semibold truncate">
                    {selectedDevice.name}
                  </h3>

                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: selBg, color: selText }}
                  >
                    {selectedDevice.status}
                  </span>
                </div>

                <p className="text-slate-400 text-xs truncate">
                  📍 {selectedDevice.location_name}
                </p>

                {selectedDevice.last_seen_at && (
                  <p className="text-slate-500 text-xs mt-1">
                    Last seen: {timeAgo(selectedDevice.last_seen_at)}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-500 hover:text-white ml-2 shrink-0 transition-colors"
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Readings */}
            <div className="p-4">
              {readingLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : latestReading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Water Level',
                      value: `${latestReading.water_level_m}m`,
                      accent: latestReading.water_level_status !== 'normal',
                    },
                    {
                      label: 'Rainfall',
                      value: `${latestReading.rainfall_mm}mm`,
                      accent: false,
                    },
                    {
                      label: 'Flow Speed',
                      value: `${latestReading.flow_speed_mps}m/s`,
                      accent: false,
                    },
                    {
                      label: 'Battery',
                      value: `${latestReading.battery_pct}%`,
                      accent: latestReading.battery_pct < 30,
                    },
                  ].map(({ label, value, accent }) => (
                    <div
                      key={label}
                      className="rounded-lg p-3"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <p className="text-slate-500 text-xs mb-1">{label}</p>
                      <p className={`text-sm font-semibold ${accent ? 'text-amber-400' : 'text-white'}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-2">
                  No recent readings
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <a
                  href={`/devices/${selectedDevice.id}`}
                  className="flex-1 text-center text-xs font-semibold py-2 rounded-lg text-white transition-colors"
                  style={{ background: '#3b82f6' }}
                >
                  View Details
                </a>
                <button
                  onClick={() => {
                    if (!mapRef.current) return;

                    mapRef.current.flyTo({
                      center: [
                        Number(selectedDevice.longitude),
                        Number(selectedDevice.latitude),
                      ],
                      zoom: 16,
                      speed: 1.2,
                    });
                  }}
                  className="px-3 py-2 rounded-lg text-slate-300 text-xs font-semibold transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  🎯 Zoom in
                </button>
              </div>
            </div>
          </div>
        )}

      </div>{/* /pointer-events-none overlay */}
    </div>
  );
}