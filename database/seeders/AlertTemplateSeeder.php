<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\AlertTemplate;

class AlertTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AlertTemplate::create([
            'alert_type' => 'water_level',
            'alert_level' => 'critical',
            'title' => 'Water Level Alert',
            'message_template' => 'Critical water level detected at {location_name}. Immediate action required.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'rainfall',
            'alert_level' => 'warning',
            'title' => 'Rainfall Alert',
            'message_template' => 'Heavy rainfall detected near {location_name}.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'low_battery',
            'alert_level' => 'warning',
            'title' => 'Low Battery Alert',
            'message_template' => '{device_name} battery is low at {battery_pct}%.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'poor_signal',
            'alert_level' => 'warning',
            'title' => 'Poor Signal Alert',
            'message_template' => '{device_name} has poor signal strength.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'sensor_connected',
            'alert_level' => 'info',
            'title' => 'Sensor Connected',
            'message_template' => '{device_name} is connected.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'sensor_disconnected',
            'alert_level' => 'warning',
            'title' => 'Sensor Disconnected',
            'message_template' => '{device_name} has disconnected.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'sensor_offline',
            'alert_level' => 'warning',
            'title' => 'Sensor Offline',
            'message_template' => '{device_name} is currently offline.',
            'is_active' => true
        ]);

        AlertTemplate::create([
            'alert_type' => 'maintenance_required',
            'alert_level' => 'critical',
            'title' => 'Maintenance Required',
            'message_template' => '{device_name} requires maintenance.',
            'is_active' => true
        ]);
    }
}
