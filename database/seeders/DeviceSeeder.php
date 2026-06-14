<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Device;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Device::create([
            'name' => 'Marikina River Sensor',
            'location_name' => 'Marikina River Station',
            'area' => 'NCR',
            'elevation' => 12.50,
            'latitude' => 14.6507000,
            'longitude' => 121.1029000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);

        Device::create([
            'name' => 'Pampanga River Sensor',
            'location_name' => 'Pampanga River, San Fernando',
            'area' => 'Central Luzon',
            'elevation' => 9.90,
            'latitude' => 15.0285000,
            'longitude' => 120.6893000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);

        Device::create([
            'name' => 'Cagayan River Sensor',
            'location_name' => 'Cagayan River, Tuguegarao',
            'area' => 'Cagayan Valley',
            'elevation' => 20.00,
            'latitude' => 17.6132000,
            'longitude' => 121.7270000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);

        Device::create([
            'name' => 'Agno River Sensor',
            'location_name' => 'Agno River, Pangasinan',
            'area' => 'Ilocos Region',
            'elevation' => 9.30,
            'latitude' => 16.0289000,
            'longitude' => 120.3315000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);

        Device::create([
            'name' => 'Pasig River Sensor',
            'location_name' => 'Pasig River, Napindan',
            'area' => 'NCR',
            'elevation' => 5.40,
            'latitude' => 14.5629000,
            'longitude' => 121.0796000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);

        Device::create([
            'name' => 'Bicol River Sensor',
            'location_name' => 'Bicol River, Naga',
            'area' => 'Bicol Region',
            'elevation' => 16.00,
            'latitude' => 13.6192000,
            'longitude' => 123.1814000,
            'status' => 'online',
            'installed_at' => now()->subDays(10),
            'last_seen_at' => now()
        ]);
    }
}
