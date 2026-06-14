## GET `/api/devices`

```json
{
    "data": [
        {
            "id": 1,
            "name": "Marikina River Sensor",
            "location_name": "Marikina River Station",
            "latitude": "14.6507000",
            "longitude": "121.1029000",
            "status": "online",
            "last_seen_at": "2026-06-13T08:51:37.000000Z"
        },
        ...,
    ]
}
```

## GET `/api/devices/{id}`

```json
{
  "data": {
    "id": 1,
    "name": "Marikina River Sensor",
    "location_name": "Marikina River Station",
    "area": "NCR",
    "elevation": "12.50",
    "latitude": "14.6507000",
    "longitude": "121.1029000",
    "status": "online",
    "installed_at": "2026-06-03T08:51:37.000000Z",
    "last_seen_at": "2026-06-13T08:51:37.000000Z",
    "created_at": "2026-06-13T08:51:37.000000Z",
    "updated_at": "2026-06-13T08:51:37.000000Z",
    "readings": [
      {
        "id": 1,
        "device_id": 1,
        "water_level_m": "6.76",
        "water_level_status": "critical",
        "rainfall_mm": "64.70",
        "flow_speed_mps": "0.75",
        "battery_pct": 20,
        "signal_strength_dbm": -77,
        "signal_strength_pct": 46,
        "recorded_at": "2026-06-13T08:51:37.000000Z"
      },
      ...
    ]
  }
}
```

Error message:

```json
{
    "message": "Device not found"
}
```

### GET `/api/devices/{id}/stream`

```json
{
  "device": {
    "id": 2,
    "name": "Pampanga River Sensor",
    "location_name": "Pampanga River, San Fernando",
    "status": "online",
    "last_seen_at": "2026-06-13T10:14:01.000000Z"
  },
  "inserted": false,
  "data": [
    {
      "id": 121,
      "device_id": 2,
      "water_level_m": "2.56",
      "water_level_status": "normal",
      "rainfall_mm": "26.90",
      "flow_speed_mps": "0.91",
      "battery_pct": 0,
      "signal_strength_dbm": -72,
      "signal_strength_pct": 56,
      "recorded_at": "2026-06-13T10:14:01.000000Z"
    },
    ...
  ]
}
```
