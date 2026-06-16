/**
 * MapContext.tsx
 *
 * Provides a shared map ref + imperative helpers so any component in the tree
 * can fly the camera to a device, trigger marker highlights, etc. without
 * prop-drilling through AppShell.
 *
 * Usage:
 *   const { flyTo, highlightDevice } = useMap();
 *   flyTo(device.longitude, device.latitude, 14);
 */

import React, { createContext, useContext, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContextValue {
  /** The raw Mapbox map instance. Read-only — don't store a copy. */
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  /** Smoothly pan + zoom the camera to a [lng, lat] position. */
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  /** Pulse a marker for a given device id (requires markers to be registered). */
  highlightDevice: (deviceId: number) => void;
  /** Internal: register a marker so it can be highlighted later. */
  registerMarker: (deviceId: number, marker: mapboxgl.Marker) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // deviceId → marker element, so we can add a CSS pulse class on demand
  const markerRegistry = useRef<Map<number, mapboxgl.Marker>>(new Map());

  const flyTo = useCallback((lng: number, lat: number, zoom = 14) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      speed: 1.4,
      curve: 1.4,
      easing: (t) => t,
    });
  }, []);

  const registerMarker = useCallback((deviceId: number, marker: mapboxgl.Marker) => {
    markerRegistry.current.set(deviceId, marker);
  }, []);

  const highlightDevice = useCallback((deviceId: number) => {
    markerRegistry.current.forEach((m, id) => {
      const el = m.getElement();
      el.style.zIndex = id === deviceId ? '10' : '';
      el.style.transform = id === deviceId ? 'scale(1.35)' : '';
      el.style.transition = 'transform 0.25s ease';
    });
  }, []);

  return (
    <MapContext.Provider value={{ mapRef, flyTo, highlightDevice, registerMarker }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used inside <MapProvider>');
  return ctx;
}
