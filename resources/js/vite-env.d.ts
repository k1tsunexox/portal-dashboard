/**
 * Moved vite-env.d.ts
 * from ./ to ./resources/js
 * to remove warning message when importing
 * mapbox-gl and ../app/app.css
 */

/// <reference types="vite/client" />

declare module '*.css';