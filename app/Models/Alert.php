<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = [
        'device_id',
        'alert_type',
        'alert_level',
        'alert_template_id',
        'message',
        'triggered_at',
        'acknowledged_at',
        'acknowledged_by',
        'resolved_at',
        'resolved_by',
        'is_active'
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function template()
    {
        return $this->belongsTo(AlertTemplate::class, 'alert_template_id');
    }
}
