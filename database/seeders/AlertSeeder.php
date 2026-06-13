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

            $latestReading = $device->readings()
                ->latest('recorded_at')
                ->first();

            $batteryPct = $latestReading?->battery_pct ?? 'unknown';

            $template = AlertTemplate::where('alert_type', $alertType)
                ->where('is_active', true)
                ->first();

            $message = str_replace(
                ['{location_name}', '{device_name}', '{battery_pct}'],
                [$device->location_name, $device->name, $batteryPct],
                $template->message_template
            );

            if (!$template) {
                continue;
            }


        }
    }
}
