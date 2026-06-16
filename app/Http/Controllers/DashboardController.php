<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Device;
use App\Models\Reading;

class DashboardController extends Controller
{
    public function summary()
    {
        $latestReading = Reading::latest('recorded_at')->first();

        $avgFlowRate = Reading::whereNotNull('flow_speed_mps')
            ->avg('flow_speed_mps');

        return response()->json([
            'active_sensors' => Device::where('status', 'online')->count(),
            'total_sensors' => Device::count(),
            'water_level' => $latestReading?->water_level_m ?? 0,
            'flow_rate' => $avgFlowRate ?? 0,
            'active_alerts' => Alert::where('is_active', true)->count(),
            'recent_alerts' => Alert::with('device')
                ->latest('triggered_at')
                ->limit(4)
                ->get()
                ->map(fn ($alert) => [
                    'id' => $alert->id,
                    'sensor_code' => 'S-' . str_pad($alert->device_id, 3, '0', STR_PAD_LEFT),
                    'msg' => $alert->message,
                    'time' => optional($alert->triggered_at)->diffForHumans(),
                    'level' => $alert->alert_level ?? 'info',
                ])
        ]);
    }
}
