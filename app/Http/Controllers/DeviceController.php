<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\AlertTemplate;
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
             * If null, set to realistic starting demo values,
             * otherwise, use the latest recorded value.
             */
            $baseWaterLevel = (float) ($latestReading?->water_level_m ?? 2.20);
            $baseRainfall = (float) ($latestReading?->rainfall_mm ?? 5.00);
            $baseFlowSpeed = (float) ($latestReading?->flow_speed_mps ?? 0.80);
            $baseBattery = (int) ($latestReading?->battery_pct ?? 90);
            $baseSignalDbm = (int) ($latestReading?->signal_strength_dbm ?? -70);

            /**
             * Simulates changes in water level using a balanced random walk.
             * Movement can go up or down by the same range so the value
             * does not continuously increase.
             */
            $waterDelta = random_int(-18, 18) / 100;
            $waterLevel = max(0.30, min(6.50, $baseWaterLevel + $waterDelta));

            /**
             * Simulates rainfall with small changes from the previous value.
             * Avoids sudden unrealistic jumps on every stream request.
             */
            $rainfallDelta = random_int(-15, 20) / 10;
            $rainfall = max(0, min(80, $baseRainfall + $rainfallDelta));

            /**
             * Simulates flow speed based partly on the current water level
             * and partly on small random variation.
             */
            $targetFlowSpeed = 0.40 + ($waterLevel * 0.18);
            $flowSpeed = ($baseFlowSpeed * 0.70) + ($targetFlowSpeed * 0.30) + (random_int(-8, 8) / 100);
            $flowSpeed = max(0.10, min(2.50, $flowSpeed));

            /**
             * Simulates battery percent with slower drain.
             * Battery only decreases occasionally instead of every request.
             */
            $batteryDrain = random_int(1, 100) <= 15 ? 1 : 0;
            $batteryPct = max(0, min(100, $baseBattery - $batteryDrain));

            /**
             * Simulates signal dbm and signal percent within a valid range.
             * Signal fluctuates around the previous value.
             */
            $signalDbm = max(-100, min(-40, $baseSignalDbm + random_int(-2, 2)));
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
             * Insert values into the readings table.
             * The created reading is stored in a variable so it can be
             * referenced later if alert logic needs reading details.
             */
            $reading = $device->readings()->create([
                'water_level_m' => round($waterLevel, 2),
                'water_level_status' => $waterLevelStatus,
                'rainfall_mm' => round($rainfall, 2),
                'flow_speed_mps' => round($flowSpeed, 2),
                'battery_pct' => $batteryPct,
                'signal_strength_dbm' => $signalDbm,
                'signal_strength_pct' => $signalPct,
                'recorded_at' => now()
            ]);

            /**
             * Find the matching alert template for water level alerts.
             * This is useful if alert_template_id is required or used
             * for displaying alert titles/messages later.
             */
            $alertTemplate = null;

            if(in_array($waterLevelStatus, ['warning', 'critical'])) {
                $alertTemplate = AlertTemplate::where('alert_type', 'water_level')
                    ->where('alert_level', $waterLevelStatus)
                    ->first();
            }

            /**
             * Creates or updates an active water level alert when the
             * current reading reaches warning or critical status.
             */
            if(in_array($waterLevelStatus, ['warning', 'critical'])) {
                $device->alerts()->updateOrCreate(
                    [
                        'alert_type' => 'water_level',
                        'is_active' => true,
                    ],
                    [
                        'alert_template_id' => $alertTemplate?->id,
                        'alert_level' => $waterLevelStatus,
                        'message' => $waterLevelStatus === 'critical'
                            ? 'Critical water level detected — immediate action required'
                            : 'Water level above threshold',
                        'triggered_at' => now(),
                        'resolved_at' => null,
                        'resolved_by' => null,
                    ]
                );
            }

            /**
             * Resolves the active water level alert when the current
             * water level returns to normal status.
             */
            if($waterLevelStatus === 'normal') {
                $device->alerts()
                    ->where('alert_type', 'water_level')
                    ->where('is_active', true)
                    ->update([
                        'is_active' => false,
                        'resolved_at' => now(),
                    ]);
            }

            $device->update([
                'status' => $waterLevelStatus === 'normal' ? 'online' : $waterLevelStatus,
                'last_seen_at' => now()
            ]);

            $device->refresh();
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
                'area' => $device->area,
                'elevation' => $device->elevation,
                'latitude' => $device->latitude,
                'longitude' => $device->longitude,
                'status' => $device->status,
                'installed_at' => $device->installed_at,
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