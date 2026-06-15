import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function getMarkerColor(status: string) {
    if (status === 'online') return '#16a34a';
    if (status === 'warning') return '#d97706';
    return '#dc2626';
}

export default function MapView() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [is3D, setIs3D] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [121.774, 12.879],
            zoom: 6,
            // Explicitly enable all interaction handlers
            dragPan: true,
            dragRotate: true,
            scrollZoom: true,
            touchZoomRotate: true,
            doubleClickZoom: true,
        });

        map.current.on('load', () => {
            fetchAndDropMarkers();
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    function fetchAndDropMarkers() {
        axios.get('/api/devices')
            .then(res => {
                res.data.data.forEach((device: any) => {
                    const marker = new mapboxgl.Marker({ color: getMarkerColor(device.status) })
                        .setLngLat([device.longitude, device.latitude])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                            <div style="font-family: Inter, sans-serif; padding: 4px;">
                                <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px; color: #111827;">${device.name}</p>
                                <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px;">📍 ${device.location_name}</p>
                                <span style="
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 8px;
                                    border-radius: 4px;
                                    background: ${device.status === 'online' ? '#d1fae5' : device.status === 'warning' ? '#fef3c7' : '#fee2e2'};
                                    color: ${device.status === 'online' ? '#065f46' : device.status === 'warning' ? '#92400e' : '#991b1b'};
                                ">${device.status}</span>
                            </div>
                        `))
                        .addTo(map.current!);

                    marker.getElement().addEventListener('click', () => {
                        navigate(`/devices/${device.id}`);
                    });
                });
            })
            .catch(err => console.error('Failed to load devices:', err));
    }

    function toggleView() {
        if (!map.current) return;
        if (!is3D) {
            if (!map.current.getSource('mapbox-dem')) {
                map.current.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14,
                });
            }
            map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            map.current.easeTo({ pitch: 50, bearing: -10, duration: 800 });
        } else {
            map.current.setTerrain(null);
            map.current.easeTo({ pitch: 0, bearing: 0, duration: 800 });
        }
        setIs3D(prev => !prev);
    }

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 52px)',
            // Ensure the wrapper never blocks mouse events from reaching the map
            overflow: 'hidden',
        }}>
            {/* Map container — must have explicit dimensions and no pointer interference */}
            <div
                ref={mapContainer}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // cursor changes to grab when dragging
                    cursor: 'grab',
                }}
            />

            {/* Overlay controls — pointer-events only on the buttons themselves, not the wrapper */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // This lets all mouse events pass through to the map underneath
                pointerEvents: 'none',
                zIndex: 10,
            }}>
                {/* Toggle button — re-enable pointer events just for this button */}
                <button
                    onClick={toggleView}
                    style={{
                        pointerEvents: 'auto',
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        padding: '10px 18px',
                        background: '#ffffff',
                        color: is3D ? '#2563eb' : '#374151',
                        border: `1px solid ${is3D ? '#2563eb' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.15s ease',
                    }}
                >
                    {is3D ? '🗺️ Switch to 2D' : '🏔️ Switch to 3D'}
                </button>

                {/* Legend — re-enable pointer events just for this element */}
                <div style={{
                    pointerEvents: 'auto',
                    position: 'absolute',
                    bottom: '32px',
                    left: '16px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Sensor Status</p>
                    {[
                        { color: '#16a34a', label: 'Online' },
                        { color: '#d97706', label: 'Warning' },
                        { color: '#dc2626', label: 'Offline' },
                    ].map(({ color, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                            <span style={{ color: '#6b7280' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}