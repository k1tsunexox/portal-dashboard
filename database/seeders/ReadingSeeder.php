<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;

class ReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Device::all()->each(function ($device, $deviceIndex) {
            for ($i = 0; $i < 20; $i++) {

                $waterLevel = fake()->randomFloat(2, 0.5, 8.0);

                if ($waterLevel >= 5.0) {
                    $waterLevelStatus = 'critical';
                } elseif ($waterLevel >= 3.0) {
                    $waterLevelStatus = 'warning';
                } else {
                    $waterLevelStatus = 'normal';
                }

                $signalDbm = fake()->numberBetween(-90, -40);
                $signalPct = max(0, min(100, ($signalDbm + 100) * 2));

                $device->readings()->create([
                    'water_level_m'=> $waterLevel,
                    'water_level_status' => $waterLevelStatus,
                    
                    'rainfall_mm' => fake()->randomFloat(1, 0.0, 120.0),
                    'flow_speed_mps' => fake()->randomFloat(2, 0.1, 3.0),
                    
                    'battery_pct' => $i === 0 && $deviceIndex < 2
                        ? fake()->numberBetween(10, 25)
                        : fake()->numberBetween(30, 100),
                    
                    'signal_strength_dbm' => $signalDbm,
                    'signal_strength_pct' => $signalPct,
                    
                    'recorded_at' => now()->subMinutes($i * 5),
                ]);
            }
        });
    }
}
