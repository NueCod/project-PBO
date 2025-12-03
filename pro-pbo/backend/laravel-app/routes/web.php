<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Tambahkan route login sebagai fallback agar tidak muncul error Route [login] not defined
Route::get('/login', function () {
    return response()->json(['error' => 'Unauthenticated'], 401);
})->name('login');
