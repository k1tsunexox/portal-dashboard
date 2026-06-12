<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_id')
                ->constrained('devices')
                ->cascadeOnDelete();

            $table->enum('alert_type', [
                'water_level',
                'rainfall',
                'low_battery',
                'poor_signal',
                'sensor_connected',
                'sensor_disconnected',
                'sensor_offline',
                'maintenance_required'
            ]);

            $table->string('message');

            $table->timestamp('triggered_at');

            $table->timestamp('acknowledged_at')->nullable();
            $table->string('acknowledged_by')->nullable();

            $table->timestamp('resolved_at')->nullable();
            $table->string('resolved_by')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
