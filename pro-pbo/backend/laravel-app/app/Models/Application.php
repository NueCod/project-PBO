<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    public $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'job_id',
        'student_id',
        'resume_id', // Bisa null
        'status', // applied, reviewing, interview, accepted, rejected
        'feedback_note',
        'cover_letter',
        'portfolio_url',
        'availability',
        'expected_duration',
        'additional_info',
        'interview_date',
        'interview_time',
        'interview_method',
        'interview_location',
        'interview_notes',
        'attendance_confirmed',
        'attendance_confirmed_at',
        'attendance_confirmation_method',
    ];

    // --- Relasi ---
    // Satu Application dimiliki oleh satu Job
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id', 'id');
    }

    // Satu Application dimiliki oleh satu StudentProfile
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'id');
    }

    // Satu Application bisa menggunakan satu Document sebagai resume (bisa null)
    public function resume(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'resume_id', 'id');
    }
}