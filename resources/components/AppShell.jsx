import React from 'react';
import { NavLink } from 'react-router-dom';

// AppShell wraps every page with a fixed sidebar + scrollable main area.
// NavLink auto-applies the 'active' class when the route matches.
export default function AppShell({ children }) {
    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0F172A', color: '#E2E8F0' }}>
            {/* Sidebar — always visible regardless of route */}
            <aside style={{
                width: '220px',
                minWidth: '220px',
                background: '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                gap: '8px',
                borderRight: '1px solid #334155'
            }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#38BDF8', marginBottom: '24px' }}>
                    🌊 Portal Dashboard
                </div>

                {[
                    { to: '/map', label: '🗺️ Map' },
                    { to: '/devices', label: '📡 Devices' },
                ].map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        style={({ isActive }) => ({
                            padding: '10px 14px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: isActive ? '#38BDF8' : '#94A3B8',
                            background: isActive ? '#0F172A' : 'transparent',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: isActive ? 600 : 400,
                            transition: 'all 0.15s ease',
                        })}
                    >
                        {label}
                    </NavLink>
                ))}
            </aside>

            {/* Main content — flex-1 fills remaining width, scrollable */}
            <main style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
                {children}
            </main>
        </div>
    );
}