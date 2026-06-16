<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;

Route::get('/devices', [DeviceController::class, 'index']);

Route::get('/devices/{id}', [DeviceController::class, 'show']);

Route::get('/devices/{id}/stream', [DeviceController::class, 'stream']);

Route::get('/readings/last24hours', function () {
    return \App\Models\Reading::where('recorded_at', '>=', now()->subHours(24))
        ->orderBy('recorded_at')
        ->get(['recorded_at', 'water_level_m']);
});

Route::get('/readings/alert-frequency', function (Request $request) {
    $days = min((int) $request->query('days', 7), 90);

    $rows = \App\Models\Reading::select(
            \DB::raw('DATE(recorded_at) as date'),
            \DB::raw("SUM(CASE WHEN water_level_status = 'normal'   THEN 1 ELSE 0 END) as normal"),
            \DB::raw("SUM(CASE WHEN water_level_status = 'warning'  THEN 1 ELSE 0 END) as warning"),
            \DB::raw("SUM(CASE WHEN water_level_status = 'critical' THEN 1 ELSE 0 END) as critical")
        )
        ->where('recorded_at', '>=', now()->subDays($days))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    return response()->json($rows);
});