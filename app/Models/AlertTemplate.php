<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertTemplate extends Model
{
    protected $fillable = [
        'alert_type',
        'alert_level',
        'title',
        'message_template',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function alerts()
    {
        return $this->hasMany(Alerts::class);
    }
}
