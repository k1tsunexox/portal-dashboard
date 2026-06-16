/**
 * AppShell.tsx
 *
 * The outermost layout wrapper. Keeps MapView mounted 100% of the time as
 * the literal background layer. All other views (Overview, Sensors, Alerts…)
 * slide in as floating panels on top — the map is never unmounted or hidden.
 *
 * Layer stack (bottom → top):
 *   1. <MapView />              absolute, 100vw × 100vh, z-0
 *   2. Floating nav pill        z-10, bottom-left
 *   3. Side-panel slide-over    z-20, left edge
 *   4. DeviceDetail pop-up      z-30, bottom-right corner (handled by MapView)
 *
 * Routing contract:
 *   /          → redirect to /map (nothing extra shown)
 *   /map       → map only (no side panel)
 *   /overview  → map + Overview side panel
 *   /sensors   → map + Sensors side panel
 *   /alerts    → map + Alerts side panel
 *   /analytics → map + Analytics side panel
 */

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import MapView from '../pages/MapView';
import Overview from '../pages/Overview';
import Sensors from '../pages/Sensors';
import Alerts from '../pages/Alerts';
import Analytics from '../pages/Analytics';

// ─── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/map',       label: 'Map',       icon: MapIcon       },
  { to: '/overview',  label: 'Overview',  icon: GridIcon      },
  { to: '/sensors',   label: 'Sensors',   icon: SensorIcon    },
  { to: '/alerts',    label: 'Alerts',    icon: BellIcon      },
  { to: '/analytics', label: 'Analytics', icon: BarChartIcon  },
];

// Routes that render a side panel. /map has none.
const PANEL_ROUTES: Record<string, React.ComponentType> = {
  '/overview':  Overview,
  '/sensors':   Sensors,
  '/alerts':    Alerts,
  '/analytics': Analytics,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AppShell() {
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth] = useState(400); // px — change to make it wider
  const prevRouteRef = useRef(location.pathname);

  // Determine which panel component (if any) is active
  const PanelContent = PANEL_ROUTES[location.pathname] ?? null;

  // Open/close the side panel whenever the route changes
  useEffect(() => {
    const hasPanelNow = Boolean(PANEL_ROUTES[location.pathname]);
    const hadPanelBefore = Boolean(PANEL_ROUTES[prevRouteRef.current]);

    if (hasPanelNow && !panelOpen) {
      setPanelOpen(true);
    } else if (!hasPanelNow && panelOpen) {
      // Brief delay so the map doesn't feel jarring on /map
      const t = setTimeout(() => setPanelOpen(false), 50);
      return () => clearTimeout(t);
    }

    prevRouteRef.current = location.pathname;
  }, [location.pathname]);

  const handleClosePanel = () => {
    setPanelOpen(false);
  };

  return (
    // Full-viewport root — never scroll, never overflow
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 font-sans">

      {/* ── Layer 1: Persistent map background ────────────────────────────── */}
      {/*
        MapView fills 100% of this container. It is NEVER unmounted.
        Other panels float on top of it.
      */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* ── Layer 2: Slide-over side panel ────────────────────────────────── */}
      {/*
        Translates in from the left when a non-map route is active.
        pointer-events:none on the hidden state lets the map remain interactive.
        The panel is rendered even when hidden so React doesn't remount it on
        every open — only its translateX changes.
      */}
      <aside
        className="absolute top-0 left-0 h-full z-20 flex flex-col"
        style={{
          width: panelWidth,
          transform: panelOpen ? 'translateX(0)' : `translateX(-${panelWidth}px)`,
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: panelOpen ? 'auto' : 'none',
          willChange: 'transform',
        }}
      >
        {/* Glass-morphism panel surface */}
        <div
          className="relative flex flex-col h-full"
          style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '8px 0 32px rgba(0,0,0,0.45)',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-blue-400 text-lg">🌊</span>
              <span className="text-white font-semibold text-sm tracking-tight">FloodWatch</span>
            </div>
            <button
              onClick={handleClosePanel}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label="Close panel"
            >
              <ChevronLeftIcon />
            </button>
          </div>

          {/* Scrollable panel body */}
          <div className="flex-1 overflow-y-auto">
            {PanelContent && <PanelContent />}
          </div>
        </div>
      </aside>

      {/* ── Layer 3: Floating bottom-left nav pill ─────────────────────────── */}
      {/*
        Shifts right when the panel is open so it's not obscured.
        Uses a floating pill style rather than a traditional sidebar.
      */}
      <nav
        className="absolute bottom-8 z-30 flex items-center gap-1 p-1.5 rounded-2xl"
        style={{
          left: panelOpen ? panelWidth + 16 : 16,
          transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(15, 23, 42, 0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/10',
              ].join(' ')
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Layer 3b: Top-right status indicator ──────────────────────────── */}
      {/*
        Floats top-right. Shows system time and a live "pulse" indicator.
        Shifts left when panel is open.
      */}
      <div
        className="absolute top-4 z-30 flex items-center gap-3"
        style={{
          right: 16,
          transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <LiveIndicator />
      </div>

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LiveIndicator() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300"
      style={{
        background: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-emerald-400 font-semibold">LIVE</span>
      <span className="text-slate-500">·</span>
      <span>{time}</span>
    </div>
  );
}

// ─── SVG Icons (inline, no extra deps) ───────────────────────────────────────

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function SensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
