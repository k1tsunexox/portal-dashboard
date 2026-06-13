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
