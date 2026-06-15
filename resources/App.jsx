import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import MapView from './pages/MapView';
import DeviceList from './pages/DeviceList';
import DeviceDetail from './pages/DeviceDetail';
import './app.css';

function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/map" element={<MapView />} />
                    <Route path="/devices" element={<DeviceList />} />
                    <Route path="/devices/:id" element={<DeviceDetail />} />
                    <Route path="/" element={<Navigate to="/map" />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);