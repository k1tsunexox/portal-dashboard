import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/map', label: 'Map', icon: '🗺️' },
    { to: '/overview', label: 'Overview', icon: '⊞' },
    { to: '/sensors', label: 'Sensors', icon: '📡' },
    { to: '/alerts', label: 'Alerts', icon: '△' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{
                width: '200px',
                minWidth: '200px',
                background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                }}>
                    <span style={{ color: '#3b82f6', fontSize: '20px' }}>🌊</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                        FloodWatch Portal
                    </span>
                </div>

                {/* Nav */}
                <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '9px 12px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                color: isActive ? '#2563eb' : '#6b7280',
                                background: isActive ? '#eff6ff' : 'transparent',
                                fontWeight: isActive ? 500 : 400,
                                transition: 'all 0.15s ease',
                            })}
                        >
                            <span style={{ fontSize: '16px' }}>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <header style={{
                    height: '52px',
                    minHeight: '52px',
                    background: '#ffffff',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 24px',
                }}>
                    <span style={{ fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>⚙️</span>
                </header>

                {/* Page content */}
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}