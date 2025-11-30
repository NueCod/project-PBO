<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyProfile extends Model
{
    use HasFactory;

    public $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'company_name',
        'description',
        'industry',
        'website_url',
        'address',
        'logo_url',
        'contact_email',
        'contact_phone',
    ];

    // --- Relasi ---
    // Satu CompanyProfile dimiliki oleh satu User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Satu CompanyProfile bisa memiliki banyak Job
    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'company_id', 'id');
    }
}