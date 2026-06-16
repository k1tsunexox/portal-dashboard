# Project Features

This project is a Laravel + React portal dashboard for monitoring river or field sensors. It currently focuses on device visibility, sensor readings, and the foundation for alerting.

## Main Features

1. Device listing and status overview
   - Shows all registered devices with status, location, and last seen timestamp.
   - Useful for an at-a-glance monitoring dashboard.

2. Device detail view
   - Fetches one device together with recent readings.
   - Supports deeper inspection of water level, rainfall, flow rate, battery, and signal quality.

3. Live simulation stream
   - Generates simulated sensor updates for a device.
   - Randomly creates new readings and updates the device status.

4. Reading history support
   - Stores and retrieves sensor measurements over time.
   - Provides the data structure needed for charts and trend analysis.

5. Alerting foundation
   - Includes models and tables for alert templates and alerts.
   - Prepares the app for warning, critical, and maintenance notifications.

## Current Stack

- Backend: Laravel PHP
- Frontend: React + Vite
- Data: MySQL/MariaDB
- API routes: Laravel API endpoints

## What to Expect

The current implementation is centered on backend APIs and data models. The frontend is still minimal, so most of the feature logic lives in the Laravel controller and model layer.
