<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    /**
     * Fields that are allowed to be mass assigned.
     * These are used when creating or updating alerts from the controller.
     */
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

    /**
     * Cast date fields into Carbon instances and is_active into boolean.
     * This helps the API return cleaner values for React.
     */
    protected $casts = [
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    /**
     * An alert belongs to one device.
     */
    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * An alert may use a predefined alert template.
     */
    public function template()
    {
        return $this->belongsTo(AlertTemplate::class, 'alert_template_id');
    }
}