# Feature Specifications and File Map

This document explains the project features in more detail and lists the files connected to each feature. Use this as the main reference for future development.

## 1. Device Listing / Monitoring Overview

### Purpose
Display a list of all devices and their current status for a monitoring dashboard.

### What it does
- Returns device metadata such as name, location, coordinates, status, and last seen time.
- Serves as the main API for the dashboard overview screen.

### Main files involved
- routes/api.php
  - Defines the GET /api/devices endpoint.
- app/Http/Controllers/DeviceController.php
  - Handles the index() method that queries device records.
- app/Models/Device.php
  - Defines the Device model and its relationships.
- database/migrations/2026_06_11_200115_create_devices_table.php
  - Creates the devices table structure.
- docs/api-schema.md
  - Documents the expected response format for the listing API.


---

## 2. Device Detail View

### Purpose
Show one device and its recent readings for detailed inspection.

### What it does
- Fetches one device by ID.
- Loads recent readings using the readings relationship.
- Returns water level, rainfall, flow speed, battery, and signal strength data.

### Main files involved
- routes/api.php
  - Defines the GET /api/devices/{id} endpoint.
- app/Http/Controllers/DeviceController.php
  - Handles the show() method and the recent-reading query.
- app/Models/Device.php
  - Provides the readings() relationship.
- app/Models/Reading.php
  - Defines the reading record structure.
- database/migrations/2026_06_11_201553_create_readings_table.php
  - Creates the readings table.
- docs/api-schema.md
  - Documents the detailed device response format.


---

## 3. Live Sensor Stream / Simulation

### Purpose
Simulate real-time sensor updates for testing and demo purposes.

### What it does
- Finds the latest reading for a device.
- Randomly creates a new reading entry.
- Updates the device status and last seen time.
- Returns the latest 10 readings to the client.

### Main files involved
- routes/api.php
  - Defines the GET /api/devices/{id}/stream endpoint.
- app/Http/Controllers/DeviceController.php
  - Handles the stream() method and the simulation logic.
- app/Models/Device.php
  - Provides access to readings and status updates.
- app/Models/Reading.php
  - Defines the fields that are created during simulation.
- database/migrations/2026_06_11_201553_create_readings_table.php
  - Stores simulated sensor readings.


---

## 4. Sensor Reading History

### Purpose
Store historical sensor data that can be used for monitoring and analysis.

### What it does
- Keeps reading records with timestamps.
- Stores metrics such as water level, rainfall, battery, and signal quality.
- Links readings to a specific device.

### Main files involved
- app/Models/Reading.php
  - Defines fillable fields and casts.
- app/Models/Device.php
  - Defines the hasMany readings() relationship.
- database/migrations/2026_06_11_201553_create_readings_table.php
  - Stores the reading schema.
- database/seeders/ReadingSeeder.php
  - Seeds example reading records.


---

## 5. Alerting and Notification Foundation

### Purpose
Create the backend structure for future alert generation and notification handling.

### What it does
- Stores alert templates for different issue types.
- Stores generated alerts linked to devices.
- Prepares support for alert acknowledgement, resolution, and activity tracking.

### Main files involved
- app/Models/Alert.php
  - Defines the alert record model.
- app/Models/AlertTemplate.php
  - Defines alert template records.
- database/migrations/2026_06_12_085842_create_alert_templates_table.php
  - Creates the alert_templates table.
- database/migrations/2026_06_13_050229_create_alerts_table.php
  - Creates the alerts table.
- database/seeders/AlertTemplateSeeder.php
  - Seeds alert templates.
- database/seeders/AlertSeeder.php
  - Seeds example alerts.


---

## 6. Frontend Dashboard Entry Point

### Purpose
Provide the main page where the dashboard UI will render.

### Main files involved
- routes/web.php
  - Loads the main app view.
- resources/views/app.blade.php
  - Renders the frontend entry point.
- resources/js/components/App.tsx
  - Current React component placeholder.
- resources/js/components/index.tsx
  - Bootstraps the React app.
- package.json
  - Defines the frontend build and dev scripts.

---

## Quick Reference: Most Likely Files to Edit

If you are working on the core monitoring feature, start here:

- routes/api.php
- app/Http/Controllers/DeviceController.php
- app/Models/Device.php
- app/Models/Reading.php
- database/migrations/2026_06_11_200115_create_devices_table.php
- database/migrations/2026_06_11_201553_create_readings_table.php
- docs/api-schema.md

If you are working on alerts or future notifications, start here:

- app/Models/Alert.php
- app/Models/AlertTemplate.php
- database/migrations/2026_06_12_085842_create_alert_templates_table.php
- database/migrations/2026_06_13_050229_create_alerts_table.php
