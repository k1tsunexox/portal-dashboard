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
        Schema::create('alert_templates', function (Blueprint $table) {
            $table->id();

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

            $table->enum('alert_level', [
                'info',
                'warning',
                'critical'
            ])->default('info');

            $table->string('title');
            $table->text('message_template');
            
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_templates');
    }
};
