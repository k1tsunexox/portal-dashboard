<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $devices = Device::select([
            'id',
            'name',
            'location_name',
            'latitude',
            'longitude',
            'status',
            'last_seen_at'
        ])->get();

        return response()->json([
            'data' => $devices
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $device = Device::with([
            'readings' => function ($q) {
                $q->select([
                    'id',
                    'device_id',
                    'water_level_m',
                    'water_level_status',
                    'rainfall_mm',
                    'flow_speed_mps',
                    'battery_pct',
                    'signal_strength_dbm',
                    'signal_strength_pct',
                    'recorded_at'
                ])
                ->orderByDesc('recorded_at')
                ->limit(10);
            }
        ])->find($id);

        if(!$device) {
            return response()->json([
                'message' => 'Device not found'
            ], 404);
        }

        return response()->json([
            'data' => $device
        ]);
    }

    /**
     * Live data simulation
     */
    public function stream($id)
    {   
        $device = Device::find($id);

        if(!$device) {
            return response()->json([
                'message' => 'Device not found'
            ], 404);
        }

        $latestReading = $device->readings()
            ->latest('recorded_at')
            ->first();

        /**
         * Generates a random number from 1 to 100.
         * If number generated is <= 60, this variable is set to true.
         * This determines if the randomly generated data
         * is inserted into the table.
         */
        $shouldInsert = random_int(1, 100) <= 60;

        if($shouldInsert) {
            /**
             * Checks if the column value is null.
             * If null, set to 1.00, 90, or -70 
             * otherwise, keep value
             */
            $baseWaterLevel = $latestReading?->water_level_m ?? 1.00;
            $baseBattery = $latestReading?->battery_pct ?? 90;
            $baseSignalDbm = $latestReading?->signal_strength_dbm ?? -70;

            /**
             * Simulates changes in water level, 
             * battery percent, signal dbm, and 
             * signal percent within a valid range.
             */
            $waterLevel = max(0, min(8, $baseWaterLevel + (random_int(-20, 30) / 100)));
            $batteryPct = max(0, min(100, $baseBattery - random_int(0, 1)));
            $signalDbm = max(-100, min(-40, $baseSignalDbm + random_int(-3, 3)));
            $signalPct = max(0, min(100, ($signalDbm + 100) * 2));
            
            /**
             * Set water level status depending
             * on the current water level.
             */
            if($waterLevel >= 5.0) {
                $waterLevelStatus = 'critical';
            } elseif($waterLevel >= 3.0) {
                $waterLevelStatus = 'warning';
            } else {
                $waterLevelStatus = 'normal';
            }

            /**
             * Insert values into the table. 
             */
            $device->readings()->create([
                'water_level_m' => round($waterLevel, 2),
                'water_level_status' => $waterLevelStatus,
                'rainfall_mm' => round(random_int(0, 300) / 10, 2),
                'flow_speed_mps' => round(random_int(10, 300) / 100, 2),
                'battery_pct' => $batteryPct,
                'signal_strength_dbm' => $signalDbm,
                'signal_strength_pct' => $signalPct,
                'recorded_at' => now()
            ]);

            $device->update([
                'status' => $waterLevelStatus === 'critical' ? 'critical' : 'online',
                'last_seen_at' => now()
            ]);
        }

        $readings = $device->readings()
            ->select([
                'id',
                'device_id',
                'water_level_m',
                'water_level_status',
                'rainfall_mm',
                'flow_speed_mps',
                'battery_pct',
                'signal_strength_dbm',
                'signal_strength_pct',
                'recorded_at'
            ])
            ->orderByDesc('recorded_at')
            ->limit(10)
            ->get();

        return response()->json([
            'device' => [
                'id' => $device->id,
                'name' => $device->name,
                'location_name' => $device->location_name,
                'status' => $device->status,
                'last_seen_at' => $device->last_seen_at
            ],
            'inserted' => $shouldInsert,
            'data' => $readings
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Device $device)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Device $device)
    {
        //
    }
}
