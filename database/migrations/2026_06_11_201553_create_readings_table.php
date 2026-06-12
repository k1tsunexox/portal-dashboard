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
        Schema::create('readings', function (Blueprint $table) {
            $table->id();

            /**
             * Foreign ID references devices table. 
             * Set to cascade on delete to avoid 
             * floating values when a sensor
             * is deleted.
             */
            $table->foreignId('device_id')
                ->constrained('devices')
                ->cascadeOnDelete();

            $table->decimal('water_level_m', 8, 2);
            $table->enum('water_level_status', [
                'normal',
                'warning',
                'critical'
            ])->default('normal');

            $table->decimal('rainfall_mm', 8, 2)->nullable();

            $table->decimal('flow_speed_mps', 8, 2)->nullable();

            $table->integer('battery_pct')->nullable();

            $table->integer('signal_strength_dbm')->nullable();
            $table->integer('signal_strength_pct')->nullable();

            $table->timestamp('recorded_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('readings');
    }
};
