/**
 * app.tsx  —  entry point
 *
 * Key change: wrap the entire app in <MapProvider> so that MapContext
 * (the shared mapRef + flyTo + highlightDevice) is available to ALL
 * components regardless of their position in the tree.
 *
 * AppShell no longer accepts `children` — it owns the full layout itself,
 * rendering MapView as a persistent background and mounting panel content
 * based on the current route.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MapProvider } from '.\pages\MapContext.tsx';
import AppShell from './components/AppShell';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  return (
    <BrowserRouter>
      {/*
        MapProvider must wrap everything — both AppShell (which renders MapView)
        and any panel page components — so the shared mapRef is the same object
        for everyone.
      */}
      <MapProvider>
        {/*
          AppShell owns ALL layout. It renders:
            - MapView as the full-viewport background (always mounted)
            - The slide-over panel keyed to the current route
            - The floating nav pill

          The <Routes> inside AppShell maps URL → which panel to render.
          We no longer need routes defined here at the app level.
        */}
        <Routes>
          {/*
            A single catch-all route renders AppShell.
            AppShell reads `useLocation()` internally to decide which panel
            to show. This means the map NEVER unmounts between route changes.
          */}
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </MapProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
