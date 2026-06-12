<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location_name',
        'area',
        'elevation',
        'latitude',
        'longitude',
        'status',
        'installed_at',
        'last_seen_at'
    ];

    protected $casts = [
        'elevation' =>'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'installed_at' => 'datetime',
        'last_seen_at' => 'datetime'
    ];

    public function readings()
    {
        return $this->hasMany(Reading::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alerts::class);
    }
}
