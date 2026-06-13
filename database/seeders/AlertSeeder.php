<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Device;
use App\Models\AlertTemplate;

class AlertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $devices = Device::all();
        
        if ($devices->isEmpty()) {
            return;
        }

        $alertTypes = [
            'water_level',
            'water_level',
            'water_level',

            'rainfall',
            'rainfall',

            'low_battery',
            'low_battery',

            'poor_signal',
            'poor_signal',

            'sensor_connected',

            'sensor_disconnected',
            'sensor_disconnected',

            'sensor_offline',

            'maintenance_required',
        ];

        foreach ($alertTypes as $index => $alertType) {
            $device = $devices->random();

            $template = AlertTemplate::where('alert_type', $alertType)
                ->where('is_active', true)
                ->first();

            if (!$template) {
                continue;
            }

            $latestReading = $device->readings()
                ->latest('recorded_at')
                ->first();

            $batteryPct = $latestReading?->battery_pct ?? 'unknown';

            $message = str_replace(
                ['{location_name}', '{device_name}', '{battery_pct}'],
                [$device->location_name, $device->name, $batteryPct],
                $template->message_template
            );

            $triggeredAt = now()->subMinutes($index * 15);

            $acknowledgedAt = null;
            $acknowledgedBy = null;
            $resolvedAt = null;
            $resolvedBy = null;
            $isActive = true;

            // Acknowledged, not resolved
            if ($index >= 6 && $index <= 10) {
                $acknowledgedAt = $triggeredAt->copy()->addMinutes(10);
                $acknowledgedBy = 'Admin';
                $isActive = true;
            }

            // Resolved
            if ($index > 10) {
                $acknowledgedAt = $triggeredAt->copy()->addMinutes(10);
                $acknowledgedBy = 'Admin';
                $resolvedAt = $triggeredAt->copy()->addMinutes(45);
                $resolvedBy = 'Admin';
                $isActive = false;
            }

            $device->alerts()->create([
                'alert_template_id' => $template->id,
                'alert_type' => $template->alert_type,
                'alert_level' => $template->alert_level,
                'message' => $message,
                'triggered_at' => $triggeredAt,
                'acknowledged_at' => $acknowledgedAt,
                'acknowledged_by' => $acknowledgedBy,
                'resolved_at' => $resolvedAt,
                'resolved_by' => $resolvedBy,
                'is_active' => $isActive
            ]);
        }
    }
}
