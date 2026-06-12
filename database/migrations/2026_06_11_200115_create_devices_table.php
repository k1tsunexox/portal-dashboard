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
        Schema::create('devices', function (Blueprint $table) {
            
            /**
             * Some variables are set as nullable()
             * as their values may not be known/available
             * immediately. These include:
             * elevation DECIMAL
             * installed_at TIMESTAMP
             * last_seen_at TIMESTAMP
             */
            $table->id();
            
            $table->string('name');
            $table->string('location_name');
            $table->decimal('elevation', 8, 2)->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->enum('status', [
                'online',
                'offline',
                'warning',
                'critical',
                'maintenance'
            ])->default('offline');

            $table->timestamp('installed_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
