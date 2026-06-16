<?php

use Illuminate\Support\Facades\Route;

// load app.blade.php
Route::view('/', 'app');

/**
 * React fallback route. Any URL such as:
 * /map, /overview, /devices/1, etc
 * will open/load app.blade.php. 
 * 
 * Changed ->where('any', '.*')
 * to: ->where('any', '^(?!api).*$')
 * to ensure that API routes return JSON
 * instead of React pages.
 */
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
