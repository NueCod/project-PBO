<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
// Ganti ProductController dengan controller yang relevan nanti
// use App\Http\Controllers\Api\ProductController;

// Route Otentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route debug
Route::get('/debug-register', function () {
    return response()->json(['message' => 'Debug register endpoint is working']);
});

// Route yang memerlukan otentikasi (gunakan middleware sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Route untuk profil mahasiswa
    Route::get('/profile/student', [App\Http\Controllers\Api\Profile\StudentProfileController::class, 'show']);
    Route::put('/profile/student', [App\Http\Controllers\Api\Profile\StudentProfileController::class, 'update']);

    // Route untuk profil perusahaan
    Route::get('/profile/company', [App\Http\Controllers\Api\Profile\CompanyProfileController::class, 'show']);
    Route::put('/profile/company', [App\Http\Controllers\Api\Profile\CompanyProfileController::class, 'update']);

    // Route untuk lowongan pekerjaan (magang)
    Route::apiResource('jobs', App\Http\Controllers\Api\JobController::class);
    Route::get('/jobs/company', [App\Http\Controllers\Api\JobController::class, 'getCompanyJobs']); // Get jobs posted by authenticated company
    Route::patch('/jobs/{id}/close', [App\Http\Controllers\Api\JobController::class, 'closeJob']); // Close a specific job

    // Tambahkan route lain yang memerlukan login di sini
    // Contoh:
    // Route::apiResource('applications', ApplicationController::class);
    // Route::apiResource('documents', DocumentController::class);
    // Route::get('/profile', [ProfileController::class, 'show']); // Bisa untuk student atau company tergantung role user
});