<?php

namespace App\Http\Controllers;

use App\Models\Reading;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function last24Hrs()
    {
        return Reading::where(
            'recorded_at',
            '>=', now()->subHours(24)
        )
        ->orderBy('recorded_at')
        ->get([
            'recorded_at',
            'water_level_m'
        ]);
    }

    public function alertFrequency(Request $req)
    {
        $days = min((int)$req->query('days', 7), 90);

        return Reading::select(
            DB::raw('DATE(recorded_at) as date'),
            DB::raw("SUM(CASE WHEN water_level_status = 'normal' THEN 1 ELSE 0 END) as normal"),
            DB::raw("SUM(CASE WHEN water_level_status = 'warning' THEN 1 ELSE 0 END) as warning"),
            DB::raw("SUM(CASE WHEN water_level_status = 'critical' THEN 1 ELSE 0 END) as critical")
        ) 
        ->where('created_at', '>=', now()->subDays($days))
        ->groupBy('date')
        ->orderBy('date')
        ->get();
    }
}
