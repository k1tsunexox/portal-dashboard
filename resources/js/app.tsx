import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './MapContext';
import AppShell from './components/AppShell';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
    return (
        <BrowserRouter>
            <MapProvider>
                <Routes>
                    <Route path="/*" element={<AppShell />} />
                </Routes>
            </MapProvider>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
