import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import Overview from './pages/Overview';
import Sensors from './pages/Sensors';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import DeviceDetail from './pages/DeviceDetail';

function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<Navigate to="/map" replace />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/sensors" element={<Sensors />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/devices/:id" element={<DeviceDetail />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);