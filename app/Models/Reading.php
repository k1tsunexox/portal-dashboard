<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reading extends Model
{
    protected $fillable = [
        'device_id',
        'water_level_m',
        'water_level_status',
        'rainfall_mm',
        'flow_speed_mps',
        'battery_pct',
        'signal_strength_dbm',
        'signal_strength_pct',
        'recorded_at'
    ];

    protected $casts = [
        'water_level_m' => 'decimal:2',
        'rainfall_mm' => 'decimal:2',
        'flow_speed_mps' => 'decimal:2',
        'recorded_at' => 'datetime'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
