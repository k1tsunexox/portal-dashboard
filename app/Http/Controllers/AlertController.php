<?php

namespace App\Http\Controllers;

use App\Models\Alert;

class AlertController extends Controller
{
    public function index()
    {
        return Alert::with('device')
            ->latest('triggered_at')
            ->get()
            ->map(fn ($alert) => [
                'id' => $alert->id,
                'sensor_code' => 'S-' . str_pad($alert->device_id, 3, '0', STR_PAD_LEFT),
                'location' => $alert->device?->location_name,
                'msg' => $alert->message,
                'time' => optional($alert->triggered_at)->diffForHumans(),
                'level' => $alert->alert_level,
                'is_active' => $alert->is_active
            ]);
    }
}
