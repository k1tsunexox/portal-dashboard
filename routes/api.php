<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AnalyticsController;

Route::get('/devices', [DeviceController::class, 'index']);

Route::get('/devices/{id}', [DeviceController::class, 'show']);

Route::get('/devices/{id}/stream', [DeviceController::class, 'stream']);

Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

Route::get('/alerts', [AlertController::class, 'index']);

Route::get('/analytics/last24Hrs', [AnalyticsController::class, 'last24Hrs']);

Route::get('/analytics/alert-frequency', [AnalyticsController::class, 'alertFrequency']);