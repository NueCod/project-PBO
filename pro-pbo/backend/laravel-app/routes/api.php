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

// Routes TANPA otentikasi
// Tempatkan routes spesifik SEBELUM routes umum untuk mencegah konflik route
Route::get('/jobs', [App\Http\Controllers\Api\JobController::class, 'index']); // Get all active jobs for students to browse (no auth required)

// Routes yang memerlukan otentikasi (gunakan middleware sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Route untuk profil mahasiswa
    Route::get('/profile/student', [App\Http\Controllers\Api\Profile\StudentProfileController::class, 'show']);
    Route::put('/profile/student', [App\Http\Controllers\Api\Profile\StudentProfileController::class, 'update']);

    // Route untuk profil perusahaan
    Route::get('/profile/company', [App\Http\Controllers\Api\Profile\CompanyProfileController::class, 'show']);
    Route::put('/profile/company', [App\Http\Controllers\Api\Profile\CompanyProfileController::class, 'update']);

    // Routes khusus SEBELUM routes dengan parameter untuk mencegah konflik route
    Route::get('/jobs/company', [App\Http\Controllers\Api\JobController::class, 'getCompanyJobs']); // Get jobs posted by authenticated company
    Route::get('/jobs/company/', [App\Http\Controllers\Api\JobController::class, 'getCompanyJobs']); // Dengan trailing slash

    // Routes CRUD untuk lowongan pekerjaan (magang) - hanya operasi CRUD yang memerlukan auth
    Route::post('/jobs', [App\Http\Controllers\Api\JobController::class, 'store']);
    Route::put('/jobs/{id}', [App\Http\Controllers\Api\JobController::class, 'update']);
    Route::delete('/jobs/{id}', [App\Http\Controllers\Api\JobController::class, 'destroy']);
    Route::patch('/jobs/{id}/close', [App\Http\Controllers\Api\JobController::class, 'closeJob']); // Close a specific job

    // Route debug untuk mengecek apakah Sanctum berfungsi
    Route::get('/debug/auth', [App\Http\Controllers\Api\DebugController::class, 'checkAuth'])->middleware('auth:sanctum');

    // Tambahkan route lain yang memerlukan login di sini
    // Contoh:
    // Application routes for students
    Route::apiResource('applications', App\Http\Controllers\Api\ApplicationController::class);

    // Additional application route for companies to view applications for their jobs
    Route::get('/company/applications', [App\Http\Controllers\Api\ApplicationController::class, 'getCompanyApplications']);

    // Additional application route for companies to set interview schedule for applications
    Route::patch('/applications/{id}/schedule-interview', [App\Http\Controllers\Api\ApplicationController::class, 'setInterviewSchedule']);

    // Additional application route for students to confirm attendance for interviews
    Route::patch('/applications/{id}/confirm-attendance', [App\Http\Controllers\Api\ApplicationController::class, 'confirmAttendance']);

    // Additional application route for companies to update application status (accept/reject)
    Route::patch('/applications/{id}/status', [App\Http\Controllers\Api\ApplicationController::class, 'updateStatus']);

    // Route::apiResource('documents', DocumentController::class);
    // Route::get('/profile', [ProfileController::class, 'show']); // Bisa untuk student atau company tergantung role user
});

// Routes TANPA otentikasi - DITEMPATKAN SETELAH routes middleware group untuk mencegah konflik
Route::get('/jobs/{id}', [App\Http\Controllers\Api\JobController::class, 'show']); // Get specific job (no auth required)